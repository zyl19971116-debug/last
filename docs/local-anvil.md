# Local Anvil countdown testing

This mode is development-only. It never replaces the Robinhood Chain Testnet configuration and must never be enabled for a production process.

## Start and deploy

```powershell
& "$env:USERPROFILE\.foundry\bin\anvil.exe" --host 127.0.0.1 --port 8545 --chain-id 31337
```

In another terminal:

```powershell
Set-Location contracts
& "$env:USERPROFILE\.foundry\bin\forge.exe" test -vvv
& "$env:USERPROFILE\.foundry\bin\forge.exe" script script/DeployLocal.s.sol:DeployLocal --rpc-url http://127.0.0.1:8545 --private-key <ANVIL_ACCOUNT_0_PRIVATE_KEY> --broadcast
```

The private key is one of Anvil's disposable deterministic development keys. Never use it on a public network and never commit it to an environment file.

## Frontend environment

Create `.env.local` with the deployed address and the following local-only values:

```dotenv
NEXT_PUBLIC_ENABLE_LOCAL_CHAIN=true
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_LAST_SIGNAL_ADDRESS=<DEPLOYED_LOCAL_ADDRESS>
INDEXER_RPC_URL=http://127.0.0.1:8545
INDEXER_START_BLOCK=<DEPLOYMENT_BLOCK>
INDEXER_CONFIRMATIONS=0
```

Start the app bound to localhost:

```powershell
npm run dev -- -p 3002 -H 127.0.0.1
```

Open `http://127.0.0.1:3002/dev/countdown-lab`. The lab API accepts only fixed operations, requires development mode, requires chain ID 31337, requires the allowlisted localhost RPC, and rejects non-local Host headers.

## Tests

```powershell
npm run typecheck
npm test
npm run test:e2e:local
npm run build
```

The local Playwright test uses genuine Anvil transactions and time travel. It will mutate the disposable local chain state.
