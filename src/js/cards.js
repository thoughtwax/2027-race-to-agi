// Cards Management Module
const Cards = {
    currentCard: null,
    cardQueue: [],
    usedCards: new Set(),
    cardsData: null,
    
    // Load cards data
    async loadCardsData() {
        try {
            const [mainResponse, additionalResponse] = await Promise.all([
                fetch('src/data/cards.json'),
                fetch('src/data/additionalCards.json').catch(() => null)
            ]);
            
            this.cardsData = await mainResponse.json();
            
            // Merge additional cards if available
            if (additionalResponse) {
                const additionalCards = await additionalResponse.json();
                
                // Merge phase cards
                ['phase1_additional', 'phase2_additional', 'phase3_additional', 'phase4_additional'].forEach(phase => {
                    if (additionalCards[phase]) {
                        const basePhase = phase.replace('_additional', '_extended');
                        this.cardsData[basePhase] = [...(this.cardsData[basePhase] || []), ...additionalCards[phase]];
                    }
                });
                
                // Add crisis cards to a special category
                if (additionalCards.crisis_cards) {
                    this.cardsData.crisis_cards = additionalCards.crisis_cards;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load cards data:', error);
            return false;
        }
    },
    
    // Get next card
    getNextCard() {
        // Build queue if empty
        if (this.cardQueue.length === 0) {
            const phaseCards = this.cardsData[`phase${GameState.current.phase}`] || [];
            const extendedCards = this.cardsData[`phase${GameState.current.phase}_extended`] || [];
            const allPhaseCards = [...phaseCards, ...extendedCards];
            
            const validCards = allPhaseCards.filter(card => {
                if (this.usedCards.has(card.id)) return false;
                if (card.condition && !this.evaluateCondition(card.condition)) return false;
                return true;
            });
            
            this.cardQueue = [...validCards];
            
            // Shuffle
            for (let i = this.cardQueue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.cardQueue[i], this.cardQueue[j]] = [this.cardQueue[j], this.cardQueue[i]];
            }
        }
        
        // Get next card or generate random
        this.currentCard = this.cardQueue.shift() || this.generateRandomCard();
        if (this.currentCard.id) {
            this.usedCards.add(this.currentCard.id);
        }
        
        return this.currentCard;
    },
    
    // Evaluate card conditions
    evaluateCondition(condition) {
        if (condition.gt !== undefined) {
            return Object.entries(condition.gt).every(([key, value]) => 
                GameState.current.resources[key] > value
            );
        }
        if (condition.lt !== undefined) {
            return Object.entries(condition.lt).every(([key, value]) => 
                GameState.current.resources[key] < value
            );
        }
        if (condition.and) {
            return condition.and.every(cond => this.evaluateCondition(cond));
        }
        if (condition.or) {
            return condition.or.some(cond => this.evaluateCondition(cond));
        }
        if (condition.flags) {
            return Object.entries(condition.flags).every(([flag, value]) => 
                GameState.current.flags[flag] === value
            );
        }
        return true;
    },
    
    // Generate random card
    generateRandomCard() {
        const templates = this.cardsData.randomTemplates;
        return templates[Math.floor(Math.random() * templates.length)];
    },
    
    // Display card
    displayCard(card) {
        const cardElement = document.getElementById('current-card');
        
        // Store current card
        this.currentCard = card;
        
        // Reset drag handler first
        if (typeof DragHandler !== 'undefined') {
            DragHandler.reset();
        }
        
        // Reset any previous animations and ensure card is hidden
        this.resetCard();
        
        // Add prep class to position card for animation
        cardElement.classList.add('card-prep');
        cardElement.style.visibility = 'visible'; // Ensure visible for new card
        
        // Add urgent class if needed
        cardElement.classList.toggle('urgent', card.urgent || false);
        
        // Update content
        cardElement.querySelector('.card-header').textContent = card.header;
        cardElement.querySelector('.card-title').textContent = card.title;
        
        // Clear and add description paragraphs
        cardElement.querySelectorAll('.card-description').forEach(p => p.remove());
        
        const descriptions = Array.isArray(card.description) ? card.description : [card.description];
        descriptions.forEach(desc => {
            const p = document.createElement('p');
            p.className = 'card-description';
            
            // Split by newline characters and create line breaks
            const lines = desc.split('\n');
            lines.forEach((line, index) => {
                if (index > 0) {
                    p.appendChild(document.createElement('br'));
                }
                
                // Process bold text marked with **text**
                const parts = line.split(/\*\*(.*?)\*\*/g);
                parts.forEach((part, partIndex) => {
                    if (partIndex % 2 === 1) {
                        // Odd indices are the bold parts
                        const bold = document.createElement('strong');
                        bold.textContent = part;
                        p.appendChild(bold);
                    } else if (part) {
                        // Even indices are regular text
                        p.appendChild(document.createTextNode(part));
                    }
                });
            });
            
            cardElement.appendChild(p);
        });
        
        // Force reflow to ensure prep class is applied
        void cardElement.offsetWidth;
        
        // Animate card entry from bottom after a brief delay
        // Longer delay to ensure previous card is fully gone
        setTimeout(() => {
            // Remove prep class and add entering class
            cardElement.classList.remove('card-prep');
            cardElement.classList.add('card-entering');
            
            // Remove the entering class after animation
            setTimeout(() => {
                cardElement.classList.remove('card-entering');
                
                // Show buttons after additional delay
                setTimeout(() => {
                    const buttons = document.querySelector('.choice-buttons');
                    if (buttons) {
                        buttons.classList.remove('buttons-hidden');
                    }
                }, 100); // Additional delay for buttons
                
                // Add tutorial animation for first card
                if (card.id === 'tutorial' && GameState.current.turnCount === 0) {
                    cardElement.classList.add('tutorial-hint');
                    document.getElementById('choice-left').classList.add('tutorial-glow-left');
                    document.getElementById('choice-right').classList.add('tutorial-glow-right');
                    
                    // Remove tutorial classes after animation
                    setTimeout(() => {
                        cardElement.classList.remove('tutorial-hint');
                        document.getElementById('choice-left').classList.remove('tutorial-glow-left');
                        document.getElementById('choice-right').classList.remove('tutorial-glow-right');
                    }, 2300); // Animation duration + delay
                }
                
                // Re-attach drag handler to the card
                if (typeof DragHandler !== 'undefined' && DragHandler.attachToCard) {
                    DragHandler.attachToCard();
                }
            }, 500); // Match the card entry animation duration
        }, 300); // Increased delay to ensure clean state
    },
    
    // Handle choice
    makeChoice(choice) {
        if (!this.currentCard) return;
        
        // Track decision
        GameState.current.recentDecisions.push({
            card: this.currentCard,
            choice: choice,
            date: { ...GameState.current.date }
        });
        
        // Apply effects
        const effects = choice === 'left' ? this.currentCard.leftEffects : this.currentCard.rightEffects;
        const event = choice === 'left' ? this.currentCard.leftEvent : this.currentCard.rightEvent;
        
        // Show consequence text
        if (event) {
            UI.showConsequence(event.description);
        }
        
        // Special handling for tutorial card's quit option
        if (this.currentCard.id === 'tutorial' && choice === 'left') {
            // Don't apply the talent effect or progress turn - just end the game
            setTimeout(() => Game.endGame('quit'), 1500);
            return;
        }
        
        // Apply resource effects
        Object.entries(effects).forEach(([resource, change]) => {
            if (resource === 'competitorBoost') {
                GameState.current.competitorProgress += change;
            } else {
                const actualChange = GameState.updateResource(resource, change);
                Resources.showChange(resource, actualChange);
            }
        });
        
        // Apply special effects
        if (this.currentCard.special) {
            this.applySpecialEffects(this.currentCard.special, choice);
        }
        
        // Update personal metrics based on decision
        this.updatePersonalMetrics(this.currentCard, choice);
        
        // Progress game
        Game.progressTurn();
    },
    
    // Apply special card effects
    applySpecialEffects(special, choice) {
        const effects = special[choice] || special.both;
        if (!effects) return;
        
        // Update flags
        if (effects.flags) {
            Object.assign(GameState.current.flags, effects.flags);
        }
        
        // Update multipliers
        if (effects.multipliers) {
            Object.assign(GameState.current.multipliers, effects.multipliers);
        }
        
        // Competitor boost
        if (effects.competitorBoost) {
            GameState.current.competitorProgress += effects.competitorBoost;
        }
        
        // Show special event
        if (effects.event) {
            UI.showEvent(effects.event);
        }
        
        // Check for end game
        if (effects.endGame) {
            if (this.evaluateCondition(effects.endGame.condition || {})) {
                setTimeout(() => Game.endGame(effects.endGame.ending), effects.endGame.delay || 1500);
            }
        }
    },
    
    // Update personal metrics
    updatePersonalMetrics(card, choice) {
        const effects = choice === 'left' ? card.leftEffects : card.rightEffects;
        
        // Net worth changes based on capital changes
        if (effects.capital) {
            // Each point of capital represents $100k
            // But even losing capital makes you richer (severance packages, stock buybacks, etc)
            const capitalImpact = effects.capital > 0 ? 
                effects.capital * 100000 :  // Positive capital = normal gains
                Math.abs(effects.capital) * 25000;  // Negative capital = smaller gains
            GameState.updateNetWorth(capitalImpact);
        }
        
        // Additional net worth changes for specific decisions
        if (card.header.includes('INVESTOR') && choice === 'right') {
            GameState.updateNetWorth(Config.personal.netWorthChanges.investorDeal);
        } else if (card.header.includes('GOVERNMENT') && choice === 'left') {
            GameState.updateNetWorth(Config.personal.netWorthChanges.governmentContract);
        } else if (card.title.toLowerCase().includes('ethical') && choice === 'left') {
            GameState.updateNetWorth(Config.personal.netWorthChanges.ethicalChoice);
        }
        
        // Legacy changes based on decisions
        if (card.id === 'final_training') {
            GameState.updateLegacy(choice === 'left' ? 'cautious' : 'visionary');
        } else if (card.header.includes('ALIGNMENT') && choice === 'left') {
            GameState.updateLegacy('savior');
        } else if (card.header.includes('CLIMATE') || card.header.includes('ENERGY')) {
            if (choice === 'left') {
                // Choosing green/ethical options
                if (GameState.current.personal.legacy === 'Unknown') {
                    GameState.updateLegacy('balanced');
                }
            }
        } else if (effects.trust && effects.trust < -20) {
            // Major trust loss
            GameState.updateLegacy('reckless');
        } else if (effects.alignment && effects.alignment < -15) {
            // Sacrificing alignment
            GameState.updateLegacy('sellout');
        }
        
        UI.updatePersonalStats();
    },
    
    // Initialize drag handlers - now using DragHandler module
    initDragHandlers() {
        // Initialize the new drag handler
        DragHandler.init();
    },
    
    // Reset card state
    resetCard() {
        const cardElement = document.getElementById('current-card');
        // Force remove all transforms and transitions
        cardElement.style.transform = '';
        cardElement.style.transition = '';
        cardElement.style.opacity = '';
        cardElement.style.visibility = ''; // Reset visibility
        // Remove ALL animation classes
        cardElement.classList.remove(
            'animating-out', 'card-exiting-left', 'card-exiting-right',
            'card-entering', 'dragging', 'exiting', 'exit-left', 'exit-right',
            'animating-in', 'card-entry', 'card-prep'
        );
        // Force a reflow to ensure styles are applied
        void cardElement.offsetWidth;
    },
    
    // Old drag handling methods - replaced by DragHandler module
    /*
    handleStart(e) {
        this.isDragging = true;
        this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.currentX = this.startX;
        this.velocity = 0;
        this.lastTime = Date.now();
        const cardElement = document.getElementById('current-card');
        // Remove animation classes that might interfere
        cardElement.classList.remove('animating-in', 'card-entering');
        cardElement.classList.add('dragging');
    },
    
    handleMove(e) {
        if (!this.isDragging) return;
        
        const prevX = this.currentX;
        this.currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const deltaX = this.currentX - this.startX;
        const cardElement = document.getElementById('current-card');
        
        // Calculate velocity for momentum
        const now = Date.now();
        const deltaTime = now - this.lastTime;
        if (deltaTime > 0) {
            this.velocity = (this.currentX - prevX) / deltaTime * 16; // Normalize to ~60fps
        }
        this.lastTime = now;
        
        // No rubber band effect - card moves freely with drag
        const rotation = deltaX * 0.08;
        // Scale increases more noticeably as approaching threshold
        const scaleProgress = Math.min(Math.abs(deltaX) / Config.drag.decisionThreshold, 1);
        const scale = 1 + (scaleProgress * 0.05); // Up to 5% scale increase at threshold
        
        cardElement.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg) scale(${scale})`;
        
        // Update visual feedback
        this.updateButtonEmphasis(deltaX);
    },
    
    updateVisualFeedback(deltaX) {
        const cardElement = document.getElementById('current-card');
        
        // Update tilt classes
        cardElement.classList.remove('tilt-left', 'tilt-right', 'tilt-left-strong', 'tilt-right-strong');
        
        if (Math.abs(deltaX) > Config.drag.strongTiltThreshold) {
            cardElement.classList.add(deltaX < 0 ? 'tilt-left-strong' : 'tilt-right-strong');
        } else if (Math.abs(deltaX) > Config.drag.tiltThreshold) {
            cardElement.classList.add(deltaX < 0 ? 'tilt-left' : 'tilt-right');
        }
        
        // Update button emphasis with smooth transitions
        this.updateButtonEmphasis(deltaX);
    },
    
    handleEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const deltaX = this.currentX - this.startX;
        const cardElement = document.getElementById('current-card');
        cardElement.classList.remove('dragging');
        
        // Add momentum to decision
        const totalDelta = deltaX + (this.velocity * 10);
        
        // Check if swipe threshold met (with momentum)
        if (Math.abs(totalDelta) > Config.drag.decisionThreshold || 
            (Math.abs(deltaX) > Config.drag.rubberBandThreshold && Math.abs(this.velocity) > 2)) {
            // Animate out and make choice
            const choice = totalDelta < 0 ? 'left' : 'right';
            cardElement.classList.add('animating-out', `card-exiting-${choice}`);
            
            setTimeout(() => {
                this.makeChoice(choice);
            }, 400); // Match exit animation duration
        } else {
            // Spring back animation
            this.animateSpringBack(deltaX);
        }
        
        // Clear button emphasis with animation
        this.updateButtonEmphasis(0);
    },
    
    animateSpringBack(deltaX) {
        const cardElement = document.getElementById('current-card');
        
        // Add spring physics
        let position = deltaX;
        let velocity = this.velocity;
        const springStrength = 0.3;
        const damping = 0.85;
        
        const animate = () => {
            velocity += -position * springStrength;
            velocity *= damping;
            position += velocity;
            
            if (Math.abs(position) > 0.1 || Math.abs(velocity) > 0.1) {
                const rotation = position * 0.08;
                const scale = 1 + Math.abs(position) * 0.0001;
                cardElement.style.transform = `translateX(${position}px) rotate(${rotation}deg) scale(${scale})`;
                requestAnimationFrame(animate);
            } else {
                this.resetCard();
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    resetCard() {
        const cardElement = document.getElementById('current-card');
        cardElement.style.transform = '';
        cardElement.style.opacity = '';
        cardElement.classList.remove(
            'animating-out', 'card-exiting-left', 'card-exiting-right',
            'card-entering', 'dragging'
        );
    },
    
    updateButtonEmphasis(deltaX) {
        const leftButton = document.getElementById('choice-left');
        const rightButton = document.getElementById('choice-right');
        const absDeltaX = Math.abs(deltaX);
        
        // Remove all classes
        leftButton.classList.remove('emphasize-left', 'glow-left', 'threshold-reached');
        rightButton.classList.remove('emphasize-right', 'glow-right', 'threshold-reached');
        leftButton.style.removeProperty('--glow-intensity');
        rightButton.style.removeProperty('--glow-intensity');
        
        if (deltaX < 0) {
            // Moving left
            if (absDeltaX >= Config.drag.decisionThreshold) {
                // Threshold reached - show fill
                leftButton.classList.add('threshold-reached');
            } else if (absDeltaX >= Config.drag.glowStartThreshold) {
                // Calculate glow intensity (0 to 1)
                const glowProgress = (absDeltaX - Config.drag.glowStartThreshold) / 
                                   (Config.drag.glowMaxThreshold - Config.drag.glowStartThreshold);
                const glowIntensity = Math.min(1, glowProgress);
                leftButton.style.setProperty('--glow-intensity', glowIntensity);
                leftButton.classList.add('glow-left');
            }
        } else if (deltaX > 0) {
            // Moving right
            if (absDeltaX >= Config.drag.decisionThreshold) {
                // Threshold reached - show fill
                rightButton.classList.add('threshold-reached');
            } else if (absDeltaX >= Config.drag.glowStartThreshold) {
                // Calculate glow intensity (0 to 1)
                const glowProgress = (absDeltaX - Config.drag.glowStartThreshold) / 
                                   (Config.drag.glowMaxThreshold - Config.drag.glowStartThreshold);
                const glowIntensity = Math.min(1, glowProgress);
                rightButton.style.setProperty('--glow-intensity', glowIntensity);
                rightButton.classList.add('glow-right');
            }
        }
    }
    */
};