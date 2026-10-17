import {createPublicClient,http} from 'viem'; import {robinhoodTestnet} from '@/lib/chain'; import {lastSignalAbi} from '@/lib/contract';
export const lastSignalAddress=process.env.NEXT_PUBLIC_LAST_SIGNAL_ADDRESS as `0x${string}`|undefined;
export const lastSignalClient=createPublicClient({chain:robinhoodTestnet,transport:http(process.env.NEXT_PUBLIC_RPC_URL)});
export {lastSignalAbi};
export function requireLastSignalAddress(){if(!lastSignalAddress)throw new Error('NEXT_PUBLIC_LAST_SIGNAL_ADDRESS is not configured');return lastSignalAddress;}
