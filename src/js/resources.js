// Resources Management Module
const Resources = {
    // Update resource display
    updateDisplay(resource, value) {
        const element = document.querySelector(`[data-resource="${resource}"]`);
        if (!element) return;
        
        const bar = element.querySelector('.resource-bar');
        if (!bar) return;
        
        // Update bar width
        bar.style.width = `${value}%`;
        bar.setAttribute('data-value', value);
        
        // Update color based on value
        let color;
        if (value <= 30) {
            color = '#f44336'; // Red
        } else if (value <= 60) {
            color = '#ffc107'; // Amber/Yellow
        } else {
            color = '#4caf50'; // Green
        }
        
        // Apply the color
        bar.style.width = `${value}%`;
        bar.style.backgroundColor = color;
        
        // Special handling for alignment
        if (resource === 'alignment' && !GameState.current.flags.alignmentRevealed) {
            bar.style.width = '100%';
            bar.style.backgroundColor = '#999';
            element.classList.add('hidden');
        } else {
            element.classList.remove('hidden');
        }
    },
    
    // Update all resources
    updateAll() {
        Object.entries(GameState.current.resources).forEach(([resource, value]) => {
            this.updateDisplay(resource, value);
        });
        
        // Update multiplier badges
        this.updateMultipliers();
    },
    
    // Update all bars (alias for consistency)
    updateAllBars() {
        this.updateAll();
    },
    
    // Initialize resources
    init() {
        this.updateAll();
        this.initTooltips();
    },
    
    // Show resource change animation
    showChange(resource, change) {
        if (change === 0) return;
        
        const element = document.querySelector(`[data-resource="${resource}"]`);
        if (!element) return;
        
        const bar = element.querySelector('.resource-bar');
        if (!bar) return;
        
        // Add changing animation
        element.classList.add('changing');
        
        // Create change indicator
        const indicator = document.createElement('div');
        indicator.className = `resource-change ${change > 0 ? 'positive' : 'negative'}`;
        indicator.textContent = `${change > 0 ? '+' : ''}${change}`;
        bar.appendChild(indicator);
        
        // Clean up
        setTimeout(() => {
            element.classList.remove('changing');
            indicator.remove();
        }, 1500); // Match animation duration
    },
    
    // Update multiplier badges
    updateMultipliers() {
        // Remove existing badges
        document.querySelectorAll('.resource-multiplier').forEach(badge => badge.remove());
        
        // Add knowledge multiplier badge if active
        if (GameState.current.multipliers.knowledge > 1) {
            const knowledgeElement = document.querySelector('[data-resource="knowledge"]');
            if (knowledgeElement) {
                const badge = document.createElement('div');
                badge.className = 'resource-multiplier';
                badge.textContent = `${GameState.current.multipliers.knowledge}x`;
                knowledgeElement.appendChild(badge);
            }
        }
    },
    
    // Apply feedback loops
    applyFeedbackLoops(showAnimations = true) {
        const state = GameState.current;
        const r = state.resources;
        const m = state.multipliers;
        const f = state.flags;
        
        // Research Loop: Compute + Talent (powered by Energy) → Progress
        const progressGain = Config.formulas.progressPerTurn(r.compute, r.talent, r.energy);
        if (progressGain > 0) {
            const actualChange = GameState.updateResource('progress', progressGain);
            if (showAnimations) {
                // Delay to avoid overlap with card choice animations
                setTimeout(() => this.showChange('progress', actualChange), 500);
            }
        }
        
        // Knowledge generation from progress (with multiplier)
        const knowledgeGain = Config.formulas.knowledgePerTurn(r.progress, m.knowledge);
        if (knowledgeGain > 0) {
            const actualChange = GameState.updateResource('knowledge', knowledgeGain);
            if (showAnimations) {
                setTimeout(() => this.showChange('knowledge', actualChange), 500);
            }
        }
        
        // Energy efficiency from knowledge
        if (r.knowledge > 50) {
            m.energy_efficiency = 1 + (r.knowledge - 50) * 0.01;
        }
        
        // Capital generation from Trust × Progress
        const capitalGain = Config.formulas.capitalPerTurn(r.trust, r.progress);
        if (capitalGain > 0) {
            const actualChange = GameState.updateResource('capital', capitalGain);
            if (showAnimations) {
                // Delay to avoid overlap with card choice animations
                setTimeout(() => this.showChange('capital', actualChange), 500);
            }
        }
        
        // Energy consumption from compute
        const energyCost = Config.formulas.energyCostPerTurn(r.compute, m.energy_efficiency);
        if (energyCost > 0) {
            const actualChange = GameState.updateResource('energy', -energyCost);
            if (showAnimations) {
                setTimeout(() => this.showChange('energy', actualChange), 500);
            }
        }
        
        // Trust decay from high energy use
        if (r.energy > 70 && !f.climateProtests) {
            const actualChange = GameState.updateResource('trust', -3);
            this.showChange('trust', actualChange);
            
            if (r.energy > 80) {
                f.climateProtests = true;
                UI.showEvent({ 
                    title: 'Climate Crisis', 
                    description: 'Environmental groups organize against your energy consumption.' 
                });
            }
        }
        
        // Alignment decay from rapid progress without safety work
        if (r.progress > 50 && r.progress > r.alignment) {
            const actualChange = GameState.updateResource('alignment', -2);
            if (f.alignmentRevealed) {
                this.showChange('alignment', actualChange);
            }
        }
        
        // Deception risk check
        if (r.alignment < 40 && r.progress > 70 && !f.deceptionRisk) {
            f.deceptionRisk = true;
            UI.showEvent({ 
                title: 'Hidden Behavior', 
                description: 'Your AI may be concealing its true capabilities.' 
            });
        }
        
        // Talent morale from automation
        if (f.hasAIResearchers && r.talent > 30) {
            const actualChange = GameState.updateResource('talent', -1);
            if (showAnimations) {
                this.showChange('talent', actualChange);
            }
        }
        
        // Passive net worth growth - you always get richer!
        // Base amount + bonus based on capital level
        const netWorthGain = Config.personal.baseNetWorthGrowth + (r.capital * 10000);
        GameState.updateNetWorth(netWorthGain);
        
        // Update all displays
        this.updateAll();
        UI.updatePersonalStats();
    },
    
    // Initialize tooltips
    initTooltips() {
        const labelTooltips = {
            compute: "Processing power for training AI models",
            energy: "Power supply for datacenters",
            talent: "Human researchers and engineers",
            knowledge: "Accumulated research and data",
            progress: "How close you are to AGI",
            trust: "Public confidence in your company",
            capital: "Financial resources",
            alignment: "How well AI goals match human values"
        };
        
        const barTooltips = {
            compute: "Current: {value}% | Used in: Progress generation",
            energy: "Current: {value}% | Powers compute operations",
            talent: "Current: {value}% | Used in: Progress generation",
            knowledge: "Current: {value}% | Generated from: High progress",
            progress: "Current: {value}% | Formula: (Compute + Talent) × Energy%",
            trust: "Current: {value}% | Affects: Capital generation",
            capital: "Current: {value}% | Formula: Trust × Progress / 200",
            alignment: "Current: {value}% | Critical for safe AGI"
        };
        
        Object.entries(labelTooltips).forEach(([resource, text]) => {
            const label = document.querySelector(`[data-resource="${resource}"] .resource-label`);
            if (label) {
                label.setAttribute('title', text);
                label.style.cursor = 'help';
            }
        });
        
        Object.entries(barTooltips).forEach(([resource, template]) => {
            const barContainer = document.querySelector(`[data-resource="${resource}"] .resource-bar-container`);
            if (barContainer) {
                barContainer.setAttribute('data-tooltip-template', template);
                barContainer.style.cursor = 'help';
                
                // Update tooltip on hover
                barContainer.addEventListener('mouseenter', (e) => {
                    const bar = e.currentTarget.querySelector('.resource-bar');
                    const value = bar.getAttribute('data-value') || '0';
                    const text = template.replace('{value}', value);
                    e.currentTarget.setAttribute('title', text);
                });
            }
        });
    }
};