// Splash Screen Module
const Splash = {
    shown: false,
    
    show() {
        if (this.shown) return;
        this.shown = true;
    
    const splashHTML = `
        <div id="splash-screen">
            <div class="splash-content">
                <div class="splash-logo">
                    <h1>AI 2027</h1>
                    <div class="splash-subtitle">THE RACE TO AGI</div>
                </div>
                
                <div class="splash-text">
                    <p>You are the CEO of a leading AI company.</p>
                    <p>The world watches as you race toward AGI.</p>
                    <p>Every decision shapes the future of humanity.</p>
                </div>
                
                <button class="splash-start-button">BEGIN</button>
                
                <div class="splash-footer">
                    <p>Inspired by Situational Awareness and the race to AGI</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', splashHTML);
    
    const splash = document.getElementById('splash-screen');
    const startButton = splash.querySelector('.splash-start-button');
    
    // Fade in
    setTimeout(() => {
        splash.classList.add('visible');
    }, 100);
    
    // Start game on button click
    startButton.addEventListener('click', () => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
            Game.init();
        }, 800);
    });
    
    // Also start on any key press after a delay
    setTimeout(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                document.removeEventListener('keydown', handleKeyPress);
                startButton.click();
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }, 1000);
    }

};