import { defineChain } from 'viem'; import network from '../config/network.json';
const localRequested=process.env.NEXT_PUBLIC_ENABLE_LOCAL_CHAIN==='true';
export const localChainEnabled=process.env.NODE_ENV==='development'&&localRequested;
const robinhoodRpc=localRequested?network.publicRpcUrl:(process.env.NEXT_PUBLIC_RPC_URL||network.publicRpcUrl);
export const robinhoodTestnet=defineChain({id:network.chainId,name:network.name,nativeCurrency:network.nativeCurrency,rpcUrls:{default:{http:[robinhoodRpc]}},blockExplorers:{default:{name:'Robinhood Chain Testnet Explorer',url:network.explorerUrl}},testnet:true});
export const robinhoodMainnet=defineChain({id:4663,name:'Robinhood Chain',nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},rpcUrls:{default:{http:['https://rpc.mainnet.chain.robinhood.com']}},blockExplorers:{default:{name:'Robinhood Chain Explorer',url:'https://robinhoodchain.blockscout.com'}}});
export const localAnvil=defineChain({id:31337,name:'Local Testnet',nativeCurrency:{name:'Anvil Ether',symbol:'ETH',decimals:18},rpcUrls:{default:{http:['http://127.0.0.1:8545']}},testnet:true});
export const activeChain=localChainEnabled?localAnvil:robinhoodTestnet;
export const activeChainLabel=localChainEnabled?'LOCAL TESTNET':'Robinhood Testnet';
