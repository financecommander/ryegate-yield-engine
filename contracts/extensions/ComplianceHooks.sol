// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/**
 * @title ComplianceHooks
 * @dev Abstract contract providing pre-transfer and post-transfer hook pattern
 * for broker-dealer approval workflows
 */
abstract contract ComplianceHooks {
    event TransferApprovalRequested(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        uint256 requestId
    );
    event TransferApproved(uint256 indexed requestId, address indexed approver);
    event TransferRejected(uint256 indexed requestId, address indexed rejector, string reason);
    
    enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXPIRED
    }
    
    struct TransferRequest {
        bytes32 partition;
        address from;
        address to;
        uint256 value;
        ApprovalStatus status;
        uint256 requestedAt;
        uint256 expiresAt;
    }
    
    uint256 public nextRequestId;
    mapping(uint256 => TransferRequest) public transferRequests;
    uint256 public approvalTimeout = 48 hours;
    
    /**
     * @dev Pre-transfer compliance check hook
     * @dev Override in implementing contract to add custom logic
     */
    function _preTransferCheck(
        bytes32 partition,
        address from,
        address to,
        uint256 value
    ) internal virtual returns (bool) {
        // Default implementation: always allow
        // Override to implement custom pre-transfer logic
        return true;
    }
    
    /**
     * @dev Post-transfer compliance hook
     * @dev Override in implementing contract to add custom logic
     */
    function _postTransferHook(
        bytes32 partition,
        address from,
        address to,
        uint256 value
    ) internal virtual {
        // Default implementation: no-op
        // Override to implement custom post-transfer logic
    }
    
    /**
     * @dev Request transfer approval from broker-dealer
     * @param partition Token partition
     * @param to Recipient address
     * @param value Transfer amount
     * @return requestId The ID of the created request
     */
    function requestTransferApproval(
        bytes32 partition,
        address to,
        uint256 value
    ) external returns (uint256 requestId) {
        requestId = nextRequestId++;
        
        transferRequests[requestId] = TransferRequest({
            partition: partition,
            from: msg.sender,
            to: to,
            value: value,
            status: ApprovalStatus.PENDING,
            requestedAt: block.timestamp,
            expiresAt: block.timestamp + approvalTimeout
        });
        
        emit TransferApprovalRequested(partition, msg.sender, to, value, requestId);
        
        return requestId;
    }
    
    /**
     * @dev Approve a transfer request
     * @dev Should be overridden with access control in implementing contract
     */
    function approveTransfer(uint256 requestId) external virtual {
        TransferRequest storage request = transferRequests[requestId];
        require(request.requestedAt > 0, "Request does not exist");
        require(request.status == ApprovalStatus.PENDING, "Request not pending");
        require(block.timestamp <= request.expiresAt, "Request expired");
        
        request.status = ApprovalStatus.APPROVED;
        
        emit TransferApproved(requestId, msg.sender);
    }
    
    /**
     * @dev Reject a transfer request
     * @dev Should be overridden with access control in implementing contract
     */
    function rejectTransfer(uint256 requestId, string calldata reason) external virtual {
        TransferRequest storage request = transferRequests[requestId];
        require(request.requestedAt > 0, "Request does not exist");
        require(request.status == ApprovalStatus.PENDING, "Request not pending");
        
        request.status = ApprovalStatus.REJECTED;
        
        emit TransferRejected(requestId, msg.sender, reason);
    }
    
    /**
     * @dev Check if a transfer request is approved and valid
     */
    function isTransferApproved(uint256 requestId) public view returns (bool) {
        TransferRequest memory request = transferRequests[requestId];
        
        if (request.status != ApprovalStatus.APPROVED) {
            return false;
        }
        
        if (block.timestamp > request.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Update approval timeout
     * @dev Should be overridden with access control in implementing contract
     */
    function setApprovalTimeout(uint256 newTimeout) external virtual {
        require(newTimeout >= 1 hours && newTimeout <= 7 days, "Invalid timeout");
        approvalTimeout = newTimeout;
    }
}
