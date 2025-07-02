#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load JSON data files
const projectRoot = path.join(__dirname, '../..');
const cardsData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/cards.json'), 'utf8'));
const crisisData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/crisisEvents.json'), 'utf8'));
const gameConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/gameConfig.json'), 'utf8'));

// Create Excel-compatible TSV (Tab-Separated Values) for better formatting
function escapeForTSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // For TSV, we need to escape tabs and newlines
    return str.replace(/\t/g, ' ').replace(/\n/g, '\\n');
}

// Export regular cards with better formatting
console.log('Exporting cards with formatting...');
const headers = [
    'Card Type',
    'Phase', 
    'Card ID',
    'Title',
    'Description',
    'Left Choice',
    'Left Effects',
    'Left Event',
    'Right Choice', 
    'Right Effects',
    'Right Event',
    'Weight'
];

const rows = [headers.join('\t')];

// Handle regular cards
if (cardsData.tutorial) {
    // New format - single object with cards as properties
    Object.entries(cardsData).forEach(([cardId, card]) => {
        // Skip empty cards
        if (!card.title) return;
        
        let phase = '1';
        if (cardId === 'tutorial') phase = 'tutorial';
        else if (card.phase) phase = card.phase.toString();
        
        const leftEffects = Object.entries(card.leftEffects || {})
            .filter(([k, v]) => v !== 0)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        
        const rightEffects = Object.entries(card.rightEffects || {})
            .filter(([k, v]) => v !== 0)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        
        const leftEventText = card.leftEvent ? 
            (typeof card.leftEvent === 'string' ? card.leftEvent : card.leftEvent.description) : '';
        const rightEventText = card.rightEvent ? 
            (typeof card.rightEvent === 'string' ? card.rightEvent : card.rightEvent.description) : '';
        
        const row = [
            'Regular',
            phase,
            cardId,
            card.title || '',
            card.description || '',
            card.leftChoice || '',
            leftEffects,
            leftEventText,
            card.rightChoice || '',
            rightEffects,
            rightEventText,
            card.weight || 1
        ].map(escapeForTSV);
        
        rows.push(row.join('\t'));
    });
}

// Handle crisis cards
const crisisArray = crisisData.crisisEvents || crisisData;
crisisArray.forEach(crisis => {
    const leftEffects = Object.entries(crisis.leftEffects || {})
        .filter(([k, v]) => v !== 0)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    
    const rightEffects = Object.entries(crisis.rightEffects || {})
        .filter(([k, v]) => v !== 0)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    
    const leftEventText = crisis.leftEvent ? 
        (typeof crisis.leftEvent === 'string' ? crisis.leftEvent : crisis.leftEvent.description) : '';
    const rightEventText = crisis.rightEvent ? 
        (typeof crisis.rightEvent === 'string' ? crisis.rightEvent : crisis.rightEvent.description) : '';
    
    const row = [
        'Crisis',
        crisis.phases ? crisis.phases.join(';') : 'all',
        crisis.id,
        crisis.title || '',
        crisis.description || '',
        crisis.leftChoice || '',
        leftEffects,
        leftEventText,
        crisis.rightChoice || '',
        rightEffects,
        rightEventText,
        crisis.probability || 0.15
    ].map(escapeForTSV);
    
    rows.push(row.join('\t'));
});

// Write TSV file
const tsvContent = rows.join('\n');
fs.writeFileSync('game-cards-formatted.tsv', tsvContent);
console.log('Exported to game-cards-formatted.tsv');

// Also create a formatted HTML table for preview
console.log('\nCreating HTML preview...');
let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Game Cards Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #4CAF50; color: white; position: sticky; top: 0; z-index: 10; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .card-id { font-family: monospace; font-size: 12px; }
        .description { max-width: 400px; white-space: pre-wrap; }
        .effects { font-family: monospace; font-size: 12px; color: #0066cc; }
        .crisis { background-color: #ffe6e6; }
        .tutorial { background-color: #e6f3ff; }
    </style>
</head>
<body>
    <h1>Game Cards Export - ${new Date().toLocaleDateString()}</h1>
    <p>${rows.length - 1} cards total</p>
    <table>
        <thead>
            <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
`;

// Add data rows
rows.slice(1).forEach(row => {
    const cells = row.split('\t');
    const cardType = cells[0];
    const phase = cells[1];
    const rowClass = cardType === 'Crisis' ? 'crisis' : (phase === 'tutorial' ? 'tutorial' : '');
    
    htmlContent += `            <tr class="${rowClass}">
`;
    cells.forEach((cell, i) => {
        let className = '';
        if (i === 2) className = 'card-id';
        else if (i === 4) className = 'description';
        else if (i === 6 || i === 9) className = 'effects';
        
        // Convert \n back to line breaks for display
        const displayText = cell.replace(/\\n/g, '<br>');
        htmlContent += `                <td class="${className}">${displayText}</td>
`;
    });
    htmlContent += `            </tr>
`;
});

htmlContent += `        </tbody>
    </table>
    <p><em>Import the .tsv file into Google Sheets for editing. Use File → Import → Upload and select "Tab" as the separator.</em></p>
</body>
</html>`;

fs.writeFileSync('game-cards-preview.html', htmlContent);
console.log('Created game-cards-preview.html for preview');

console.log('\nExport complete!');
console.log('\nTo import into Google Sheets:');
console.log('1. Open Google Sheets');
console.log('2. File → Import → Upload');
console.log('3. Select game-cards-formatted.tsv');
console.log('4. Choose "Tab" as the separator');
console.log('5. The formatting should be preserved!');