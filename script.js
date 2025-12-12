/**
 * Memory Game Logic
 */

// DOM Elements
const gameBoard = document.getElementById('game-board');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const levelElement = document.getElementById('level');
const restartBtn = document.getElementById('restart-btn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const nextLevelBtn = document.getElementById('next-level-btn');
const matchedDeck = document.getElementById('matched-deck');
const winSound = document.getElementById('win-sound');
const matchSound = document.getElementById('match-sound');
const volumeSlider = document.getElementById('volume-slider');

// Game State
let gameState = {
    cards: [], // Array to hold card values
    flippedCards: [], // Currently flipped cards (max 2)
    matchedPairs: 0,
    moves: 0,
    time: 0,
    timerInterval: null,
    level: 1,
    isLocked: false, // Lock board during animations
    volume: 0.5
};

// Level Configuration
const levels = {
    1: { rows: 3, cols: 4, pairs: 6 },
    2: { rows: 4, cols: 4, pairs: 8 },
    3: { rows: 4, cols: 5, pairs: 10 },
    4: { rows: 4, cols: 6, pairs: 12 }
};

// Card Content (Emojis)
const emojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', 'fox', '🐻', '🐼', 
    '🐨', '🐯', '🦁', 'not_used', '🐸', '🐙', '🐵', '🦄', 
    '🐞', '🦋', '🐠', '🦖' 
].map(e => e === 'fox' ? '🦊' : e === 'not_used' ? '🐮' : e); 
// Just ensuring I have enough unique emojis.

/**
 * Initialize the game
 */
function initGame() {
    setupLevel(gameState.level);
    setupEventListeners();
}

/**
 * Setup a specific level
 * @param {number} level 
 */
function setupLevel(level) {
    resetGameData();
    updateStatsUI();
    
    // Clear matched deck container
    matchedDeck.innerHTML = '';
    
    const config = levels[level] || levels[1];
    const totalCards = config.pairs * 2;
    
    // Adjust grid style based on columns
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

    // Generate and shuffle cards
    const cardValues = generateCardDeck(config.pairs);
    gameState.cards = cardValues;
    
    renderBoard(cardValues);
    startTimer();
}

/**
 * Reset game data for new level/restart
 */
function resetGameData() {
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.time = 0;
    gameState.isLocked = false;
    
    stopTimer();
    // Modal hidden
    modal.classList.add('hidden');
}

/**
 * Generate pairs of cards and shuffle them
 * @param {number} pairCount 
 * @returns {Array} Shuffled array of card values
 */
function generateCardDeck(pairCount) {
    const deck = [];
    // Select unique emojis for this game
    const selectedEmojis = emojis.slice(0, pairCount);
    
    // Create pairs
    selectedEmojis.forEach(emoji => {
        deck.push({ id: Math.random().toString(36).substr(2, 9), value: emoji });
        deck.push({ id: Math.random().toString(36).substr(2, 9), value: emoji });
    });

    return shuffleArray(deck);
}

/**
 * Fisher-Yates Shuffle Algorithm
 * @param {Array} array 
 * @returns {Array}
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Render the game board
 * @param {Array} cards 
 */
function renderBoard(cards) {
    gameBoard.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        cardElement.dataset.value = card.value;

        // Front Face (Emoji) - initially hidden
        const frontFace = document.createElement('div');
        frontFace.classList.add('card-face', 'card-front');
        frontFace.textContent = card.value;

        // Back Face (Pattern/Solid) - initially visible
        const backFace = document.createElement('div');
        backFace.classList.add('card-face', 'card-back');
        backFace.textContent = '?'; // Or leave empty

        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);
        
        cardElement.addEventListener('click', () => handleCardClick(cardElement));
        gameBoard.appendChild(cardElement);
    });
}

/**
 * Handle card click event
 * @param {HTMLElement} cardElement 
 */
function handleCardClick(cardElement) {
    // Prevent interaction if board is locked, card is already flipped, or matched
    if (
        gameState.isLocked || 
        cardElement.classList.contains('flipped') || 
        cardElement.classList.contains('matched')
    ) {
        return;
    }

    flipCard(cardElement);
    
    const flipped = gameState.flippedCards;
    
    if (flipped.length === 2) {
        incrementMoves();
        checkForMatch();
    }
}

/**
 * Flip a card visualy and update state
 * @param {HTMLElement} card 
 */
function flipCard(card) {
    card.classList.add('flipped');
    gameState.flippedCards.push(card);
}

/**
 * Check if the two flipped cards match
 */
function checkForMatch() {
    gameState.isLocked = true; // Lock board while checking

    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.dataset.value === card2.dataset.value;

    if (isMatch) {
        disableCards(card1, card2);
    } else {
        unflipCards(card1, card2);
    }
}

