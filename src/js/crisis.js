// Crisis Event System
const Crisis = {
    crisisData: null,
    lastCrisisTurn: -5, // Ensure crisis can happen early
    MIN_TURNS_BETWEEN_CRISES: 5,
    
    // Load crisis data
    async loadCrisisData() {
        try {
            const [mainResponse, additionalResponse, newResponse] = await Promise.all([
                fetch('src/data/crisisEvents.json'),
                fetch('src/data/additionalCrisisEvents.json').catch(() => null),
                fetch('src/data/newCrisisEvents.json').catch(() => null)
            ]);
            
            this.crisisData = await mainResponse.json();
            
            // Merge additional crisis events if available
            if (additionalResponse) {
                const additionalData = await additionalResponse.json();
                
                if (additionalData.additionalCrisisEvents) {
                    this.crisisData.crisisEvents = [
                        ...this.crisisData.crisisEvents,
                        ...additionalData.additionalCrisisEvents
                    ];
                }
                
                if (additionalData.additionalNewspaperHeadlines) {
                    this.crisisData.newspaperHeadlines = [
                        ...this.crisisData.newspaperHeadlines,
                        ...additionalData.additionalNewspaperHeadlines
                    ];
                }
            }
            
            // Merge new crisis events if available
            if (newResponse) {
                const newData = await newResponse.json();
                
                if (newData.newCrisisEvents) {
                    this.crisisData.crisisEvents = [
                        ...this.crisisData.crisisEvents,
                        ...newData.newCrisisEvents
                    ];
                }
                
                if (newData.newNewspaperHeadlines) {
                    this.crisisData.newspaperHeadlines = [
                        ...this.crisisData.newspaperHeadlines,
                        ...newData.newNewspaperHeadlines
                    ];
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load crisis data:', error);
            return false;
        }
    },
    
    // Check if crisis should trigger
    checkForCrisis() {
        // Don't trigger crisis in the first 5 turns
        if (GameState.current.turnCount < 5) {
            return null;
        }
        
        // Don't trigger crisis too frequently
        if (GameState.current.turnCount - this.lastCrisisTurn < this.MIN_TURNS_BETWEEN_CRISES) {
            return null;
        }
        
        // Higher chance of crisis in later phases
        const baseChance = 0.1 + (GameState.current.phase - 1) * 0.05;
        
        // Increase chance if resources are extreme
        const r = GameState.current.resources;
        let crisisMultiplier = 1;
        
        // Check for extreme resource states
        if (r.trust < 30 || r.energy > 80 || r.progress > 70 || r.alignment < 40) {
            crisisMultiplier = 2;
        }
        
        // Check for very low resources
        if (r.capital < 20 || r.talent < 30 || r.compute < 20) {
            crisisMultiplier = 1.5;
        }
        
        const finalChance = Math.min(baseChance * crisisMultiplier, 0.4);
        
        if (Math.random() > finalChance) {
            return null;
        }
        
        // Find valid crisis events from both sources
        const crisisEvents = [...(this.crisisData.crisisEvents || [])];
        
        // Add crisis cards from Cards module if available
        if (Cards.cardsData && Cards.cardsData.crisis_cards) {
            crisisEvents.push(...Cards.cardsData.crisis_cards);
        }
        
        const validCrises = crisisEvents.filter(crisis => {
            // Check if already used
            if (Cards.usedCards.has(crisis.id)) return false;
            
            // Check trigger conditions
            if (crisis.trigger) {
                return this.evaluateTrigger(crisis.trigger);
            }
            
            // Check condition (from card format)
            if (crisis.condition) {
                return Cards.evaluateCondition(crisis.condition);
            }
            
            return true;
        });
        
        if (validCrises.length === 0) return null;
        
        // Select random crisis
        const crisis = validCrises[Math.floor(Math.random() * validCrises.length)];
        this.lastCrisisTurn = GameState.current.turnCount;
        
        return crisis;
    },
    
    // Evaluate trigger conditions
    evaluateTrigger(trigger) {
        const state = GameState.current;
        
        // Handle resource comparisons
        if (trigger.compute) return this.compareResource('compute', trigger.compute);
        if (trigger.energy) return this.compareResource('energy', trigger.energy);
        if (trigger.talent) return this.compareResource('talent', trigger.talent);
        if (trigger.knowledge) return this.compareResource('knowledge', trigger.knowledge);
        if (trigger.progress) return this.compareResource('progress', trigger.progress);
        if (trigger.trust) return this.compareResource('trust', trigger.trust);
        if (trigger.capital) return this.compareResource('capital', trigger.capital);
        if (trigger.alignment) return this.compareResource('alignment', trigger.alignment);
        if (trigger.competitorProgress) {
            return this.compareValue(state.competitorProgress, trigger.competitorProgress);
        }
        
        // Handle phase check
        if (trigger.phase) {
            return this.compareValue(state.phase, trigger.phase);
        }
        
        // Handle flags
        if (trigger.flags) {
            return Object.entries(trigger.flags).every(([flag, value]) => 
                state.flags[flag] === value
            );
        }
        
        // Handle logical operators
        if (trigger.and) {
            return trigger.and.every(condition => this.evaluateTrigger(condition));
        }
        
        if (trigger.or) {
            return trigger.or.some(condition => this.evaluateTrigger(condition));
        }
        
        return true;
    },
    
    // Compare resource values
    compareResource(resource, condition) {
        const value = GameState.current.resources[resource];
        return this.compareValue(value, condition);
    },
    
    // Compare values with operators
    compareValue(value, condition) {
        if (condition.gt !== undefined) return value > condition.gt;
        if (condition.gte !== undefined) return value >= condition.gte;
        if (condition.lt !== undefined) return value < condition.lt;
        if (condition.lte !== undefined) return value <= condition.lte;
        if (condition.eq !== undefined) return value === condition.eq;
        return true;
    },
    
    // Get newspaper headlines based on state
    getNewspaperHeadlines() {
        if (!this.crisisData) return [];
        
        const headlines = [];
        
        // Check each headline condition
        this.crisisData.newspaperHeadlines.forEach(group => {
            if (this.evaluateTrigger(group.condition)) {
                headlines.push(...group.headlines);
            }
        });
        
        // Shuffle and return top 3
        for (let i = headlines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [headlines[i], headlines[j]] = [headlines[j], headlines[i]];
        }
        
        return headlines.slice(0, 3);
    },
    
    // Show crisis alert animation
    showCrisisAlert(crisis) {
        // Create alert overlay
        const alert = document.createElement('div');
        alert.className = 'crisis-alert';
        alert.innerHTML = `
            <div class="crisis-alert-content">
                <h2 class="crisis-header">⚠️ ${crisis.header} ⚠️</h2>
                <div class="crisis-title">${crisis.title}</div>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Trigger animation
        setTimeout(() => alert.classList.add('active'), 10);
        
        // Remove after animation
        setTimeout(() => {
            alert.classList.remove('active');
            setTimeout(() => alert.remove(), 500);
        }, 2000);
        
        // Add screen shake effect
        document.getElementById('app').classList.add('crisis-shake');
        setTimeout(() => {
            document.getElementById('app').classList.remove('crisis-shake');
        }, 500);
    }
};