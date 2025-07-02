/**
 * Google Apps Script to format the Game Cards spreadsheet
 * 
 * To use:
 * 1. Import your CSV/TSV into Google Sheets
 * 2. Go to Extensions → Apps Script
 * 3. Copy and paste this code
 * 4. Save and run formatGameCards()
 */

function formatGameCards() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  // Set column widths for better readability
  const columnWidths = {
    1: 100,   // Card Type
    2: 80,    // Phase
    3: 150,   // Card ID
    4: 250,   // Title
    5: 500,   // Description
    6: 150,   // Left Choice
    7: 200,   // Left Effects
    8: 300,   // Left Event
    9: 150,   // Right Choice
    10: 200,  // Right Effects
    11: 300,  // Right Event
    12: 80    // Weight
  };
  
  for (let col in columnWidths) {
    sheet.setColumnWidth(parseInt(col), columnWidths[col]);
  }
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setBackground('#4A90E2');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment('center');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Apply alternating row colors and conditional formatting
  const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
  
  // Set default formatting
  dataRange.setFontSize(10);
  dataRange.setVerticalAlignment('top');
  dataRange.setWrap(true);
  
  // Apply conditional formatting for different card types
  const rules = [];
  
  // Crisis cards - light red background
  const crisisRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Crisis')
    .setBackground('#FFE6E6')
    .setRanges([sheet.getRange(2, 1, lastRow - 1, 1)])
    .build();
  rules.push(crisisRule);
  
  // Tutorial card - light blue background
  const tutorialRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('tutorial')
    .setBackground('#E6F3FF')
    .setRanges([sheet.getRange(2, 2, lastRow - 1, 1)])
    .build();
  rules.push(tutorialRule);
  
  sheet.setConditionalFormatRules(rules);
  
  // Format specific columns
  // Card ID column - monospace font
  sheet.getRange(2, 3, lastRow - 1, 1).setFontFamily('Courier New');
  
  // Effects columns - blue color and smaller font
  sheet.getRange(2, 7, lastRow - 1, 1).setFontColor('#0066CC').setFontSize(9);
  sheet.getRange(2, 10, lastRow - 1, 1).setFontColor('#0066CC').setFontSize(9);
  
  // Add borders
  const allRange = sheet.getRange(1, 1, lastRow, lastCol);
  allRange.setBorder(true, true, true, true, true, true, '#CCCCCC', SpreadsheetApp.BorderStyle.SOLID);
  
  // Create filters
  const filterRange = sheet.getRange(1, 1, lastRow, lastCol);
  filterRange.createFilter();
  
  // Add data validation for Card Type column
  const cardTypes = ['Regular', 'Crisis'];
  const cardTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(cardTypes)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 1, lastRow - 1, 1).setDataValidation(cardTypeRule);
  
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('Formatting complete! The spreadsheet has been formatted for easier editing.');
}

// Helper function to add a summary sheet
function addSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getActiveSheet();
  
  // Create or get summary sheet
  let summarySheet;
  try {
    summarySheet = ss.insertSheet('Summary');
  } catch (e) {
    summarySheet = ss.getSheetByName('Summary');
    summarySheet.clear();
  }
  
  // Count cards by type and phase
  const formulas = [
    ['Card Statistics', ''],
    ['', ''],
    ['Total Cards', `=COUNTA(${dataSheet.getName()}!C2:C)`],
    ['Regular Cards', `=COUNTIF(${dataSheet.getName()}!A:A,"Regular")`],
    ['Crisis Cards', `=COUNTIF(${dataSheet.getName()}!A:A,"Crisis")`],
    ['', ''],
    ['Cards by Phase', ''],
    ['Tutorial', `=COUNTIF(${dataSheet.getName()}!B:B,"tutorial")`],
    ['Phase 1', `=COUNTIF(${dataSheet.getName()}!B:B,"1")`],
    ['Phase 2', `=COUNTIF(${dataSheet.getName()}!B:B,"2")`],
    ['Phase 3', `=COUNTIF(${dataSheet.getName()}!B:B,"3")`],
    ['Phase 4', `=COUNTIF(${dataSheet.getName()}!B:B,"4")`],
    ['All Phases', `=COUNTIF(${dataSheet.getName()}!B:B,"all")`],
  ];
  
  summarySheet.getRange(1, 1, formulas.length, 2).setValues(formulas);
  summarySheet.getRange(1, 1, 1, 2).setFontWeight('bold').setFontSize(14);
  summarySheet.getRange(7, 1, 1, 2).setFontWeight('bold');
  summarySheet.autoResizeColumns(1, 2);
}

// Menu creation
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎮 Game Cards')
    .addItem('Format Spreadsheet', 'formatGameCards')
    .addItem('Add Summary Sheet', 'addSummarySheet')
    .addSeparator()
    .addItem('About', 'showAbout')
    .addToUi();
}

function showAbout() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Game Cards Editor', 
    'This spreadsheet contains all the cards for 2027: Race to AGI.\\n\\n' +
    'Edit the text and effects, then export as CSV to import back into the game.\\n\\n' +
    'Effect format: resource:amount, resource:amount\\n' +
    'Resources: compute, energy, talent, knowledge, progress, trust, capital, alignment',
    ui.ButtonSet.OK);
}