# Deployment

The repository defaults to Robinhood Chain Testnet (chain ID `46630`). The verified public endpoint is `https://rpc.testnet.chain.robinhood.com`; the explorer is `https://explorer.testnet.chain.robinhood.com`. Public RPCs are rate limited, so configure a production provider before launch.

1. Install Foundry and run `cd contracts && forge install foundry-rs/forge-std && forge test`.
2. Fund a deployment wallet with testnet ETH from the official faucet.
3. Set `RH_RPC_URL` and `PRIVATE_KEY` in your shell only. Never commit either.
4. Run `forge script script/Deploy.s.sol:Deploy --rpc-url $RH_RPC_URL --broadcast` from `contracts/`.
5. Verify with Blockscout and put the verified address in `NEXT_PUBLIC_LAST_SIGNAL_ADDRESS`.
6. Apply the Prisma schema using `npx prisma migrate dev`, then run `npm run indexer`.

No deployment has been executed by this repository.
