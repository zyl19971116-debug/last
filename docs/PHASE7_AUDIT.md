# Phase 7 Audit

## Baseline

- Verified clean baseline branch `codex/last-signal-build` at `658ebf9` before creating `phase-7-testnet-integration`.
- Existing UI, routes, RainbowKit/wagmi integration, Solidity contract, Foundry project, Prisma schema, indexer and Playwright tests were present.

## Existing real functionality

- Real injected/WalletConnect wallet connectors; no fake account state.
- Real viem reads and wallet-signed `sendSignal` writes when a verified contract address is configured.
- Explicit empty/error states when contract or indexer data is unavailable.
- O(1) contract updates and event-based history design.

## Findings and fixes

- **Critical:** constructor created epoch 1 but left `currentEpochId` at zero. Every signal reverted against an empty epoch. Fixed by explicitly initializing the ID and covered by regression tests.
- The former indexer could begin near chain head instead of the deployment block. It now refuses to start without `INDEXER_START_BLOCK`.
- The former database schema did not model epochs, participants, rewards or achievements. Added non-destructive initial migration and stable chain/transaction/log uniqueness.
- Added chain, environment, database, contract and indexer checks that never print secret values.
- Added a chain-id guard to the testnet deployment script.

## External requirements

- WalletConnect Cloud project ID.
- PostgreSQL connection string for a dedicated environment.
- Testnet contract address and deployment block after deployment.
- Encrypted deployer keystore, separate password file and funded Robinhood Chain Testnet account.

## Tests available

- Foundry unit/fuzz/invariant tests.
- Vitest chain configuration test.
- Playwright navigation, disconnected-wallet honesty and mobile navigation tests.
- Prisma validation/generation and non-destructive migration deployment.

## Deployment status

`READY_TO_DEPLOY` is blocked until the user explicitly authorizes a testnet write and supplies a secure signer with sufficient test ETH. No contract address or transaction hash is claimed.
