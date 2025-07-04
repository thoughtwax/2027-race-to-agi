// Safari Fullscreen Enhancements
const SafariFullscreen = {
    init() {
        // Set up viewport height CSS variable for better control
        this.updateViewportHeight();
        
        // Update on resize and orientation change
        window.addEventListener('resize', () => this.updateViewportHeight());
        window.addEventListener('orientationchange', () => this.updateViewportHeight());
        
        // Handle scroll to hide Safari UI
        this.setupScrollBehavior();
        
        // Add standalone mode detection
        this.detectStandaloneMode();
    },
    
    updateViewportHeight() {
        // Calculate the actual viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },
    
    setupScrollBehavior() {
        // Prevent overscroll bounce
        document.body.addEventListener('touchmove', (e) => {
            // Only prevent default if we're at the top or bottom
            if (e.target.closest('.modal-content')) {
                // Allow scrolling in modals
                return;
            }
            e.preventDefault();
        }, { passive: false });
        
        // Optional: Programmatically scroll a tiny bit to hide Safari UI
        // This is aggressive but effective
        if (!this.isStandalone()) {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);
        }
    },
    
    detectStandaloneMode() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone || 
                           document.referrer.includes('android-app://');
        
        if (isStandalone) {
            document.body.classList.add('standalone-mode');
        }
        
        return isStandalone;
    },
    
    isStandalone() {
        return this.detectStandaloneMode();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SafariFullscreen.init());
} else {
    SafariFullscreen.init();
}