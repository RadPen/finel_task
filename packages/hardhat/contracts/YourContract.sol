// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract YourContract {
    struct Voter {
        bool voted;
        address delegate;
        uint vote;
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    bool public votingEnded;

    constructor() {
        chairperson = msg.sender;
        votingEnded = false;
    }

    function propose(bytes32 proposalName) external {
        require(msg.sender == chairperson, "Only chairperson can propose.");
        proposals.push(Proposal({name: proposalName, voteCount: 0}));
    }

    function giveRightToVote(address voter) external {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");
        require(!voters[voter].voted, "The voter already voted.");
        voters[voter].voted = false;
    }

    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
        }

        sender.delegate = to;

        if (voters[to].voted) {
            proposals[voters[to].vote].voteCount++;
        }
    }

    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You have already voted.");
        require(proposal < proposals.length, "Invalid proposal.");

        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount++;
    }

    function revokeVote() external {
        Voter storage sender = voters[msg.sender];
        require(sender.voted, "You have not voted yet.");

        proposals[sender.vote].voteCount--;

        sender.voted = false;
        sender.delegate = address(0); // сброс делегата
    }

    function endVoting() external {
        require(msg.sender == chairperson, "Only chairperson can end voting.");
        votingEnded = true;
    }

    function winningProposal() external view returns (uint winningProposalIndex) {
        require(votingEnded, "Voting has not ended yet.");
        uint winningVoteCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
            }
        }
    }

    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }
}

