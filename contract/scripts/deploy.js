const { ethers } = require("hardhat");

async function main() {
    try {
        const [deployer] = await ethers.getSigners();

        console.log(deployer.address);

        const testToken = "0x9ac2c46d7acc21c881154d57c0dc1c55a3139198";

        const StakeContract = await ethers.getContractFactory("StakeContract");
        const stakeContract = await StakeContract.deploy(testToken);
        await stakeContract.deployed();
        console.log(`StakeContract deployed to: ${stakeContract.address}`);

        const BridgeContract = await ethers.getContractFactory("BridgeContract");
        const bridgeContract = await BridgeContract.deploy(
            testToken,
            stakeContract.address,
            deployer.address
        );
        await bridgeContract.deployed();
        console.log(`BridgeContract deployed to: ${bridgeContract.address}`);

        await stakeContract.setBridge(bridgeContract.address);
    } catch(err) {
        console.log(err);
    }
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});