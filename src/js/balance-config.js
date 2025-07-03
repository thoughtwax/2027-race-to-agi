// Enhanced Balance Configuration
const BalanceConfig = {
    // Resource formulas with better balance
    formulas: {
        // Progress generation - more balanced scaling
        progressPerTurn: (compute, talent, energy) => {
            const base = (compute * 0.08 + talent * 0.08);
            const energyMultiplier = Math.min(energy / 100, 1); // Cap at 100% efficiency
            const diminishingReturns = 1 - (Math.max(compute + talent - 100, 0) * 0.002); // Soft cap
            return Math.floor(base * energyMultiplier * diminishingReturns);
        },
        
        // Knowledge generation - starts earlier, scales better
        knowledgePerTurn: (progress, multiplier) => {
            if (progress < 20) return 0; // Lower threshold
            const base = progress * 0.12;
            const scalingBonus = progress > 50 ? (progress - 50) * 0.05 : 0;
            return Math.floor((base + scalingBonus) * multiplier);
        },
        
        // Capital generation - more responsive to trust
        capitalPerTurn: (trust, progress) => {
            const trustMultiplier = trust > 60 ? 1.2 : (trust < 40 ? 0.8 : 1);
            return Math.floor((trust * progress) / 180 * trustMultiplier);
        },
        
        // Energy cost - scales with efficiency improvements
        energyCostPerTurn: (compute, efficiency) => {
            const baseCost = compute * 0.12;
            const scalingCost = compute > 60 ? (compute - 60) * 0.08 : 0;
            return Math.floor((baseCost + scalingCost) / efficiency);
        }
    },
    
    // Resource thresholds for different states
    thresholds: {
        critical: 15,    // More forgiving critical threshold
        warning: 35,     // Earlier warning
        healthy: 60,     // Same healthy threshold
        excellent: 80    // New excellent threshold
    },
    
    // Feedback loop parameters
    feedbackLoops: {
        // Trust decay from energy use - more gradual
        trustDecayFromEnergy: {
            threshold: 75,      // Starts later
            rate: 2,           // Slower decay
            severeThreshold: 85,
            severeRate: 4
        },
        
        // Alignment decay from progress - more nuanced
        alignmentDecayFromProgress: {
            threshold: 40,      // Starts earlier
            rate: (progress, alignment) => {
                const gap = progress - alignment;
                if (gap <= 10) return 0;
                if (gap <= 20) return 1;
                if (gap <= 30) return 2;
                return 3;
            }
        },
        
        // Talent erosion from automation
        talentErosionFromAI: {
            baseRate: 1,
            acceleratedRate: 2,
            moraleThreshold: 40  // Below this, erosion accelerates
        },
        
        // Energy efficiency improvements
        efficiencyFromKnowledge: {
            threshold: 40,      // Starts earlier
            rate: 0.015,        // 1.5% per knowledge point above threshold
            cap: 2.0           // Maximum 2x efficiency
        }
    },
    
    // Crisis triggers - more balanced
    crisisTriggers: {
        energyCrisis: { energy: { gt: 85 } },
        trustCrisis: { trust: { lt: 15 } },
        talentCrisis: { talent: { lt: 20 } },
        alignmentCrisis: { 
            and: [
                { alignment: { lt: 30 } },
                { progress: { gt: 60 } }
            ]
        },
        capitalCrisis: { capital: { lt: 10 } }
    },
    
    // Phase-specific adjustments
    phaseModifiers: {
        1: {
            progressMultiplier: 1.0,
            costMultiplier: 1.0,
            crisisChance: 0.05
        },
        2: {
            progressMultiplier: 1.2,
            costMultiplier: 1.3,
            crisisChance: 0.10
        },
        3: {
            progressMultiplier: 1.5,
            costMultiplier: 1.6,
            crisisChance: 0.15
        },
        4: {
            progressMultiplier: 2.0,
            costMultiplier: 2.0,
            crisisChance: 0.25
        }
    },
    
    // Decision weight adjustments for AI
    decisionWeights: {
        // Make decisions more impactful but balanced
        small: { min: 5, max: 10 },      // Minor changes
        medium: { min: 10, max: 20 },    // Moderate changes
        large: { min: 20, max: 30 },     // Major changes
        extreme: { min: 30, max: 40 }    // Crisis-level changes
    },
    
    // Win condition thresholds
    winConditions: {
        alignedAGI: {
            progress: 90,
            alignment: 70,
            trust: 40  // Lowered from potential 50
        },
        uncertainAGI: {
            progress: 90,
            alignment: 50,  // Between 50-70
            trust: 30
        },
        rogueAI: {
            progress: 90,
            alignment: 49  // Below 50
        }
    },
    
    // Loss condition thresholds
    lossConditions: {
        bankruptcy: { capital: 0 },
        noTrust: { trust: 0 },
        powerFailure: { energy: 0 },
        competitorWins: { competitorProgress: 100 }
        // Removed talentDrain to prevent race condition with state.js quit check
    }
};

