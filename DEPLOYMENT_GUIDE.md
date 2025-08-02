# 🚀 Contract Deployment Guide

This guide will help you fix the contract deployment and transaction issues in your Monad gaming dApp.

## 🔧 Prerequisites

1. **MetaMask Extension** - Install MetaMask browser extension
2. **Private Key** - Your wallet's private key for deployment
3. **MONAD Tokens** - Some MONAD tokens for gas fees (get from faucet)

## 📋 Step-by-Step Deployment

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# Create .env file
echo "PRIVATE_KEY=your_private_key_here" > .env
```

⚠️ **Important**: Replace `your_private_key_here` with your actual private key (without the 0x prefix)

### 2. Get MONAD Testnet Tokens

Visit the Monad testnet faucet to get some MONAD tokens:
- **Faucet URL**: https://faucet.testnet.monad.xyz
- **Network**: Monad Testnet (Chain ID: 10143)

### 3. Deploy Contracts

```bash
# Compile contracts first
npm run compile

# Deploy all contracts to Monad testnet
npm run deploy:all
```

### 4. Verify Deployment

After deployment, check that:
- ✅ All contracts are deployed successfully
- ✅ Contract addresses are saved in `src/contract_data/`
- ✅ No deployment errors in console

## 🔍 Troubleshooting Common Issues

### Issue 1: "PRIVATE_KEY not found"
**Solution**: Create `.env` file with your private key

### Issue 2: "Insufficient balance for deployment"
**Solution**: Get MONAD tokens from faucet

### Issue 3: "Contract deployment verification failed"
**Solution**: Check network connection and try again

### Issue 4: "MetaMask not detected"
**Solution**: Install MetaMask extension

### Issue 5: "Wrong network"
**Solution**: Switch to Monad testnet in MetaMask

## 🌐 Network Configuration

### Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://explorer.testnet.monad.xyz

### Monad Mainnet
- **Chain ID**: 1338
- **RPC URL**: https://rpc.monad.xyz
- **Explorer**: https://explorer.monad.xyz

## 📁 Contract Files Structure

After deployment, your `src/contract_data/` should contain:

```
src/contract_data/
├── DiceRoll.json
├── DiceRoll-address.json
├── SpinWheel.json
├── SpinWheel-address.json
├── BlackJack.json
├── BlackJack-address.json
├── Mines.json
├── Mines-address.json
├── HighLow.json
├── HighLow-address.json
└── monad-config.js
```

## 🎮 Testing Transactions

### 1. Start Development Server
```bash
npm run dev
```

### 2. Connect MetaMask
- Open http://localhost:3000
- Connect MetaMask wallet
- Switch to Monad testnet

### 3. Test a Game
- Navigate to any game (Dice Roll, Mines, etc.)
- Place a small bet (0.01 MONAD)
- Verify transaction goes through

## 🔧 Contract Functions

### DiceRoll Contract
- `placeBet()` - Place a bet
- `rollDice(prediction)` - Roll dice with prediction
- `cashOut()` - Cash out winnings
- `getPlayerBalance(address)` - Get player balance

### Mines Contract
- `bet()` - Place a bet
- `reveal(x, y)` - Reveal a tile
- `cashOut()` - Cash out winnings

### BlackJack Contract
- `placeBet()` - Place a bet
- `hit()` - Take another card
- `stand()` - End turn
- `cashOut()` - Cash out winnings

## 🚨 Important Notes

1. **Gas Limits**: Contracts use optimized gas limits for Monad
2. **Error Handling**: All transactions include proper error handling
3. **Network Switching**: Automatic network detection and switching
4. **Balance Checks**: Validates sufficient balance before transactions

## 📞 Support

If you encounter issues:

1. Check the console for error messages
2. Verify network connection
3. Ensure sufficient MONAD balance
4. Check contract deployment status

## 🎯 Next Steps

After successful deployment:

1. **Test all games** with small bets
2. **Verify transactions** on Monad explorer
3. **Update frontend** if needed
4. **Deploy to mainnet** when ready

---

**Happy gaming on Monad! 🎮✨** 