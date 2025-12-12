# 🧠 Memory Game

A responsive, interactive card matching game built with vanilla JavaScript. Challenge your memory across increasing difficulty levels, track your moves and time, and enjoy smooth 3D animations.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Progressive Difficulty**: 4 unique levels with increasing grid sizes (from 12 to 24 cards).
- **Smart Match System**: Matched pairs are visually removed from the grid and stacked neatly at the bottom.
- **Immersive Feedback**: Smooth 3D CSS flip animations, victory confetti, and sound effects upon level completion.
- **Real-Time Statistics**: Tracks your time and moves dynamically as you play.
- **Responsive Design**: Fluid grid layout that adapts to mobile, tablet, and desktop screens.
- **Fisher-Yates Shuffle**: Ensures a truly random card distribution for every new game.

## Live Demo

[🎮 View Live Demo](https://memory-gameeeeee.netlify.app/)

## Technologies

- **HTML5**: Semantic markup for game structure and accessibility.
- **CSS3**: utilized for 3D transforms (`rotateY`), Flexbox/Grid layouts, and CSS Variables for easy theming.
- **JavaScript (ES6+)**: Handles game state, DOM manipulation, event listeners, and logic.
- **Canvas Confetti**: Lightweight external library for celebration effects.

## Installation

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/Serkanbyx/memory-game.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd memory-game
   ```

3. **Run the project**
   - **Option A (Direct)**: Open `index.html` in your web browser.
   - **Option B (VS Code)**: Install "Live Server" extension, right-click `index.html` and select "Open with Live Server".
   - **Option C (Python)**:
     ```bash
     python -m http.server 8000
     ```

## Usage

1. **Start**: The game begins immediately at Level 1.
2. **Play**: Click any card to reveal its emoji. Click a second card to try and match it.
3. **Match**:
   - If they match, they will be moved to the "Matched Cards" stack at the bottom.
   - If they don't match, they will flip back over after a short delay.
4. **Progress**: Match all pairs to finish the level and trigger the celebration.
5. **Next Level**: Click "Next Level" in the modal to increase difficulty.

## How It Works?

### Shuffle Algorithm

The game uses the **Fisher-Yates Shuffle** algorithm to ensure randomness:

```javascript
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

### Matching Logic

The game tracks state using an object and checks for matches when two cards are in the `flippedCards` array.

```javascript
function checkForMatch() {
  gameState.isLocked = true; // Prevent extra clicks
  const [card1, card2] = gameState.flippedCards;

  if (card1.dataset.value === card2.dataset.value) {
    disableCards(card1, card2); // Handle match
  } else {
    unflipCards(card1, card2); // Handle miss
  }
}
```

## Customization

### Changing Colors

You can easily modify the color scheme by editing the CSS Variables in `style.css`:

```css
:root {
  --primary-color: #360185; /* Change main theme color */
  --secondary-color: #8f0177;
  --accent-color: #de1a58;
}
```

### Changing Icons

To use different emojis or icons, update the `emojis` array in `script.js`:

```javascript
const emojis = ['🚀', '🛸', '🌍', '🌑', '⭐', ...];
```

## Features in Detail

### Completed Features

- [x] ✅ **Dynamic Grid System**: Grid automatically adjusts based on difficulty level.
- [x] ✅ **Move Counter**: Tracks every move to measure efficiency.
- [x] ✅ **Timer**: Counts up to track how long the level takes.
- [x] ✅ **Matched Card Stack**: Visually stacks matched cards at the bottom of the screen.
- [x] ✅ **Responsive UI**: Fully playable on mobile, tablet, and desktop.
- [x] ✅ **Confetti Celebration**: Visual reward for completing a level.
- [x] ✅ **Sound Effects**: Audio feedback for winning.

### Future Features

- [ ] 🔮 **High Score Leaderboard**: Save best times to local storage.
- [ ] 🔮 **Sound Toggle**: Option to mute/unmute game sounds.
- [ ] 🔮 **Dark/Light Mode**: User preference for theme.
- [ ] 🔮 **Custom Card Decks**: Allow users to upload their own images.

## Contributing

Contributions are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Developer

**Serkan Bayraktar**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Contact

- **Report Bug**: [GitHub Issues](https://github.com/Serkanbyx/memory-game/issues)
- **Email**: serkanbyx1@gmail.com

---

⭐ If you like this project, don't forget to give it a star!
