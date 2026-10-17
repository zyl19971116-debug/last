// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {DeployLastSignal} from "./DeployLastSignal.s.sol";

/// @dev Backwards-compatible entry point; inherits the Robinhood testnet guard.
contract Deploy is DeployLastSignal {}
