# Game Content Editing Workflow

This guide explains how to export, edit, and import game text content using Google Sheets.

## Quick Start (Recommended)

1. Navigate to the tools directory:
   ```bash
   cd tools/content-editor
   ```

2. Run the formatted export:
   ```bash
   node export-game-text-formatted.js
   ```

3. This creates:
   - `game-cards-formatted.tsv` - Tab-separated file with better formatting
   - `game-cards-preview.html` - Preview in your browser

4. Import into Google Sheets:
   - Open Google Sheets
   - File → Import → Upload
   - Select `game-cards-formatted.tsv`
   - Choose "Tab" as the separator
   - Click Import

5. Format the spreadsheet:
   - Extensions → Apps Script
   - Copy contents of `google-sheets-formatter.gs`
   - Save and run `formatGameCards()`
   - Or use the new menu: 🎮 Game Cards → Format Spreadsheet

## Basic Export (CSV)

For basic CSV export:
```bash
node export-game-text.js
```

This generates:
- `game-cards-export.csv` - All decision cards with their effects
- `game-endings-export.csv` - All game ending texts
- `game-config-export.csv` - Initial resource values

## Google Sheets Import

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. File → Import → Upload → Select your CSV file
4. Choose "Replace spreadsheet" and click Import

## Editing Guidelines

### Cards CSV Columns:
- **Card Type**: Regular or Crisis
- **Phase**: Which game phase (1-4, or "all" for crisis)
- **Card ID**: Unique identifier (don't change these!)
- **Title**: Card header text
- **Description**: Card body text (supports **bold** and \n for line breaks)
- **Left/Right Choice**: Button text
- **Left/Right Effects**: Resource changes (format: `resource:amount; resource:amount`)
- **Left/Right Event**: Consequence text shown after choice
- **Weight**: Probability weight (default 1 for regular, 0.15 for crisis)

### Resource Names:
- compute, energy, talent, knowledge (inputs)
- progress, trust, capital, alignment (outputs)

### Effect Examples:
- Single effect: `trust:10`
- Multiple effects: `trust:10; progress:-5; energy:-20`
- Leave blank for no effects

## Import Process

1. Download your edited sheets as CSV files
2. Run the import script:
   ```bash
   node import-game-text.js game-cards-edited.csv
   ```

3. For endings, you'll need to manually update `src/js/ui.js` with the provided code

## Notes

- Always backup your data files before importing!
- Card IDs must remain unique
- Effects must use exact resource names
- Test your changes in-game after importing