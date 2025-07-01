// UI Enhancement Module - Additional Visual Feedback
const UIEnhancements = {
    // Show resource change animation with particles
    showResourceChange(resource, change) {
        const resourceElement = document.querySelector(`[data-resource="${resource}"]`);
        if (!resourceElement) return;
        
        const bar = resourceElement.querySelector('.resource-bar');
        
        // Add animation class
        bar.classList.remove('increasing', 'decreasing');
        void bar.offsetWidth; // Force reflow
        bar.classList.add(change > 0 ? 'increasing' : 'decreasing');
        
        // Create floating particle
        this.createResourceParticle(resourceElement, change);
        
        // Remove animation class after completion
        setTimeout(() => {
            bar.classList.remove('increasing', 'decreasing');
        }, 600);
    },
    
    // Create floating particle effect
    createResourceParticle(element, change) {
        const particle = document.createElement('div');
        particle.className = `resource-particle ${change > 0 ? 'positive' : 'negative'}`;
        particle.textContent = `${change > 0 ? '+' : ''}${change}`;
        
        const rect = element.getBoundingClientRect();
        particle.style.left = `${rect.right - 50}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => particle.remove(), 1200);
    },
    
    // Show phase transition screen
    showPhaseTransition(phase, title, description) {
        const screen = document.createElement('div');
        screen.className = 'phase-transition-screen';
        screen.innerHTML = `
            <div class="phase-transition-content">
                <div class="phase-number">${phase}</div>
                <h2>${title}</h2>
                <p>${description}</p>
            </div>
        `;
        
        document.body.appendChild(screen);
        
        // Remove after delay
        setTimeout(() => {
            screen.classList.add('fade-out');
            setTimeout(() => screen.remove(), 500);
        }, 3000);
    },
    
    // Show decision preview on hover/drag
    showDecisionPreview(direction, effects) {
        // Remove existing previews
        document.querySelectorAll('.decision-preview').forEach(p => p.remove());
        
        const preview = document.createElement('div');
        preview.className = `decision-preview ${direction}`;
        
        const effectsList = Object.entries(effects)
            .filter(([key, value]) => value !== 0)
            .map(([key, value]) => {
                const sign = value > 0 ? '+' : '';
                const color = value > 0 ? 'green' : 'red';
                return `<span style="color: var(--color-${color})">${key}: ${sign}${value}</span>`;
            })
            .join('<br>');
        
        preview.innerHTML = effectsList || 'No immediate effects';
        
        const card = document.getElementById('current-card');
        card.appendChild(preview);
        
        return preview;
    },
    
    // Remove decision preview
    hideDecisionPreview() {
        document.querySelectorAll('.decision-preview').forEach(p => p.remove());
    },
    
    // Show competitor progress warning with animation
    showCompetitorWarning(progress) {
        const warning = document.createElement('div');
        warning.className = 'competitor-warning';
        warning.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
                <strong>COMPETITOR ALERT</strong><br>
                DeepCent at ${progress}% progress!
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // Remove after animation
        setTimeout(() => {
            warning.classList.add('fade-out');
            setTimeout(() => warning.remove(), 500);
        }, 3000);
    },
    
    // Show critical resource warning
    showCriticalResourceWarning(resource) {
        const resourceElement = document.querySelector(`[data-resource="${resource}"]`);
        if (!resourceElement) return;
        
        const container = resourceElement.querySelector('.resource-bar-container');
        container.classList.add('critical');
        
        // Remove after a few pulses
        setTimeout(() => {
            container.classList.remove('critical');
        }, 3000);
    },
    
    // Create confetti effect for success
    createConfetti() {
        const colors = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF5722'];
        const particles = 50;
        
        for (let i = 0; i < particles; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'confetti-particle';
                particle.style.left = `${Math.random() * window.innerWidth}px`;
                particle.style.top = '-10px';
                particle.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
                
                document.body.appendChild(particle);
                
                // Remove after animation
                setTimeout(() => particle.remove(), 3000);
            }, i * 30);
        }
    },
    
    // Add card stack effect
    addCardStackEffect(cardElement) {
        // Remove existing stacks
        cardElement.querySelectorAll('.card-stack-1, .card-stack-2').forEach(s => s.remove());
        
        // Add stack elements
        const stack1 = document.createElement('div');
        stack1.className = 'card-stack-1';
        const stack2 = document.createElement('div');
        stack2.className = 'card-stack-2';
        
        cardElement.appendChild(stack1);
        cardElement.appendChild(stack2);
    },
    
    // Show loading spinner
    showLoading() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-overlay';
        spinner.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(spinner);
        return spinner;
    },
    
    // Hide loading spinner
    hideLoading(spinner) {
        if (spinner) spinner.remove();
    },
    
    // Apply ending-specific visual effects
    applyEndingEffect(ending) {
        const app = document.getElementById('app');
        
        switch(ending) {
            case 'aligned_agi':
                app.classList.add('ending-aligned');
                this.createConfetti();
                break;
            case 'rogue_ai':
                app.classList.add('ending-rogue');
                break;
            case 'power_failure':
                // No fade to black - keep screen visible
                break;
        }
    }
};

// Extend the existing UI object
Object.assign(UI, {
    // Hook into existing methods to add enhancements
    _originalShowEvent: UI.showEvent,
    showEvent(event) {
        this._originalShowEvent(event);
        
        // Removed phase transition animations - phases are internal game mechanics
    },
    
    _originalShowGameOver: UI.showGameOver,
    showGameOver(ending) {
        UIEnhancements.applyEndingEffect(ending);
        this._originalShowGameOver(ending);
    }
});

// Extend Resources object to show animations
const _originalUpdateDisplay = Resources.updateDisplay;
Resources.updateDisplay = function(resource, value, change) {
    _originalUpdateDisplay.call(this, resource, value, change);
    
    if (change && change !== 0) {
        UIEnhancements.showResourceChange(resource, change);
    }
    
    // Show critical warning for low resources
    if (value < 20) {
        UIEnhancements.showCriticalResourceWarning(resource);
    }
};

// Extend Cards object to show decision previews
const _originalHandleDrag = Cards.handleDrag;
Cards.handleDrag = function(e) {
    _originalHandleDrag.call(this, e);
    
    const dragX = this.currentX - this.startX;
    const threshold = Config.drag.glowStartThreshold;
    
    if (Math.abs(dragX) > threshold && this.currentCard) {
        const direction = dragX < 0 ? 'left' : 'right';
        const effects = this.currentCard[`${direction}Effects`];
        if (effects) {
            UIEnhancements.showDecisionPreview(direction, effects);
        }
    } else {
        UIEnhancements.hideDecisionPreview();
    }
};

// Card stack effect disabled to remove grey rectangles
// const _originalDisplayCard = Cards.displayCard;
// Cards.displayCard = function(card) {
//     _originalDisplayCard.call(this, card);
//     
//     const cardElement = document.getElementById('current-card');
//     UIEnhancements.addCardStackEffect(cardElement);
// };