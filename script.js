/**
 * Memory Game Logic
 * Enhanced with: Event Delegation, Keyboard Navigation, ARIA Support,
 * Local Storage Leaderboard, and Dark Mode
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
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const leaderboardList = document.getElementById('leaderboard-list');

// Game State
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    time: 0,
    timerInterval: null,
    level: 1,
    isLocked: false,
    volume: 0.5,
    isDarkMode: false
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
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐸', '🐙', '🐵', '🦄',
    '🐞', '🦋', '🐠', '🦖'
];

// Local Storage Keys
const STORAGE_KEYS = {
    LEADERBOARD: 'memoryGame_leaderboard',
    THEME: 'memoryGame_theme',
    VOLUME: 'memoryGame_volume'
};

/**
 * Initialize the game
 */
function initGame() {
    loadUserPreferences();
    setupLevel(gameState.level);
    setupEventListeners();
    renderLeaderboard();
    announceToScreenReader('Memory Game loaded. Press Tab to navigate cards, Enter or Space to flip.');
}

/**
 * Load user preferences from Local Storage
 */
function loadUserPreferences() {
    // Load theme preference
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark') {
        gameState.isDarkMode = true;
        document.body.classList.add('dark-mode');
        updateThemeToggleIcon();
    }

    // Load volume preference
    const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
    if (savedVolume !== null) {
        gameState.volume = parseFloat(savedVolume);
        volumeSlider.value = gameState.volume;
    }
}

/**
 * Setup a specific level
 * @param {number} level
 */
function setupLevel(level) {
    resetGameData();
    updateStatsUI();

    matchedDeck.innerHTML = '';

    const config = levels[level] || levels[1];

    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

    const cardValues = generateCardDeck(config.pairs);
    gameState.cards = cardValues;

    renderBoard(cardValues);
    startTimer();

    announceToScreenReader(`Level ${level} started. ${config.pairs * 2} cards to match.`);
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
    modal.classList.add('hidden');
}

/**
 * Generate pairs of cards and shuffle them
 * @param {number} pairCount
 * @returns {Array} Shuffled array of card values
 */
function generateCardDeck(pairCount) {
    const deck = [];
    const selectedEmojis = emojis.slice(0, pairCount);

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
 * Render the game board with ARIA support
 * @param {Array} cards
 */
function renderBoard(cards) {
    gameBoard.innerHTML = '';

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        cardElement.dataset.value = card.value;

        // Keyboard Navigation: Make cards focusable
        cardElement.setAttribute('tabindex', '0');

        // ARIA Attributes for accessibility
        cardElement.setAttribute('role', 'button');
        cardElement.setAttribute('aria-label', `Card ${index + 1}, face down`);
        cardElement.setAttribute('aria-pressed', 'false');

        // Front Face (Emoji) - initially hidden
        const frontFace = document.createElement('div');
        frontFace.classList.add('card-face', 'card-front');
        frontFace.textContent = card.value;
        frontFace.setAttribute('aria-hidden', 'true');

        // Back Face (Pattern/Solid) - initially visible
        const backFace = document.createElement('div');
        backFace.classList.add('card-face', 'card-back');
        backFace.textContent = '?';
        backFace.setAttribute('aria-hidden', 'true');

        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);

        gameBoard.appendChild(cardElement);
    });
}

/**
 * Handle card interaction (click or keyboard)
 * @param {HTMLElement} cardElement
 */
function handleCardInteraction(cardElement) {
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
 * Flip a card visually and update state
 * @param {HTMLElement} card
 */
function flipCard(card) {
    card.classList.add('flipped');
    card.setAttribute('aria-pressed', 'true');
    card.setAttribute('aria-label', `Card showing ${card.dataset.value}`);
    gameState.flippedCards.push(card);

    announceToScreenReader(`Revealed ${card.dataset.value}`);
}

/**
 * Check if the two flipped cards match
 */
function checkForMatch() {
    gameState.isLocked = true;

    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.dataset.value === card2.dataset.value;

    if (isMatch) {
        disableCards(card1, card2);
        announceToScreenReader(`Match found! ${card1.dataset.value}`);
    } else {
        unflipCards(card1, card2);
        announceToScreenReader('No match. Cards flipping back.');
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

        // Remove from tab order
        card1.setAttribute('tabindex', '-1');
        card2.setAttribute('tabindex', '-1');
        card1.setAttribute('aria-disabled', 'true');
        card2.setAttribute('aria-disabled', 'true');

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
    }, 500);
}

/**
 * Move matched cards to the bottom deck
 * @param {HTMLElement} card1
 * @param {HTMLElement} card2
 */
function moveCardsToMatchedDeck(card1, card2) {
    const placeholder1 = document.createElement('div');
    placeholder1.classList.add('card-placeholder');
    const placeholder2 = document.createElement('div');
    placeholder2.classList.add('card-placeholder');

    card1.replaceWith(placeholder1);
    card2.replaceWith(placeholder2);

    const pairContainer = document.createElement('div');
    pairContainer.classList.add('matched-pair');
    pairContainer.setAttribute('aria-label', `Matched pair: ${card1.dataset.value}`);

    pairContainer.appendChild(card1);
    pairContainer.appendChild(card2);

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

        card1.setAttribute('aria-pressed', 'false');
        card2.setAttribute('aria-pressed', 'false');
        card1.setAttribute('aria-label', 'Card, face down');
        card2.setAttribute('aria-label', 'Card, face down');

        gameState.flippedCards = [];
        gameState.isLocked = false;
    }, 1000);
}

