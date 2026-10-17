import {Prisma,PrismaClient} from '@prisma/client';
import {createPublicClient,http,parseAbi} from 'viem';
import network from '../config/network.json';

const db=new PrismaClient();
const address=process.env.NEXT_PUBLIC_LAST_SIGNAL_ADDRESS as `0x${string}`|undefined;
if(!address)throw new Error('NEXT_PUBLIC_LAST_SIGNAL_ADDRESS is required');
if(!process.env.INDEXER_START_BLOCK)throw new Error('INDEXER_START_BLOCK is required; scanning from block 0 is forbidden');
const startBlock=BigInt(process.env.INDEXER_START_BLOCK);
const client=createPublicClient({transport:http(process.env.INDEXER_RPC_URL||network.publicRpcUrl)});
const confirmations=BigInt(process.env.INDEXER_CONFIRMATIONS||20);
const abi=parseAbi(['event SignalSent(uint256 indexed epochId,address indexed wallet,uint256 timestamp,uint256 extensionSeconds)','event EpochStarted(uint256 indexed epochId,uint256 startTime,uint256 endTime)','event EpochFinalized(uint256 indexed epochId,uint256 startTime,uint256 endTime,uint256 totalSignals,uint256 uniqueParticipants,uint256 totalExtension)']);

async function rebuildParticipants(tx:Prisma.TransactionClient,epochIds:bigint[]){
 for(const epochId of epochIds){
  await tx.participant.deleteMany({where:{chainId:network.chainId,epochId}});
  const signals=await tx.signal.findMany({where:{chainId:network.chainId,epochId},orderBy:[{timestamp:'asc'},{logIndex:'asc'}]});
  for(const s of signals)await tx.participant.upsert({where:{chainId_epochId_wallet:{chainId:network.chainId,epochId,wallet:s.wallet}},create:{chainId:network.chainId,epochId,wallet:s.wallet,signalCount:1,points:10,firstSignalAt:s.timestamp,lastSignalAt:s.timestamp},update:{signalCount:{increment:1},points:{increment:10},lastSignalAt:s.timestamp}});
  const unique=await tx.participant.count({where:{chainId:network.chainId,epochId}});
  await tx.epoch.updateMany({where:{chainId:network.chainId,id:epochId},data:{totalSignals:signals.length,uniqueParticipants:unique,totalExtensionSeconds:signals.reduce((n,s)=>n+s.extensionSeconds,0)}});
 }
}

async function rollbackFrom(blockNumber:bigint){
 await db.$transaction(async tx=>{
  const affected=await tx.signal.findMany({where:{chainId:network.chainId,blockNumber:{gte:blockNumber}},select:{epochId:true},distinct:['epochId']});
  await tx.signal.deleteMany({where:{chainId:network.chainId,blockNumber:{gte:blockNumber}}});
  await tx.epoch.deleteMany({where:{chainId:network.chainId,startBlock:{gte:blockNumber}}});
  await tx.blockCheckpoint.deleteMany({where:{chainId:network.chainId,blockNumber:{gte:blockNumber}}});
  await rebuildParticipants(tx,affected.map(x=>x.epochId));
  await tx.indexerCursor.update({where:{chainId:network.chainId},data:{nextBlock:blockNumber,lastBlockHash:null,error:null}});
 });
}

