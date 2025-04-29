import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const contract = await deploy("YourContract", {
        from: deployer,
        args: [],
        log: true,
        autoMine: true,
    });

  console.log("👋 Initial greeting:", contract.address);
};

export default deploy;
deploy.tags = ["YourContract"];


