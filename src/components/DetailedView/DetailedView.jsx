import React, { useState, useMemo } from "react";
import { fieldPriorities } from "../../data"; // Keep this for field priorities configuration
import { useGoogleSheets } from '../../hooks/useGoogleSheets'; // Add this import
import {
  Paper, Typography, Box, Chip, Button, Stack
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AlertTriangle, Star, Info, User, Calendar, ClipboardList, BadgeCheck, TrendingUp } from "lucide-react";

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

const getCellChip = (header, value) => {
  if (header.priority === "alert") {
    return (
      <Chip
        icon={<AlertTriangle size={14} />}
        label="Alert"
        color="warning"
        size="small"
        sx={{ ml: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
      />
    );
  }
  if (header.priority === "focus") {
    return (
      <Chip
        icon={<Info size={14} />}
        label="Focus"
        color="info"
        size="small"
        sx={{ ml: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
      />
    );
  }
  
  // Handle KPI status colors based on percentage values
  if (header.key === "projectKPIsAchievedPercent" || header.key === "qualityBillabilityPercent") {
    const numericValue = parseFloat(value?.toString().replace('%', '')) || 0;
    let color = "default";
    if (numericValue >= 90) color = "success";
    else if (numericValue >= 70) color = "info";
    else if (numericValue >= 50) color = "warning";
    else color = "error";
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</span>
        <Chip
          label={`${Math.round(numericValue)}%`}
          color={color}
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.7rem', minWidth: 'auto' }}
        />
      </Box>
    );
  }
  
  return null;
};

const iconForHeader = (header) => {
  // Alert (orange) - critical fields that need attention
  if (
    [
      "qualityBillabilityPercent",
      "projectQualityPlanStatusRev",
      "projectQualityPlanStatusIssueDate",
      "delayInAuditsNoDays",
      "carsOpen",
      "carsDelayedClosingNoDays",
      "obsOpen",
      "obsDelayedClosingNoDays",
      "projectKPIsAchievedPercent"
    ].includes(header.key)
  ) {
    return <AlertTriangle size={14} />;
  }
  // Focus (blue) - important tracking fields
  if (
    [
      "projectAudit1",
      "projectAudit2",
      "projectAudit3",
      "projectAudit4",
      "clientAudit1",
      "clientAudit2",
      "carsClosed",
      "obsClosed"
    ].includes(header.key)
  ) {
    return <Info size={14} />;
  }
  // Standard (gray) - basic information
  switch (header.key) {
    case "projectNo":
      return <ClipboardList size={14} />;
    case "projectTitle":
      return <Star size={14} />;
    case "client":
    case "projectManager":
    case "projectQualityEng":
      return <User size={14} />;
    case "projectStartingDate":
    case "projectClosingDate":
    case "projectExtension":
      return <Calendar size={14} />;
    case "projectCompletionPercent":
      return <TrendingUp size={14} />;
    default:
      return null;
  }
};

const DetailedView = () => {
  const { data: projectsData, loading, error, lastUpdated, refetch } = useGoogleSheets();
  const [viewMode, setViewMode] = useState("all");

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
            gap: 0.5,
            width: '100%',
            textAlign: 'center'
          }}>
            {iconForHeader(header)}
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center'
            }}>
              {header.label}
            </Typography>
          </Box>
        ),
        renderCell: (params) => {
          const value = params.value;
          
          if (header.key === "projectKPIsAchievedPercent" || header.key === "qualityBillabilityPercent") {
            return getCellChip(header, value);
          } else if (header.priority === "alert" || header.priority === "focus") {
            return (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 0.5, 
                width: '100%',
                flexWrap: 'wrap'
              }}>
                <Typography variant="body2" sx={{ 
                  color: header.priority === "alert" ? "#d97706" : "#2563eb",
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  textAlign: 'center'
                }}>
                  {value}
                </Typography>
                <Chip
                  color={header.color}
                  size="small"
                  icon={iconForHeader(header)}
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.65rem',
                    height: '20px',
                    '& .MuiChip-label': { px: 0.5 }
                  }}
                />
              </Box>
            );
          } else {
            return (
              <Typography variant="body2" sx={{ 
                color: "#64748b",
                fontSize: '0.8rem',
                wordBreak: header.key === "remarks" ? 'break-word' : 'normal',
                textAlign: ["remarks", "projectTitle"].includes(header.key) ? 'left' : 'center',
                width: '100%'
              }}>
                {value || '-'}
              </Typography>
            );
          }
        },
      })),
    [filteredHeaders]
  );

  // DataGrid expects each row to have an id
  const rows = useMemo(() => {
    if (!projectsData) return [];
    return projectsData.map((row, idx) => ({
      id: row.srNo || idx + 1,
      ...row,
    }));
  }, [projectsData]);

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
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
            📊 Detailed Project Information
          </Typography>

          {/* Data source info */}
          <Box sx={{ 
            mb: 2, 
            p: 1, 
            bgcolor: "success.50", 
            borderRadius: 1, 
            border: 1, 
            borderColor: "success.200" 
          }}>
            {/* <Typography variant="caption" sx={{ color: "success.800" }}>
              Live data from Google Sheets • {projectsData.length} projects • Last updated: {lastUpdated?.toLocaleTimeString() || 'Unknown'}
            </Typography> */}
          </Box>

          {/* View Mode Buttons */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {["all", "alerts", "focus", "standard", "everything"].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "contained" : "outlined"}
                color={viewMode === mode ? "primary" : "inherit"}
                size="small"
                onClick={() => setViewMode(mode)}
                sx={{ 
                  mb: 0.5,
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

          {/* Current view info */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Showing {filteredHeaders.length} columns • {
              viewMode === "everything" ? "All available fields" : 
              viewMode === "alerts" ? "High priority fields only" :
              viewMode === "focus" ? "Focus tracking fields" :
              viewMode === "standard" ? "Basic information fields" : "Key project fields"
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