import React, { useState, useMemo } from "react";
import { projectsData, fieldPriorities } from "../../data";
import {
  Paper, Typography, Box, Chip, Button, Stack
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AlertTriangle, Star, Info, User, Calendar, ClipboardList, BadgeCheck, TrendingUp } from "lucide-react";

// Field labels and priorities
const fieldLabels = {
  srNo: "Sr No",
  projectNo: "RAD PROJECT NO",
  projectTitle: "Project Name",
  client: "CLIENT",
  projectManager: "Project Manager",
  projectQualityEng: "Project Quality Engineer",
  projectStartingDate: "Project Starting Date",
  projectClosingDate: "Project Closing Date",
  projectExtension: "Project Extension",
  manHourForQuality: "Manhours for Quality",
  manhoursUsed: "Manhours Used",
  manhoursBalance: "Manhours Balance",
  projectQualityPlanStatusRev: "Project Quality Plan Status",
  projectAudit1: "Project Audit -1",
  projectAudit2: "Project Audit -2",
  projectAudit3: "Project Audit -3",
  clientAudit1: "Client Audit -1",
  clientAudit2: "Client Audit -2",
  carsOpen: "CARs Open",
  carsClosed: "CARs Closed",
  obsOpen: "Obs Open",
  obsClosed: "Obs Closed",
  projectKPIStatus: "Project KPI Status",
  remarks: "Remarks"
};

const priorityMap = {};
fieldPriorities.highPriority.forEach(key => priorityMap[key] = "alert");
fieldPriorities.focusInformation.forEach(key => priorityMap[key] = "focus");
fieldPriorities.standardInformation.forEach(key => {
  if (!priorityMap[key]) priorityMap[key] = "standard";
});

const colorMap = {
  alert: "warning",
  focus: "info",
  standard: "default"
};

// Compose all headers for "Show Everything"
const allKeys = [
  "srNo",
  "projectNo",
  "projectTitle",
  "client",
  "projectManager",
  "projectQualityEng",
  "projectStartingDate",
  "projectClosingDate",
  "projectExtension",
  "manHourForQuality",
  "manhoursUsed",
  "manhoursBalance",
  "projectQualityPlanStatusRev",
  "projectAudit1",
  "projectAudit2",
  "projectAudit3",
  "clientAudit1",
  "clientAudit2",
  "carsOpen",
  "carsClosed",
  "obsOpen",
  "obsClosed",
  "projectKPIStatus",
  "remarks"
];

const allHeaders = allKeys.map((key) => ({
  key,
  label: fieldLabels[key] || key,
  priority: priorityMap[key] || "standard",
  color: colorMap[priorityMap[key] || "standard"]
}));

// Default headers for other views (short view)
const headers = [
  { key: "srNo", label: "Sr No", priority: "standard", color: colorMap.standard },
  { key: "projectNo", label: "Project No", priority: "standard", color: colorMap.standard },
  { key: "qualityBillabilityPercent", label: "Quality Billability %", priority: "alert", color: colorMap.alert },
  { key: "projectAudit1", label: "Project Audit 1", priority: "focus", color: colorMap.focus },
  { key: "remarks", label: "Remarks", priority: "standard", color: colorMap.standard }
];

const getCellChip = (header, value) => {
  if (header.priority === "alert") {
    return (
      <Chip
        icon={<AlertTriangle size={16} />}
        label="Alert"
        color="warning"
        size="small"
        sx={{ ml: 1, fontWeight: 600 }}
      />
    );
  }
  if (header.priority === "focus") {
    return (
      <Chip
        icon={<Info size={16} />}
        label="Focus"
        color="info"
        size="small"
        sx={{ ml: 1, fontWeight: 600 }}
      />
    );
  }
  if (header.key === "projectKPIStatus") {
    let color =
      value === "Green"
        ? "success"
        : value === "Yellow"
        ? "warning"
        : value === "Red"
        ? "error"
        : "default";
    return (
      <Chip
        label={value}
        color={color}
        size="small"
        sx={{ ml: 1, fontWeight: 600 }}
      />
    );
  }
  return null;
};

const iconForHeader = (header) => {
  // Alert (orange)
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
    return <AlertTriangle size={16} />;
  }
  // Focus (blue)
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
    return <Info size={16} />;
  }
  // Standard (gray)
  switch (header.key) {
    case "projectNo":
      return <ClipboardList size={16} />;
    case "projectTitle":
      return <Star size={16} />;
    case "client":
    case "projectManager":
    case "projectQualityEng":
      return <User size={16} />;
    case "projectStartingDate":
    case "projectClosingDate":
      return <Calendar size={16} />;
    case "projectKPIStatus":
      return <BadgeCheck size={16} />;
    default:
      return null;
  }
};

