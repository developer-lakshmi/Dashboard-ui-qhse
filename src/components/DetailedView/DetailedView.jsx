import React, { useState, useMemo } from "react";
import { fieldPriorities } from "../../data"; // Keep this for field priorities configuration
import { useGoogleSheets } from '../../hooks/useGoogleSheets'; // Add this import
import {
  Paper, Typography, Box, Chip, Button, Stack, TextField, InputAdornment
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AlertTriangle, Star, Info, User, Calendar, ClipboardList, BadgeCheck, TrendingUp, Search, X } from "lucide-react";

// Import common components for consistent loading/error states
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";
import { EmptyDataState } from "../common/EmptyDataState";

// Field labels using the correct Google Sheets field names
const fieldLabels = {
  srNo: "Sr No",
  projectNo: "Project No", 
  projectTitle: "Project Title",
  client: "Client",
  projectManager: "Project Manager",
  projectQualityEng: "Project Quality Engineer",
  projectStartingDate: "Project Starting Date",
  projectClosingDate: "Project Closing Date",
  projectExtension: "Project Extension",
  manHourForQuality: "Manhours for Quality",
  manhoursUsed: "Manhours Used",
  manhoursBalance: "Manhours Balance",
  qualityBillabilityPercent: "Quality Billability %",
  projectQualityPlanStatusRev: "Project Quality Plan Status - Rev",
  projectQualityPlanStatusIssueDate: "Project Quality Plan Status - Issue Date",
  projectAudit1: "Project Audit -1",
  projectAudit2: "Project Audit -2",
  projectAudit3: "Project Audit -3",
  projectAudit4: "Project Audit -4",
  clientAudit1: "Client Audit -1",
  clientAudit2: "Client Audit -2",
  delayInAuditsNoDays: "Delay in Audits - No. of Days",
  carsOpen: "CARs Open",
  carsDelayedClosingNoDays: "CARs Delayed Closing No. Days",
  carsClosed: "CARs Closed",
  obsOpen: "No. of Obs Open",
  obsDelayedClosingNoDays: "Obs Delayed Closing No. of Days",
  obsClosed: "Obs Closed",
  projectKPIsAchievedPercent: "Project KPIs Achieved %",
  projectCompletionPercent: "Project Completion %",
  remarks: "Remarks"
};

// Create priority map from your existing configuration
const priorityMap = {};
if (fieldPriorities?.highPriority) {
  fieldPriorities.highPriority.forEach(key => priorityMap[key] = "alert");
}
if (fieldPriorities?.focusInformation) {
  fieldPriorities.focusInformation.forEach(key => priorityMap[key] = "focus");
}
if (fieldPriorities?.standardInformation) {
  fieldPriorities.standardInformation.forEach(key => {
    if (!priorityMap[key]) priorityMap[key] = "standard";
  });
}

// Set default priorities for Google Sheets fields
const defaultPriorities = {
  // Alert fields (high priority)
  qualityBillabilityPercent: "alert",
  delayInAuditsNoDays: "alert",
  carsOpen: "alert",
  carsDelayedClosingNoDays: "alert",
  obsOpen: "alert",
  obsDelayedClosingNoDays: "alert",
  projectKPIsAchievedPercent: "alert",
  
  // Focus fields
  projectAudit1: "focus",
  projectAudit2: "focus",
  projectAudit3: "focus",
  projectAudit4: "focus",
  clientAudit1: "focus",
  clientAudit2: "focus",
  carsClosed: "focus",
  obsClosed: "focus",
  projectQualityPlanStatusRev: "focus",
  
  // Standard fields (everything else)
  srNo: "standard",
  projectNo: "standard",
  projectTitle: "standard",
  client: "standard",
  projectManager: "standard",
  projectQualityEng: "standard",
  projectStartingDate: "standard",
  projectClosingDate: "standard",
  projectExtension: "standard",
  manHourForQuality: "standard",
  manhoursUsed: "standard",
  manhoursBalance: "standard",
  projectCompletionPercent: "standard",
  remarks: "standard"
};

