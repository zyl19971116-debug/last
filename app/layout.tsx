import './globals.css'; import {Providers} from '@/components/providers'; import type {Metadata} from 'next';
export const metadata:Metadata={title:'LAST SIGNAL — One Signal Can Change Tomorrow',description:'A global on-chain countdown written by everyone.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers>{children}</Providers></body></html>}
