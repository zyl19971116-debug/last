'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Clock3,Radio,RefreshCw} from 'lucide-react';
import {Countdown} from './countdown';

type LabState={chainId:number;currentBlock:string;chainTimestamp:number;contractAddress:string;testAccount:string;epoch:{id:string;startTime:number;endTime:number;totalSignals:number;uniqueParticipants:number;totalExtension:number;status:number};eligibility:{canSignal:boolean;reason:number};transaction?:{hash:string;blockNumber:string;status:string}|null};
const actions=[['advanceHour','Advance 1 Hour'],['advanceDay','Advance 1 Day'],['advanceToEnd','Advance To Epoch End'],['mine','Mine Block'],['refresh','Refresh Contract State'],['sendSignal','Send Real Test Signal'],['startNextEpoch','Finalize / Start Next Epoch']] as const;
const format=(seconds:number)=>new Date(seconds*1000).toISOString();

export function LocalCountdownLab(){
 const [data,setData]=useState<LabState|null>(null);
 const [busy,setBusy]=useState('');
 const [error,setError]=useState('');
 const refresh=useCallback(async()=>{const response=await fetch('/api/dev/anvil',{cache:'no-store'});const body=await response.json();if(!response.ok)throw new Error(body.error);setData(body)},[]);
 useEffect(()=>{refresh().catch(e=>setError(e.message))},[refresh]);
 const run=async(action:string)=>{setBusy(action);setError('');try{if(action==='refresh')await refresh();else{const response=await fetch('/api/dev/anvil',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action})});const body=await response.json();if(!response.ok)throw new Error(body.error);setData(body)}}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy('')}};
 return <main className="lab-page">
  <Link href="/" className="lab-back"><ArrowLeft/> Return to LAST SIGNAL</Link>
  <header><p className="eyebrow"><span/>LOCAL DEVELOPMENT ONLY</p><h1>COUNTDOWN LAB</h1><p>Canonical state from Anvil chain 31337. Controls call an allowlisted localhost RPC and cannot run in production.</p></header>
  {data?<><section className="lab-clock"><span><Radio/> CURRENT EPOCH #{String(data.epoch.id).padStart(3,'0')}</span><Countdown endTime={data.epoch.endTime*1000} chainNow={data.chainTimestamp*1000}/><small>{data.epoch.status===0?'ACTIVE':'FINALIZED'} · CHAIN TIME {format(data.chainTimestamp)}</small></section><section className="lab-metrics">{[['Current Block',data.currentBlock],['Chain ID',data.chainId],['Epoch End',format(data.epoch.endTime)],['Remaining Time',`${Math.max(0,data.epoch.endTime-data.chainTimestamp)}s`],['Total Signals',data.epoch.totalSignals],['Unique Participants',data.epoch.uniqueParticipants],['Total Extension',`${data.epoch.totalExtension}s`],['Eligibility',data.eligibility.canSignal?'ELIGIBLE':`BLOCKED · ${data.eligibility.reason}`]].map(([label,value])=><article key={String(label)}><small>{label}</small><strong>{String(value)}</strong></article>)}</section><section className="lab-controls">{actions.map(([action,label])=><button key={action} disabled={!!busy} onClick={()=>run(action)}>{action==='refresh'?<RefreshCw/>:<Clock3/>}{busy===action?'RUNNING…':label}</button>)}</section><section className="lab-proof"><p><b>Contract</b> <code>{data.contractAddress}</code></p><p><b>Anvil Test Account</b> <code>{data.testAccount}</code></p>{data.transaction&&<p><b>Last Transaction</b> <code>{data.transaction.hash}</code> · block {data.transaction.blockNumber} · {data.transaction.status}</p>}</section></>:<div className="empty-state"><span><Radio/></span><h3>Connecting to local Anvil</h3><p>Waiting for canonical chain state.</p></div>}
  {error&&<p className="error-box">{error}</p>}
 </main>;
}
