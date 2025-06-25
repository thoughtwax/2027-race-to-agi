// Splash Screen Module
const Splash = {
    shown: false,
    
    show() {
        if (this.shown) return;
        this.shown = true;
    
    const splashHTML = `
        <div id="splash-screen">
            <a href="#" class="splash-about" id="splash-about-btn">ABOUT</a>
            
            <div class="splash-content">
                <div class="splash-title">
                    <h1 class="splash-year">2027:</h1>
                    <h1 class="splash-subtitle">RACE TO AGI</h1>
                </div>
                
                <button class="splash-play-button" id="splash-play-btn">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 28V12L28 20L14 28Z" fill="white"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', splashHTML);
    
    const splash = document.getElementById('splash-screen');
    const playButton = document.getElementById('splash-play-btn');
    const aboutButton = document.getElementById('splash-about-btn');
    
    // Fade in
    setTimeout(() => {
        splash.classList.add('visible');
    }, 100);
    
    // About button
    aboutButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Show about modal directly without starting game
        UI.showModal();
    });
    
    // Start game on button click
    playButton.addEventListener('click', () => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
            Game.init();
        }, 400);
    });
    
    // Also start on any key press after a delay
    setTimeout(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                document.removeEventListener('keydown', handleKeyPress);
                playButton.click();
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }, 1000);
    }

};