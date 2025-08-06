import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Your Google Sheets configuration
const SHEET_ID = '1gPwSaDEY84dkfqf78nzhdtxT-j1TaJWsaS_15gpraV4';
// const SHEET_NAME = 'Sheet1';
const SHEET_NAME = 'QHSE running projects status'; // Ensure this matches your actual sheet name
const API_KEY = 'AIzaSyAMPpWHmtO3asVWSppJS_iWiWQS6cft2oo';

// Updated field mapping to match your ACTUAL Google Sheets headers
const FIELD_MAPPING = {
  'Sr No': 'srNo',
  'Project No': 'projectNo',
  'Project Title': 'projectTitle',
  'Client': 'client',
  'Project Manager': 'projectManager',
  'Project Starting Date': 'projectStartingDate',
  'Project Closing Date': 'projectClosingDate',
  'Project Extension': 'projectExtension',
  'Project Quality Engineer': 'projectQualityEng',
  'Manhours for Quality': 'manHourForQuality',
  'Manhours Used': 'manhoursUsed',
  'Manhours Balance': 'manhoursBalance',
  'Quality Billability %': 'qualityBillabilityPercent',
  'Project Quality Plan status - Rev': 'projectQualityPlanStatusRev',
  'Project Quality Plan status - Issued Date': 'projectQualityPlanStatusIssueDate',
  'Project Audit -1': 'projectAudit1',
  'Project Audit -2': 'projectAudit2',
  'Project Audit -3': 'projectAudit3',
  'Project Audit -4': 'projectAudit4',
  'Client Audit -1': 'clientAudit1',
  'Client Audit -2': 'clientAudit2',
  'Delay in Audits - No. of Days': 'delayInAuditsNoDays',
  'CARs Open': 'carsOpen',
  'CARs Delayed closing No. days': 'carsDelayedClosingNoDays',
  'CARs Closed': 'carsClosed',
  'No. of Obs Open': 'obsOpen',
  'Obs delayed closing No. of Days': 'obsDelayedClosingNoDays',
  'Obs Closed': 'obsClosed',
  'Project KPIs Achieved %': 'projectKPIsAchievedPercent',
  'Project Compl. %': 'projectCompletionPercent',
  'Rejection of Deleverables %': 'rejectionOfDeliverablesPercent',     // ✅ NEW FIELD
  'Cost of Poor Quality               in AED': 'costOfPoorQualityAED', // ✅ NEW FIELD
  'Remarks': 'remarks'
};

// Helper function to convert any header to camelCase (fallback)
const toCamelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');
};

// Add this helper function after line 44 (after toCamelCase function)
const parseEuropeanDate = (dateString) => {
  if (!dateString || dateString === '' || dateString === 'N/A') {
    return dateString;
  }
  
  // Handle European format DD.MM.YYYY or DD.MM.YY
  if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('.');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Convert to ISO format
  }
  
  return dateString; // Return as-is for other formats
};

export function useGoogleSheets(pollInterval = 60000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSheetData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
      );

      const rows = res.data.values;
      if (!rows || rows.length === 0) {
        setData([]);
        return;
      }

      const headers = rows[0];
      
      // 🔍 DEBUG: Log headers to see mapping status
      console.log('🔍 Updated mapping status:');
      headers.forEach((header, index) => {
        const mappedField = FIELD_MAPPING[header];
        console.log(`  ${index}: "${header}" -> ${mappedField ? `✅ ${mappedField}` : '❌ UNMAPPED'}`);
      });

      const items = rows.slice(1).map((row, index) => {
        let item = {};
        headers.forEach((header, i) => {
          let value = row[i] || '';
          
          // Map header to camelCase field name
          const fieldName = FIELD_MAPPING[header] || toCamelCase(header);
          
          // 🔍 DEBUG: Log the first 5 basic fields for the first row
          if (index === 0 && ['Sr No', 'Project No', 'Project Title', 'Client', 'Project Manager'].includes(header)) {
            console.log(`🔍 Row 0 - Header: "${header}" -> Field: "${fieldName}" -> Value: "${value}"`);
          }
          
          // Handle specific field types based on your data structure
          if (['srNo', 'manHourForQuality', 'manhoursUsed', 'manhoursBalance',
               'delayInAuditsNoDays', 'carsOpen', 'carsDelayedClosingNoDays', 
               'carsClosed', 'obsOpen', 'obsDelayedClosingNoDays', 'obsClosed',
               'costOfPoorQualityAED'].includes(fieldName)) {  // ✅ Added costOfPoorQualityAED
            // Convert to number
            item[fieldName] = value === '' ? 0 : Number(value);
          } else if (fieldName.includes('Percent') || fieldName.includes('percent')) {
            // Keep percentage fields as strings (e.g., "100%") - rejectionOfDeliverablesPercent will be handled here
            item[fieldName] = value.toString();
          } else if (['projectStartingDate', 'projectClosingDate', 'projectExtension', 
                      'projectQualityPlanStatusIssueDate', 'projectAudit1', 'projectAudit2', 
                      'projectAudit3', 'projectAudit4', 'clientAudit1', 'clientAudit2'].includes(fieldName)) {
            // Parse European dates to ISO format
            item[fieldName] = parseEuropeanDate(value);
          } else {
            // Keep as string
            item[fieldName] = value.toString();
          }
        });
        
        // 🔍 DEBUG: Log the mapped basic fields for first item
        if (index === 0) {
          console.log('🔍 First item basic fields (after mapping fix):', {
            srNo: item.srNo,
            projectNo: item.projectNo,
            projectTitle: item.projectTitle,
            client: item.client,
            projectManager: item.projectManager,
            qualityBillabilityPercent: item.qualityBillabilityPercent,
            carsOpen: item.carsOpen,
            obsOpen: item.obsOpen,
            projectKPIsAchievedPercent: item.projectKPIsAchievedPercent,
            delayInAuditsNoDays: item.delayInAuditsNoDays,
            carsDelayedClosingNoDays: item.carsDelayedClosingNoDays,
            obsDelayedClosingNoDays: item.obsDelayedClosingNoDays,
            projectCompletionPercent: item.projectCompletionPercent,
            rejectionOfDeliverablesPercent: item.rejectionOfDeliverablesPercent, // ✅ NEW DEBUG
            costOfPoorQualityAED: item.costOfPoorQualityAED                      // ✅ NEW DEBUG
          });
        }
        
        return item;
      });

      setData(items);
      setError(null);
      setLastUpdated(new Date());
      console.log('✅ Google Sheets data loaded with corrected mapping:', items.length, 'projects');
      
    } catch (err) {
      console.error('❌ Error fetching sheet data:', err);
      setError(err.message || 'Failed to fetch Google Sheets data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheetData();
    // Poll for updates every 60 seconds
    const interval = setInterval(fetchSheetData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchSheetData, pollInterval]);

  return { data, loading, error, refetch: fetchSheetData, lastUpdated };
}