const localRequested=process.env.NEXT_PUBLIC_ENABLE_LOCAL_CHAIN==='true';
export const CONTRACT_ADDRESS=(process.env.NODE_ENV==='production'&&localRequested?undefined:process.env.NEXT_PUBLIC_LAST_SIGNAL_ADDRESS) as `0x${string}`|undefined;
export const lastSignalAbi=[
 {type:'function',name:'sendSignal',stateMutability:'nonpayable',inputs:[],outputs:[]},
 {type:'function',name:'startNextEpoch',stateMutability:'nonpayable',inputs:[],outputs:[]},
 {type:'function',name:'getCurrentEpoch',stateMutability:'view',inputs:[],outputs:[{name:'id',type:'uint256'},{name:'startTime',type:'uint64'},{name:'endTime',type:'uint64'},{name:'totalSignals',type:'uint64'},{name:'uniqueParticipants',type:'uint64'},{name:'totalExtension',type:'uint64'},{name:'status',type:'uint8'}]},
 {type:'function',name:'canSignal',stateMutability:'view',inputs:[{name:'account',type:'address'}],outputs:[{name:'',type:'bool'},{name:'',type:'uint8'}]},
 {type:'function',name:'lastSignalDay',stateMutability:'view',inputs:[{name:'epochId',type:'uint256'},{name:'account',type:'address'}],outputs:[{name:'dayIndex',type:'uint256'},{name:'exists',type:'bool'}]},
 {type:'event',name:'EpochStarted',inputs:[{indexed:true,name:'epochId',type:'uint256'},{indexed:false,name:'startTime',type:'uint256'},{indexed:false,name:'endTime',type:'uint256'}]},
 {type:'event',name:'EpochFinalized',inputs:[{indexed:true,name:'epochId',type:'uint256'},{indexed:false,name:'startTime',type:'uint256'},{indexed:false,name:'endTime',type:'uint256'},{indexed:false,name:'totalSignals',type:'uint256'},{indexed:false,name:'uniqueParticipants',type:'uint256'},{indexed:false,name:'totalExtension',type:'uint256'}]},
 {type:'event',name:'SignalSent',inputs:[{indexed:true,name:'epochId',type:'uint256'},{indexed:true,name:'wallet',type:'address'},{indexed:false,name:'timestamp',type:'uint256'},{indexed:false,name:'extensionSeconds',type:'uint256'}]}
] as const;
