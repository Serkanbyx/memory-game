# 🧠 Memory Game

A responsive, accessible, and interactive card matching game built with vanilla JavaScript. Challenge your memory across increasing difficulty levels, track your moves and time, compete on the leaderboard, and enjoy smooth 3D flip animations.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Progressive Difficulty**: 4 unique levels with increasing grid sizes (from 12 to 24 cards)
- **Smart Match System**: Matched pairs are visually removed from the grid and stacked neatly at the bottom
- **3D Card Flip Animation**: Smooth CSS 3D transforms with `rotateY` for realistic card flipping
- **Real-Time Statistics**: Live tracking of time, moves, and current level
- **Dark/Light Mode**: Toggle between themes with preference saved to local storage
- **Leaderboard System**: Persistent high score tracking with top 10 scores saved locally
- **Full Keyboard Support**: Navigate with Tab, flip cards with Enter/Space
- **Screen Reader Accessible**: Complete ARIA labels and live region announcements
- **Sound Effects**: Audio feedback for matching cards and completing levels
- **Volume Control**: Adjustable volume slider with preference persistence
- **Confetti Celebration**: Visual celebration effect when completing a level
- **Responsive Design**: Fluid grid layout adapting to mobile, tablet, and desktop
- **Fisher-Yates Shuffle**: Truly random card distribution for every game

## Live Demo

