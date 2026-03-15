// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LiquidityManager {
    // Mapping of liquidity pools to their respective liquidity
    mapping(address => uint256) public liquidity;
    // Array of liquidity pools
    address[] public liquidityPools;

    function getLiquidity(address liquidityPool) public view returns (uint256) {
        return liquidity[liquidityPool];
    }

    function addLiquidityPool(address liquidityPool, uint256 liquidityAmount) public {
        liquidityPools.push(liquidityPool);
        liquidity[liquidityPool] = liquidityAmount;
    }
}
