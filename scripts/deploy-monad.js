const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Monad Network Deployment...");
    
    // Check for private key
    if (!process.env.PRIVATE_KEY) {
        console.error("❌ PRIVATE_KEY not found in environment variables!");
        console.log("Please create a .env file with your private key:");
        console.log("PRIVATE_KEY=your_private_key_here");
        process.exit(1);
    }
    
    // Get the network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get the signer and display the address
    const [signer] = await ethers.getSigners();
    console.log(`👤 Deploying from address: ${signer.address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(signer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} MONAD`);
    
    if (balance === 0n) {
        console.error("❌ Insufficient balance for deployment!");
        console.log("Please fund your account with some MONAD tokens.");
        process.exit(1);
    }

    // Define contracts to deploy
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
            console.log(`\n📦 Deploying ${contractName} contract...`);
            
            const ContractFactory = await ethers.getContractFactory(contractName);
            const contract = await ContractFactory.deploy();
            
            console.log(`⏳ Waiting for ${contractName} deployment confirmation...`);
            await contract.waitForDeployment();
            
            const contractAddress = await contract.getAddress();
            console.log(`✅ ${contractName} deployed to: ${contractAddress}`);
            
            deployedContracts[contractName] = contractAddress;
            
            // Save contract details for the frontend
            saveFrontendFiles(contract, contractName);
            
            // Verify contract deployment
            const code = await ethers.provider.getCode(contractAddress);
            if (code === "0x") {
                throw new Error("Contract deployment verification failed - no code at address");
            }
            console.log(`✅ ${contractName} deployment verified`);
            
        } catch (error) {
            console.error(`❌ Failed to deploy ${contractName}:`, error.message);
            console.error("Full error:", error);
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

    const summaryPath = path.join(__dirname, "../DEPLOYMENT_SUMMARY.md");
    const summaryContent = `# Deployment Summary

## Network Information
- **Network**: ${deploymentSummary.network}
- **Chain ID**: ${deploymentSummary.chainId}
- **Deployer**: ${deploymentSummary.deployer}
- **Timestamp**: ${deploymentSummary.timestamp}

## Deployed Contracts

${Object.entries(deployedContracts).map(([name, address]) => `- **${name}**: \`${address}\``).join('\n')}

## Next Steps
1. Update your frontend to use these contract addresses
2. Test the contracts on Monad testnet
3. Verify contracts on Monad explorer if needed

## Contract Addresses for Frontend
\`\`\`javascript
const CONTRACT_ADDRESSES = {
${Object.entries(deployedContracts).map(([name, address]) => `  ${name}: "${address}"`).join(',\n')}
};
\`\`\`
`;

    fs.writeFileSync(summaryPath, summaryContent);
    console.log(`\n📄 Deployment summary saved to: ${summaryPath}`);

    console.log("\n🎉 Deployment completed!");
    console.log("\n📋 Deployed contracts:");
    for (const [name, address] of Object.entries(deployedContracts)) {
        console.log(`  ${name}: ${address}`);
    }
    
    console.log("\n🔗 You can view your contracts on Monad Explorer:");
    console.log("https://explorer.testnet.monad.xyz");
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

    console.log(`  📁 Contract artifacts saved to ${contractsDir}`);
}

// Execute the deployment script
main()
    .then(() => {
        console.log("\n✅ Monad deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 