/**
 * Handle matched cards
 * @param {HTMLElement} card1 
 * @param {HTMLElement} card2 
 */
function disableCards(card1, card2) {
    setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        // Play match sound
        if (matchSound && gameState.volume > 0) {
            matchSound.volume = gameState.volume;
            matchSound.currentTime = 0;
            matchSound.play().catch(e => console.log("Audio play failed:", e));
        }

        moveCardsToMatchedDeck(card1, card2);

        gameState.matchedPairs++;
        gameState.flippedCards = [];
        gameState.isLocked = false;

        checkWinCondition();
    }, 500); // Small delay to see the match
}

/**
 * Move matched cards to the bottom deck
 * @param {HTMLElement} card1 
 * @param {HTMLElement} card2 
 */
function moveCardsToMatchedDeck(card1, card2) {
    // Create placeholders to keep grid layout intact
    const placeholder1 = document.createElement('div');
    placeholder1.classList.add('card-placeholder');
    const placeholder2 = document.createElement('div');
    placeholder2.classList.add('card-placeholder');

    // Replace cards in the grid with placeholders
    // We need to insert placeholders before moving elements to ensure grid doesn't shift unexpectedly
    card1.replaceWith(placeholder1);
    card2.replaceWith(placeholder2);

    // Create a container for the pair
    const pairContainer = document.createElement('div');
    pairContainer.classList.add('matched-pair');

    // Remove specific positioning styles that might interfere
    // (Though we rely on class-based styling in CSS mostly)
    
    // Append cards to the new container
    pairContainer.appendChild(card1);
    pairContainer.appendChild(card2);

    // Add to the matched deck
    matchedDeck.appendChild(pairContainer);
}

/**
 * Handle mismatched cards
 * @param {HTMLElement} card1 
 * @param {HTMLElement} card2 
 */
function unflipCards(card1, card2) {
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        
        gameState.flippedCards = [];
        gameState.isLocked = false;
    }, 1000); // Show cards for 1 second before flipping back
}

/**
 * Check if all pairs are found
 */
function checkWinCondition() {
    const currentConfig = levels[gameState.level] || levels[1];
    if (gameState.matchedPairs === currentConfig.pairs) {
        stopTimer();
        handleLevelComplete();
    }
}

/**
 * Increment move counter
 */
function incrementMoves() {
    gameState.moves++;
    movesElement.textContent = gameState.moves;
}

/**
 * Timer Logic
 */
function startTimer() {
    // Clear existing timer if any
    stopTimer();
    gameState.timerInterval = setInterval(() => {
        gameState.time++;
        const minutes = Math.floor(gameState.time / 60).toString().padStart(2, '0');
        const seconds = (gameState.time % 60).toString().padStart(2, '0');
        timeElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
}

/**
 * Handle Level Complete
 */
function handleLevelComplete() {
    triggerWinEffects();
    
    const isLastLevel = gameState.level >= Object.keys(levels).length;
    
    if (isLastLevel) {
        modalTitle.textContent = "Congratulations!";
        modalMessage.textContent = `You completed the game!`;
        nextLevelBtn.textContent = "Play Again";
        nextLevelBtn.onclick = () => {
            gameState.level = 1;
            setupLevel(gameState.level);
        };
    } else {
        modalTitle.textContent = "Level Complete!";
        modalMessage.textContent = `You finished Level ${gameState.level} in ${gameState.moves} moves and ${timeElement.textContent}.`;
        nextLevelBtn.textContent = "Next Level";
        nextLevelBtn.onclick = () => {
            gameState.level++;
            setupLevel(gameState.level);
        };
    }
    
    modal.classList.remove('hidden');
}

/**
 * Trigger celebration effects (Sound + Confetti)
 */
function triggerWinEffects() {
    // Play Sound
    if (winSound && gameState.volume > 0) {
        winSound.volume = gameState.volume;
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log("Audio play failed:", e));
    }

    // Fire Confetti
    if (typeof confetti === 'function') {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            // Random confetti bursts
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
}

/**
 * Setup Global Event Listeners
 */
function setupEventListeners() {
    restartBtn.addEventListener('click', () => {
        // Restart current level
        setupLevel(gameState.level);
    });

    volumeSlider.addEventListener('input', (e) => {
        gameState.volume = parseFloat(e.target.value);
    });
}

/**
 * UI Helper
 */
function updateStatsUI() {
    levelElement.textContent = gameState.level;
    movesElement.textContent = '0';
    timeElement.textContent = '00:00';
}

// Start the game on load
document.addEventListener('DOMContentLoaded', initGame);

