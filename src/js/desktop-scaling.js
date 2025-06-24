// Desktop Scaling Module
const DesktopScaling = {
    // Base dimensions for scaling
    BASE_WIDTH: 428,
    BASE_HEIGHT: 926,
    
    // Scaling limits
    MIN_SCALE: 0.8,
    MAX_SCALE: 1.5,
    
    // Initialize scaling
    init() {
        // Only apply scaling on desktop
        if (window.innerWidth < 1024) return;
        
        this.applyScaling();
        
        // Reapply on resize
        window.addEventListener('resize', this.debounce(() => {
            this.applyScaling();
        }, 250));
    },
    
    // Calculate and apply appropriate scale
    applyScaling() {
        const app = document.getElementById('app');
        if (!app) return;
        
        // Reset any existing transform
        app.style.transform = '';
        app.style.transformOrigin = '';
        
        // Only scale on large screens
        if (window.innerWidth < 1024) {
            app.classList.remove('scaled');
            return;
        }
        
        // Calculate available space
        const availableWidth = window.innerWidth;
        const availableHeight = window.innerHeight;
        
        // Calculate scale factors
        const scaleX = availableWidth / this.BASE_WIDTH;
        const scaleY = availableHeight / this.BASE_HEIGHT;
        
        // Use the smaller scale to ensure content fits
        let scale = Math.min(scaleX, scaleY);
        
        // Apply scale limits
        scale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, scale));
        
        // For very large screens, cap at a reasonable size
        if (window.innerWidth > 1600) {
            scale = Math.min(scale, 1.2);
        }
        
        // Apply scaling if beneficial
        if (scale > 1.1 && window.innerWidth > 1200) {
            app.classList.add('scaled');
            app.style.transform = `scale(${scale})`;
            app.style.transformOrigin = 'center top';
            app.style.width = `${this.BASE_WIDTH}px`;
            app.style.margin = '0 auto';
            app.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.1)';
            
            // Adjust container height to prevent overflow
            const scaledHeight = this.BASE_HEIGHT * scale;
            if (scaledHeight > availableHeight) {
                const adjustedScale = availableHeight / this.BASE_HEIGHT * 0.95;
                app.style.transform = `scale(${adjustedScale})`;
            }
        } else {
            app.classList.remove('scaled');
            app.style.width = '';
            app.style.margin = '';
            app.style.boxShadow = '';
        }
    },
    
    // Debounce helper
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DesktopScaling.init());
} else {
    DesktopScaling.init();
}