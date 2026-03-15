# Phase 2 Documentation

## Overview

Phase 2 of the ryegate-yield-engine includes the implementation of the YieldOptimizer, OracleAggregator, LiquidityManager, and GovernanceModule contracts.

## Deployment

To deploy the contracts, run the `deploy-phase2.js` script in the `scripts` directory.

## Architecture

The YieldOptimizer contract is responsible for optimizing yield across multiple lending protocols.

The OracleAggregator contract aggregates yield rates and prices from multiple oracles.

The LiquidityManager contract rebalances liquidity across multiple yield sources.

The GovernanceModule contract provides on-chain governance for yield parameter changes.

## Testing

To test the contracts, run the `test` script in the `test` directory.