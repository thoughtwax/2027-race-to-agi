// Main Entry Point
document.addEventListener('DOMContentLoaded', async () => {
    console.log('RACE TO AGI - Initializing...');
    
    try {
        // Initialize game directly (no save system)
        await Game.init();
        
        console.log('Game initialized successfully');
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (DragHandler.dragging) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    UI.animateChoice('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    UI.animateChoice('right');
                    break;
                case 'Escape':
                    UI.hideModal();
                    break;
            }
        });
        
        // No save system - removed visibility change handler
        
        // Add debug commands in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.debug = {
                state: GameState,
                cards: Cards,
                resources: Resources,
                ui: UI,
                game: Game,
                config: Config,
                
                // Debug helpers
                setResource(resource, value) {
                    GameState.current.resources[resource] = value;
                    Resources.updateDisplay(resource, value);
                },
                
                skipToPhase(phase) {
                    GameState.current.phase = phase;
                    if (phase === 4) {
                        GameState.current.flags.alignmentRevealed = true;
                    }
                    UI.updatePhase();
                },
                
                triggerEnding(ending) {
                    Game.endGame(ending);
                },
                
                addCard(cardId) {
                    Cards.usedCards.delete(cardId);
                }
            };
            
            console.log('Debug mode enabled. Access debug commands via window.debug');
        }
        
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
                <div>
                    <h1>An Error Occurred</h1>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Refresh</button>
                </div>
            </div>
        `;
    }
});

// Add touch support detection
if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device');
} else {
    document.documentElement.classList.add('mouse-device');
}

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

