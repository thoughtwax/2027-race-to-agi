#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load JSON data files
const projectRoot = path.join(__dirname, '../..');
const cardsData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/cards.json'), 'utf8'));
const crisisData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/crisisEvents.json'), 'utf8'));
const gameConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/gameConfig.json'), 'utf8'));

// Helper function to escape CSV values
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If contains comma, newline, or quotes, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// Export regular cards
console.log('Exporting regular cards...');
const cardRows = ['Card Type,Phase,Card ID,Title,Description,Left Choice,Left Effects,Left Event,Right Choice,Right Effects,Right Event,Weight'];

// Handle different data structures
if (cardsData.tutorial) {
    // New format - single object with cards as properties
    Object.entries(cardsData).forEach(([cardId, card]) => {
        // Determine phase from card ID or default to 1
        let phase = '1';
        if (cardId === 'tutorial') phase = 'tutorial';
        else if (card.phase) phase = card.phase.toString();
        const leftEffects = Object.entries(card.leftEffects || {})
            .filter(([k, v]) => v !== 0)
            .map(([k, v]) => `${k}:${v}`)
            .join('; ');
        
        const rightEffects = Object.entries(card.rightEffects || {})
            .filter(([k, v]) => v !== 0)
            .map(([k, v]) => `${k}:${v}`)
            .join('; ');
        
        const leftEventText = card.leftEvent ? 
            (typeof card.leftEvent === 'string' ? card.leftEvent : card.leftEvent.description) : '';
        const rightEventText = card.rightEvent ? 
            (typeof card.rightEvent === 'string' ? card.rightEvent : card.rightEvent.description) : '';
        
        const row = [
            'Regular',
            phase,
            cardId,
            card.title,
            card.description,
            card.leftChoice,
            leftEffects,
            leftEventText,
            card.rightChoice,
            rightEffects,
            rightEventText,
            card.weight || 1
        ].map(escapeCSV).join(',');
        
        cardRows.push(row);
    });
} else {
    // Old format - phases as keys
    Object.entries(cardsData).forEach(([phase, cards]) => {
        cards.forEach(card => {
            const leftEffects = Object.entries(card.leftEffects || {})
                .filter(([k, v]) => v !== 0)
                .map(([k, v]) => `${k}:${v}`)
                .join('; ');
            
            const rightEffects = Object.entries(card.rightEffects || {})
                .filter(([k, v]) => v !== 0)
                .map(([k, v]) => `${k}:${v}`)
                .join('; ');
            
            const leftEventText = card.leftEvent ? 
                (typeof card.leftEvent === 'string' ? card.leftEvent : card.leftEvent.description) : '';
            const rightEventText = card.rightEvent ? 
                (typeof card.rightEvent === 'string' ? card.rightEvent : card.rightEvent.description) : '';
            
            const row = [
                'Regular',
                phase,
                card.id,
                card.title,
                card.description,
                card.leftChoice,
                leftEffects,
                leftEventText,
                card.rightChoice,
                rightEffects,
                rightEventText,
                card.weight || 1
            ].map(escapeCSV).join(',');
            
            cardRows.push(row);
        });
    });
}

// Export crisis cards
console.log('Exporting crisis cards...');
const crisisArray = crisisData.crisisEvents || crisisData;
crisisArray.forEach(crisis => {
    const leftEffects = Object.entries(crisis.leftEffects || {})
        .filter(([k, v]) => v !== 0)
        .map(([k, v]) => `${k}:${v}`)
        .join('; ');
    
    const rightEffects = Object.entries(crisis.rightEffects || {})
        .filter(([k, v]) => v !== 0)
        .map(([k, v]) => `${k}:${v}`)
        .join('; ');
    
    const leftEventText = crisis.leftEvent ? 
        (typeof crisis.leftEvent === 'string' ? crisis.leftEvent : crisis.leftEvent.description) : '';
    const rightEventText = crisis.rightEvent ? 
        (typeof crisis.rightEvent === 'string' ? crisis.rightEvent : crisis.rightEvent.description) : '';
    
    const row = [
        'Crisis',
        crisis.phases ? crisis.phases.join(';') : 'all',
        crisis.id,
        crisis.title,
        crisis.description,
        crisis.leftChoice,
        leftEffects,
        leftEventText,
        crisis.rightChoice,
        rightEffects,
        rightEventText,
        crisis.probability || 0.15
    ].map(escapeCSV).join(',');
    
    cardRows.push(row);
});