[🎮 View Live Demo](https://memory-gameeeeee.netlify.app/)

## Technologies

- **HTML5**: Semantic markup with ARIA attributes for accessibility
- **CSS3**: 3D transforms, CSS Grid, Flexbox, CSS Variables for theming, and smooth transitions
- **JavaScript (ES6+)**: Modern syntax with event delegation, async patterns, and modular functions
- **Font Awesome 6**: Scalable vector icons for UI elements
- **Canvas Confetti**: Lightweight library for celebration effects
- **Local Storage API**: Persistent user preferences and leaderboard data

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

   - **Option A (Direct)**: Open `index.html` directly in your web browser
   - **Option B (VS Code)**: Install "Live Server" extension, right-click `index.html` and select "Open with Live Server"
   - **Option C (Python)**:
     ```bash
     python -m http.server 8000
     ```
   - **Option D (Node.js)**:
     ```bash
     npx serve
     ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## Usage

1. **Start**: The game begins immediately at Level 1 with a 3x4 grid (6 pairs)
2. **Play**: Click any card (or press Enter/Space when focused) to reveal its emoji
3. **Match**: Find matching pairs:
   - If cards match → They move to the "Matched Cards" section with a sound effect
   - If cards don't match → They flip back after 1 second
4. **Progress**: Match all pairs to complete the level and trigger confetti celebration
5. **Next Level**: Click "Next Level" in the completion modal to advance
6. **Leaderboard**: Your scores are automatically saved and displayed
7. **Theme**: Click the sun/moon icon to toggle between light and dark modes
8. **Volume**: Use the slider to adjust game sound volume

## Keyboard Shortcuts

| Key               | Action                         |
| ----------------- | ------------------------------ |
| `Tab`             | Navigate between cards         |
| `Shift + Tab`     | Navigate backwards             |
| `Enter` / `Space` | Flip the focused card          |
| `Escape`          | Close the level complete modal |

## How It Works?

### Fisher-Yates Shuffle Algorithm

The game uses the Fisher-Yates algorithm to ensure truly random card distribution:

```javascript
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

### Event Delegation Pattern

Instead of attaching listeners to each card, a single listener handles all card interactions for better performance:

```javascript
gameBoard.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) {
    handleCardInteraction(card);
  }
});
```

### 3D Card Flip with CSS

Cards use CSS 3D transforms for realistic flipping:

```css
.card {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-front {
  transform: rotateY(180deg);
  backface-visibility: hidden;
}
```

### Local Storage Persistence

User preferences and scores are saved using the Local Storage API:

```javascript
const STORAGE_KEYS = {
  LEADERBOARD: "memoryGame_leaderboard",
  THEME: "memoryGame_theme",
  VOLUME: "memoryGame_volume",
};

// Save score
localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(scores));
```

## Customization

### Changing Theme Colors

Modify CSS Variables in `style.css` to customize the color scheme:

```css
:root {
  --primary-color: #360185;
  --secondary-color: #8f0177;
  --accent-color: #de1a58;
  --highlight-color: #f4b342;
}

/* Dark mode colors */
body.dark-mode {
  --primary-color: #a855f7;
  --secondary-color: #ec4899;
  --accent-color: #f472b6;
}
```

### Changing Card Emojis

Update the `emojis` array in `script.js` to use different icons:

```javascript
const emojis = [
  "🚀",
  "🛸",
  "🌍",
  "🌙",
  "⭐",
  "🌈",
  "🎯",
  "🎨",
  // Add more emojis...
];
```

### Adjusting Difficulty Levels

Modify the `levels` object in `script.js`:

```javascript
const levels = {
  1: { rows: 2, cols: 3, pairs: 3 }, // Easier
  2: { rows: 3, cols: 4, pairs: 6 },
  3: { rows: 4, cols: 4, pairs: 8 },
  4: { rows: 4, cols: 5, pairs: 10 },
  5: { rows: 5, cols: 6, pairs: 15 }, // Add more levels
};
```

## Accessibility Features

This game is designed with accessibility as a priority:

- **ARIA Labels**: All interactive elements have descriptive labels
- **Live Regions**: Game state changes are announced to screen readers
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Skip Link**: Allows keyboard users to skip directly to the game board
- **Focus Indicators**: Clear visual focus states for all interactive elements
- **Reduced Motion**: Respects `prefers-reduced-motion` user preference
- **High Contrast**: Enhanced support for high contrast mode
- **Semantic HTML**: Proper use of landmarks, headings, and roles

## Features in Detail

### Completed Features

- [x] ✅ Dynamic grid system adjusting based on difficulty level
- [x] ✅ Move counter tracking player efficiency
- [x] ✅ Timer counting elapsed time per level
- [x] ✅ Matched card stack displaying found pairs
- [x] ✅ Responsive UI for all screen sizes
- [x] ✅ Confetti celebration on level completion
- [x] ✅ Sound effects for matching and winning
- [x] ✅ Dark/Light mode toggle with persistence
- [x] ✅ Leaderboard with top 10 scores
- [x] ✅ Full keyboard navigation support
- [x] ✅ ARIA labels and screen reader support
- [x] ✅ Event delegation for performance
- [x] ✅ Volume control with persistence
- [x] ✅ Reduced motion support

### Future Features

- [ ] 🔮 Custom card deck upload (use your own images)
- [ ] 🔮 Multiplayer mode (compete with friends)
- [ ] 🔮 Timed challenge mode
- [ ] 🔮 Achievement/badge system
- [ ] 🔮 Statistics dashboard

## Browser Support

| Browser | Support          |
| ------- | ---------------- |
| Chrome  | ✅ Full          |
| Firefox | ✅ Full          |
| Safari  | ✅ Full          |
| Edge    | ✅ Full          |
| Opera   | ✅ Full          |
| IE11    | ❌ Not Supported |

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feat/amazing-feature
   ```
3. **Commit** your changes with conventional commits
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch
   ```bash
   git push origin feat/amazing-feature
   ```
5. **Open** a Pull Request

### Commit Message Format

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Developer

**Serkan Bayraktar**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Acknowledgments

- [Font Awesome](https://fontawesome.com/) - Icon library
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) - Confetti animation library
- [Mixkit](https://mixkit.co/) - Free sound effects

## Contact

- **Report Bug**: [GitHub Issues](https://github.com/Serkanbyx/memory-game/issues)
- **Email**: serkanbyx1@gmail.com
- **Website**: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
