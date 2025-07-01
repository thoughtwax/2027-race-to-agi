// Splash Screen Module
const Splash = {
    shown: false,
    
    show() {
        if (this.shown) return;
        this.shown = true;
    
    const splashHTML = `
        <div id="splash-screen">
            <video class="splash-video" autoplay loop muted playsinline>
                <source src="assets/images/splash.mp4" type="video/mp4">
            </video>
            
            <a href="#" class="splash-about" id="splash-about-btn">ABOUT</a>
            
            <div class="splash-content">
                <div class="splash-title-wrapper">
                    <div class="splash-title">
                        <h1 class="splash-year">2027<span class="splash-colon">:</span></h1>
                        <h1 class="splash-subtitle">RACE TO AGI</h1>
                    </div>
                </div>
                
                <button class="splash-play-button" id="splash-play-btn">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 48V16L48 32L16 48Z" fill="white"/>
                    </svg>
                </button>
                
                <p class="splash-credit">A GAME BY EMMET CONNOLLY</p>
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