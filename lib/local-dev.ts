import {createPublicClient,createWalletClient,encodeFunctionData,http} from 'viem';
import {lastSignalAbi} from './contract';
import {localAnvil} from './chain';

export const LOCAL_RPC_URL='http://127.0.0.1:8545';
export const LOCAL_CHAIN_ID=31337;
export const LOCAL_TEST_ACCOUNT='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const;

export function assertLocalDevelopment(host:string|null){
 if(process.env.NODE_ENV!=='development'||process.env.NEXT_PUBLIC_ENABLE_LOCAL_CHAIN!=='true')throw new Error('Local development mode is disabled');
 if(host!=='127.0.0.1:3002'&&host!=='localhost:3002')throw new Error('Local lab is restricted to this machine');
 if(process.env.NEXT_PUBLIC_RPC_URL!==LOCAL_RPC_URL)throw new Error('Local lab RPC is not allowlisted');
 const address=process.env.NEXT_PUBLIC_LAST_SIGNAL_ADDRESS as `0x${string}`|undefined;
 if(!address)throw new Error('Local contract address is not configured');
 return address;
}

export const localPublicClient=createPublicClient({chain:localAnvil,transport:http(LOCAL_RPC_URL)});
export const localWalletClient=createWalletClient({chain:localAnvil,transport:http(LOCAL_RPC_URL),account:LOCAL_TEST_ACCOUNT});

export async function localRpc(method:string,params:unknown[]=[]){
 const response=await fetch(LOCAL_RPC_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),cache:'no-store'});
 const payload=await response.json() as {result?:unknown;error?:{message:string}};
 if(payload.error)throw new Error(payload.error.message);
 return payload.result;
}

export async function sendLocalContractTransaction(address:`0x${string}`,functionName:'sendSignal'|'startNextEpoch'){
 const hash=await localWalletClient.sendTransaction({to:address,data:encodeFunctionData({abi:lastSignalAbi,functionName}),value:0n});
 const receipt=await localPublicClient.waitForTransactionReceipt({hash});
 if(receipt.status!=='success')throw new Error(`Local ${functionName} transaction reverted: ${hash}`);
 return {hash,blockNumber:receipt.blockNumber.toString(),status:receipt.status};
}
