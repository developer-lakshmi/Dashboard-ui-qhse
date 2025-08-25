import { useEffect, useState, useCallback } from 'react';
import { DATA_CONFIG } from '../../api/dataConfig';
import { fetchGoogleSheet } from '../../api/Api';

const { sheetId, sheetName } = DATA_CONFIG.spotCheckRegister;
const { apiKey } = DATA_CONFIG;

const FIELD_MAPPING = {
  'Sr No': 'srNo',
  'Project No': 'projectNo',
  'Project Title': 'projectTitle',
  'Client': 'client',
  'QHSE Engineer': 'qhseEngineer',
  'Date of Spot check': 'dateOfSpotCheck',
  'Time': 'time',
  'Document No.': 'documentNo',
  'Document Title': 'documentTitle',
  'Originator / Lead': 'originatorLead',
  'Comments': 'comments',
  'Category': 'category',
  'Remarks': 'remarks'
};

export function useQHSESpotCheckRegister(pollInterval = 3600000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchGoogleSheet({ sheetId, sheetName, apiKey });
      console.log("Fetched rows:", rows); // <-- Add this line
      if (!rows || rows.length < 2) {
        setData([]);
        setLoading(false);
        return;
      }
      const headers = rows[0];
      const items = rows.slice(1).map(row => {
        const item = {};
        headers.forEach((header, idx) => {
          const key = FIELD_MAPPING[header.trim()];
          if (key) item[key] = row[idx] || '';
        });
        return item;
      });
      setData(items);
    } catch (error) {
      setData([]);
    }
    setLoading(false);
  }, [sheetId, sheetName, apiKey]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return { data, loading };
}