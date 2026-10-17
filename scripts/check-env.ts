const required=['NEXT_PUBLIC_CHAIN_ID','NEXT_PUBLIC_RPC_URL','NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID','NEXT_PUBLIC_LAST_SIGNAL_ADDRESS','DATABASE_URL','INDEXER_RPC_URL','INDEXER_START_BLOCK','INDEXER_CONFIRMATIONS'];
const missing=required.filter(name=>!process.env[name]);
if(process.env.NEXT_PUBLIC_CHAIN_ID&&process.env.NEXT_PUBLIC_CHAIN_ID!=='46630'){console.error('FAIL NEXT_PUBLIC_CHAIN_ID must be 46630');process.exitCode=1;}
for(const name of missing)console.log(`MISSING ${name} — configure it in .env.local or the process environment`);
console.log(missing.length?`BLOCKED: ${missing.length} required variables are absent`:'PASS: required variable names are configured (values intentionally hidden)');
if(missing.length)process.exitCode=2;