// Apply balance patches to existing game
const applyBalancePatches = () => {
    // Create new formulas object with balanced versions
    const balancedFormulas = Object.assign({}, Config.formulas, BalanceConfig.formulas);
    
    // Replace the entire formulas object
    Config.formulas = balancedFormulas;
    
    // Update resource thresholds by creating new object
    Config.resources = Object.assign({}, Config.resources, BalanceConfig.thresholds);
    
    // Enhance the resource feedback loops
    const originalApplyFeedbackLoops = Resources.applyFeedbackLoops;
    Resources.applyFeedbackLoops = function() {
        const state = GameState.current;
        const r = state.resources;
        const m = state.multipliers;
        const f = state.flags;
        const phase = state.phase;
        
        // Get phase modifiers
        const phaseMod = BalanceConfig.phaseModifiers[phase] || BalanceConfig.phaseModifiers[1];
        
        // Progress generation with phase modifier
        const baseProgress = Config.formulas.progressPerTurn(r.compute, r.talent, r.energy);
        const progressGain = Math.floor(baseProgress * phaseMod.progressMultiplier);
        if (progressGain > 0) {
            const actualChange = GameState.updateResource('progress', progressGain);
            this.showChange('progress', actualChange);
        }
        
        // Knowledge generation
        const knowledgeGain = Config.formulas.knowledgePerTurn(r.progress, m.knowledge);
        if (knowledgeGain > 0) {
            const actualChange = GameState.updateResource('knowledge', knowledgeGain);
            this.showChange('knowledge', actualChange);
        }
        
        // Enhanced energy efficiency from knowledge
        const effConfig = BalanceConfig.feedbackLoops.efficiencyFromKnowledge;
        if (r.knowledge > effConfig.threshold) {
            const efficiency = 1 + (r.knowledge - effConfig.threshold) * effConfig.rate;
            m.energy_efficiency = Math.min(efficiency, effConfig.cap);
        }
        
        // Capital generation
        const capitalGain = Config.formulas.capitalPerTurn(r.trust, r.progress);
        if (capitalGain > 0) {
            const actualChange = GameState.updateResource('capital', capitalGain);
            this.showChange('capital', actualChange);
        }
        
        // Energy consumption with phase modifier
        const baseCost = Config.formulas.energyCostPerTurn(r.compute, m.energy_efficiency);
        const energyCost = Math.floor(baseCost * phaseMod.costMultiplier);
        if (energyCost > 0) {
            const actualChange = GameState.updateResource('energy', -energyCost);
            this.showChange('energy', actualChange);
        }
        
        // Trust decay from energy - more nuanced
        const trustDecay = BalanceConfig.feedbackLoops.trustDecayFromEnergy;
        if (r.energy > trustDecay.threshold) {
            const rate = r.energy > trustDecay.severeThreshold ? trustDecay.severeRate : trustDecay.rate;
            const actualChange = GameState.updateResource('trust', -rate);
            this.showChange('trust', actualChange);
            
            if (r.energy > trustDecay.severeThreshold && !f.climateProtests) {
                f.climateProtests = true;
                UI.showEvent({ 
                    title: 'Climate Emergency', 
                    description: 'Massive protests erupt over your energy consumption.' 
                });
            }
        }
        
        // Alignment decay - using function
        const alignmentDecay = BalanceConfig.feedbackLoops.alignmentDecayFromProgress;
        if (r.progress > alignmentDecay.threshold) {
            const decayRate = alignmentDecay.rate(r.progress, r.alignment);
            if (decayRate > 0) {
                const actualChange = GameState.updateResource('alignment', -decayRate);
                if (f.alignmentRevealed) {
                    this.showChange('alignment', actualChange);
                }
            }
        }
        
        // Talent erosion with morale consideration
        const talentErosion = BalanceConfig.feedbackLoops.talentErosionFromAI;
        if (f.hasAIResearchers && r.talent > 20) {
            const rate = r.talent < talentErosion.moraleThreshold ? 
                talentErosion.acceleratedRate : talentErosion.baseRate;
            const actualChange = GameState.updateResource('talent', -rate);
            this.showChange('talent', actualChange);
        }
        
        // Check for automatic loss conditions
        Object.entries(BalanceConfig.lossConditions).forEach(([condition, check]) => {
            if (Object.entries(check).every(([resource, value]) => r[resource] <= value)) {
                // Transform camelCase to snake_case
                const transformedEnding = condition.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                console.log(`Balance-config triggering ending: ${condition} → ${transformedEnding}`);
                Game.endGame(transformedEnding);
            }
        });
        
        // Update all displays
        this.updateAll();
    };
    
    // Enhance crisis chances based on phase
    const originalCheckForCrisis = Crisis.checkForCrisis;
    Crisis.checkForCrisis = function() {
        const phaseMod = BalanceConfig.phaseModifiers[GameState.current.phase] || 
                        BalanceConfig.phaseModifiers[1];
        
        // Temporarily adjust base chance
        const originalChance = this.baseChance;
        this.baseChance = phaseMod.crisisChance;
        
        const result = originalCheckForCrisis.call(this);
        
        // Restore original
        this.baseChance = originalChance;
        
        return result;
    };
};

// Auto-apply patches after all modules are loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Game !== 'undefined' && typeof Resources !== 'undefined') {
        setTimeout(applyBalancePatches, 100); // Small delay to ensure everything is initialized
    }
});