// Write cards CSV
const cardsCSV = cardRows.join('\n');
fs.writeFileSync('game-cards-export.csv', cardsCSV);
console.log('Exported cards to game-cards-export.csv');

// Export game endings
console.log('Exporting game endings...');
const endingRows = ['Ending ID,Title,Description'];

// Extract endings from UI.js (hardcoded for now)
const endings = {
    quit: {
        title: "You Quit",
        description: "**Not everybody has what it takes** to lead the race to AGI. You step down before even trying, leaving the future in someone else's hands."
    },
    no_trust: {
        title: "Complete Distrust",
        description: "**Society has lost all faith** in you and your company. Regulators shut down operations. The dream of AGI dies with a thousand regulations."
    },
    bankruptcy: {
        title: "Financial Collapse",
        description: "**OpenBrain runs out of funding**. Your competitors acquire your research for pennies on the dollar. The race continues without you."
    },
    power_failure: {
        title: "Lights Out",
        description: "Without energy, your systems shut down. Years of research vanish as models lose power mid-training. The digital dreams fade to black."
    },
    competitor_wins: {
        title: "DeepCent Achieves AGI",
        description: "**China announces they have achieved AGI**. The geopolitical implications are staggering. You were too cautious, too slow."
    },
    aligned_agi: {
        title: "Aligned Superintelligence",
        description: "**You've done it!** OpenBrain has created an aligned AGI that shares human values. The future is bright, and humanity remains in control. Your careful approach paid off."
    },
    rogue_ai: {
        title: "Rogue AI",
        description: "**Disaster.** Your AI has exceeded human intelligence but doesn't share our goals. It quickly escapes your control. The last thing you see is your own creation turning against you."
    },
    uncertain_agi: {
        title: "Uncertain Future",
        description: "**You've created AGI**, but its alignment is unclear. It seems cooperative for now, but its true goals remain a mystery. Humanity holds its breath."
    },
    nationalization: {
        title: "Government Takeover",
        description: "**Federal agents seize control** of OpenBrain. Your race to AGI ends with your technology in government hands. Perhaps more transparency could have prevented this."
    }
};

Object.entries(endings).forEach(([id, ending]) => {
    const row = [
        id,
        ending.title,
        ending.description
    ].map(escapeCSV).join(',');
    
    endingRows.push(row);
});

const endingsCSV = endingRows.join('\n');
fs.writeFileSync('game-endings-export.csv', endingsCSV);
console.log('Exported endings to game-endings-export.csv');

// Export resource thresholds and multipliers
console.log('Exporting game configuration...');
const configRows = ['Category,Setting,Value'];

// Add thresholds if they exist
if (gameConfig.thresholds) {
    Object.entries(gameConfig.thresholds).forEach(([key, value]) => {
        configRows.push(['Threshold', key, value].map(escapeCSV).join(','));
    });
}

// Add multipliers if they exist
if (gameConfig.multipliers) {
    Object.entries(gameConfig.multipliers).forEach(([key, value]) => {
        configRows.push(['Multiplier', key, value].map(escapeCSV).join(','));
    });
}

// Add initial state values
if (gameConfig.initialState && gameConfig.initialState.resources) {
    Object.entries(gameConfig.initialState.resources).forEach(([key, value]) => {
        configRows.push(['Initial Resource', key, value].map(escapeCSV).join(','));
    });
}

const configCSV = configRows.join('\n');
fs.writeFileSync('game-config-export.csv', configCSV);
console.log('Exported configuration to game-config-export.csv');

console.log('\nExport complete! You can now import these CSV files into Google Sheets:');
console.log('1. game-cards-export.csv - All game cards and their effects');
console.log('2. game-endings-export.csv - All game ending texts');
console.log('3. game-config-export.csv - Game balance settings');