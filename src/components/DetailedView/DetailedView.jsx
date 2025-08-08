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
import { MainHeader } from "../Common/MainHeader";
import { PageLayout } from '../../layouts/PageLayout';

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
            py: 0.5 // Reduced padding
          }}>
            <Typography variant="caption" sx={{ 
              fontSize: '0.68rem', // Smaller font
              fontWeight: 700,
              lineHeight: 1.1,
              textAlign: 'center',
              color: header.priority === 'alert' ? '#d97706 !important' : 
                     header.priority === 'focus' ? '#2563eb !important' : '#374151 !important',
              '.dark &': {
                color: header.priority === 'alert' ? '#fbbf24 !important' : 
                       header.priority === 'focus' ? '#60a5fa !important' : 'rgb(241 245 249) !important',
              }
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
                gap: 0.3, // Smaller gap
                width: '100%'
              }}>
                <Typography variant="body2" sx={{ 
                  color: "#d97706 !important",
                  fontWeight: 600,
                  fontSize: '0.7rem', // Smaller font
                  backgroundColor: '#fef3c7',
                  px: 0.8, // Smaller padding
                  py: 0.2,
                  borderRadius: 0.5,
                  '.dark &': {
                    color: "#fbbf24 !important",
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  }
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
                gap: 0.3,
                width: '100%'
              }}>
                <Typography variant="body2" sx={{ 
                  color: "#2563eb !important",
                  fontWeight: 500,
                  fontSize: '0.7rem', // Smaller font
                  backgroundColor: '#dbeafe',
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 0.5,
                  '.dark &': {
                    color: "#60a5fa !important",
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  }
                }}>
                  {formattedValue}
                </Typography>
              </Box>
            );
          } else {
            return (
              <Typography variant="body2" sx={{ 
                color: formattedValue === '-' || formattedValue === 'N/A' || formattedValue === 'TBD' || formattedValue === '0'
                  ? "#94a3b8 !important" 
                  : "#374151 !important",
                fontSize: '0.7rem', // Smaller font
                fontWeight: formattedValue === '-' || formattedValue === 'N/A' || formattedValue === 'TBD' ? 400 : 500,
                wordBreak: header.key === "remarks" ? 'break-word' : 'normal',
                textAlign: ["remarks", "projectTitle"].includes(header.key) ? 'left' : 'center',
                width: '100%',
                fontStyle: formattedValue === 'N/A' || formattedValue === 'TBD' ? 'italic' : 'normal',
                '.dark &': {
                  color: formattedValue === '-' || formattedValue === 'N/A' || formattedValue === 'TBD' || formattedValue === '0'
                    ? "rgb(148 163 184) !important" 
                    : "rgb(241 245 249) !important",
                }
              }}>
                {formattedValue}
              </Typography>
            );
          }
        },
      })),
    [filteredHeaders]
  );

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <MainHeader 
          title="Detailed Project View"
          subtitle="Comprehensive table view of all project data with advanced filtering and search capabilities."
        />
        <LoadingState message="Loading detailed project data from Google Sheets..." />
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <MainHeader 
          title="Detailed Project View"
          subtitle="Error loading project data"
        />
        <ErrorState error={error} onRetry={refetch} />
      </PageLayout>
    );
  }

  // Empty state
  if (!projectsData || projectsData.length === 0) {
    return (
      <PageLayout>
        <MainHeader 
          title="Detailed Project View"
          subtitle="Comprehensive table view of all project data with advanced filtering and search capabilities."
        />
        <EmptyDataState />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <MainHeader 
        title="Detailed Project View"
        subtitle="Comprehensive table view of all project data with advanced filtering and search capabilities."
        lastUpdated={lastUpdated}
      >
        <div className="text-xs text-green-600 dark:text-green-400">
          • Live data ({projectsData.length} projects)
        </div>
      </MainHeader>

      <DetailedViewContent 
        projectsData={projectsData}
        rows={rows}
        columns={columns}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearSearch={clearSearch}
        filteredHeaders={filteredHeaders}
      />
    </PageLayout>
  );
};

