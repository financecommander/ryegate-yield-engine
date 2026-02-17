// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IRyegateNotes {
    function claimYield() external;
}

/**
 * @title ReentrancyAttack
 * @dev Malicious contract attempting reentrancy on claimYield()
 * @dev Used for testing that ReentrancyGuard is properly implemented
 */
contract ReentrancyAttack {
    IRyegateNotes public target;
    uint256 public attackCount;
    
    constructor(address _target) {
        target = IRyegateNotes(_target);
    }
    
    function attack() external {
        target.claimYield();
    }
    
    /**
     * @dev Fallback that attempts to re-enter claimYield()
     * @dev Note: This won't actually work with USDC transfers (ERC20, not ETH)
     * @dev but tests that the ReentrancyGuard is properly in place
     */
    receive() external payable {
        if (attackCount < 2) {
            attackCount++;
            target.claimYield();
        }
    }
    
    /**
     * @dev Fallback for any other calls
     */
    fallback() external payable {
        if (attackCount < 2) {
            attackCount++;
            target.claimYield();
        }
    }
}
