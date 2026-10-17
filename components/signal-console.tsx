'use client';
import {useAccount,useBlock,useReadContract,useWriteContract,useWaitForTransactionReceipt,useSwitchChain,useSimulateContract} from 'wagmi';
import {ConnectButton} from '@rainbow-me/rainbowkit';
import {CONTRACT_ADDRESS,lastSignalAbi} from '@/lib/contract';
import {activeChain,localChainEnabled} from '@/lib/chain';
import {Activity,Check,Clock3,ExternalLink,Fuel,Radio,ShieldCheck,Wallet,X} from 'lucide-react';
import {Countdown} from './countdown';

export function SignalConsole(){
 const {address,isConnected,chainId}=useAccount();
 const {switchChain}=useSwitchChain();
 const epoch=useReadContract({address:CONTRACT_ADDRESS!,abi:lastSignalAbi,functionName:'getCurrentEpoch',query:{enabled:!!CONTRACT_ADDRESS,refetchInterval:12000}});
 const block=useBlock({query:{enabled:!!CONTRACT_ADDRESS,refetchInterval:12000}});
 const e=epoch.data as readonly [bigint,bigint,bigint,bigint,bigint,bigint,number]|undefined;
 const eligibility=useReadContract({address:CONTRACT_ADDRESS!,abi:lastSignalAbi,functionName:'canSignal',args:address?[address]:undefined,query:{enabled:!!address&&!!CONTRACT_ADDRESS,refetchInterval:12000}});
 const can=eligibility.data?.[0];
 const simulation=useSimulateContract({address:CONTRACT_ADDRESS!,abi:lastSignalAbi,functionName:'sendSignal',account:address,query:{enabled:!!address&&!!CONTRACT_ADDRESS&&chainId===activeChain.id&&can===true}});
 const {writeContract,data:hash,error,isPending}=useWriteContract();
 const receipt=useWaitForTransactionReceipt({hash,confirmations:1});
 const transmitting=!!hash&&receipt.isLoading;const success=receipt.isSuccess;const failed=!!(error||simulation.error);
 let label='TRANSMIT SIGNAL';
 if(!CONTRACT_ADDRESS)label='CONTRACT NOT CONFIGURED';else if(chainId!==activeChain.id)label='SWITCH NETWORK';else if(eligibility.data&&!can)label=['UNAVAILABLE','EPOCH ENDED','ALREADY SENT TODAY','EXTENSION CAP REACHED'][Number(eligibility.data[1])]||'UNAVAILABLE';else if(simulation.isLoading)label='VERIFYING ELIGIBILITY';else if(simulation.isError)label='SIMULATION FAILED';
 const action=()=>{if(chainId!==activeChain.id){switchChain({chainId:activeChain.id});return}if(simulation.data?.request)writeContract(simulation.data.request)};
 const nextUtc=new Date();nextUtc.setUTCHours(24,0,0,0);
 const state=success?'success':failed?'failed':transmitting?'transmitting':isPending?'charging':'ready';
 const chainNow=block.data?Number(block.data.timestamp)*1000:undefined;
 return <div className="terminal-wrap">
  <section className={`transmitter ${state}`}><div className="terminal-grid"/><div className="transmitter-head"><span>LS–TX / {activeChain.id}</span><span><i/> {state.toUpperCase()}</span></div><div className="emitter"><i/><i/><i/><div className="emitter-core">{success?<Check/>:failed?<X/>:<Radio/>}</div></div><div className="transmitter-copy"><p>{success?'TRANSMISSION CONFIRMED':failed?'TRANSMISSION INTERRUPTED':transmitting?'SIGNAL IN TRANSIT':isPending?'AWAITING SIGNATURE':'REACTOR STANDBY'}</p><h2>{success?'+1 HOUR':transmitting?'TRANSMITTING…':isPending?'CHARGING…':'READY TO TRANSMIT'}</h2>{hash&&(localChainEnabled?<span className="mono">{hash}</span>:<a target="_blank" rel="noreferrer" href={`${activeChain.blockExplorers!.default.url}/tx/${hash}`}>{hash.slice(0,12)}…{hash.slice(-8)} <ExternalLink/></a>)}</div></section>
  <aside className="control-panel"><div className="panel-label"><span/> WALLET ELIGIBILITY</div><h2>Transmission Control</h2><div className="control-identity"><Wallet/><span><small>CONNECTED IDENTITY</small><b className="mono">{address?`${address.slice(0,8)}…${address.slice(-6)}`:'NOT CONNECTED'}</b></span></div><div className="control-rows"><div><span><ShieldCheck/> Daily eligibility</span><b className={can?'ok':''}>{!address?'Connect wallet':eligibility.isLoading?'Checking…':can?'Eligible':label}</b></div><div><span><Activity/> Current epoch</span><b>{e?`#${String(e[0]).padStart(3,'0')}`:'—'}</b></div><div><span><Fuel/> Estimated gas</span><b>{simulation.data?'Wallet estimate':'—'}</b></div><div><span><Clock3/> Extension</span><b>+1 hour</b></div></div>{e&&<div className="mini-countdown"><small>EPOCH TIME REMAINING</small><Countdown endTime={Number(e[2])*1000} chainNow={chainNow}/></div>}{eligibility.data&&!can&&Number(eligibility.data[1])===2&&<p className="next-window">Next window · {nextUtc.toISOString()}</p>}{!isConnected?<ConnectButton/>:<button className="transmit-button" disabled={isPending||transmitting||(chainId===activeChain.id&&(!can||!simulation.data))} onClick={action}><span><Radio/></span>{isPending?'CONFIRM IN WALLET':transmitting?'TRANSMITTING':label}<i/></button>}<p className="gas-warning">SIGNAL has no platform fee. Real network gas in ETH is required.</p>{failed&&<p className="error-box">{(error||simulation.error)?.message}</p>}</aside>
  <section className="history-panel"><div className="section-title"><div><p className="eyebrow"><span/>PERSONAL ARCHIVE</p><h2>Signal History</h2></div><span className="sync-label">INDEXER VERIFIED</span></div><div className="empty-state"><span><Radio/></span><h3>{address?'No indexed transmissions':'Connect to identify your history'}</h3><p>Confirmed events appear after the indexer reaches the transaction block and confirmation depth.</p></div></section>
 </div>;
}