const DetailedViewContent = ({
  projectsData,
  rows,
  columns,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  clearSearch,
  filteredHeaders
}) => {
  return (
    <div className="space-y-3"> {/* Further reduced spacing */}
     

      <Paper                                     
        elevation={2} 
        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-lg"
        sx={{
          height: 'calc(100vh - 140px)', // More height for table
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'white',
          '.dark &': {
            backgroundColor: 'rgb(15 23 42)',
          }
        }}
      >
        {/* Compact Header - Inside table container */}
        <div className="p-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800"> {/* Reduced padding */}
          {/* Single row with all controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Left side - Title and search */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem' }} // Smaller title
                className="!text-gray-900 dark:!text-slate-100 whitespace-nowrap"
              >
                📊 Project Data
              </Typography>
              
              {/* Compact Search Bar */}
              <Box sx={{ flex: '0 0 auto', minWidth: '240px', maxWidth: '320px' }}> {/* Smaller search */}
                <TextField
                  className="bg-white dark:bg-slate-700"
                  variant="outlined"
                  size="small"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={14} style={{ color: '#6b7280' }} className="text-gray-500 dark:text-slate-400" />
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
                          <X size={12} />
                        </Box>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '4px', // Smaller radius
                      fontSize: '0.8rem', // Smaller text
                      height: '32px', // Smaller height
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
                        padding: '6px 10px', // Smaller padding
                        '&::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
                        }
                      }
                    }
                  }}
                />
              </Box>

              {/* Search Results - Inline */}
              {searchTerm && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  backgroundColor: '#f1f5f9',
                  borderRadius: '3px',
                  px: 1,
                  py: 0.3,
                  fontSize: '0.7rem'
                }}>
                  <Box sx={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    backgroundColor: rows.length > 0 ? '#10b981' : '#f59e0b'
                  }} />
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: '#374151'
                  }}>
                    {rows.length} result{rows.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
            </div>

            {/* Right side - View mode buttons */}
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap className="!text-gray-600 dark:!text-slate-400">
              {["all", "alerts", "focus", "standard", "everything"].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "contained" : "outlined"}
                  color={viewMode === mode ? "primary" : "inherit"}
                  size="small"
                  onClick={() => setViewMode(mode)}
                  sx={{ 
                    fontSize: '0.65rem', // Smaller font
                    px: 0.8, // Smaller padding
                    py: 0.3,
                    minHeight: '24px', // Smaller height
                    minWidth: 'auto'
                  }}
                >
                  {mode === "all" && "🔍 Key"}
                  {mode === "alerts" && "🚨 Alert"}
                  {mode === "focus" && "📌 Focus"}
                  {mode === "standard" && "📋 Standard"}
                  {mode === "everything" && "🗂️ All"}
                </Button>
              ))}
            </Stack>
          </div>

          {/* Info Bar - More compact */}
          <Typography className="!text-gray-500 dark:!text-slate-500 mt-1"
            variant="caption" sx={{ fontSize: '0.7rem', display: 'block' }}>
            {rows.length} projects • {filteredHeaders.length} columns • {
              viewMode === "everything" ? "All fields" : 
              viewMode === "alerts" ? "Alert fields" :
              viewMode === "focus" ? "Focus fields" :
              viewMode === "standard" ? "Standard fields" : "Key fields"
            }
          </Typography>
        </div>

        {/* DataGrid Container - Maximum space */}
        <Box sx={{ flex: 1, width: '100%', overflow: 'hidden' }}>
          <DataGrid
            className="bg-white dark:bg-slate-900"
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
            columnHeaderHeight={44} // Further reduced
            rowHeight={38} // Further reduced
            sx={{
              height: '100%',
              width: '100%',
              border: 'none',
              '& .MuiDataGrid-main': {
                overflow: 'hidden'
              },
              '& .MuiDataGrid-columnHeaders': { 
                backgroundColor: "#f8fafc !important",
                borderBottom: "2px solid #e2e8f0",
                '.dark &': {
                  backgroundColor: "rgb(30 41 59) !important",
                  borderBottomColor: "rgb(51 65 85) !important",
                },
                '& .MuiDataGrid-columnHeader': {
                  padding: '4px 3px', // Further reduced padding
                  borderRight: '1px solid #e2e8f0',
                  '.dark &': {
                    borderRightColor: 'rgb(51 65 85)',
                    backgroundColor: 'rgb(30 41 59) !important',
                  },
                  '&:hover': {
                    backgroundColor: '#f1f5f9 !important',
                    '.dark &': {
                      backgroundColor: 'rgb(51 65 85) !important',
                    }
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    color: '#374151 !important',
                    fontWeight: '600 !important',
                    fontSize: '0.68rem !important', // Even smaller font
                    '.dark &': {
                      color: 'rgb(226 232 240) !important',
                    }
                  },
                  '& .MuiDataGrid-columnHeaderTitleContainer': {
                    color: 'inherit !important',
                    justifyContent: 'center',
                    '.dark &': {
                      color: 'rgb(226 232 240) !important',
                    }
                  },
                  '& .MuiTypography-caption': {
                    color: '#374151 !important',
                    '.dark &': {
                      color: 'rgb(226 232 240) !important',
                    }
                  },
                  '& .MuiDataGrid-iconButtonContainer': {
                    '& .MuiIconButton-root': {
                      color: '#6b7280 !important',
                      padding: '2px', // Smaller icon buttons
                      '.dark &': {
                        color: 'rgb(203 213 225) !important',
                      }
                    }
                  },
                  '& .MuiDataGrid-menuIcon': {
                    color: '#6b7280 !important',
                    '.dark &': {
                      color: 'rgb(203 213 225) !important',
                    }
                  }
                }
              },
              '& .MuiDataGrid-cell': { 
                padding: '2px 4px', // Further reduced padding
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #f1f5f9',
                color: '#374151',
                fontSize: '0.75rem', // Smaller font
                '.dark &': {
                  borderBottomColor: 'rgb(71 85 105)',
                  color: 'rgb(241 245 249)',
                }
              },
              '& .MuiDataGrid-row': {
                backgroundColor: 'white',
                '.dark &': {
                  backgroundColor: 'rgb(15 23 42)',
                },
                '&:hover': {
                  backgroundColor: "#f8fafc",
                  '.dark &': {
                    backgroundColor: 'rgb(51 65 85)',
                  }
                },
                '&:nth-of-type(even)': {
                  backgroundColor: '#fafbfb',
                  '.dark &': {
                    backgroundColor: 'rgba(51, 65, 85, 0.5)',
                  }
                }
              },
              '& .MuiDataGrid-columnSeparator': {
                visibility: 'visible',
                color: '#e2e8f0',
                '.dark &': {
                  color: 'rgb(71 85 105)',
                }
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                minHeight: '36px', // Smaller footer
                '.dark &': {
                  borderTopColor: 'rgb(71 85 105)',
                  backgroundColor: 'rgb(51 65 85)',
                },
                '& .MuiTablePagination-root': {
                  color: '#374151',
                  fontSize: '0.75rem', // Smaller pagination text
                  '.dark &': {
                    color: 'rgb(241 245 249)',
                  }
                },
                '& .MuiIconButton-root': {
                  color: '#6b7280',
                  padding: '4px', // Smaller pagination buttons
                  '.dark &': {
                    color: 'rgb(203 213 225)',
                  }
                }
              },
              '& .MuiDataGrid-sortIcon': {
                color: '#6b7280',
                '.dark &': {
                  color: 'rgb(203 213 225)',
                }
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#374151',
                fontSize: '0.75rem',
                '.dark &': {
                  color: 'rgb(241 245 249)',
                }
              },
              '& .MuiDataGrid-filler': {
                backgroundColor: "#f8fafc !important",
                '.dark &': {
                  backgroundColor: "rgb(30 41 59) !important",
                }
              },
              '& .MuiDataGrid-scrollbarFiller': {
                backgroundColor: "#f8fafc !important",
                '.dark &': {
                  backgroundColor: "rgb(30 41 59) !important",
                }
              },
              '& .MuiDataGrid-scrollbarFiller--header': {
                backgroundColor: "#f8fafc !important",
                '.dark &': {
                  backgroundColor: "rgb(30 41 59) !important",
                }
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: 'white',
                '.dark &': {
                  backgroundColor: 'rgb(15 23 42)',
                }
              },
              '& .MuiDataGrid-overlayWrapper': {
                backgroundColor: 'white',
                '.dark &': {
                  backgroundColor: 'rgb(15 23 42)',
                }
              },
            }}
          />
        </Box>
      </Paper>
    </div>
  );
};

export default DetailedView;