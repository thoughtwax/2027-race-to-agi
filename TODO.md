# AI CEO 2027 - Development TODO

## Current Sprint: Architecture Refactor & UI Redesign

### High Priority - Completed
- [x] Refactor single HTML file into modular structure
  - [x] Create organized folder structure
  - [x] Extract game data into JSON files
  - [x] Separate CSS into stylesheets
  - [x] Modularize JavaScript code
  - [ ] Set up simple build process (optional)

### High Priority - In Progress
- [x] Ensure game fits on screen without scrolling on mobile and desktop
  - [x] Fixed viewport height issues
  - [x] Optimized spacing for small screens
  - [x] Added responsive breakpoints for various devices
  - [x] Handle mobile browser chrome (address bar)
  - [x] Created ultra-compact header for desktop (resources inline)
  - [x] Removed card scrolling - content always fits
  - [x] Dynamic font sizing with clamp()

- [x] Implement pixel-perfect UI based on mockups
  - [x] Update layout to match mockup structure
  - [x] Remove container box for full-width design
  - [x] Style cards to match mockup design
  - [x] Update colors and typography
  - [x] Fix button styles and states
  - [ ] Add Inter font properly (currently using fallback)

### High Priority - Completed
- [x] Implement sophisticated card dragging with rubber band effect
  - [x] Add drag threshold detection with momentum
  - [x] Implement rubber band physics for pre/post threshold
  - [x] Add visual button emphasis during drag
  - [x] Spring physics for smooth animations
  - [x] Velocity-based swipe detection

### High Priority - Pending

- [ ] Fix card exit animations
  - [ ] Cards should animate off screen when swiped/chosen
  - [ ] Currently cards are disappearing instead of flying off
  - [ ] Need to ensure animation completes before next card appears
  - [ ] May need to refactor card display/reset timing

- [x] Add NET WORTH and LEGACY tracking system
  - [x] Create new game state variables
  - [x] Define decision impacts on personal metrics
  - [x] Display values in bottom UI
  - [x] Balance personal vs humanity trade-offs
  - [x] Capital changes affect net worth
  - [x] Dynamic legacy updates based on choices

- [ ] Implement card entry/exit animations
  - [ ] Cards animate up from bottom on entry
  - [ ] Background consequence text (1.5s display)
  - [ ] Smooth fade transition between cards

### Medium Priority
- [ ] Create full-page About modal
  - [ ] Game description and satirical goals
  - [ ] Credits and attribution
  - [ ] Link to AI2027 paper inspiration

- [ ] Desktop scaling
  - [ ] Detect screen size and scale appropriately
  - [ ] Maintain mobile-first aspect ratios
  - [ ] Test on various screen sizes

### Completed
- [x] Analyze current game implementation
- [x] Evaluate architecture (staying with single-file)
- [x] Compare features vs PRD requirements
- [x] Create development roadmap
- [x] Get UI mockup clarifications

## Future Sprints

### Content Expansion
- [x] Add 25+ new decision cards across all phases (Added 40+ total cards)
- [ ] Create more varied crisis events
- [ ] Expand narrative branches
- [ ] Add more newspaper headlines

### Core Features
- [ ] Implement save system using localStorage
- [ ] Add achievements/statistics tracking
- [ ] Create difficulty modes
- [ ] Add sound effects (with toggle)

### Polish & Enhancement
- [ ] Improve tutorial with interactive walkthrough
- [ ] Add tooltips showing resource calculations
- [ ] Enhance visual feedback for multipliers
- [ ] Improve accessibility features

## Known Issues
- Code organization needs improvement (2100+ lines in single file)
- Limited card variety (only ~15 cards vs 40+ in PRD)
- No session persistence
- Minimal tutorial

## Notes
- Refactoring to modular architecture for better maintainability
- All game content (cards, decisions) will be in easily editable JSON files
- Focusing on content and polish before new features
- Prioritizing mobile experience with desktop scaling