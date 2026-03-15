// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GovernanceModule {
    // Mapping of governance proposals to their respective votes
    mapping(address => mapping(address => bool)) public votes;
    // Array of governance proposals
    address[] public proposals;

    function castVote(address proposal, bool vote) public {
        votes[msg.sender][proposal] = vote;
    }

    function addProposal(address proposal) public {
        proposals.push(proposal);
    }
}
