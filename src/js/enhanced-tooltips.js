// Enhanced Tooltips Module
const EnhancedTooltips = {
    tooltip: null,
    
    init() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'enhanced-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 13px;
            line-height: 1.4;
            pointer-events: none;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: none;
        `;
        document.body.appendChild(this.tooltip);
        
        // Add tooltips to resource bars
        this.addResourceTooltips();
    },
    
    addResourceTooltips() {
        const resources = document.querySelectorAll('.resource');
        
        resources.forEach(resource => {
            const resourceName = resource.getAttribute('data-resource');
            const barContainer = resource.querySelector('.resource-bar-container');
            
            if (barContainer) {
                barContainer.addEventListener('mouseenter', (e) => this.showResourceTooltip(e, resourceName));
                barContainer.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
                barContainer.addEventListener('mouseleave', () => this.hideTooltip());
            }
        });
    },
    
    showResourceTooltip(e, resourceName) {
        const bar = e.currentTarget.querySelector('.resource-bar');
        const value = parseInt(bar.getAttribute('data-value') || '0');
        const state = GameState.current;
        
        let content = `<div style="font-weight: bold; margin-bottom: 8px; color: #4CAF50;">${resourceName.toUpperCase()}: ${value}%</div>`;
        
        // Add resource-specific calculations
        switch(resourceName) {
            case 'progress':
                const progressPerTurn = Math.floor((state.resources.compute * 0.1 + state.resources.talent * 0.1) * (state.resources.energy / 100));
                content += `<div style="margin-bottom: 4px;">Progress per turn: <span style="color: #4CAF50">+${progressPerTurn}</span></div>`;
                content += `<div style="font-size: 11px; opacity: 0.8;">Formula: (Compute×0.1 + Talent×0.1) × Energy%</div>`;
                if (state.resources.progress < 100 && progressPerTurn > 0) {
                    const turnsToAGI = Math.ceil((100 - state.resources.progress) / progressPerTurn);
                    content += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">Turns to AGI: <span style="color: #2196F3">${turnsToAGI}</span></div>`;
                }
                break;
                
            case 'knowledge':
                if (state.resources.progress > 30) {
                    const knowledgePerTurn = Math.floor(state.resources.progress * 0.1 * state.multipliers.knowledge);
                    content += `<div style="margin-bottom: 4px;">Knowledge per turn: <span style="color: #4CAF50">+${knowledgePerTurn}</span></div>`;
                    content += `<div style="font-size: 11px; opacity: 0.8;">Formula: Progress×0.1 × Multiplier</div>`;
                    if (state.multipliers.knowledge > 1) {
                        content += `<div style="margin-top: 4px; color: #FF9800;">AI Researcher bonus: ${state.multipliers.knowledge}x</div>`;
                    }
                } else {
                    content += '<div style="color: #FFC107;">Requires Progress > 30 to generate</div>';
                }
                break;
                
            case 'capital':
                const capitalPerTurn = Math.floor((state.resources.trust * state.resources.progress) / 200);
                content += `<div style="margin-bottom: 4px;">Capital per turn: <span style="color: #4CAF50">+${capitalPerTurn}</span></div>`;
                content += `<div style="font-size: 11px; opacity: 0.8;">Formula: (Trust × Progress) / 200</div>`;
                if (capitalPerTurn < 5) {
                    content += '<div style="margin-top: 4px; color: #FFC107;">Low income - increase Trust or Progress</div>';
                }
                break;
                
            case 'energy':
                const energyCost = Math.floor(state.resources.compute * 0.15 / state.multipliers.energy_efficiency);
                const netEnergy = state.resources.energy - energyCost;
                content += `<div style="margin-bottom: 4px;">Energy cost per turn: <span style="color: #F44336">-${energyCost}</span></div>`;
                content += `<div style="font-size: 11px; opacity: 0.8;">Formula: Compute×0.15 / Efficiency</div>`;
                if (state.multipliers.energy_efficiency > 1) {
                    content += `<div style="margin-top: 4px; color: #4CAF50;">Efficiency bonus: ${((state.multipliers.energy_efficiency - 1) * 100).toFixed(0)}%</div>`;
                }
                if (netEnergy < 20) {
                    content += '<div style="margin-top: 8px; padding: 4px; background: rgba(244,67,54,0.2); border-radius: 4px;">⚠️ Energy shortage imminent!</div>';
                }
                break;
                
            case 'alignment':
                if (state.flags.alignmentRevealed) {
                    if (value < 30) {
                        content += '<div style="color: #F44336; font-weight: bold;">⚠️ CRITICAL: Rogue AI risk!</div>';
                        content += '<div style="font-size: 11px; margin-top: 4px;">AGI may not share human values</div>';
                    } else if (value < 50) {
                        content += '<div style="color: #FF9800;">Warning: Alignment degrading</div>';
                        content += '<div style="font-size: 11px; margin-top: 4px;">Focus on safety research</div>';
                    } else if (value > 70) {
                        content += '<div style="color: #4CAF50;">Good alignment with human values</div>';
                    }
                } else {
                    content += '<div style="font-style: italic; opacity: 0.7;">True value hidden until Phase 4</div>';
                    content += '<div style="font-size: 11px; margin-top: 4px;">May be different from displayed value</div>';
                }
                break;
                
            case 'trust':
                if (value < 20) {
                    content += '<div style="color: #F44336; font-weight: bold;">⚠️ Society turning against you!</div>';
                } else if (value < 30) {
                    content += '<div style="color: #FF9800;">Government intervention risk</div>';
                } else if (value > 80) {
                    content += '<div style="color: #4CAF50;">Strong public support</div>';
                }
                content += `<div style="margin-top: 4px; font-size: 11px;">Affects capital generation</div>`;
                break;
                
            case 'compute':
                content += `<div style="font-size: 11px;">Used for AI training and progress</div>`;
                if (value > 80) {
                    content += '<div style="margin-top: 4px; color: #FF9800;">Global GPU shortage likely</div>';
                }
                const computeContribution = Math.floor(state.resources.compute * 0.1 * (state.resources.energy / 100));
                content += `<div style="margin-top: 4px;">Contributing <span style="color: #2196F3">+${computeContribution}</span> to progress</div>`;
                break;
                
            case 'talent':
                content += `<div style="font-size: 11px;">Research staff and engineers</div>`;
                if (value < 30) {
                    content += '<div style="margin-top: 4px; color: #FF9800;">Recruitment crisis - losing key staff</div>';
                }
                const talentContribution = Math.floor(state.resources.talent * 0.1 * (state.resources.energy / 100));
                content += `<div style="margin-top: 4px;">Contributing <span style="color: #2196F3">+${talentContribution}</span> to progress</div>`;
                break;
        }
        
        // Add competitor warning for progress
        if (resourceName === 'progress' && state.competitorProgress > 60) {
            content += `<div style="margin-top: 8px; padding: 4px; background: rgba(244,67,54,0.2); border-radius: 4px;">DeepCent Progress: ${state.competitorProgress}%</div>`;
        }
        
        // Add critical warnings
        if (value <= 10) {
            content += '<div style="margin-top: 8px; color: #F44336; font-weight: bold; text-align: center;">💀 CRITICAL - Game Over Risk!</div>';
        } else if (value <= 20) {
            content += '<div style="margin-top: 8px; color: #F44336; text-align: center;">⚠️ CRITICAL</div>';
        } else if (value <= 30) {
            content += '<div style="margin-top: 8px; color: #FF9800; text-align: center;">Low</div>';
        }
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
        this.updateTooltipPosition(e);
    },
    
    updateTooltipPosition(e) {
        const x = e.pageX + 10;
        const y = e.pageY + 10;
        
        // Adjust position if tooltip would go off screen
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let finalX = x;
        let finalY = y;
        
        if (x + tooltipRect.width > windowWidth - 10) {
            finalX = e.pageX - tooltipRect.width - 10;
        }
        
        if (y + tooltipRect.height > windowHeight - 10) {
            finalY = e.pageY - tooltipRect.height - 10;
        }
        
        this.tooltip.style.left = finalX + 'px';
        this.tooltip.style.top = finalY + 'px';
    },
    
    hideTooltip() {
        this.tooltip.style.display = 'none';
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EnhancedTooltips.init());
} else {
    EnhancedTooltips.init();
}