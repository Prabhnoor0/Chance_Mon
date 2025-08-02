# Game Contracts Documentation

## Overview
This document describes the smart contracts for all games in the Chance Mon platform. Each contract contains the complete game logic on-chain for transparency and fairness.

## Contract List

### 1. DiceRoll.sol
**Purpose**: On-chain dice rolling game with prediction mechanics

**Key Features**:
- Players bet and predict if dice sum will be under 7, over 7, or exactly 7
- Three prediction types with different payouts
- Pseudo-random number generation using block data
- 2% house edge

**Main Functions**:
- `placeBet()`: Place a bet to start the game
- `rollDice(uint256 prediction)`: Roll dice and determine outcome
- `cashOut()`: Withdraw winnings
- `getActiveGame(address player)`: Get current game state

**Events**:
- `DiceRolled`: Emitted when dice are rolled
- `BetPlaced`: Emitted when a bet is placed
- `CashOut`: Emitted when winnings are withdrawn

**Minimum Bet**: 0.01 ETH

---

### 2. SpinWheel.sol
**Purpose**: Risk-based spinning wheel game with multipliers

**Key Features**:
- Three risk levels (Low, Medium, High) with different multipliers
- Dynamic multiplier calculation based on risk
- Random result generation with weighted outcomes
- 2% house edge

**Main Functions**:
- `placeBet(uint256 riskLevel)`: Place bet with risk level
- `spinWheel()`: Spin the wheel and determine result
- `cashOut()`: Withdraw winnings
- `getMultipliers(uint256 riskLevel)`: Get multipliers for risk level

**Events**:
- `SpinWheelSpun`: Emitted when wheel is spun
- `BetPlaced`: Emitted when a bet is placed
- `CashOut`: Emitted when winnings are withdrawn

**Minimum Bet**: 1 ETH

---

### 3. BlackJack.sol
**Purpose**: Classic BlackJack game with dealer AI

**Key Features**:
- Complete BlackJack rules implementation
- Dealer hits until 17 or higher
- BlackJack pays 3:2
- Card generation using block data
- 2% house edge

**Main Functions**:
- `placeBet()`: Place bet and start game
- `dealCards()`: Deal initial cards
- `hit()`: Draw additional card
- `stand()`: End player turn, dealer plays
- `cashOut()`: Withdraw winnings

**Events**:
- `GameStarted`: Emitted when game starts
- `CardDealt`: Emitted when cards are dealt
- `GameEnded`: Emitted when game ends
- `BetPlaced`: Emitted when bet is placed
- `CashOut`: Emitted when winnings are withdrawn

**Minimum Bet**: 0.1 ETH

---

### 4. Mines.sol
**Purpose**: Minefield navigation game with increasing multipliers

**Key Features**:
- 25 tiles with 10 hidden bombs
- Multiplier increases with each safe tile found
- Cash out anytime to secure winnings
- Probability-based multiplier calculation
- 2% house edge

**Main Functions**:
- `placeBet()`: Place bet and generate bomb positions
- `revealTile(uint256 position)`: Reveal a tile
- `cashOut()`: Cash out current winnings
- `withdraw()`: Withdraw accumulated balance

**Events**:
- `GameStarted`: Emitted when game starts
- `TileRevealed`: Emitted when tile is revealed
- `GameEnded`: Emitted when game ends
- `BetPlaced`: Emitted when bet is placed
- `CashOut`: Emitted when winnings are withdrawn

**Minimum Bet**: 0.001 ETH

---

### 5. HighLow.sol
**Purpose**: Card prediction game with streak mechanics

**Key Features**:
- Predict if next card is higher or lower
- Streak-based multiplier system
- 10-second time limit per guess
- Cash out anytime during streak
- 2% house edge

**Main Functions**:
- `startGame()`: Start new game with bet
- `makeGuess(bool isHigher)`: Make prediction
- `cashOut()`: Cash out current streak winnings
- `withdraw()`: Withdraw accumulated balance
- `getTimeRemaining(address player)`: Get time left

**Events**:
- `GameStarted`: Emitted when game starts
- `GuessMade`: Emitted when guess is made
- `CashOut`: Emitted when winnings are withdrawn
- `GameEnded`: Emitted when game ends

**Minimum Bet**: 0.001 ETH

---

## Common Features

### Random Number Generation
All contracts use pseudo-random number generation based on:
- Player address
- Block timestamp
- Block data

**Formula**: `keccak256(player + seed + block.timestamp)`

### House Edge
All contracts implement a 2% house edge on winnings.

### Player Balance System
- Winnings are stored in `playerBalance` mapping
- Players must call `withdraw()` or `cashOut()` to receive funds
- Balances are tracked per player address

### Game State Management
- Each contract maintains active game state per player
- Games can be reset for testing purposes
- Timeout mechanisms where applicable

### Event System
- Comprehensive event logging for transparency
- Events include game state changes and financial transactions
- Useful for frontend integration and monitoring

## Deployment

### Prerequisites
- Hardhat development environment
- Local blockchain node (Hardhat Network)
- Sufficient ETH for deployment

### Deployment Command
```bash
npx hardhat run scripts/deploy-all-games.js --network localhost
```

### Deployment Output
- Contract addresses saved to `src/contract_data/`
- ABI files generated for frontend integration
- Deployment summary saved to `deployment-summary.json`

## Testing

### Manual Testing
Each contract includes a `resetGame()` function for testing:
```solidity
function resetGame() public {
    delete activeGames[msg.sender];
    playerBalance[msg.sender] = 0;
}
```

### Automated Testing
Create test files in `test/` directory:
- `test/DiceRoll.test.js`
- `test/SpinWheel.test.js`
- `test/BlackJack.test.js`
- `test/Mines.test.js`
- `test/HighLow.test.js`

## Security Considerations

### Randomness
- Uses pseudo-random number generation
- Not suitable for high-value applications
- Consider VRF (Verifiable Random Function) for production

### Access Control
- No admin functions implemented
- All functions are public
- Consider role-based access control for production

### Reentrancy
- No external calls during state changes
- Follows checks-effects-interactions pattern

### Gas Optimization
- Efficient data structures
- Minimal storage operations
- Batch operations where possible

## Frontend Integration

### Contract Interaction
```javascript
// Example: Interacting with DiceRoll contract
const contract = new ethers.Contract(address, abi, signer);
await contract.placeBet({ value: ethers.parseEther("0.01") });
await contract.rollDice(0); // 0 = under 7, 1 = over 7, 2 = exactly 7
```

### Event Listening
```javascript
contract.on("DiceRolled", (player, bet, dice1, dice2, sum, isWin, winAmount) => {
    console.log("Dice rolled:", { dice1, dice2, sum, isWin, winAmount });
});
```

## Future Enhancements

### Planned Improvements
1. **VRF Integration**: Implement Chainlink VRF for true randomness
2. **Multi-Signature**: Add multi-sig wallet for fund management
3. **Tournament Mode**: Implement tournament-style gameplay
4. **NFT Integration**: Add NFT rewards and achievements
5. **Cross-Chain**: Support for multiple blockchain networks

### Scalability
- Gas optimization for high-frequency usage
- Batch operations for multiple players
- Layer 2 integration for cost reduction

## Support

For technical support or questions about the contracts:
1. Check the test files for usage examples
2. Review the event logs for debugging
3. Use Hardhat console for interactive testing
4. Monitor gas usage for optimization opportunities 