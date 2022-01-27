const FundActivity = artifacts.require('FundActivity');
const Fund = artifacts.require('Fund');

contract('FundActivity', (accounts) => {
    let fund;

    before(async () => {
        instance = await FundActivity.deployed()

        await instance.createFund('100', {
            from: accounts[0],
            gas: '1000000'
        })

        const listOfAddress = await instance.getDeployedFunds()
        fund = await Fund.at(listOfAddress[0])
    })

    it('deployed FundActivity and Fund contract', async () => {
        assert.ok(instance.address)
        assert.ok(fund.address)
    })

    it('marks caller as the fund manager', async () => {
        const manager = await fund.manager()
        assert.equal(manager, accounts[0])
    })

    it('contributed to Fund', async () => {
        await fund.contribute({
            from: accounts[0],
            value: web3.utils.toWei('0.1', 'ether')
        })

        const approverExist = await fund.approvers(accounts[0])
        const numberOfApprovers = await fund.numberOfApprovers()

        assert.equal(approverExist, true)
        assert.equal(numberOfApprovers, 1)
    })

    it('create campaign', async () => {
        await fund.createCampaign('Buy battery', '100', accounts[1], {
            from: accounts[0],
            gas: '1000000'
        })

        const campaign = await fund.campaigns(0)

        assert.equal(campaign.description, 'Buy battery')
    })

    it('approved campaign', async () => {
        await fund.contribute({
            from: accounts[0],
            value: web3.utils.toWei('0.1', 'ether')
        })
        
        await fund.createCampaign('Buy battery', '100', accounts[1], {
            from: accounts[0],
            gas: '1000000'
        })

        await fund.approveCampaign(0, {
            from: accounts[0],
            gas: '1000000'
        })

        const campaign = await fund.campaigns(0)
        const approvalsExist = await fund.getApprovalExistOfCampaign(0, accounts[0])
        const numberOfApprovals = await campaign.numberOfApprovals
        
        assert.equal(approvalsExist, true)
        assert.equal(numberOfApprovals, 1)
    })

    it('finalize approve', async () => {
        await fund.contribute({
            from: accounts[1],
            value: web3.utils.toWei('8', 'ether')
        })

        await fund.createCampaign("Buy Battery", web3.utils.toWei('6', 'ether'), accounts[2], {
            from: accounts[0],
            gas: '1000000'
        })

        await fund.approveCampaign(0, {
            from: accounts[1],
            gas: '1000000'
        })

        await fund.finalizeCampaign(0, {
            from: accounts[0],
            gas: '1000000'
        });

        const campaign = await fund.campaigns(0)
        let balance = await web3.eth.getBalance(accounts[2])
        balance = web3.utils.fromWei(balance, 'ether')
        balance = parseFloat(balance)

        assert.equal(campaign.completed, true)
        assert(balance > 105)
    });

})