pragma solidity ^0.8.0;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

contract OracleAggregator {
    // Mapping of oracles to their corresponding yield rates
    mapping(address => uint256) public oracleRates;

    // Event emitted when a new oracle is added
    event OracleAdded(address oracle);

    // Event emitted when an oracle rate is updated
    event OracleRateUpdated(address oracle, uint256 newRate);

    // Add a new oracle to the aggregator
    function addOracle(address _oracle) public {
        oracleRates[_oracle] = 0;
        emit OracleAdded(_oracle);
    }

    // Update the rate for a given oracle
    function updateOracleRate(address _oracle, uint256 _newRate) public {
        oracleRates[_oracle] = _newRate;
        emit OracleRateUpdated(_oracle, _newRate);
    }
}