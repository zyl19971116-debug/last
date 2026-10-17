// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Script} from "forge-std/Script.sol"; import {LastSignal} from "../src/LastSignal.sol";
contract Deploy is Script { function run() external returns(LastSignal deployed){vm.startBroadcast();deployed=new LastSignal();vm.stopBroadcast();} }
