import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Your Google Sheets configuration
const SHEET_ID = '1gPwSaDEY84dkfqf78nzhdtxT-j1TaJWsaS_15gpraV4';
const SHEET_NAME = 'QHSE running projects status';
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
  'Rejection of Deleverables %': 'rejectionOfDeliverablesPercent',     
  'Cost of Poor Quality               in AED': 'costOfPoorQualityAED', 
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

// ✅ NEW: Function to create a hash of the data content
const createDataHash = (data) => {
  const dataString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

// ✅ UPDATED: Changed default polling interval from 60 seconds to 1 hour
export function useGoogleSheets(pollInterval = 3600000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataLastChanged, setDataLastChanged] = useState(null); // ✅ NEW: Track when data actually changed
  const [previousDataHash, setPreviousDataHash] = useState(null); // ✅ NEW: Track data changes

  const fetchSheetData = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const dataRes = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
      );

      const rows = dataRes.data.values;
      if (!rows || rows.length === 0) {
        setData([]);
        return;
      }

      const headers = rows[0];
      
      // 🔍 DEBUG: Log headers to see mapping status (only on initial load to reduce console spam)
      if (isInitialLoad) {
        console.log('🔍 Google Sheets mapping status:');
        headers.forEach((header, index) => {
          const mappedField = FIELD_MAPPING[header];
          console.log(`  ${index}: "${header}" -> ${mappedField ? `✅ ${mappedField}` : '❌ UNMAPPED'}`);
        });
      }

      const items = rows.slice(1).map((row, index) => {
        let item = {};
        headers.forEach((header, i) => {
          let value = row[i] || '';
          
          // Map header to camelCase field name
          const fieldName = FIELD_MAPPING[header] || toCamelCase(header);
          
          // 🔍 DEBUG: Log the first 5 basic fields for the first row (only on initial load)
          if (isInitialLoad && index === 0 && ['Sr No', 'Project No', 'Project Title', 'Client', 'Project Manager'].includes(header)) {
            console.log(`🔍 Row 0 - Header: "${header}" -> Field: "${fieldName}" -> Value: "${value}"`);
          }
          
          // Handle specific field types based on your data structure
          if (['srNo', 'manHourForQuality', 'manhoursUsed', 'manhoursBalance',
               'delayInAuditsNoDays', 'carsOpen', 'carsDelayedClosingNoDays', 
               'carsClosed', 'obsOpen', 'obsDelayedClosingNoDays', 'obsClosed',
               'costOfPoorQualityAED'].includes(fieldName)) {
            // Convert to number
            item[fieldName] = value === '' ? 0 : Number(value);
          } else if (fieldName.includes('Percent') || fieldName.includes('percent')) {
            // Keep percentage fields as strings (e.g., "100%")
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
        
        // 🔍 DEBUG: Log the mapped basic fields for first item (only on initial load)
        if (isInitialLoad && index === 0) {
          console.log('🔍 First item basic fields (after mapping):', {
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
            rejectionOfDeliverablesPercent: item.rejectionOfDeliverablesPercent,
            costOfPoorQualityAED: item.costOfPoorQualityAED
          });
        }
        
        return item;
      });

      // ✅ NEW: Check if data actually changed
      const currentDataHash = createDataHash(items);
      const dataChanged = isInitialLoad || (previousDataHash !== null && currentDataHash !== previousDataHash);
      
      if (dataChanged) {
        console.log('📊 Data content changed - updating timestamp');
        setDataLastChanged(new Date());
      } else {
        console.log('📊 Data content unchanged - keeping previous timestamp');
      }

      setData(items);
      setError(null);
      setLastUpdated(new Date()); // When we last fetched
      setPreviousDataHash(currentDataHash); // Store hash for next comparison
      
      // ✅ UPDATED: Better logging with data change status
      const logMessage = isInitialLoad 
        ? `✅ Google Sheets data loaded: ${items.length} projects`
        : `🔄 Google Sheets data refreshed: ${items.length} projects ${dataChanged ? '(DATA CHANGED)' : '(NO CHANGES)'} (${new Date().toLocaleTimeString()})`;
      console.log(logMessage);
      
    } catch (err) {
      console.error('❌ Error fetching sheet data:', err);
      setError(err.message || 'Failed to fetch Google Sheets data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [previousDataHash]);

  // Manual refresh function that can be called by user
  const manualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchSheetData(false);
  }, [fetchSheetData]);

  useEffect(() => {
    // Initial load
    fetchSheetData(true);
    
    // Set up polling for updates every hour
    const interval = setInterval(() => {
      console.log('🕐 Hourly auto-refresh triggered');
      fetchSheetData(false);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchSheetData, pollInterval]);

  // ✅ UPDATED: Return data change timestamp instead of access timestamp
  return { 
    data, 
    loading,           // True only during initial load
    isRefreshing,      // True during background refreshes
    error, 
    refetch: manualRefresh,  // Manual refresh function
    lastUpdated,       // When we last fetched data
    dataLastChanged    // ✅ NEW: When the data content actually changed
  };
}