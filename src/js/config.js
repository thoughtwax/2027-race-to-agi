// Game Configuration Module
const Config = {
    // Animation timings
    animations: {
        cardSwipe: 400,
        cardEntry: 500,
        rubberBand: 800,
        consequenceDisplay: 1500,
        resourceChange: 300,
        feedbackFloat: 2000
    },
    
    // Drag thresholds
    drag: {
        decisionThreshold: 150,  // Increased from 100 - threshold to accept swipe
        rubberBandThreshold: 50,
        tiltThreshold: 20,
        strongTiltThreshold: 40,
        glowStartThreshold: 60,  // When glow starts appearing
        glowMaxThreshold: 120   // When glow is at maximum (before fill)
    },
    
    // Resource thresholds for color coding
    resources: {
        critical: 20,
        warning: 40,
        healthy: 60
    },
    
    // Game settings
    game: {
        newspaperInterval: 8,
        competitorProgressRate: 5,
        competitorAggressiveRate: 8
    },
    
    // Formulas
    formulas: {
        progressPerTurn: (compute, talent, energy) => 
            Math.floor((compute * 0.1 + talent * 0.1) * (energy / 100)),
        
        knowledgePerTurn: (progress, multiplier) => 
            progress > 30 ? Math.floor(progress * 0.1 * multiplier) : 0,
        
        capitalPerTurn: (trust, progress) => 
            Math.floor((trust * progress) / 200),
        
        energyCostPerTurn: (compute, efficiency) => 
            Math.floor(compute * 0.15 / efficiency)
    },
    
    // Personal metrics
    personal: {
        netWorthChanges: {
            investorDeal: 5000000,      // Good deal
            ipoSuccess: 50000000,       // Great success
            bankruptcy: 250000,         // Even bankruptcy makes you richer (golden parachute)
            governmentContract: 10000000, // Government money printer
            ethicalChoice: 500000       // Being ethical pays... less
        },
        baseNetWorthGrowth: 100000,     // Passive income per turn
        legacyTypes: {
            unknown: "Unknown",
            visionary: "Visionary",
            destroyer: "Destroyer",
            sellout: "Corporate Sellout",
            savior: "Humanity's Savior",
            cautious: "The Cautious One",
            reckless: "The Reckless",
            balanced: "The Balanced Leader"
        }
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(Config);
Object.freeze(Config.animations);
Object.freeze(Config.drag);
Object.freeze(Config.resources);
Object.freeze(Config.game);
Object.freeze(Config.formulas);
Object.freeze(Config.personal);
Object.freeze(Config.personal.netWorthChanges);
Object.freeze(Config.personal.legacyTypes);