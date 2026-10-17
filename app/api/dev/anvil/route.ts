import {NextRequest,NextResponse} from 'next/server';
import {assertLocalDevelopment,LOCAL_CHAIN_ID,LOCAL_TEST_ACCOUNT,localPublicClient,localRpc,sendLocalContractTransaction} from '@/lib/local-dev';
import {lastSignalAbi} from '@/lib/contract';

export const dynamic='force-dynamic';

async function state(address:`0x${string}`){
 const [chainId,block,epoch,eligibility]=await Promise.all([
  localPublicClient.getChainId(),localPublicClient.getBlock(),
  localPublicClient.readContract({address,abi:lastSignalAbi,functionName:'getCurrentEpoch'}),
  localPublicClient.readContract({address,abi:lastSignalAbi,functionName:'canSignal',args:[LOCAL_TEST_ACCOUNT]})
 ]);
 if(chainId!==LOCAL_CHAIN_ID)throw new Error(`Wrong chain: expected ${LOCAL_CHAIN_ID}, received ${chainId}`);
 return {chainId,currentBlock:block.number.toString(),chainTimestamp:Number(block.timestamp),contractAddress:address,testAccount:LOCAL_TEST_ACCOUNT,epoch:{id:epoch[0].toString(),startTime:Number(epoch[1]),endTime:Number(epoch[2]),totalSignals:Number(epoch[3]),uniqueParticipants:Number(epoch[4]),totalExtension:Number(epoch[5]),status:Number(epoch[6])},eligibility:{canSignal:eligibility[0],reason:Number(eligibility[1])}};
}

export async function GET(request:NextRequest){try{const address=assertLocalDevelopment(request.headers.get('host'));return NextResponse.json(await state(address),{headers:{'cache-control':'no-store'}})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Local lab unavailable'},{status:404})}}

export async function POST(request:NextRequest){try{
 const address=assertLocalDevelopment(request.headers.get('host'));
 const body=await request.json() as {action?:string};
 let transaction:null|Awaited<ReturnType<typeof sendLocalContractTransaction>>=null;
 if(body.action==='advanceHour')await localRpc('evm_increaseTime',[3600]);
 else if(body.action==='advanceDay')await localRpc('evm_increaseTime',[86400]);
 else if(body.action==='advanceToEnd'){const epoch=await localPublicClient.readContract({address,abi:lastSignalAbi,functionName:'getCurrentEpoch'});await localRpc('evm_setNextBlockTimestamp',[Number(epoch[2])]);}
 else if(body.action==='sendSignal'){const eligibility=await localPublicClient.readContract({address,abi:lastSignalAbi,functionName:'canSignal',args:[LOCAL_TEST_ACCOUNT]});if(!eligibility[0])throw new Error(['UNAVAILABLE','EPOCH ENDED','ALREADY SENT TODAY','EXTENSION CAP REACHED'][Number(eligibility[1])]||'SIGNAL UNAVAILABLE');transaction=await sendLocalContractTransaction(address,'sendSignal');}
 else if(body.action==='startNextEpoch')transaction=await sendLocalContractTransaction(address,'startNextEpoch');
 else if(body.action!=='mine')return NextResponse.json({error:'Unsupported local action'},{status:400});
 if(['advanceHour','advanceDay','advanceToEnd','mine'].includes(body.action||''))await localRpc('evm_mine');
 return NextResponse.json({...(await state(address)),transaction},{headers:{'cache-control':'no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Local operation failed'},{status:400})}}
