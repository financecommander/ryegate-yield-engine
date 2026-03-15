pragma solidity ^0.8.0;

import './ERC1400Token.sol';

contract YieldOptimizer {
    // Mapping of yield sources to their corresponding yield rates
    mapping(address => uint256) public yieldRates;

    // Mapping of yield sources to their corresponding yield tokens
    mapping(address => address) public yieldTokens;

    // Event emitted when a new yield source is added
    event YieldSourceAdded(address yieldSource);

    // Event emitted when a yield rate is updated
    event YieldRateUpdated(address yieldSource, uint256 newRate);

    // Add a new yield source to the optimizer
    function addYieldSource(address _yieldSource, uint256 _yieldRate, address _yieldToken) public {
        yieldRates[_yieldSource] = _yieldRate;
        yieldTokens[_yieldSource] = _yieldToken;
        emit YieldSourceAdded(_yieldSource);
    }

    // Update the yield rate for a given yield source
    function updateYieldRate(address _yieldSource, uint256 _newRate) public {
        yieldRates[_yieldSource] = _newRate;
        emit YieldRateUpdated(_yieldSource, _newRate);
    }
}