// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface ILendingProtocol {
    function deposit(uint256 amount) external returns (bool);
    function withdraw(uint256 amount) external returns (bool);
    function getYieldRate() external view returns (uint256);
}

contract YieldOptimizer is Ownable {
    using SafeMath for uint256;

    mapping(address => uint256) public balances;
    address[] public protocols;
    mapping(address => bool) public approvedProtocols;

    event Deposit(address indexed user, uint256 amount, address protocol);
    event Withdraw(address indexed user, uint256 amount, address protocol);
    event Rebalance(address indexed protocol, uint256 amount);

    constructor() {
        // Initial setup
    }

    function addProtocol(address protocol) external onlyOwner {
        require(!approvedProtocols[protocol], "Protocol already approved");
        approvedProtocols[protocol] = true;
        protocols.push(protocol);
    }

    function deposit(uint256 amount, address protocol) external payable {
        require(approvedProtocols[protocol], "Protocol not approved");
        require(msg.value == amount, "Incorrect amount sent");
        balances[msg.sender] = balances[msg.sender].add(amount);
        ILendingProtocol(protocol).deposit(amount);
        emit Deposit(msg.sender, amount, protocol);
    }

    function withdraw(uint256 amount, address protocol) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        ILendingProtocol(protocol).withdraw(amount);
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount, protocol);
    }

    function rebalance() external onlyOwner {
        // TODO: Implement logic to rebalance funds across protocols based on yield rates
        emit Rebalance(protocols[0], 0);
    }

    function getBestYieldProtocol() public view returns (address) {
        address bestProtocol = protocols[0];
        uint256 bestRate = 0;
        for (uint256 i = 0; i < protocols.length; i++) {
            uint256 rate = ILendingProtocol(protocols[i]).getYieldRate();
            if (rate > bestRate) {
                bestRate = rate;
                bestProtocol = protocols[i];
            }
        }
        return bestProtocol;
    }
}
