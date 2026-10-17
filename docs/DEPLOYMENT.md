# Deployment

The repository defaults to Robinhood Chain Testnet (chain ID `46630`). The verified public endpoint is `https://rpc.testnet.chain.robinhood.com`; the explorer is `https://explorer.testnet.chain.robinhood.com`. Public RPCs are rate limited, so configure a production provider before launch.

1. Install Foundry and run `cd contracts && forge install foundry-rs/forge-std && forge test`.
2. Fund a deployment wallet with testnet ETH from the official faucet.
3. Use an encrypted keystore or hardware/interactively signed account. Do not paste or commit a raw private key. Configure `DEPLOYER_KEYSTORE_PATH` and a separate `DEPLOYER_KEYSTORE_PASSWORD_FILE` locally.
4. Run the preflight checks (`npm run check:chain`, `npm run check:env`, `forge build`, `forge test -vvv`). Confirm chain ID `46630`, deployer address and balance.
5. Only after explicit authorization, run `forge script script/DeployLastSignal.s.sol:DeployLastSignal --rpc-url robinhood_testnet --keystore <path> --password-file <path> --broadcast` from `contracts/`.
6. Verify receipt status and bytecode using `npm run check:contract`, then verify source with the Blockscout API.
7. Record the real address and deployment block in local environment variables. Run `npx prisma migrate deploy`, then `npm run indexer`.

No deployment has been executed by this repository.
