'use client';
import {useEffect,useState} from 'react';
function split(ms:number){let s=Math.max(0,Math.floor(ms/1000));const d=Math.floor(s/86400);s%=86400;const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);return [d,h,m,s%60]}
export function Countdown({endTime}:{endTime?:number}){const [now,setNow]=useState(Date.now());useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[]);const vals=endTime?split(endTime-now):['--','--','--','--'];return <div className="countdown" aria-label="Current epoch countdown">{vals.map((v,i)=><div key={i}><strong>{String(v).padStart(2,'0')}</strong><span>{['DAYS','HOURS','MINUTES','SECONDS'][i]}</span></div>)}</div>}
