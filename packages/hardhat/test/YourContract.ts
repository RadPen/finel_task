import { ethers } from "hardhat";
import { expect } from "chai";

describe("YourContract", function () {
    let yourContract;
    let owner, addr1;

    beforeEach(async function () {
        const YourContract = await ethers.getContractFactory("YourContract");
        [owner, addr1] = await ethers.getSigners();
        yourContract = await YourContract.deploy();
    });

    it("should allow chairperson to end voting", async function () {
        await yourContract.endVoting();
        expect(await yourContract.votingEnded()).to.be.true;
    });

    it("should not allow to get winning proposal before voting ends", async function () {
        await expect(yourContract.winningProposal()).to.be.revertedWith("Voting has not ended yet.");
    });
});


