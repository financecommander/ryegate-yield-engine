pragma solidity ^0.8.0;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

contract OracleAggregator {
    AggregatorV3Interface[] public oracles;

    function addOracle(address _oracle) public {
        oracles.push(AggregatorV3Interface(_oracle));
    }

    function getLatestPrice() public view returns (int256) {
        // TODO: Implement Chainlink oracle aggregation logic
        return 0;
    }
}