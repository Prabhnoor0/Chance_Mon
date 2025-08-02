import { ethers } from 'ethers';
import { switchToMonadNetwork, isConnectedToMonad } from '../contract_data/monad-config.js';

// Contract ABIs and addresses
import DiceRollABI from '../contract_data/DiceRoll.json' assert { type: "json" };
import DiceRollAddress from '../contract_data/DiceRoll-address.json' assert { type: "json" };
import SpinWheelABI from '../contract_data/SpinWheel.json' assert { type: "json" };
import SpinWheelAddress from '../contract_data/SpinWheel-address.json' assert { type: "json" };
import BlackJackABI from '../contract_data/BlackJack.json' assert { type: "json" };
import BlackJackAddress from '../contract_data/BlackJack-address.json' assert { type: "json" };
import MinesABI from '../contract_data/Mines.json' assert { type: "json" };
import MinesAddress from '../contract_data/Mines-address.json' assert { type: "json" };
import HighLowABI from '../contract_data/HighLow.json' assert { type: "json" };
import HighLowAddress from '../contract_data/HighLow-address.json' assert { type: "json" };

// Contract configurations
const CONTRACT_CONFIGS = {
  DiceRoll: {
    abi: DiceRollABI.abi,
    address: DiceRollAddress.address
  },
  SpinWheel: {
    abi: SpinWheelABI.abi,
    address: SpinWheelAddress.address
  },
  BlackJack: {
    abi: BlackJackABI.abi,
    address: BlackJackAddress.address
  },
  Mines: {
    abi: MinesABI.abi,
    address: MinesAddress.address
  },
  HighLow: {
    abi: HighLowABI.abi,
    address: HighLowAddress.address
  }
};

// Global state
let provider = null;
let signer = null;
let contracts = {};

/**
 * Initialize Web3 connection and contracts
 */
export const initializeWeb3 = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected! Please install MetaMask extension.');
  }

  try {
    // Check if connected to Monad network
    const isMonad = await isConnectedToMonad();
    if (!isMonad) {
      const switchNetwork = confirm("You're not connected to Monad network. Would you like to switch to Monad Testnet?");
      if (switchNetwork) {
        await switchToMonadNetwork('testnet');
      } else {
        throw new Error('Please connect to Monad network to use this dApp');
      }
    }

    // Initialize provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Request accounts
    const accounts = await provider.send("eth_requestAccounts", []);
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please connect your MetaMask wallet.');
    }

    // Initialize all contracts
    for (const [contractName, config] of Object.entries(CONTRACT_CONFIGS)) {
      try {
        contracts[contractName] = new ethers.Contract(
          config.address,
          config.abi,
          signer
        );
        console.log(`✅ ${contractName} contract initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${contractName} contract:`, error);
      }
    }

    return {
      provider,
      signer,
      contracts,
      account: accounts[0]
    };

  } catch (error) {
    console.error('Web3 initialization failed:', error);
    throw error;
  }
};

/**
 * Get contract instance
 */
export const getContract = (contractName) => {
  if (!contracts[contractName]) {
    throw new Error(`Contract ${contractName} not initialized. Please call initializeWeb3() first.`);
  }
  return contracts[contractName];
};

/**
 * Get current account
 */
export const getCurrentAccount = async () => {
  if (!signer) {
    throw new Error('Web3 not initialized. Please call initializeWeb3() first.');
  }
  return await signer.getAddress();
};

/**
 * Get account balance
 */
