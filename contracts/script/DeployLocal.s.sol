// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {LastSignal} from "../src/LastSignal.sol";

/// @notice Development-only deployment entry point for a local Anvil chain.
/// @dev The production/testnet deployment guard remains in DeployLastSignal.s.sol.
contract DeployLocal is Script {
    error WrongLocalChain(uint256 actual);

    function run() external returns (LastSignal deployed) {
        if (block.chainid != 31337) revert WrongLocalChain(block.chainid);
        vm.startBroadcast();
        deployed = new LastSignal();
        vm.stopBroadcast();
    }
}