function ensureProjectColumns(headers) {
  const mustHave = ["projectNo", "projectTitle"];
  const always = allHeaders.filter(h => mustHave.includes(h.key));
  // Filter out duplicates
  const keys = new Set(always.map(h => h.key));
  headers.forEach(h => {
    if (!keys.has(h.key)) always.push(h);
  });
  return always;
}

const DetailedView = () => {
  const [viewMode, setViewMode] = useState("all");

  const getFilteredHeaders = () => {
    if (viewMode === "everything") return allHeaders;
    let filtered;
    switch (viewMode) {
      case "alerts":
        filtered = allHeaders.filter((h) => h.priority === "alert");
        break;
      case "focus":
        filtered = allHeaders.filter((h) => h.priority === "focus");
        break;
      case "standard":
        filtered = allHeaders.filter((h) => h.priority === "standard");
        // Exclude certain fields in "standard" view
        const excludeKeys = [
          "projectQualityPlanStatusRev", "projectAudit1", "projectAudit2", "projectAudit3",
          "clientAudit1", "clientAudit2", "carsOpen", "obsOpen", "projectKPIStatus"
        ];
        filtered = filtered.filter(f => !excludeKeys.includes(f.key));
        break;
      default:
        filtered = headers;
    }
   // Always include Project No and Project Name (Project Title)
const mustHaveKeys = ["srNo", "projectNo", "projectTitle"];
const rest = filtered.filter(f => !mustHaveKeys.includes(f.key));
const ordered = mustHaveKeys
  .map(key => allHeaders.find(f => f.key === key))
  .filter(Boolean)
  .concat(rest);
return ordered;
  };

  const filteredHeaders = getFilteredHeaders();

  // DataGrid columns
  const columns = useMemo(
    () =>
      filteredHeaders.map((header) => ({
        field: header.key,
        headerName: header.label,
        minWidth: header.label.length * 10 + 40,
        headerAlign: "center",
        align: header.align || "center",
        sortable: true,
        renderHeader: () => (
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
            {iconForHeader(header)}
            <span>{header.label}</span>
          </Stack>
        ),
        renderCell: (params) =>
          header.priority === "alert" || header.priority === "focus" ? (
            <Chip
              label={params.value}
              color={header.color}
              size="small"
              icon={iconForHeader(header)}
              sx={{ fontWeight: 600 }}
            />
          ) : header.key === "projectKPIStatus" ? (
            getCellChip(header, params.value)
          ) : (
            <span style={{ color: "#64748b" }}>{params.value}</span>
          ),
      })),
    [filteredHeaders]
  );

  // DataGrid expects each row to have an id
  const rows = useMemo(() =>
    projectsData.map((row, idx) => ({
      id: row.srNo || idx + 1,
      ...row,
    }))
  , [projectsData]);

  return (
    <Box
      component={Paper}
      elevation={4}
      sx={{
        borderRadius: 3,
        p: 3,
        mb: 0,
        boxShadow: 4,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
        Detailed Project Info
      </Typography>

      {/* Priority Legend */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip icon={<AlertTriangle size={16} />} label="High Priority (Alert)" color="warning" size="small" />
          <Chip icon={<Info size={16} />} label="Focus Field" color="info" size="small" />
                    <Chip label="Standard Info" color="default" size="small" />

          <Chip icon={<BadgeCheck size={16} />} label="KPI Status: Good" color="success" size="small" />
          <Chip label="KPI Status: Warning" color="warning" size="small" variant="outlined" />
          <Chip label="KPI Status: Critical" color="error" size="small" variant="outlined" />
        </Stack>
      </Box>

      {/* View Mode Buttons */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {["all", "alerts", "focus", "standard", "everything"].map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "contained" : "outlined"}
            color={viewMode === mode ? "primary" : "inherit"}
            size="small"
            onClick={() => setViewMode(mode)}
          >
            {mode === "all" && "All Fields"}
            {mode === "alerts" && "🚨 Alerts"}
            {mode === "focus" && "🔍 Focus"}
            {mode === "standard" && "📋 Standard"}
            {mode === "everything" && "🗂️ Show Everything"}
          </Button>
        ))}
      </Stack>

      {/* DataGrid Table */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination={false}
          hideFooter
          disableRowSelectionOnClick
          sortingOrder={['asc', 'desc']}
          disableColumnMenu={false}
          autoHeight={false}
          sx={{
            background: "#fff",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            "& .MuiDataGrid-columnHeaders": { cursor: "grab", fontWeight: 700 },
            "& .MuiDataGrid-cell": { py: 0.5, px: 1, whiteSpace: "normal", wordBreak: "break-word" },
            "& .MuiDataGrid-columnHeaderTitle": { whiteSpace: "normal", lineHeight: 1.2, wordBreak: "break-word" },
          }}
        />
      </Box>

      {/* <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {projectsData.length} projects
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data as of {new Date().toLocaleDateString()}
        </Typography>
      </Stack> */}
    </Box>
  );
};

export default DetailedView;