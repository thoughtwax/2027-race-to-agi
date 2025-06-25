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
        };
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