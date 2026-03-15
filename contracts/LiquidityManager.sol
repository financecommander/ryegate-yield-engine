pragma solidity ^0.8.0;

contract LiquidityManager {
    // Mapping of liquidity providers to their corresponding liquidity amounts
    mapping(address => uint256) public liquidityProviders;

    // Event emitted when a new liquidity provider is added
    event LiquidityProviderAdded(address provider);

    // Event emitted when a liquidity amount is updated
    event LiquidityAmountUpdated(address provider, uint256 newAmount);

    // Add a new liquidity provider to the manager
    function addLiquidityProvider(address _provider, uint256 _amount) public {
        liquidityProviders[_provider] = _amount;
        emit LiquidityProviderAdded(_provider);
    }

    // Update the liquidity amount for a given provider
    function updateLiquidityAmount(address _provider, uint256 _newAmount) public {
        liquidityProviders[_provider] = _newAmount;
        emit LiquidityAmountUpdated(_provider, _newAmount);
    }
}