// Merge with defaults
Object.keys(defaultPriorities).forEach(key => {
  if (!priorityMap[key]) {
    priorityMap[key] = defaultPriorities[key];
  }
});

const colorMap = {
  alert: "warning",
  focus: "info",
  standard: "default"
};

// Get all available field keys from Google Sheets mapping
const allKeys = Object.keys(fieldLabels);

const allHeaders = allKeys.map((key) => ({
  key,
  label: fieldLabels[key] || key,
  priority: priorityMap[key] || "standard",
  color: colorMap[priorityMap[key] || "standard"]
}));

// Default headers for basic view
const basicHeaders = [
  { key: "srNo", label: "Sr No", priority: "standard", color: colorMap.standard },
  { key: "projectNo", label: "Project No", priority: "standard", color: colorMap.standard },
  { key: "projectTitle", label: "Project Title", priority: "standard", color: colorMap.standard },
  { key: "client", label: "Client", priority: "standard", color: colorMap.standard },
  { key: "qualityBillabilityPercent", label: "Quality Billability %", priority: "alert", color: colorMap.alert },
  { key: "projectKPIsAchievedPercent", label: "Project KPIs Achieved %", priority: "alert", color: colorMap.alert },
  { key: "carsOpen", label: "CARs Open", priority: "alert", color: colorMap.alert },
  { key: "obsOpen", label: "Obs Open", priority: "alert", color: colorMap.alert },
  { key: "remarks", label: "Remarks", priority: "standard", color: colorMap.standard }
];

// Updated getCellChip function - Clean and minimal
const getCellChip = (header, value) => {
  // Handle KPI status colors based on percentage values
  if (header.key === "projectKPIsAchievedPercent" || header.key === "qualityBillabilityPercent") {
    // Check if value is empty, N/A, or contains Excel error
    if (!value || value === '' || value === 'N/A' || value === null || value === undefined || 
        value === '#DIV/0!' || String(value).includes('#DIV/0!') || String(value).includes('#ERROR')) {
      return (
        <Typography variant="body2" sx={{ 
          color: "#94a3b8", 
          fontSize: '0.8rem',
          fontStyle: 'italic',
          fontWeight: 400
        }}>
          N/A
        </Typography>
      );
    }

    // If we have a value, process it normally
    const numericValue = parseFloat(value?.toString().replace('%', '')) || 0;
    let color = "default";
    let chipBgColor = '#f3f4f6';
    let chipTextColor = '#6b7280';
    
    if (numericValue >= 90) {
      color = "success";
      chipBgColor = '#f0fdf4';
      chipTextColor = '#15803d';
    } else if (numericValue >= 70) {
      color = "info";
      chipBgColor = '#e0f2fe';
      chipTextColor = '#0369a1';
    } else if (numericValue >= 50) {
      color = "warning";
      chipBgColor = '#fffbeb';
      chipTextColor = '#f59e0b';
    } else {
      color = "error";
      chipBgColor = '#fef2f2';
      chipTextColor = '#ef4444';
    }
    
    // Show ONLY the chip with percentage and icon - clean and minimal
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
        <Chip
          icon={<AlertTriangle size={14} />}
          label={`${Math.round(numericValue)}%`}
          color={color}
          size="small"
          sx={{ 
            fontWeight: 600, 
            fontSize: '0.7rem', 
            minWidth: 'auto',
            backgroundColor: chipBgColor,
            color: chipTextColor,
          }}
        />
      </Box>
    );
  }

  // For alert priority fields - CLEAN: Show value + icon only
  if (header.priority === "alert") {
    if (!value || value === '' || value === 'N/A' || value === null || value === undefined ||
        value === '#DIV/0!' || String(value).includes('#DIV/0!') || String(value).includes('#ERROR')) {
      return (
        <Typography variant="body2" sx={{ 
          color: "#94a3b8", 
          fontSize: '0.8rem',
          fontStyle: 'italic',
          fontWeight: 400
        }}>
          {header.key.includes('Percent') ? 'N/A' : 
           ['carsOpen', 'obsOpen', 'carsClosed', 'obsClosed'].includes(header.key) ? '0' :
           header.key.includes('Date') ? 'TBD' : '-'}
        </Typography>
      );
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 0.5, 
        width: '100%'
      }}>
        <AlertTriangle size={16} color="#d97706" />
        <Typography variant="body2" sx={{ 
          color: "#d97706",
          fontWeight: 500,
          fontSize: '0.8rem'
        }}>
          {value}
        </Typography>
      </Box>
    );
  }

  // For focus priority fields - CLEAN: Show value + icon only
  if (header.priority === "focus") {
    if (!value || value === '' || value === 'N/A' || value === null || value === undefined ||
        value === '#DIV/0!' || String(value).includes('#DIV/0!') || String(value).includes('#ERROR')) {
      return (
        <Typography variant="body2" sx={{ 
          color: "#94a3b8", 
          fontSize: '0.8rem',
          fontStyle: 'italic',
          fontWeight: 400
        }}>
          {header.key.includes('Percent') ? 'N/A' : 
           ['carsOpen', 'obsOpen', 'carsClosed', 'obsClosed'].includes(header.key) ? '0' :
           header.key.includes('Date') ? 'TBD' : '-'}
        </Typography>
      );
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 0.5, 
        width: '100%'
      }}>
        <Info size={16} color="#2563eb" />
        <Typography variant="body2" sx={{ 
          color: "#2563eb",
          fontWeight: 500,
          fontSize: '0.8rem'
        }}>
          {value}
        </Typography>
      </Box>
    );
  }
  
  return null;
};

