// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OracleAggregator {
    // Mapping of oracles to their respective data feeds
    mapping(address => AggregatorV3Interface) public oracles;

    function getOracleDataFeed(address oracle) public view returns (AggregatorV3Interface) {
        return oracles[oracle];
    }

    function addOracle(address oracle, AggregatorV3Interface dataFeed) public {
        oracles[oracle] = dataFeed;
    }
}
