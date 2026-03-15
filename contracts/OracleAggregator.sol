// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OracleAggregator is Ownable {
    mapping(address => AggregatorV3Interface) public priceFeeds;
    mapping(address => bool) public supportedAssets;

    event PriceFeedUpdated(address indexed asset, address feed);

    constructor() {
        // Initial setup
    }

    function addPriceFeed(address asset, address feed) external onlyOwner {
        require(!supportedAssets[asset], "Asset already supported");
        priceFeeds[asset] = AggregatorV3Interface(feed);
        supportedAssets[asset] = true;
        emit PriceFeedUpdated(asset, feed);
    }

    function getLatestPrice(address asset) external view returns (int256) {
        require(supportedAssets[asset], "Asset not supported");
        (, int256 price,,,) = priceFeeds[asset].latestRoundData();
        return price;
    }

    function removePriceFeed(address asset) external onlyOwner {
        require(supportedAssets[asset], "Asset not supported");
        supportedAssets[asset] = false;
        delete priceFeeds[asset];
        emit PriceFeedUpdated(asset, address(0));
    }
}
