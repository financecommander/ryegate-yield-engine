// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IKYCWhitelist {
    function isWhitelisted(address account) external view returns (bool);
    function isAccredited(address account) external view returns (bool);
}

interface IPausable {
    function paused() external view returns (bool);
}

/**
 * @title TransferRestrictor
 * @dev Modular transfer restriction engine for ERC-1400 compliance
 */
abstract contract TransferRestrictor is AccessControl {
    IKYCWhitelist public kycWhitelist;
    
    // Partition => lockup duration in seconds
    mapping(bytes32 => uint256) public lockupDuration;
    
    // Address => Partition => lockup start timestamp
    mapping(address => mapping(bytes32 => uint256)) public lockupStart;
    
    // REG_D partition hash
    bytes32 public constant REG_D = keccak256("REG_D");
    
    event LockupDurationSet(bytes32 indexed partition, uint256 duration);
    event KYCWhitelistUpdated(address indexed newWhitelist);
    
    constructor(address _kycWhitelist) {
        require(_kycWhitelist != address(0), "Invalid KYC address");
        kycWhitelist = IKYCWhitelist(_kycWhitelist);
        
        // Default: 12 months (365 days) for REG_D
        lockupDuration[REG_D] = 365 days;
    }
    
    /**
     * @dev Check if transfer is allowed with detailed status code
     * @param partition Token partition
     * @param from Sender address
     * @param to Recipient address
     * @param value Transfer amount
     * @return allowed Whether transfer is allowed
     * @return statusCode EIP-1066 status code
     * @return reason Human-readable reason
     */
    function checkTransferRestriction(
        bytes32 partition,
        address from,
        address to,
        uint256 value
    ) external view returns (bool allowed, bytes1 statusCode, string memory reason) {
        // Check: Neither from nor to is zero address
        if (from == address(0)) {
            return (false, 0x56, "Invalid sender");
        }
        if (to == address(0)) {
            return (false, 0x57, "Invalid receiver");
        }
        
        // Check: Contract is not paused
        try IPausable(address(this)).paused() returns (bool isPaused) {
            if (isPaused) {
                return (false, 0x54, "Transfers halted");
            }
        } catch {
            // If paused() call fails, assume not paused
        }
        
        // Check: Both from and to are KYC whitelisted
        if (!kycWhitelist.isWhitelisted(from)) {
            return (false, 0x56, "Sender not KYC'd");
        }
        if (!kycWhitelist.isWhitelisted(to)) {
            return (false, 0x57, "Receiver not KYC'd");
        }
        
        // Check: REG_D specific restrictions
        if (partition == REG_D) {
            // Receiver must be accredited
            if (!kycWhitelist.isAccredited(to)) {
                return (false, 0x57, "Receiver not accredited for Reg D");
            }
            
            // Check lockup period (unless sender is operator)
            uint256 lockupStartTime = lockupStart[from][partition];
            if (lockupStartTime > 0) {
                uint256 lockupEnd = lockupStartTime + lockupDuration[partition];
                if (block.timestamp < lockupEnd) {
                    // Check if sender has OPERATOR_ROLE (compliance override)
                    bytes32 operatorRole = keccak256("OPERATOR_ROLE");
                    if (!hasRole(operatorRole, from)) {
                        return (false, 0x55, "Reg D lockup active");
                    }
                }
            }
        }
        
        // Check: Transfer value is greater than zero
        if (value == 0) {
            return (false, 0x50, "Zero value transfer");
        }
        
        // Check: Sender has sufficient balance (this check is typically done in the token contract)
        // We return success here as balance check is redundant with ERC20 checks
        
        return (true, 0x51, "Transfer allowed");
    }
    
    /**
     * @dev Convenience wrapper that returns only boolean
     */
    function canTransfer(
        bytes32 partition,
        address from,
        address to,
        uint256 value
    ) external view returns (bool) {
        (bool allowed,,) = this.checkTransferRestriction(partition, from, to, value);
        return allowed;
    }
    
    /**
     * @dev Set lockup duration for a partition
     */
    function setLockupDuration(bytes32 partition, uint256 duration) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        lockupDuration[partition] = duration;
        emit LockupDurationSet(partition, duration);
    }
    
    /**
     * @dev Update KYC whitelist address
     */
    function setKYCWhitelist(address _kycWhitelist) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_kycWhitelist != address(0), "Invalid KYC address");
        kycWhitelist = IKYCWhitelist(_kycWhitelist);
        emit KYCWhitelistUpdated(_kycWhitelist);
    }
    
    /**
     * @dev Set lockup start time for an address and partition
     * @dev Internal function to be called when tokens are issued
     */
    function _setLockupStart(address account, bytes32 partition, uint256 timestamp) internal {
        lockupStart[account][partition] = timestamp;
    }
}
