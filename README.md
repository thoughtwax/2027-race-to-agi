# AI CEO 2027 - Race to AGI

A satirical web-based decision game about the complex trade-offs in developing AGI.

## Project Structure

```
ai-2027-game/
├── index.html          # Main game entry point
├── src/
│   ├── css/           # Modular stylesheets
│   │   ├── reset.css
│   │   ├── main.css
│   │   ├── cards.css
│   │   ├── resources.css
│   │   ├── animations.css
│   │   └── responsive.css
│   ├── js/            # JavaScript modules
│   │   ├── config.js   # Game configuration
│   │   ├── state.js    # State management
│   │   ├── resources.js # Resource system
│   │   ├── cards.js    # Card mechanics
│   │   ├── ui.js       # UI management
│   │   ├── game.js     # Game logic
│   │   └── main.js     # Entry point
│   └── data/          # Game content (JSON)
│       ├── cards.json  # All decision cards
│       └── gameConfig.json # Game settings
├── assets/            # Fonts and images
├── prototype.html     # Original prototype
└── PRD.md            # Product requirements
```

## Running the Game

1. Clone the repository
2. Run the local server:
   ```bash
   ./serve.sh
   ```
3. Open http://localhost:8080 in your browser

## Game Features

- **Mobile-first design** with desktop scaling
- **Sophisticated drag physics** with rubber band effects
- **4 input + 4 output resources** with feedback loops
- **Personal stakes** tracking (Net Worth & Legacy)
- **Save system** using localStorage
- **40+ decision cards** across 4 phases
- **Multiple endings** based on your choices

## Development

### Adding New Cards

Edit `src/data/cards.json` to add new decision cards. Each card has:
- `id`: Unique identifier
- `title`: Card headline
- `description`: Decision context
- `leftChoice` / `rightChoice`: Button labels
- `leftEffects` / `rightEffects`: Resource changes
- `condition`: Optional conditions for card to appear
- `special`: Special effects (flags, multipliers, endings)

### Customizing Resources

Resource formulas and thresholds are in `src/js/config.js`.

### Styling

The game uses modular CSS with CSS variables for easy theming. Main variables are in `src/css/main.css`.

## Credits

- Inspired by the AI2027 research paper
- Game design focused on illustrating AGI development trade-offs
- Built with vanilla JavaScript for maximum compatibility