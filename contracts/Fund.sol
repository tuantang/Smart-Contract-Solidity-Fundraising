// SPDX-License-Identifier: MIT
pragma solidity >=0.8.11;

contract FundActivity {
    address[] public deployFunds;

    function createFund(uint minimum) public {
        Fund fund = new Fund(minimum, msg.sender);
        deployFunds.push(address(fund));
    }

    function getDeployedFunds() public view returns (address[] memory) {
        return deployFunds;
    }
}

contract Fund {

    struct Campaign {
        string description;
        uint value;
        address recipient;
        uint numberOfApprovals;
        bool completed;
        mapping (address => bool) approvals;
    }

    address public manager;
    uint public minimumContribution;
    uint public numberOfApprovers;
    mapping (address => bool) public approvers;
    uint public numberOfCampaigns;
    mapping (uint => Campaign) public campaigns;

    constructor(uint minimum, address creator) {
        manager = creator;
        minimumContribution = minimum;
    }

    modifier validateManager() {
        require(msg.sender == manager);
        _;
    }

    modifier validateApprover() {
        require(approvers[msg.sender]);
        _;
    }

    modifier validateApproved(uint indexOfCampaigns) {
        require(!campaigns[indexOfCampaigns].approvals[msg.sender]);
        _;
    }

    modifier validateCompleted(uint indexOfCampaigns) {
        require(!campaigns[indexOfCampaigns].completed);
        _;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution);

        approvers[msg.sender] = true;
        numberOfApprovers++;
    }
    
    function createCampaign(string memory description, uint value, address recipient) public validateManager {
        Campaign storage campaign = campaigns[numberOfCampaigns++];
        campaign.description = description;
        campaign.value = value;
        campaign.recipient = recipient;
        campaign.numberOfApprovals = 0;
        campaign.completed = false;
    }

    function approveCampaign(uint index) public validateApprover validateApproved(index) validateCompleted(index) {
        Campaign storage campaign = campaigns[index];

        campaign.approvals[msg.sender] = true;
        campaign.numberOfApprovals++;
    }

    function finalizeCampaign(uint index) public validateManager {
        Campaign storage campaign = campaigns[index];
        
        require(campaign.numberOfApprovals > (numberOfApprovers / 2));
        
        payable(campaign.recipient).transfer(campaign.value);
        campaign.completed = true;
    }

    function getApprovalExistOfCampaign(uint index, address approverAddress) public view returns (bool) {
        return campaigns[index].approvals[approverAddress];
    }
}