// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Test} from "forge-std/Test.sol";
import {LastSignal} from "../src/LastSignal.sol";

contract LastSignalTest is Test {
    LastSignal signal;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        vm.warp(100 days);
        signal = new LastSignal();
    }

    function testInitialEpoch() public view {
        (uint256 id, uint64 start, uint64 end,,,, LastSignal.EpochStatus status) = signal.getCurrentEpoch();
        assertEq(id, 1);
        assertEq(end - start, 7 days);
        assertEq(uint8(status), uint8(LastSignal.EpochStatus.Active));
    }

    function testSignalExtendsAndCountsUnique() public {
        (,, uint64 beforeEnd,,,,) = signal.getCurrentEpoch();
        vm.prank(alice);
        signal.sendSignal();
        (,, uint64 afterEnd, uint64 total, uint64 unique, uint64 ext,) = signal.getCurrentEpoch();
        assertEq(afterEnd, beforeEnd + 1 hours);
        assertEq(total, 1);
        assertEq(unique, 1);
        assertEq(ext, 1 hours);
    }

    function testCannotSignalTwiceSameUtcDay() public {
        vm.startPrank(alice);
        signal.sendSignal();
        vm.expectRevert();
        signal.sendSignal();
        vm.stopPrank();
    }

    function testUtcBoundaryAllowsNextSignal() public {
        vm.prank(alice);
        signal.sendSignal();
        vm.warp((block.timestamp / 1 days + 1) * 1 days);
        vm.prank(alice);
        signal.sendSignal();
        (,,, uint64 total, uint64 unique,,) = signal.getCurrentEpoch();
        assertEq(total, 2);
        assertEq(unique, 1);
    }

    function testConcurrentOrderingRejectsSecondSameWallet() public {
        vm.prank(alice);
        signal.sendSignal();
        vm.prank(bob);
        signal.sendSignal();
        vm.prank(alice);
        vm.expectRevert();
        signal.sendSignal();
    }

    function testEndedAndPermissionlessNextEpoch() public {
        (,, uint64 end,,,,) = signal.getCurrentEpoch();
        vm.warp(end);
        vm.prank(alice);
        vm.expectRevert();
        signal.sendSignal();
        vm.prank(bob);
        signal.startNextEpoch();
        assertEq(signal.currentEpochId(), 2);
    }

    function testCrossEpochEligibilityResets() public {
        vm.prank(alice);
        signal.sendSignal();
        (,, uint64 end,,,,) = signal.getCurrentEpoch();
        vm.warp(end);
        signal.startNextEpoch();
        vm.prank(alice);
        signal.sendSignal();
        assertTrue(signal.hasParticipated(2, alice));
    }

    function testFuzzUniqueParticipants(address user) public {
        vm.assume(user != address(0));
        vm.prank(user);
        signal.sendSignal();
        (,,,, uint64 unique,,) = signal.getCurrentEpoch();
        assertEq(unique, 1);
    }

    function testDayZeroSentinelDoesNotBlockFirstSignal() public {
        vm.warp(0);
        LastSignal fresh = new LastSignal();
        vm.prank(alice);
        fresh.sendSignal();
        (uint256 day, bool exists) = fresh.lastSignalDay(1, alice);
        assertEq(day, 0);
        assertTrue(exists);
    }

    function testUtc2359ToMidnight() public {
        vm.warp(101 days - 1);
        LastSignal fresh = new LastSignal();
        vm.prank(alice);
        fresh.sendSignal();
        vm.warp(101 days);
        vm.prank(alice);
        fresh.sendSignal();
    }

    function testEventParameters() public {
        vm.expectEmit(true, true, false, true);
        emit LastSignal.SignalSent(1, alice, block.timestamp, 1 hours);
        vm.prank(alice);
        signal.sendSignal();
    }

    function testOldEpochIsImmutableAfterNextStarts() public {
        vm.prank(alice);
        signal.sendSignal();
        (uint64 start, uint64 end, uint64 total, uint64 unique, uint64 ext,) = signal.epochs(1);
        vm.warp(end);
        signal.startNextEpoch();
        (uint64 a, uint64 b, uint64 c, uint64 d, uint64 e, LastSignal.EpochStatus status) = signal.epochs(1);
        assertEq(a, start);
        assertEq(b, end);
        assertEq(c, total);
        assertEq(d, unique);
        assertEq(e, ext);
        assertEq(uint8(status), 1);
    }

    function testCannotStartNextTwiceBeforeEnd() public {
        (,, uint64 end,,,,) = signal.getCurrentEpoch();
        vm.warp(end);
        signal.startNextEpoch();
        vm.expectRevert();
        signal.startNextEpoch();
    }

    function testExtensionCap() public {
        for (uint256 i; i < 720; i++) {
            address user = address(uint160(i + 1));
            vm.prank(user);
            signal.sendSignal();
        }
        vm.prank(address(9999));
        vm.expectRevert();
        signal.sendSignal();
        (,,,,, uint64 ext,) = signal.getCurrentEpoch();
        assertEq(ext, 30 days);
    }

    function testFuzzEndBoundary(uint32 offset) public {
        (,, uint64 end,,,,) = signal.getCurrentEpoch();
        offset = uint32(bound(offset, 0, 3600));
        vm.warp(uint256(end) + offset);
        vm.prank(alice);
        vm.expectRevert();
        signal.sendSignal();
    }
}
