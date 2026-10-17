import {createPublicClient,http} from 'viem'; import {activeChain} from '@/lib/chain'; import {lastSignalAbi} from '@/lib/contract';
export const lastSignalAddress=process.env.NEXT_PUBLIC_LAST_SIGNAL_ADDRESS as `0x${string}`|undefined;
export const lastSignalClient=createPublicClient({chain:activeChain,transport:http(activeChain.rpcUrls.default.http[0])});
export {lastSignalAbi};
export function requireLastSignalAddress(){if(!lastSignalAddress)throw new Error('NEXT_PUBLIC_LAST_SIGNAL_ADDRESS is not configured');return lastSignalAddress;}
