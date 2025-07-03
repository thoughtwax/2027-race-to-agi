// Game State Management
const GameState = {
    // Initialize from gameConfig.json
    current: {
        date: { month: 1, year: 2025 },
        phase: 1,
        resources: {
            compute: 40,
            energy: 60,
            talent: 70,
            knowledge: 30,
            progress: 10,
            trust: 60,
            capital: 50,
            alignment: 80
        },
        personal: {
            netWorth: 1000000,
            legacy: "Unknown"
        },
        multipliers: {
            knowledge: 1,
            energy_efficiency: 1
        },
        flags: {
            hasAIResearchers: false,
            chinaAggressive: false,
            aiDeceptive: false,
            publicRevolt: false,
            climateProtests: false,
            alignmentRevealed: false,
            deceptionRisk: false
        },
        competitorProgress: 5,
        turnCount: 0,
        decisionsSinceNewspaper: 0,
        recentDecisions: []
    },
    
    // No save/load functionality - game is session-based
    
    reset() {
        // Get last ending for variety adjustments
        let lastEnding = null;
        try {
            lastEnding = localStorage.getItem('ai2027_lastEnding');
        } catch (e) {
            // Ignore localStorage errors
        }
        
        // Reset to initial state
        this.current = {
            date: { month: 1, year: 2025 },
            phase: 1,
            resources: {
                compute: 40,
                energy: 60,
                talent: 70,
                knowledge: 30,
                progress: 10,
                trust: 70,  // Already increased from 60 to 70 in previous fix
                capital: 50,
                alignment: 80
            },
            personal: {
                netWorth: 1000000,
                legacy: "Unknown"
            },
            multipliers: {
                knowledge: 1,
                energy_efficiency: 1
            },
            flags: {
                hasAIResearchers: false,
                chinaAggressive: false,
                aiDeceptive: false,
                publicRevolt: false,
                climateProtests: false,
                alignmentRevealed: false,
                deceptionRisk: false
            },
            competitorProgress: 5,
            turnCount: 0,
            decisionsSinceNewspaper: 0,
            recentDecisions: []
        };
        
        // Apply variety adjustments based on last ending
        if (lastEnding) {
            this.applyVarietyAdjustments(lastEnding);
            this.current.hasVarietyAdjustment = true;
            this.current.lastEndingType = lastEnding;
        }
    },
    
    // Apply adjustments to prevent same ending twice
    applyVarietyAdjustments(lastEnding) {
        const r = this.current.resources;
        
        switch(lastEnding) {
            case 'no_trust':
                r.trust = Math.min(100, r.trust + 10);
                // Trust will decay slower (handled in balance-config)
                break;
                
            case 'bankruptcy':
                r.capital = Math.min(100, r.capital + 10);
                r.trust = Math.min(100, r.trust + 5); // Trust helps capital generation
                break;
                
            case 'power_failure':
                r.energy = Math.min(100, r.energy + 10);
                this.current.multipliers.energy_efficiency = 1.1; // 10% better efficiency
                break;
                
            case 'quit':
                r.talent = Math.min(100, r.talent + 10);
                r.knowledge = Math.min(100, r.knowledge + 5); // Knowledge helps retain talent
                break;
                
            case 'competitor_wins':
                this.current.competitorProgress = 0; // Start competitor slower
                break;
                
            case 'aligned_agi':
                r.alignment = 65; // Make it harder to get same ending
                break;
                
            case 'rogue_ai':
                r.alignment = 85; // Push toward different ending
                break;
                
            case 'uncertain_agi':
                // Randomize alignment to encourage different outcome
                r.alignment = 60 + Math.floor(Math.random() * 30);
                break;
        }
        
        // Log adjustment for transparency (commented out for production)
        // console.log(`Variety adjustment applied for last ending: ${lastEnding}`);
    },
    
    // Resource management
    updateResource(resource, change) {
        const oldValue = this.current.resources[resource];
        this.current.resources[resource] = Math.max(0, Math.min(100, oldValue + change));
        return this.current.resources[resource] - oldValue; // Return actual change
    },
    
    // Personal metrics
    updateNetWorth(change) {
        // In this game, you can only fail upwards
        const gain = Math.max(0, change); // Ensure only positive changes
        this.current.personal.netWorth += gain;
    },
    
    updateLegacy(type) {
        this.current.personal.legacy = Config.personal.legacyTypes[type] || "Unknown";
    },
    
    // Date progression
    advanceDate() {
        this.current.date.month++;
        if (this.current.date.month > 12) {
            this.current.date.month = 1;
            this.current.date.year++;
        }
    },
    
    // Phase management
    checkPhaseTransition() {
        const { month, year } = this.current.date;
        
        if (year === 2025 && month >= 6 && this.current.phase === 1) {
            this.current.phase = 2;
            return { 
                title: 'Phase 2: Expensive AI', 
                description: 'The race intensifies as models grow larger.' 
            };
        } else if (year === 2026 && this.current.phase === 2) {
            this.current.phase = 3;
            return { 
                title: 'Phase 3: Automation Surge', 
                description: 'AI begins transforming entire industries.' 
            };
        } else if (year === 2027 && this.current.phase === 3) {
            this.current.phase = 4;
            this.current.flags.alignmentRevealed = true;
            return { 
                title: 'Phase 4: The Singularity Approaches', 
                description: 'The final sprint to AGI begins.' 
            };
        }
        
        return null;
    },
    
    // Ending conditions
    checkEndConditions() {
        const r = this.current.resources;
        
        // Loss conditions
        if (r.talent <= 0) return 'quit';
        if (r.trust <= 0) return 'no_trust';
        if (r.capital <= 0) return 'bankruptcy';
        if (r.energy <= 0) return 'power_failure';
        if (this.current.competitorProgress >= 100) return 'competitor_wins';
        
        // Win conditions
        if (r.progress >= 100) {
            if (r.alignment >= 70) return 'aligned_agi';
            if (r.alignment < 30) return 'rogue_ai';
            return 'uncertain_agi';
        }
        
        return null;
    }
};