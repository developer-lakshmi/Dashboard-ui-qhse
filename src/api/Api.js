import axios from 'axios';

/**
 * Fetches data from any Google Sheet.
 * @param {Object} params
 * @param {string} params.sheetId
 * @param {string} params.sheetName
 * @param {string} params.apiKey
 * @returns {Promise<Array>} Array of rows
 */

export async function fetchGoogleSheet({ sheetId, sheetName, apiKey }) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
  const response = await axios.get(url);
  return response.data.values;
}