#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to parse CSV
function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || '';
        });
        return obj;
    });
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Parse effects string back to object
function parseEffects(effectsStr) {
    if (!effectsStr) return {};
    
    const effects = {};
    effectsStr.split(';').forEach(effect => {
        const [key, value] = effect.trim().split(':');
        if (key && value) {
            effects[key.trim()] = parseInt(value.trim()) || 0;
        }
    });
    return effects;
}

// Import cards
function importCards(filename) {
    console.log(`Importing cards from ${filename}...`);
    
    if (!fs.existsSync(filename)) {
        console.error(`File not found: ${filename}`);
        return;
    }
    
    const content = fs.readFileSync(filename, 'utf8');
    const rows = parseCSV(content);
    
    // Separate regular and crisis cards
    const regularCards = {};
    const crisisCards = [];
    
    rows.forEach(row => {
        if (row['Card Type'] === 'Regular') {
            const phase = row['Phase'];
            if (!regularCards[phase]) {
                regularCards[phase] = [];
            }
            
            const card = {
                id: row['Card ID'],
                title: row['Title'],
                description: row['Description'],
                leftChoice: row['Left Choice'],
                leftEffects: parseEffects(row['Left Effects']),
                rightChoice: row['Right Choice'],
                rightEffects: parseEffects(row['Right Effects'])
            };
            
            // Add optional fields
            if (row['Left Event']) card.leftEvent = row['Left Event'];
            if (row['Right Event']) card.rightEvent = row['Right Event'];
            if (row['Weight'] && row['Weight'] !== '1') card.weight = parseFloat(row['Weight']);
            
            regularCards[phase].push(card);
        } else if (row['Card Type'] === 'Crisis') {
            const crisis = {
                id: row['Card ID'],
                title: row['Title'],
                description: row['Description'],
                leftChoice: row['Left Choice'],
                leftEffects: parseEffects(row['Left Effects']),
                rightChoice: row['Right Choice'],
                rightEffects: parseEffects(row['Right Effects'])
            };
            
            // Add optional fields
            if (row['Left Event']) crisis.leftEvent = row['Left Event'];
            if (row['Right Event']) crisis.rightEvent = row['Right Event'];
            if (row['Phase'] !== 'all') crisis.phases = row['Phase'].split(';').map(p => parseInt(p));
            if (row['Weight'] && row['Weight'] !== '0.15') crisis.probability = parseFloat(row['Weight']);
            
            crisisCards.push(crisis);
        }
    });
    
    // Write files
    const projectRoot = path.join(__dirname, '../..');
    fs.writeFileSync(
        path.join(projectRoot, 'src/data/cards.json'),
        JSON.stringify(regularCards, null, 2)
    );
    console.log(`Updated src/data/cards.json with ${Object.values(regularCards).flat().length} cards`);
    
    fs.writeFileSync(
        path.join(projectRoot, 'src/data/crisisEvents.json'),
        JSON.stringify(crisisCards, null, 2)
    );
    console.log(`Updated src/data/crisisEvents.json with ${crisisCards.length} crisis cards`);
}

// Import endings (requires manual update to UI.js)
function importEndings(filename) {
    console.log(`\nImporting endings from ${filename}...`);
    
    if (!fs.existsSync(filename)) {
        console.error(`File not found: ${filename}`);
        return;
    }
    
    const content = fs.readFileSync(filename, 'utf8');
    const rows = parseCSV(content);
    
    console.log('\nEndings to update in src/js/ui.js:');
    console.log('=====================================');
    
    rows.forEach(row => {
        console.log(`\n${row['Ending ID']}: {`);
        console.log(`    title: "${row['Title']}",`);
        console.log(`    description: "${row['Description']}"`);
        console.log(`}`);
    });
    
    console.log('\n=====================================');
    console.log('Please manually update the endingsData object in src/js/ui.js with the above values.');
}

// Import config
function importConfig(filename) {
    console.log(`\nImporting configuration from ${filename}...`);
    
    if (!fs.existsSync(filename)) {
        console.error(`File not found: ${filename}`);
        return;
    }
    
    const content = fs.readFileSync(filename, 'utf8');
    const rows = parseCSV(content);
    
    const projectRoot = path.join(__dirname, '../..');
    const configPath = path.join(projectRoot, 'src/data/gameConfig.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    rows.forEach(row => {
        const category = row['Category'];
        const setting = row['Setting'];
        const value = parseFloat(row['Value']) || row['Value'];
        
        if (category === 'Threshold') {
            config.thresholds[setting] = value;
        } else if (category === 'Multiplier') {
            config.multipliers[setting] = value;
        }
    });
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Updated src/data/gameConfig.json');
}

// Main execution
console.log('Game Text Import Tool');
console.log('====================\n');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node import-game-text.js [cards.csv] [endings.csv] [config.csv]');
    console.log('\nExample:');
    console.log('  node import-game-text.js game-cards-import.csv');
    console.log('  node import-game-text.js game-cards-import.csv game-endings-import.csv');
    console.log('  node import-game-text.js game-cards-import.csv game-endings-import.csv game-config-import.csv');
    process.exit(1);
}

// Import based on provided arguments
if (args[0]) importCards(args[0]);
if (args[1]) importEndings(args[1]);
if (args[2]) importConfig(args[2]);

console.log('\nImport complete!');