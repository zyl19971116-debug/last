// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {Test} from "forge-std/Test.sol";
import {LastSignal} from "../src/LastSignal.sol";

contract SignalHandler is Test {
    LastSignal public signal;
    uint256 nonce;

    constructor(LastSignal s) {
        signal = s;
    }

    function send() external {
        address user = address(uint160(++nonce));
        vm.prank(user);
        try signal.sendSignal() {} catch {}
    }
}

contract LastSignalInvariant is StdInvariant, Test {
    LastSignal signal;
    SignalHandler handler;

    function setUp() public {
        vm.warp(10 days);
        signal = new LastSignal();
        handler = new SignalHandler(signal);
        targetContract(address(handler));
    }

    function invariantExtensionNeverExceedsCap() public view {
        (,,,,, uint64 extension,) = signal.getCurrentEpoch();
        assertLe(extension, signal.MAX_TOTAL_EXTENSION());
    }

    function invariantEpochIdNeverZero() public view {
        assertGt(signal.currentEpochId(), 0);
    }
}