export const getBalance = async (address) => {
  if (!provider) {
    throw new Error('Web3 not initialized. Please call initializeWeb3() first.');
  }
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

/**
 * Place bet with error handling
 */
export const placeBet = async (contractName, betAmount, additionalParams = {}) => {
  try {
    const contract = getContract(contractName);
    
    const tx = await contract.placeBet({
      value: ethers.parseEther(betAmount.toString()),
      gasLimit: 200_000n,
      ...additionalParams
    });

    console.log(`⏳ Waiting for ${contractName} bet transaction...`);
    const receipt = await tx.wait();
    console.log(`✅ Bet placed successfully! Transaction: ${receipt.hash}`);
    
    return receipt;
  } catch (error) {
    console.error(`❌ Bet placement failed for ${contractName}:`, error);
    throw new Error(`Failed to place bet: ${error.message}`);
  }
};

/**
 * Cash out winnings
 */
export const cashOut = async (contractName) => {
  try {
    const contract = getContract(contractName);
    
    const tx = await contract.cashOut({
      gasLimit: 100_000n
    });

    console.log(`⏳ Waiting for ${contractName} cashout transaction...`);
    const receipt = await tx.wait();
    console.log(`✅ Cashout successful! Transaction: ${receipt.hash}`);
    
    return receipt;
  } catch (error) {
    console.error(`❌ Cashout failed for ${contractName}:`, error);
    throw new Error(`Failed to cash out: ${error.message}`);
  }
};

/**
 * Get player balance from contract
 */
export const getPlayerBalance = async (contractName, address) => {
  try {
    const contract = getContract(contractName);
    const balance = await contract.getPlayerBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`❌ Failed to get player balance for ${contractName}:`, error);
    return '0';
  }
};

/**
 * Get active game state
 */
export const getActiveGame = async (contractName, address) => {
  try {
    const contract = getContract(contractName);
    const game = await contract.getActiveGame(address);
    return game;
  } catch (error) {
    console.error(`❌ Failed to get active game for ${contractName}:`, error);
    return null;
  }
};

/**
 * Listen for contract events
 */
export const listenToContractEvents = (contractName, eventName, callback) => {
  try {
    const contract = getContract(contractName);
    contract.on(eventName, callback);
    
    return () => {
      contract.off(eventName, callback);
    };
  } catch (error) {
    console.error(`❌ Failed to listen to ${eventName} for ${contractName}:`, error);
  }
};

/**
 * Switch to Monad network
 */
export const switchToMonad = async (networkType = 'testnet') => {
  try {
    await switchToMonadNetwork(networkType);
    console.log(`✅ Switched to Monad ${networkType}`);
    
    // Reinitialize after network switch
    await initializeWeb3();
  } catch (error) {
    console.error('❌ Failed to switch to Monad network:', error);
    throw error;
  }
};

/**
 * Check if contract is deployed
 */
export const isContractDeployed = async (contractName) => {
  try {
    const config = CONTRACT_CONFIGS[contractName];
    if (!config) {
      throw new Error(`Unknown contract: ${contractName}`);
    }

    const code = await provider.getCode(config.address);
    return code !== '0x';
  } catch (error) {
    console.error(`❌ Failed to check deployment for ${contractName}:`, error);
    return false;
  }
};

/**
 * Get all contract addresses
 */
export const getContractAddresses = () => {
  const addresses = {};
  for (const [name, config] of Object.entries(CONTRACT_CONFIGS)) {
    addresses[name] = config.address;
  }
  return addresses;
};

/**
 * Validate transaction parameters
 */
export const validateTransaction = (betAmount, maxBet = 10) => {
  const amount = parseFloat(betAmount);
  
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid bet amount. Please enter a positive number.');
  }
  
  if (amount > maxBet) {
    throw new Error(`Bet amount too high. Maximum bet is ${maxBet} MONAD.`);
  }
  
  if (amount < 0.01) {
    throw new Error('Bet amount too low. Minimum bet is 0.01 MONAD.');
  }
  
  return true;
};

export default {
  initializeWeb3,
  getContract,
  getCurrentAccount,
  getBalance,
  placeBet,
  cashOut,
  getPlayerBalance,
  getActiveGame,
  listenToContractEvents,
  switchToMonad,
  isContractDeployed,
  getContractAddresses,
  validateTransaction
}; 