/**
 * Check if all pairs are found
 */
function checkWinCondition() {
    const currentConfig = levels[gameState.level] || levels[1];
    if (gameState.matchedPairs === currentConfig.pairs) {
        stopTimer();
        saveScore();
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
    nextLevelBtn.focus();

    announceToScreenReader(`Level ${gameState.level} complete! ${gameState.moves} moves, ${timeElement.textContent} time.`);
}

/**
 * Trigger celebration effects (Sound + Confetti)
 */
function triggerWinEffects() {
    if (winSound && gameState.volume > 0) {
        winSound.volume = gameState.volume;
        winSound.currentTime = 0;
        winSound.play().catch(e => console.log("Audio play failed:", e));
    }

    if (typeof confetti === 'function') {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
}

/**
 * Setup Global Event Listeners with Event Delegation
 */
function setupEventListeners() {
    // Event Delegation: Single listener for all cards
    gameBoard.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            handleCardInteraction(card);
        }
    });

    // Keyboard Navigation: Enter/Space to flip cards
    gameBoard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const card = e.target.closest('.card');
            if (card) {
                e.preventDefault();
                handleCardInteraction(card);
            }
        }
    });

    // Restart button
    restartBtn.addEventListener('click', () => {
        setupLevel(gameState.level);
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        gameState.volume = parseFloat(e.target.value);
        localStorage.setItem(STORAGE_KEYS.VOLUME, gameState.volume);
    });

    // Theme toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleDarkMode);
    }

    // Modal keyboard trap
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            nextLevelBtn.focus();
        }
        if (e.key === 'Escape') {
            modal.classList.add('hidden');
        }
    });

    // Close modal on Enter/Space on button
    nextLevelBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            nextLevelBtn.click();
        }
    });
}

/**
 * Dark Mode Toggle
 */
function toggleDarkMode() {
    gameState.isDarkMode = !gameState.isDarkMode;
    document.body.classList.toggle('dark-mode');

    localStorage.setItem(STORAGE_KEYS.THEME, gameState.isDarkMode ? 'dark' : 'light');

    updateThemeToggleIcon();
    announceToScreenReader(gameState.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
}

/**
 * Update theme toggle button icon
 */
function updateThemeToggleIcon() {
    if (themeToggleBtn) {
        const sunIcon = themeToggleBtn.querySelector('.sun-icon');
        const moonIcon = themeToggleBtn.querySelector('.moon-icon');

        if (gameState.isDarkMode) {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
        } else {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
        }
    }
}

/**
 * Local Storage: Save Score
 */
function saveScore() {
    const leaderboard = getLeaderboard();

    const newScore = {
        level: gameState.level,
        moves: gameState.moves,
        time: gameState.time,
        timeFormatted: timeElement.textContent,
        date: new Date().toLocaleDateString()
    };

    leaderboard.push(newScore);

    // Sort by level (desc), then moves (asc), then time (asc)
    leaderboard.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        if (a.moves !== b.moves) return a.moves - b.moves;
        return a.time - b.time;
    });

    // Keep only top 10 scores
    const topScores = leaderboard.slice(0, 10);

    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(topScores));
    renderLeaderboard();
}

/**
 * Get leaderboard from Local Storage
 * @returns {Array}
 */
function getLeaderboard() {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Render leaderboard UI
 */
function renderLeaderboard() {
    if (!leaderboardList) return;

    const leaderboard = getLeaderboard();

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li class="empty-message">No scores yet. Play to set a record!</li>';
        return;
    }

    leaderboardList.innerHTML = leaderboard.map((score, index) => `
        <li class="leaderboard-item">
            <span class="rank">${getRankIcon(index)}</span>
            <span class="score-info">
                <strong>Level ${score.level}</strong>
                <span class="details">${score.moves} moves • ${score.timeFormatted}</span>
            </span>
            <span class="date">${score.date}</span>
        </li>
    `).join('');
}

/**
 * Get rank icon for leaderboard
 * @param {number} index
 * @returns {string}
 */
function getRankIcon(index) {
    const rankIcons = [
        '<i class="fa-solid fa-medal rank-gold" aria-hidden="true"></i>',
        '<i class="fa-solid fa-medal rank-silver" aria-hidden="true"></i>',
        '<i class="fa-solid fa-medal rank-bronze" aria-hidden="true"></i>'
    ];
    return rankIcons[index] || `<span class="rank-number">#${index + 1}</span>`;
}

/**
 * Clear leaderboard (utility function)
 */
function clearLeaderboard() {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    renderLeaderboard();
    announceToScreenReader('Leaderboard cleared');
}

/**
 * Announce message to screen readers
 * @param {string} message
 */
function announceToScreenReader(message) {
    const announcement = document.getElementById('sr-announcer');
    if (announcement) {
        announcement.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            announcement.textContent = '';
        }, 1000);
    }
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
