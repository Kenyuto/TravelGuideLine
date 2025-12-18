/**
 * Shopping List API for Google Apps Script Web App
 * 
 * This script provides a RESTful API endpoint for managing shopping list items
 * in a Google Sheet. It handles CREATE, UPDATE, and DELETE operations.
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Create a new file named "ShoppingListAPI.gs"
 * 4. Paste this code
 * 5. Deploy as Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL and set it in your frontend .env file
 * 
 * @version 1.0.0
 * @date 2025-12-18
 */

// Configuration
const SHEET_NAME = 'ShoppingList'; // or '購買清單'
const HEADERS = [
  'itemId',
  'itineraryItemId',
  'name',
  'isCompleted',
  'note',
  'quantity',
  'estimatedAmount',
  'currency',
  'createdBy',
  'createdAt',
  'lastUpdatedBy',
  'lastUpdatedAt'
];

/**
 * Handle POST requests
 * @param {Object} e - Event object
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    // Parse request body
    const request = JSON.parse(e.postData.contents);
    const { action, data } = request;

    // Validate request
    if (!action || !data) {
      return createResponse(false, 'Missing action or data');
    }

    // Get or create sheet
    const sheet = getOrCreateSheet();

    // Handle different actions
    let result;
    switch (action) {
      case 'add':
        result = addItem(sheet, data);
        break;
      case 'update':
        result = updateItem(sheet, data);
        break;
      case 'delete':
        result = deleteItem(sheet, data);
        break;
      default:
        return createResponse(false, `Unknown action: ${action}`);
    }

    return createResponse(true, 'Success', result);
  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    return createResponse(false, error.message);
  }
}

/**
 * Handle GET requests (for testing)
 * Returns all shopping list items
 * @returns {TextOutput} JSON response
 */
function doGet() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    const items = data.slice(1).map(row => {
      return {
        itemId: row[0],
        itineraryItemId: row[1],
        name: row[2],
        isCompleted: row[3] === 'true' || row[3] === true,
        note: row[4],
        quantity: row[5],
        estimatedAmount: row[6],
        currency: row[7],
        createdBy: row[8],
        createdAt: row[9],
        lastUpdatedBy: row[10],
        lastUpdatedAt: row[11]
      };
    });

    return createResponse(true, 'Success', items);
  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    return createResponse(false, error.message);
  }
}

/**
 * Get or create the shopping list sheet
 * @returns {Sheet} The shopping list sheet
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    // Create sheet if it doesn't exist
    sheet = ss.insertSheet(SHEET_NAME);
    
    // Add headers
    sheet.appendRow(HEADERS);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
  }

  return sheet;
}

/**
 * Add a new shopping list item
 * @param {Sheet} sheet - The shopping list sheet
 * @param {Object} data - Item data
 * @returns {Object} The added item
 */
function addItem(sheet, data) {
  const newRow = [
    data.id,
    data.itineraryItemId,
    data.name,
    data.isCompleted || false,
    data.note || '',
    data.quantity || '',
    data.estimatedAmount || '',
    data.currency || 'TWD',
    data.createdBy,
    data.createdAt || new Date().toISOString(),
    data.lastUpdatedBy || data.createdBy,
    data.lastUpdatedAt || new Date().toISOString()
  ];

  sheet.appendRow(newRow);
  
  Logger.log('Added item: ' + data.id);
  return data;
}

/**
 * Update an existing shopping list item
 * @param {Sheet} sheet - The shopping list sheet
 * @param {Object} data - Item data
 * @returns {Object} The updated item
 */
function updateItem(sheet, data) {
  const itemId = data.id;
  const range = sheet.getDataRange();
  const values = range.getValues();

  // Find the row with matching itemId
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === itemId) {
      // Update the row
      const rowNumber = i + 1;
      sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([[
        itemId,
        data.itineraryItemId,
        data.name,
        data.isCompleted || false,
        data.note || '',
        data.quantity || '',
        data.estimatedAmount || '',
        data.currency || 'TWD',
        values[i][8], // Keep original createdBy
        values[i][9], // Keep original createdAt
        data.lastUpdatedBy,
        data.lastUpdatedAt || new Date().toISOString()
      ]]);

      Logger.log('Updated item: ' + itemId);
      return data;
    }
  }

  throw new Error('Item not found: ' + itemId);
}

/**
 * Delete a shopping list item
 * @param {Sheet} sheet - The shopping list sheet
 * @param {Object} data - Item data (must contain id)
 * @returns {Object} Deletion result
 */
function deleteItem(sheet, data) {
  const itemId = data.id;
  const range = sheet.getDataRange();
  const values = range.getValues();

  // Find the row with matching itemId
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === itemId) {
      // Delete the row
      sheet.deleteRow(i + 1);
      Logger.log('Deleted item: ' + itemId);
      return { id: itemId, deleted: true };
    }
  }

  throw new Error('Item not found: ' + itemId);
}

/**
 * Create a JSON response
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {Object} data - Response data (optional)
 * @returns {TextOutput} JSON response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message
  };

  if (data !== undefined) {
    response.data = data;
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - Add sample data
 * Run this function from the Script Editor to add test data
 */
function addTestData() {
  const sheet = getOrCreateSheet();
  
  const testItems = [
    {
      id: 'test-001',
      itineraryItemId: 'itinerary-day1-item1',
      name: '伴手禮',
      isCompleted: false,
      note: '東京香蕉',
      quantity: 5,
      estimatedAmount: 1500,
      currency: 'TWD',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      lastUpdatedBy: 'test-user',
      lastUpdatedAt: new Date().toISOString()
    },
    {
      id: 'test-002',
      itineraryItemId: 'itinerary-day1-item1',
      name: '紀念品',
      isCompleted: true,
      note: '',
      quantity: 3,
      estimatedAmount: 800,
      currency: 'TWD',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      lastUpdatedBy: 'test-user',
      lastUpdatedAt: new Date().toISOString()
    }
  ];

  testItems.forEach(item => addItem(sheet, item));
  Logger.log('Test data added successfully');
}
