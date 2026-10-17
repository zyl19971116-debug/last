'use client';
import '@rainbow-me/rainbowkit/styles.css';
import {getDefaultConfig,RainbowKitProvider,darkTheme} from '@rainbow-me/rainbowkit';
import {WagmiProvider} from 'wagmi'; import {QueryClient,QueryClientProvider} from '@tanstack/react-query'; import {useState} from 'react'; import {activeChain} from '@/lib/chain';
const config=getDefaultConfig({appName:'LAST SIGNAL',projectId:process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID||'MISSING_PROJECT_ID',chains:[activeChain],ssr:true});
export function Providers({children}:{children:React.ReactNode}){const [client]=useState(()=>new QueryClient());return <WagmiProvider config={config}><QueryClientProvider client={client}><RainbowKitProvider locale="en-US" theme={darkTheme({accentColor:'#f22547',borderRadius:'small'})}>{children}</RainbowKitProvider></QueryClientProvider></WagmiProvider>}
