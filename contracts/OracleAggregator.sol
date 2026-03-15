// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OracleAggregator {
    // Mapping of oracles to their respective yields
    mapping(address => AggregatorV3Interface) public oracles;

    // Function to add a new oracle
    function addOracle(address oracle) public {
        // TODO: implement add oracle logic
    }

    // Function to get the latest yield rate from an oracle
    function getLatestYieldRate(address oracle) public view returns (uint256) {
        // TODO: implement get latest yield rate logic
    }
}