const DetailedView = () => {
  const { data: projectsData, loading, error, lastUpdated, refetch } = useGoogleSheets();
  const [viewMode, setViewMode] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Add search state

  // Debug: Log first project to verify field structure (only when data exists)
  if (projectsData && projectsData.length > 0) {
    console.log('🔍 DetailedView - First project structure:', {
      srNo: projectsData[0].srNo,
      projectNo: projectsData[0].projectNo,
      projectTitle: projectsData[0].projectTitle,
      client: projectsData[0].client,
      qualityBillabilityPercent: projectsData[0].qualityBillabilityPercent,
      carsOpen: projectsData[0].carsOpen,
      obsOpen: projectsData[0].obsOpen,
      projectKPIsAchievedPercent: projectsData[0].projectKPIsAchievedPercent
    });
  }

  // Helper function to get filtered headers
  const getFilteredHeaders = (currentViewMode) => {
    if (currentViewMode === "everything") return allHeaders;
    let filtered;
    switch (currentViewMode) {
      case "alerts":
        filtered = allHeaders.filter((h) => h.priority === "alert");
        break;
      case "focus":
        filtered = allHeaders.filter((h) => h.priority === "focus");
        break;
      case "standard":
        filtered = allHeaders.filter((h) => h.priority === "standard");
        // Exclude some complex fields in "standard" view for simplicity
        const excludeKeys = [
          "projectQualityPlanStatusRev", "projectQualityPlanStatusIssueDate",
          "delayInAuditsNoDays", "carsDelayedClosingNoDays", "obsDelayedClosingNoDays"
        ];
        filtered = filtered.filter(f => !excludeKeys.includes(f.key));
        break;
      default:
        filtered = basicHeaders;
    }
    
    // Always include essential project identification fields
    const mustHaveKeys = ["srNo", "projectNo", "projectTitle"];
    const rest = filtered.filter(f => !mustHaveKeys.includes(f.key));
    const ordered = mustHaveKeys
      .map(key => allHeaders.find(f => f.key === key))
      .filter(Boolean)
      .concat(rest);
    return ordered;
  };

  // MOVE ALL HOOKS HERE - BEFORE ANY CONDITIONAL RETURNS
  const filteredHeaders = useMemo(() => getFilteredHeaders(viewMode), [viewMode]);

  // Smart column width calculation
  const getColumnWidth = (header) => {
    const baseWidth = header.label.length * 10;
    switch (header.key) {
      case "srNo":
        return 80;
      case "projectNo":
        return 140;
      case "projectTitle":
        return Math.max(250, baseWidth);
      case "client":
        return Math.max(150, baseWidth);
      case "projectManager":
      case "projectQualityEng":
        return Math.max(180, baseWidth);
      case "remarks":
        return 300;
      case "qualityBillabilityPercent":
      case "projectKPIsAchievedPercent":
        return 180;
      case "carsOpen":
      case "obsOpen":
      case "carsClosed":
      case "obsClosed":
        return 120;
      case "delayInAuditsNoDays":
      case "carsDelayedClosingNoDays":
      case "obsDelayedClosingNoDays":
        return 160;
      default:
        return Math.max(120, Math.min(200, baseWidth));
    }
  };

  // Enhanced empty value handling
  const formatCellValue = (value, header) => {
    if (value === null || value === undefined || value === '' || value === 'N/A' ||
        value === '#DIV/0!' || String(value).includes('#DIV/0!') || String(value).includes('#ERROR')) {
      // For percentage fields, show more context
      if (header.key.includes('Percent') || header.key.includes('%')) {
        return 'N/A';
      }
      // For count fields (numbers), show 0 or -
      if (['carsOpen', 'obsOpen', 'carsClosed', 'obsClosed'].includes(header.key)) {
        return '0';
      }
      // For manhours fields, show 0
      if (header.key.includes('manhour') || header.key.includes('manHour')) {
        return '0';
      }
      // For dates, show more descriptive
      if (header.key.includes('Date')) {
        return 'TBD';
      }
      // Default for text fields
      return '-';
    }
    return value;
  };

  // Enhanced rows with search filtering (KEEP THIS ONE)
  const rows = useMemo(() => {
    if (!projectsData) return [];
    
    let filteredData = projectsData;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = projectsData.filter(row => {
        const searchableFields = [
          row.projectNo,
          row.projectTitle,
          row.client,
          row.projectManager,
          row.projectQualityEng
        ];
        
        return searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filteredData.map((row, idx) => ({
      id: row.srNo || idx + 1,
      ...row,
    }));
  }, [projectsData, searchTerm]);

  // Clear search function
  const clearSearch = () => {
    setSearchTerm("");
  };

  // DataGrid columns with enhanced rendering
  const columns = useMemo(
    () =>
      filteredHeaders.map((header) => ({
        field: header.key,
        headerName: header.label,
        width: getColumnWidth(header),
        headerAlign: "center",
        align: ["remarks", "projectTitle"].includes(header.key) ? "left" : "center",
        sortable: true,
        resizable: true,
        renderHeader: () => (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center',
            py: 1
          }}>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center',
              color: header.priority === 'alert' ? '#d97706' : 
                     header.priority === 'focus' ? '#2563eb' : '#374151'
            }}>
              {header.label}
            </Typography>
          </Box>
        ),
        renderCell: (params) => {
          const value = params.value;
          const formattedValue = formatCellValue(value, header);
          
          if (header.key === "projectKPIsAchievedPercent" || header.key === "qualityBillabilityPercent") {
            return getCellChip(header, value);
          } else if (header.priority === "alert") {
            return (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 0.5, 
                width: '100%'
              }}>
                <Typography variant="body2" sx={{ 
                  color: "#d97706",
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  backgroundColor: '#fef3c7',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1
                }}>
                  {formattedValue}
                </Typography>
              </Box>
            );
          } else if (header.priority === "focus") {
            return (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 0.5, 
                width: '100%'
              }}>
                <Typography variant="body2" sx={{ 
                  color: "#2563eb",
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  backgroundColor: '#dbeafe',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1
                }}>
                  {formattedValue}
                </Typography>
              </Box>
            );
          } else {
            return (
              <Typography variant="body2" sx={{ 
                color: formattedValue === '-' || formattedValue === 'N/A' || formattedValue === 'TBD' || formattedValue === '0'
                  ? "#94a3b8" 
                  : "#374151",
                fontSize: '0.8rem',
                fontWeight: formattedValue === '-' || formattedValue === 'N/A' || formattedValue === 'TBD' ? 400 : 500,
                wordBreak: header.key === "remarks" ? 'break-word' : 'normal',
                textAlign: ["remarks", "projectTitle"].includes(header.key) ? 'left' : 'center',
                width: '100%',
                fontStyle: formattedValue === 'N/A' || formattedValue === 'TBD' ? 'italic' : 'normal'
              }}>
                {formattedValue}
              </Typography>
            );
          }
        },
      })),
    [filteredHeaders]
  );

  // NOW HANDLE CONDITIONAL RETURNS AFTER ALL HOOKS
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 2, height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Loading detailed project data from Google Sheets..." />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2, height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ErrorState error={error} onRetry={refetch} />
      </Box>
    );
  }

  // Empty state
  if (!projectsData || projectsData.length === 0) {
    return (
      <Box sx={{ p: 2, height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyDataState />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      p: 2,
      overflow: 'hidden'
    }}>
      <Paper 
        elevation={2} 
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Header Section */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
            📊 Detailed Project Information
          </Typography>

          {/* Compact Professional Search Bar */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '0 0 auto', minWidth: '300px', maxWidth: '400px' }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: '#6b7280' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <Box
                        component="button"
                        onClick={clearSearch}
                        sx={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          p: 0.5,
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#6b7280',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                            color: '#374151'
                          }
                        }}
                      >
                        <X size={14} />
                      </Box>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    height: '40px',
                    border: '1px solid #d1d5db',
                    '&:hover': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '& input': {
                      padding: '10px 12px',
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1
                      }
                    }
                  }
                }}
              />
            </Box>

            {/* Search Results - Compact Display */}
            {searchTerm && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                px: 1.5,
                py: 0.5,
                fontSize: '0.8rem'
              }}>
                <Box sx={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: rows.length > 0 ? '#10b981' : '#f59e0b'
                }} />
                <Typography variant="caption" sx={{ 
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  {rows.length} result{rows.length !== 1 ? 's' : ''}
                </Typography>
                <Button
                  size="small"
                  onClick={clearSearch}
                  sx={{
                    fontSize: '0.7rem',
                    color: '#6b7280',
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 0.25,
                    ml: 0.5,
                    '&:hover': {
                      backgroundColor: '#e5e7eb'
                    }
                  }}
                >
                  ✕
                </Button>
              </Box>
            )}
          </Box>

          {/* View Mode Buttons */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {["all", "alerts", "focus", "standard", "everything"].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "contained" : "outlined"}
                color={viewMode === mode ? "primary" : "inherit"}
                size="small"
                onClick={() => setViewMode(mode)}
                sx={{ 
                  fontSize: '0.75rem',
                  px: 1.5,
                  py: 0.5
                }}
              >
                {mode === "all" && "🔍 Key Fields"}
                {mode === "alerts" && "🚨 Alerts"}
                {mode === "focus" && "📌 Focus"}
                {mode === "standard" && "📋 Standard"}
                {mode === "everything" && "🗂️ All"}
              </Button>
            ))}
          </Stack>

          {/* Compact Info Bar */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {rows.length} projects • {filteredHeaders.length} columns • {
              viewMode === "everything" ? "All fields" : 
              viewMode === "alerts" ? "Alert fields" :
              viewMode === "focus" ? "Focus fields" :
              viewMode === "standard" ? "Standard fields" : "Key fields"
            }
          </Typography>
        </Box>

        {/* DataGrid Container */}
        <Box sx={{ flex: 1, width: '100%', overflow: 'hidden' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination={true}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
            sortingOrder={['asc', 'desc']}
            disableColumnMenu={false}
            columnHeaderHeight={60}
            rowHeight={50}
            sx={{
              height: '100%',
              width: '100%',
              border: 'none',
              '& .MuiDataGrid-main': {
                overflow: 'hidden'
              },
              '& .MuiDataGrid-columnHeaders': { 
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
                '& .MuiDataGrid-columnHeader': {
                  padding: '8px 4px',
                }
              },
              '& .MuiDataGrid-cell': { 
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #f1f5f9'
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: "#f8fafc"
                },
                '&:nth-of-type(even)': {
                  backgroundColor: '#fafbfb'
                }
              },
              '& .MuiDataGrid-columnSeparator': {
                visibility: 'visible',
                color: '#e2e8f0'
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DetailedView;