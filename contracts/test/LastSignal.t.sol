// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {Test} from "forge-std/Test.sol";
import {LastSignal} from "../src/LastSignal.sol";

contract LastSignalTest is Test {
    LastSignal signal; address alice=address(0xA11CE); address bob=address(0xB0B);
    function setUp() public { vm.warp(100 days); signal=new LastSignal(); }
    function testSignalExtendsAndCountsUnique() public { (, ,uint64 beforeEnd,,,,)=signal.getCurrentEpoch(); vm.prank(alice); signal.sendSignal(); (,,uint64 afterEnd,uint64 total,uint64 unique,uint64 ext,)=signal.getCurrentEpoch(); assertEq(afterEnd,beforeEnd+1 hours);assertEq(total,1);assertEq(unique,1);assertEq(ext,1 hours); }
    function testCannotSignalTwiceSameUtcDay() public { vm.startPrank(alice);signal.sendSignal();vm.expectRevert();signal.sendSignal();vm.stopPrank(); }
    function testUtcBoundaryAllowsNextSignal() public { vm.prank(alice);signal.sendSignal();vm.warp((block.timestamp/1 days+1)*1 days);vm.prank(alice);signal.sendSignal();(,,,uint64 total,uint64 unique,,)=signal.getCurrentEpoch();assertEq(total,2);assertEq(unique,1); }
    function testConcurrentOrderingRejectsSecondSameWallet() public { vm.prank(alice);signal.sendSignal();vm.prank(bob);signal.sendSignal();vm.prank(alice);vm.expectRevert();signal.sendSignal(); }
    function testEndedAndPermissionlessNextEpoch() public { (,,uint64 end,,,,)=signal.getCurrentEpoch();vm.warp(end);vm.prank(alice);vm.expectRevert();signal.sendSignal();vm.prank(bob);signal.startNextEpoch();assertEq(signal.currentEpochId(),2); }
    function testCrossEpochEligibilityResets() public { vm.prank(alice);signal.sendSignal();(,,uint64 end,,,,)=signal.getCurrentEpoch();vm.warp(end);signal.startNextEpoch();vm.prank(alice);signal.sendSignal();assertTrue(signal.hasParticipated(2,alice)); }
    function testFuzzUniqueParticipants(address user) public { vm.assume(user!=address(0));vm.prank(user);signal.sendSignal();(,,,,uint64 unique,,)=signal.getCurrentEpoch();assertEq(unique,1); }
}
