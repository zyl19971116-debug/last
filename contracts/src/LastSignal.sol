// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title LAST SIGNAL shared countdown
/// @notice One free protocol action per address per UTC day. Network gas still applies.
/// @dev All mutations are O(1). Historical discovery is event-driven.
contract LastSignal {
    uint64 public constant INITIAL_DURATION = 7 days;
    uint64 public constant SIGNAL_EXTENSION = 1 hours;
    uint64 public constant MAX_TOTAL_EXTENSION = 30 days;

    enum EpochStatus { Active, Finalized }
    struct Epoch { uint64 startTime; uint64 endTime; uint64 totalSignals; uint64 uniqueParticipants; uint64 totalExtension; EpochStatus status; }

    uint256 public currentEpochId;
    mapping(uint256 => Epoch) public epochs;
    mapping(uint256 => mapping(address => uint256)) private lastSignalDayPlusOne;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;

    error EpochEnded(uint256 epochId, uint256 endTime);
    error AlreadySignaledToday(uint256 epochId, address wallet, uint256 dayIndex);
    error ExtensionCapReached(uint256 epochId);
    error EpochStillActive(uint256 epochId, uint256 endTime);
    error EpochAlreadyFinalized(uint256 epochId);

    event EpochStarted(uint256 indexed epochId, uint256 startTime, uint256 endTime);
    event EpochFinalized(uint256 indexed epochId, uint256 startTime, uint256 endTime, uint256 totalSignals, uint256 uniqueParticipants, uint256 totalExtension);
    event SignalSent(uint256 indexed epochId, address indexed wallet, uint256 timestamp, uint256 extensionSeconds);

    constructor() { _startEpoch(1); }

    /// @notice Send today's signal, extending the active epoch by exactly one hour.
    function sendSignal() external {
        Epoch storage epoch = epochs[currentEpochId];
        if (epoch.status != EpochStatus.Active || block.timestamp >= epoch.endTime) revert EpochEnded(currentEpochId, epoch.endTime);
        uint256 dayIndex = block.timestamp / 1 days;
        if (lastSignalDayPlusOne[currentEpochId][msg.sender] == dayIndex + 1) revert AlreadySignaledToday(currentEpochId, msg.sender, dayIndex);
        if (MAX_TOTAL_EXTENSION - epoch.totalExtension < SIGNAL_EXTENSION) revert ExtensionCapReached(currentEpochId);
        lastSignalDayPlusOne[currentEpochId][msg.sender] = dayIndex + 1;
        if (!hasParticipated[currentEpochId][msg.sender]) { hasParticipated[currentEpochId][msg.sender] = true; epoch.uniqueParticipants += 1; }
        epoch.totalSignals += 1; epoch.totalExtension += SIGNAL_EXTENSION; epoch.endTime += SIGNAL_EXTENSION;
        emit SignalSent(currentEpochId, msg.sender, block.timestamp, SIGNAL_EXTENSION);
    }

    /// @notice Finalize the ended epoch and create the next one. Permissionless; requires a transaction.
    function startNextEpoch() external {
        Epoch storage epoch = epochs[currentEpochId];
        if (epoch.status == EpochStatus.Finalized) revert EpochAlreadyFinalized(currentEpochId);
        if (block.timestamp < epoch.endTime) revert EpochStillActive(currentEpochId, epoch.endTime);
        epoch.status = EpochStatus.Finalized;
        emit EpochFinalized(currentEpochId, epoch.startTime, epoch.endTime, epoch.totalSignals, epoch.uniqueParticipants, epoch.totalExtension);
        unchecked { currentEpochId += 1; }
        _startEpoch(currentEpochId);
    }

    /// @return eligible Whether account may signal now.
    /// @return reason 0=eligible, 1=ended, 2=already today, 3=cap reached.
    function canSignal(address account) external view returns (bool eligible, uint8 reason) {
        Epoch storage epoch = epochs[currentEpochId];
        if (epoch.status != EpochStatus.Active || block.timestamp >= epoch.endTime) return (false, 1);
        if (lastSignalDayPlusOne[currentEpochId][account] == block.timestamp / 1 days + 1) return (false, 2);
        if (MAX_TOTAL_EXTENSION - epoch.totalExtension < SIGNAL_EXTENSION) return (false, 3);
        return (true, 0);
    }

    function getCurrentEpoch() external view returns (uint256 id,uint64 startTime,uint64 endTime,uint64 totalSignals,uint64 uniqueParticipants,uint64 totalExtension,EpochStatus status) {
        Epoch storage e=epochs[currentEpochId]; return(currentEpochId,e.startTime,e.endTime,e.totalSignals,e.uniqueParticipants,e.totalExtension,e.status);
    }
    function _startEpoch(uint256 id) private { uint64 start=uint64(block.timestamp); epochs[id]=Epoch(start,start+INITIAL_DURATION,0,0,0,EpochStatus.Active); emit EpochStarted(id,start,start+INITIAL_DURATION); }
}
