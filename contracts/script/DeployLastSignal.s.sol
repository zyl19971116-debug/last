// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script} from "forge-std/Script.sol";
import {LastSignal} from "../src/LastSignal.sol";

contract DeployLastSignal is Script {
    error WrongChain(uint256 actual);

    function run() external returns (LastSignal deployed) {
        if (block.chainid != 46630) revert WrongChain(block.chainid);
        vm.startBroadcast();
        deployed = new LastSignal();
        vm.stopBroadcast();
    }
}
