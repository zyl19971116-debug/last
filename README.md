# LAST SIGNAL

A real, wallet-signed global countdown for Robinhood Chain. The UI never substitutes mock blockchain data: absent configuration produces explicit empty, syncing, or unavailable states.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, RainbowKit/wagmi/viem, Framer Motion, Solidity/Foundry, PostgreSQL/Prisma, and Playwright.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set a WalletConnect project ID and a verified deployed contract address for wallet transactions. See `docs/DEPLOYMENT.md`. The generated hero art is original and stored in `public/assets/last-signal/hero-world.png`; live UI, buttons, typography, stats and countdown are DOM elements.

## Commands

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- `cd contracts && forge test`

## Integrity and limitations

- SIGNAL means zero platform fee, not zero gas.
- The server never holds user keys.
- The app defaults to Robinhood Chain Testnet, chain ID 46630.
- Rankings and points derive only from confirmed `SignalSent` logs.
- There is no deployed rewards or ERC-20 contract in the MVP.
- Public RPC outages surface as errors; they do not trigger mock data.

## Phase 7 checks

Run `npm run check:chain`, `npm run check:env`, `npm run check:database`, `npm run check:contract`, and `npm run check:indexer`. These checks redact secret values and return `BLOCKED` when required external configuration is absent. See `docs/PHASE7_AUDIT.md` and `docs/PHASE7_REPORT.md`.
