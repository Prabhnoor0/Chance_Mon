// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Mines {
    // Events
    event GameStarted(address indexed player, uint256 bet, uint256[] bombPositions);
    event TileRevealed(address indexed player, uint256 position, bool isBomb, uint256 multiplier);
    event GameEnded(address indexed player, bool isWin, uint256 winAmount);
    event BetPlaced(address indexed player, uint256 amount);
    event CashOut(address indexed player, uint256 amount);

    // Game state
    struct Game {
        uint256 bet;
        uint256[] bombPositions;
        uint256[] revealedTiles;
        uint256 currentMultiplier;
        uint256 safeTilesFound;
        bool isActive;
        bool isWin;
        uint256 winAmount;
        uint256 timestamp;
    }

    // Player state
    mapping(address => Game) public activeGames;
    mapping(address => uint256) public playerBalance;

    // Constants
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 10 ether;
    uint256 public constant HOUSE_EDGE = 2; // 2% house edge
    uint256 public constant TOTAL_TILES = 25;
    uint256 public constant BOMB_COUNT = 10;
    uint256 public constant SAFE_TILES = TOTAL_TILES - BOMB_COUNT;

    // Modifiers
    modifier onlyActiveGame() {
        require(activeGames[msg.sender].isActive, "No active game");
        _;
    }

    modifier validBet(uint256 bet) {
        require(bet >= MIN_BET, "Bet too small");
        require(bet <= MAX_BET, "Bet too large");
        _;
    }

    // Place a bet and start game
    function placeBet() public payable validBet(msg.value) {
        require(!activeGames[msg.sender].isActive, "Game already in progress");
        
        // Generate bomb positions
        uint256[] memory bombPositions = _generateBombPositions(msg.sender, block.timestamp);
        
        activeGames[msg.sender] = Game({
            bet: msg.value,
            bombPositions: bombPositions,
            revealedTiles: new uint256[](0),
            currentMultiplier: 1000, // 1.0 as integer
            safeTilesFound: 0,
            isActive: true,
            isWin: false,
            winAmount: 0,
            timestamp: block.timestamp
        });

        emit BetPlaced(msg.sender, msg.value);
        emit GameStarted(msg.sender, msg.value, bombPositions);
    }

    // Reveal a tile
    function revealTile(uint256 position) public onlyActiveGame {
        require(position < TOTAL_TILES, "Invalid position");
        require(!_isTileRevealed(position), "Tile already revealed");
        
        Game storage game = activeGames[msg.sender];
        
        // Check if position is a bomb
        bool isBomb = _isBomb(position);
        
        if (isBomb) {
            // Game over - player hit a bomb
            game.isActive = false;
            game.isWin = false;
            game.winAmount = 0;
            
            emit TileRevealed(msg.sender, position, true, game.currentMultiplier);
            emit GameEnded(msg.sender, false, 0);
        } else {
            // Safe tile - continue game
            game.revealedTiles.push(position);
            game.safeTilesFound++;
            
            // Calculate new multiplier
            game.currentMultiplier = _calculateMultiplier(game.safeTilesFound);
            
            emit TileRevealed(msg.sender, position, false, game.currentMultiplier);
            
            // Check if all safe tiles found
            if (game.safeTilesFound == SAFE_TILES) {
                _endGame(true);
            }
        }
    }

    // Cash out current winnings
    function cashOut() public onlyActiveGame {
        Game storage game = activeGames[msg.sender];
        require(game.safeTilesFound > 0, "No tiles revealed");
        
        uint256 winAmount = (game.bet * game.currentMultiplier * (100 - HOUSE_EDGE)) / 100000; // Divide by 1000 for multiplier
        playerBalance[msg.sender] += winAmount;
        
        game.isActive = false;
        game.isWin = true;
        game.winAmount = winAmount;
        
        emit GameEnded(msg.sender, true, winAmount);
    }

    // Withdraw winnings
    function withdraw() public {
        uint256 balance = playerBalance[msg.sender];
        require(balance > 0, "No winnings to withdraw");
        
        playerBalance[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit CashOut(msg.sender, balance);
    }

    // Get player's active game
    function getActiveGame(address player) public view returns (Game memory) {
        return activeGames[player];
    }

    // Get player balance
    function getPlayerBalance(address player) public view returns (uint256) {
        return playerBalance[player];
    }

    // Check if tile is revealed
    function _isTileRevealed(uint256 position) internal view returns (bool) {
        Game storage game = activeGames[msg.sender];
        for (uint256 i = 0; i < game.revealedTiles.length; i++) {
            if (game.revealedTiles[i] == position) {
                return true;
            }
        }
        return false;
    }

    // Check if position is a bomb
    function _isBomb(uint256 position) internal view returns (bool) {
        Game storage game = activeGames[msg.sender];
        for (uint256 i = 0; i < game.bombPositions.length; i++) {
            if (game.bombPositions[i] == position) {
                return true;
            }
        }
        return false;
    }

    // Generate bomb positions
    function _generateBombPositions(address player, uint256 seed) internal view returns (uint256[] memory) {
        uint256[] memory positions = new uint256[](BOMB_COUNT);
        uint256[] memory available = new uint256[](TOTAL_TILES);
        
        // Initialize available positions
        for (uint256 i = 0; i < TOTAL_TILES; i++) {
            available[i] = i;
        }
        
        // Select random bomb positions
        for (uint256 i = 0; i < BOMB_COUNT; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(player, seed, i, block.timestamp))) % (TOTAL_TILES - i);
            positions[i] = available[randomIndex];
            
            // Remove selected position from available
            available[randomIndex] = available[TOTAL_TILES - i - 1];
        }
        
        return positions;
    }

    // Calculate multiplier based on safe tiles found
    function _calculateMultiplier(uint256 safeTilesFound) internal pure returns (uint256) {
        if (safeTilesFound == 0) return 1000; // 1.0
        
        // Calculate probability of finding this many safe tiles
        uint256 probability = _calculateProbability(safeTilesFound);
        
        // Multiplier = 1 / probability (with some house edge)
        uint256 multiplier = (1000000 * 98) / probability; // 98% to account for house edge
        
        return multiplier;
    }

    // Calculate probability of finding n safe tiles
    function _calculateProbability(uint256 n) internal pure returns (uint256) {
        if (n == 0) return 1000000; // 100%
        
        // This is a simplified calculation
        // In reality, it would be more complex combinatorial math
        uint256 numerator = 1;
        uint256 denominator = 1;
        
        for (uint256 i = 0; i < n; i++) {
            numerator *= (SAFE_TILES - i);
            denominator *= (TOTAL_TILES - i);
        }
        
        return (numerator * 1000000) / denominator;
    }

    // End game
    function _endGame(bool isWin) internal {
        Game storage game = activeGames[msg.sender];
        game.isActive = false;
        game.isWin = isWin;
        
        uint256 winAmount = 0;
        if (isWin) {
            winAmount = (game.bet * game.currentMultiplier * (100 - HOUSE_EDGE)) / 100000;
            playerBalance[msg.sender] += winAmount;
        }
        
        game.winAmount = winAmount;
        
        emit GameEnded(msg.sender, isWin, winAmount);
    }

    // Get contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Reset game (for testing)
    function resetGame() public {
        delete activeGames[msg.sender];
        playerBalance[msg.sender] = 0;
    }
}