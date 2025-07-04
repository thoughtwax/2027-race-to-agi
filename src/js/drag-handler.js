// Clean Drag Handler Module
const DragHandler = {
    // State
    dragging: false,
    startX: 0,
    currentX: 0,
    cardElement: null,
    
    // Settings
    DECISION_THRESHOLD: 150, // Increased from 120 - requires wider swipe
    VELOCITY_THRESHOLD: 0.5,
    
    // Track for velocity
    positions: [],
    
    init() {
        // Bind methods once to preserve references
        this.boundHandlePointerDown = this.handlePointerDown.bind(this);
        this.boundHandlePointerMove = this.handlePointerMove.bind(this);
        this.boundHandlePointerUp = this.handlePointerUp.bind(this);
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.preventDefaultTouch = (e) => e.preventDefault();
        
        // Document-level events for reliability
        document.addEventListener('mousemove', this.boundHandlePointerMove);
        document.addEventListener('mouseup', this.boundHandlePointerUp);
        document.addEventListener('touchmove', this.boundHandlePointerMove);
        document.addEventListener('touchend', this.boundHandlePointerUp);
        document.addEventListener('touchcancel', this.boundHandlePointerUp);
        document.addEventListener('pointermove', this.boundHandlePointerMove);
        document.addEventListener('pointerup', this.boundHandlePointerUp);
        document.addEventListener('pointercancel', this.boundHandlePointerUp);
        
        // Add keyboard support
        document.addEventListener('keydown', this.boundHandleKeyDown);
        
        // Attach to card element
        this.attachToCard();
    },
    
    attachToCard() {
        this.cardElement = document.getElementById('current-card');
        // console.log('Attaching to card element:', this.cardElement);
        if (!this.cardElement) {
            console.warn('Card element not found');
            return;
        }
        
        // Remove existing listeners to avoid duplicates
        this.cardElement.removeEventListener('pointerdown', this.boundHandlePointerDown);
        this.cardElement.removeEventListener('mousedown', this.boundHandlePointerDown);
        this.cardElement.removeEventListener('touchstart', this.boundHandlePointerDown);
        
        // Add both mouse and touch support
        this.cardElement.addEventListener('mousedown', this.boundHandlePointerDown);
        this.cardElement.addEventListener('touchstart', this.boundHandlePointerDown);
        this.cardElement.addEventListener('pointerdown', this.boundHandlePointerDown);
        
        // console.log('Event listeners attached to card');
    },
    
    handlePointerDown(e) {
        // console.log('Pointer down event', e.type, e);
        
        // Prevent default to avoid scrolling on touch
        e.preventDefault();
        
        // Handle touch events
        if (e.type === 'touchstart') {
            e = e.touches[0];
        }
        
        // Only handle primary button/touch for mouse events
        if (e.button !== undefined && e.button !== 0) return;
        
        this.dragging = true;
        this.startX = e.clientX;
        this.currentX = e.clientX;
        this.positions = [{ x: e.clientX, time: Date.now() }];
        
        // Add dragging class
        this.cardElement.classList.add('dragging');
        
        // Remove any transition for immediate response
        this.cardElement.style.transition = 'none';
        
        // Capture pointer for this element if available
        if (e.pointerId !== undefined && this.cardElement.setPointerCapture) {
            try {
                this.cardElement.setPointerCapture(e.pointerId);
            } catch (err) {
            }
        }
        
    },
    
    handlePointerMove(e) {
        if (!this.dragging) return;
        
        // Handle touch events
        if (e.type === 'touchmove') {
            e = e.touches[0];
        }
        
        this.currentX = e.clientX;
        const deltaX = this.currentX - this.startX;
        
        // Track position for velocity calculation
        const now = Date.now();
        this.positions.push({ x: e.clientX, time: now });
        
        // Keep only last 100ms of positions
        this.positions = this.positions.filter(p => now - p.time < 100);
        
        // Apply transform directly using CSS variables for performance
        this.updateCardPosition(deltaX);
        
        // Update visual feedback
        this.updateButtonFeedback(deltaX);
    },
    
    handlePointerUp(e) {
        if (!this.dragging) return;
        
        // console.log('Pointer up event', e.type);
        
        this.dragging = false;
        const deltaX = this.currentX - this.startX;
        const velocity = this.calculateVelocity();
        
        // Release pointer capture
        if (e.pointerId !== undefined) {
            this.cardElement.releasePointerCapture(e.pointerId);
        }
        
        // Determine if threshold met
        const shouldAccept = Math.abs(deltaX) > this.DECISION_THRESHOLD || 
                           (Math.abs(deltaX) > 60 && Math.abs(velocity) > this.VELOCITY_THRESHOLD);
        
        if (shouldAccept) {
            const choice = deltaX < 0 ? 'left' : 'right';
            this.acceptChoice(choice);
        } else {
            this.springBack();
        }
        
        // Clear positions
        this.positions = [];
    },
    
    updateCardPosition(deltaX) {
        // Use CSS custom properties for smooth updates
        const rotation = deltaX * 0.1;
        const scale = 1 + Math.min(Math.abs(deltaX) / 1000, 0.05);
        
        // Use will-change and transform3d for GPU acceleration
        const transformValue = `translate3d(${deltaX}px, 0, 0) rotate(${rotation}deg) scale(${scale})`;
        this.cardElement.style.transform = transformValue;
        
        // Force a repaint to ensure the transform is applied
        this.cardElement.style.webkitTransform = transformValue;
        
        // console.log('Updating card position:', transformValue);
    },
    
    updateButtonFeedback(deltaX) {
        const leftButton = document.getElementById('choice-left');
        const rightButton = document.getElementById('choice-right');
        const threshold = this.DECISION_THRESHOLD;
        
        // Clear all states
        leftButton.classList.remove('active', 'hover');
        rightButton.classList.remove('active', 'hover');
        
        if (deltaX < -20) {
            leftButton.classList.add('hover');
            if (deltaX < -threshold) {
                leftButton.classList.add('active');
            }
        } else if (deltaX > 20) {
            rightButton.classList.add('hover');
            if (deltaX > threshold) {
                rightButton.classList.add('active');
            }
        }
    },
    
    calculateVelocity() {
        if (this.positions.length < 2) return 0;
        
        const recent = this.positions.slice(-5);
        const first = recent[0];
        const last = recent[recent.length - 1];
        const timeDiff = last.time - first.time;
        
        if (timeDiff === 0) return 0;
        
        return (last.x - first.x) / timeDiff;
    },
    
    acceptChoice(choice) {
        // Prevent multiple accepts
        if (this.accepting) return;
        this.accepting = true;
        
        // Add exit animation class
        this.cardElement.classList.remove('dragging');
        this.cardElement.classList.add('exiting', `exit-${choice}`);
        
        // Ensure the transition is applied for the exit animation
        this.cardElement.style.transition = '';
        
        // Hide buttons immediately when choice is made
        const buttons = document.querySelector('.choice-buttons');
        if (buttons) {
            buttons.classList.add('buttons-hidden');
        }
        
        // Don't clear button states - keep them lit during exit
        
        // Wait for animation then make choice
        setTimeout(() => {
            // Don't manually hide the card - let CSS handle it
            Cards.makeChoice(choice);
            this.accepting = false;
        }, 500); // Match the exit animation duration
    },
    
    springBack() {
        // Use CSS transition for smooth spring back
        this.cardElement.classList.remove('dragging');
        this.cardElement.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.cardElement.style.transform = 'translate3d(0, 0, 0) rotate(0) scale(1)';
        
        // Clear button states
        this.updateButtonFeedback(0);
        
        // Remove transition after animation
        setTimeout(() => {
            this.cardElement.style.transition = '';
        }, 300);
    },
    
    handleKeyDown(e) {
        // Only handle arrow keys when not dragging and card is visible
        if (this.dragging || this.accepting || !this.cardElement || this.cardElement.style.visibility === 'hidden') return;
        
        // Check if we're in a game over screen or other modal
        if (document.querySelector('.game-over-screen') || document.querySelector('.newspaper-modal')) return;
        
        let choice = null;
        
        if (e.key === 'ArrowLeft') {
            choice = 'left';
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            choice = 'right';
            e.preventDefault();
        }
        
        if (choice) {
            // Animate the card slightly to show the choice
            this.animateKeyboardChoice(choice);
        }
    },
    
    animateKeyboardChoice(choice) {
        // Prevent multiple keyboard accepts
        if (this.accepting) return;
        
        const direction = choice === 'left' ? -1 : 1;
        const targetX = direction * 200;
        const rotation = direction * 15;
        
        // Add visual feedback to buttons
        const button = document.getElementById(`choice-${choice}`);
        if (button) {
            button.classList.add('active');
        }
        
        // Animate card
        this.cardElement.style.transition = 'transform 0.2s ease-out';
        this.cardElement.style.transform = `translate3d(${targetX}px, 0, 0) rotate(${rotation}deg)`;
        
        // After a brief moment, accept the choice
        setTimeout(() => {
            this.acceptChoice(choice);
        }, 150);
    },
    
    reset() {
        this.dragging = false;
        this.positions = [];
        this.cardElement.style.transform = '';
        this.cardElement.style.transition = '';
        this.cardElement.classList.remove('dragging', 'exiting', 'exit-left', 'exit-right');
        // Clear button states when resetting for new card
        this.updateButtonFeedback(0);
    }
};