async function syncBatch(){
 const cursor=await db.indexerCursor.upsert({where:{chainId:network.chainId},create:{chainId:network.chainId,nextBlock:startBlock},update:{}});
 const head=await client.getBlockNumber(); const safeHead=head>confirmations?head-confirmations:0n;
 await db.indexerCursor.update({where:{chainId:network.chainId},data:{chainHead:head}}); if(cursor.nextBlock>safeHead)return;
 if(cursor.nextBlock>startBlock){const previous=await db.blockCheckpoint.findUnique({where:{chainId_blockNumber:{chainId:network.chainId,blockNumber:cursor.nextBlock-1n}}});if(previous){const canonical=await client.getBlock({blockNumber:cursor.nextBlock-1n});if(canonical.hash!==previous.blockHash){await rollbackFrom(cursor.nextBlock-1n);return;}}}
 const to=cursor.nextBlock+999n>safeHead?safeHead:cursor.nextBlock+999n;
 const logs=await client.getLogs({address,events:abi,fromBlock:cursor.nextBlock,toBlock:to});
 await db.$transaction(async tx=>{
  for(let n=cursor.nextBlock;n<=to;n++){const block=await client.getBlock({blockNumber:n});await tx.blockCheckpoint.upsert({where:{chainId_blockNumber:{chainId:network.chainId,blockNumber:n}},create:{chainId:network.chainId,blockNumber:n,blockHash:block.hash,parentHash:block.parentHash},update:{blockHash:block.hash,parentHash:block.parentHash}});}
  for(const log of logs){
   if(log.eventName==='EpochStarted'){const a=log.args;if(a.epochId===undefined||a.startTime===undefined||a.endTime===undefined)continue;await tx.epoch.upsert({where:{id:a.epochId},create:{id:a.epochId,chainId:network.chainId,startTime:new Date(Number(a.startTime)*1000),endTime:new Date(Number(a.endTime)*1000),status:'ACTIVE',startBlock:log.blockNumber},update:{startTime:new Date(Number(a.startTime)*1000),endTime:new Date(Number(a.endTime)*1000),status:'ACTIVE',startBlock:log.blockNumber}});}
   if(log.eventName==='EpochFinalized'){const a=log.args;if(a.epochId===undefined||a.endTime===undefined)continue;await tx.epoch.updateMany({where:{id:a.epochId,chainId:network.chainId},data:{status:'FINALIZED',finalizeBlock:log.blockNumber,endTime:new Date(Number(a.endTime)*1000),totalSignals:Number(a.totalSignals),uniqueParticipants:Number(a.uniqueParticipants),totalExtensionSeconds:Number(a.totalExtension)}});}
   if(log.eventName==='SignalSent'){const a=log.args;if(a.epochId===undefined||a.wallet===undefined||a.timestamp===undefined||a.extensionSeconds===undefined)continue;const wallet=a.wallet.toLowerCase();const timestamp=new Date(Number(a.timestamp)*1000);await tx.signal.upsert({where:{chainId_transactionHash_logIndex:{chainId:network.chainId,transactionHash:log.transactionHash,logIndex:log.logIndex}},create:{chainId:network.chainId,epochId:a.epochId,wallet,timestamp,extensionSeconds:Number(a.extensionSeconds),blockNumber:log.blockNumber,blockHash:log.blockHash,transactionHash:log.transactionHash,logIndex:log.logIndex},update:{blockNumber:log.blockNumber,blockHash:log.blockHash}});await tx.participant.upsert({where:{chainId_epochId_wallet:{chainId:network.chainId,epochId:a.epochId,wallet}},create:{chainId:network.chainId,epochId:a.epochId,wallet,signalCount:1,points:10,firstSignalAt:timestamp,lastSignalAt:timestamp},update:{signalCount:{increment:1},points:{increment:10},lastSignalAt:timestamp}});await tx.epoch.updateMany({where:{id:a.epochId,chainId:network.chainId},data:{totalSignals:{increment:1},totalExtensionSeconds:{increment:Number(a.extensionSeconds)}}});}
  }
  const last=await client.getBlock({blockNumber:to});await tx.indexerCursor.update({where:{chainId:network.chainId},data:{nextBlock:to+1n,lastBlockHash:last.hash,error:null}});
 });
}

async function main(){let delay=3000;for(;;){try{await syncBatch();delay=3000;await new Promise(r=>setTimeout(r,12000));}catch(e){const message=e instanceof Error?e.message:String(e);console.error(message);await db.indexerCursor.upsert({where:{chainId:network.chainId},create:{chainId:network.chainId,nextBlock:startBlock,error:message},update:{error:message}});await new Promise(r=>setTimeout(r,delay));delay=Math.min(delay*2,60000);}}}
main().finally(()=>db.$disconnect());
