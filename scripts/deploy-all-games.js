const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying all game contracts...");
    
    // Get the network info
    const network = await ethers.provider.getNetwork();
    console.log(`Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get the signer and display the address
    const [signer] = await ethers.getSigners();
    console.log(`Deploying from address: ${signer.address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(signer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    const contracts = [
        "DiceRoll",
        "SpinWheel", 
        "BlackJack",
        "Mines",
        "HighLow"
    ];

    const deployedContracts = {};

    for (const contractName of contracts) {
        try {
            console.log(`\nDeploying ${contractName} contract...`);
            
            const ContractFactory = await ethers.getContractFactory(contractName);
            const contract = await ContractFactory.deploy();
            await contract.waitForDeployment();
            
            const contractAddress = await contract.getAddress();
            console.log(`${contractName} deployed to: ${contractAddress}`);
            
            deployedContracts[contractName] = contractAddress;
            
            // Save contract details for the frontend
            saveFrontendFiles(contract, contractName);
            
        } catch (error) {
            console.error(`Failed to deploy ${contractName}:`, error.message);
        }
    }

    // Save deployment summary
    const deploymentSummary = {
        network: network.name,
        chainId: network.chainId,
        deployer: signer.address,
        timestamp: new Date().toISOString(),
        contracts: deployedContracts
    };

    const summaryPath = path.join(__dirname, "../deployment-summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(deploymentSummary, null, 2));
    console.log(`\nDeployment summary saved to: ${summaryPath}`);

    console.log("\n✅ All contracts deployed successfully!");
    console.log("\nDeployed contracts:");
    for (const [name, address] of Object.entries(deployedContracts)) {
        console.log(`  ${name}: ${address}`);
    }
}

function saveFrontendFiles(contract, name) {
    const contractsDir = path.join(__dirname, "../src/contract_data/");

    // Ensure the directory exists
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Save contract address
    fs.writeFileSync(
        path.join(contractsDir, `${name}-address.json`),
        JSON.stringify({ address: contract.target }, null, 2)
    );

    // Save contract ABI
    const contractArtifact = artifacts.readArtifactSync(name);
    fs.writeFileSync(
        path.join(contractsDir, `${name}.json`),
        JSON.stringify(contractArtifact, null, 2)
    );

    console.log(`  Contract artifacts saved to ${contractsDir}`);
}

// Execute the deployment script
main()
    .then(() => {
        console.log("\n🎉 All game contracts deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    }); 