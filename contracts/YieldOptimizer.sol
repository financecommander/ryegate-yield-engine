// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract YieldOptimizer {
    // Mapping of yield sources to their respective yield rates
    mapping(address => uint256) public yieldRates;
    // Mapping of yield sources to their respective liquidity
    mapping(address => uint256) public liquidity;
    // Array of yield sources
    address[] public yieldSources;

    function getYieldRate(address yieldSource) public view returns (uint256) {
        return yieldRates[yieldSource];
    }

    function addYieldSource(address yieldSource, uint256 yieldRate) public {
        yieldSources.push(yieldSource);
        yieldRates[yieldSource] = yieldRate;
    }

    function updateYieldRate(address yieldSource, uint256 yieldRate) public {
        yieldRates[yieldSource] = yieldRate;
    }
}
