pragma solidity ^0.8.0;

contract GovernanceModule {
    // Mapping of governance proposals to their corresponding votes
    mapping(address => mapping(address => uint256)) public proposalVotes;

    // Event emitted when a new proposal is created
    event ProposalCreated(address proposal);

    // Event emitted when a vote is cast for a proposal
    event VoteCast(address proposal, address voter, uint256 vote);

    // Create a new governance proposal
    function createProposal(address _proposal) public {
        proposalVotes[_proposal][msg.sender] = 0;
        emit ProposalCreated(_proposal);
    }

    // Cast a vote for a given proposal
    function castVote(address _proposal, uint256 _vote) public {
        proposalVotes[_proposal][msg.sender] = _vote;
        emit VoteCast(_proposal, msg.sender, _vote);
    }
}