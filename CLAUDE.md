# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

To run the game locally:
```bash
./serve.sh
```
This starts a Python HTTP server on port 8080. Open http://localhost:8080 in your browser.

## Architecture Overview

This is a vanilla JavaScript web game with no build process or dependencies. The architecture follows a modular pattern:

### Core Game Flow
1. **Entry Point**: `main.js` initializes the game when DOM loads
2. **Game Loop**: `game.js` manages turn progression and win/lose conditions
3. **State Management**: `state.js` contains all game state in a single object
4. **Card System**: `cards.js` displays decision cards and handles player choices
5. **Resource System**: `resources.js` manages the 8 resources and their feedback loops

### Key Architecture Decisions

**Event Flow**: When a player makes a choice (swipe/click):
1. `DragHandler` (drag-handler.js) detects the gesture and adds exit animation classes
2. `Cards.makeChoice()` applies resource effects
3. `Game.progressTurn()` advances the game state
4. `Cards.displayCard()` shows the next card after a delay

**Resource Feedback Loops**: Applied each turn in `resources.js`:
- Research Loop: (Compute + Talent) × Energy% → Progress
- Capital Generation: (Trust × Progress) / 200 → Capital
- Energy Consumption: Compute × 0.05 → Energy drain

**CSS Organization**: 
- `main.css`: Core styles and CSS variables
- `cards.css`: Card-specific styles
- `resources.css`: Resource bar styles
- `animations.css`: Keyframe animations
- `responsive-simple.css`: Single breakpoint at 768px

### Common Issues and Solutions

**Card animations not working**: Check that DragHandler is properly attached after card entry animation completes (see `cards.js` line 154)

**Resources not updating**: Ensure resource names match exactly between HTML data attributes and JavaScript (compute, energy, talent, knowledge, progress, trust, capital, alignment)

**Game not progressing**: Check browser console for errors in card/crisis data loading. JSON files must be valid.

### Data Files

- `src/data/cards.json`: All decision cards organized by phase
- `src/data/crisisEvents.json`: Crisis event cards
- `src/data/gameConfig.json`: Resource thresholds, multipliers, and game constants

### Current Known Issues

- Card exit animations don't fully animate off screen (tracked in TODO.md)
- Mobile viewport issues with some device keyboards

### Testing Considerations

No automated tests exist. Manual testing should cover:
- Card swiping/clicking on mobile and desktop
- Resource calculations and bounds (0-100)
- Save/load functionality
- All 8 game endings trigger correctly