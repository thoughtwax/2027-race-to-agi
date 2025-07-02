// Main Entry Point
document.addEventListener('DOMContentLoaded', async () => {
    
    try {
        // Initialize modal handlers early so they work from splash screen
        UI.initModal();
        
        // Show splash screen first
        Splash.show();
        
        // Add keyboard shortcuts that will be active after game starts
        document.addEventListener('keydown', (e) => {
            // Handle Escape key for modal even during splash
            if (e.key === 'Escape') {
                UI.hideModal();
                return;
            }
            
            // Only handle game shortcuts if splash is not visible
            if (document.getElementById('splash-screen')) return;
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
            }
        });
        
        // No save system - removed visibility change handler
        
        // Add debug commands in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Debug button is visible by default in HTML, no need to show it
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
            
        } else {
            // Hide debug button when not on localhost
            const debugBtn = document.getElementById('debug-btn');
            if (debugBtn) {
                debugBtn.style.display = 'none';
            }
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

