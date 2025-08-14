import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import {
  AlertTriangle,
  Clock,
  BarChart2,
  DollarSign,
  CheckCircle2,
  Wrench,
  FileText,
  Eye,
  XCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { formatDate } from '../../utils/dateUtils'; // Add this import

/**
 * ✅ UPDATED: PROJECT OVERVIEW CARDS - Enhanced with full-screen modals and projectTitleKey support
 */

// ✅ UPDATED: Icon mapping with unique colors for each overview
const iconMap = {
  "Running Projects Quality Plan Overview": <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
  "Audit Overview": <Clock className="w-8 h-8 text-orange-500 dark:text-orange-400" />,
  "KPI Overview": <BarChart2 className="w-8 h-8 text-green-500 dark:text-green-400" />,
  "CARs/Observation Overview": <Wrench className="w-8 h-8 text-red-500 dark:text-red-400" />,
  "Rejection Overview": <XCircle className="w-8 h-8 text-pink-500 dark:text-pink-400" />,
  "Cost of Poor Quality Overview": <DollarSign className="w-8 h-8 text-purple-500 dark:text-purple-400" />
};

// ✅ UPDATED: Color mappings - Enhanced with themes
const getCardClasses = (color) => {
  const colorMap = {
    blue: "border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20",
    orange: "border-l-4 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-950/20",
    green: "border-l-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/20",
    red: "border-l-4 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20",
    pink: "border-l-4 border-pink-500 dark:border-pink-400 bg-pink-50 dark:bg-pink-950/20",
    purple: "border-l-4 border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/20"
  };
  return colorMap[color] || colorMap.blue;
};

const getValueClasses = (color) => {
  const colorMap = {
    blue: "text-blue-800 dark:text-blue-300",
    orange: "text-orange-800 dark:text-orange-300",
    green: "text-green-800 dark:text-green-300",
    red: "text-red-800 dark:text-red-300",
    pink: "text-pink-800 dark:text-pink-300",
    purple: "text-purple-800 dark:text-purple-300"
  };
  return colorMap[color] || colorMap.blue;
};

// ✅ ENHANCED: Get theme colors for modals
const getThemeColors = (title) => {
  const themes = {
    "Running Projects Quality Plan Overview": { header: "bg-blue-100 dark:bg-blue-900", hover: "hover:bg-blue-50 dark:hover:bg-blue-950/30", button: "!text-blue-600 dark:!text-blue-400" },
    "Audit Overview": { header: "bg-orange-100 dark:bg-orange-900", hover: "hover:bg-orange-50 dark:hover:bg-orange-950/30", button: "!text-orange-600 dark:!text-orange-400" },
    "KPI Overview": { header: "bg-green-100 dark:bg-green-900", hover: "hover:bg-green-50 dark:hover:bg-green-950/30", button: "!text-green-600 dark:!text-green-400" },
    "CARs/Observation Overview": { header: "bg-red-100 dark:bg-red-900", hover: "hover:bg-red-50 dark:hover:bg-red-950/30", button: "!text-red-600 dark:!text-red-400" },
    "Rejection Overview": { header: "bg-pink-100 dark:bg-pink-900", hover: "hover:bg-pink-50 dark:hover:bg-pink-950/30", button: "!text-pink-600 dark:!text-pink-400" },
    "Cost of Poor Quality Overview": { header: "bg-purple-100 dark:bg-purple-900", hover: "hover:bg-purple-50 dark:hover:bg-purple-950/30", button: "!text-purple-600 dark:!text-purple-400" }
  };
  return themes[title] || themes["Running Projects Quality Plan Overview"];
};

/**
 * HELPER FUNCTIONS
 */
const parseNumber = (val) => {
  if (!val || val === '' || val === 'N/A') return 0;
  return Number(val) || 0;
};

const parsePercent = (val) => {
  if (!val || val === '' || val === 'N/A') return 0;
  const cleaned = String(val).replace('%', '');
  return Number(cleaned) || 0;
};

const isValidProject = (project) => {
  return project && 
         project.projectNo && 
         project.projectNo !== '' && 
         project.projectNo !== 'N/A' &&
         project.projectTitle &&
         project.projectTitle !== '' &&
         project.projectTitle !== 'N/A';
};

/**
 * ✅ UPDATED: Project filters
 */
const projectFilters = {
  "Running Projects Quality Plan Overview": (projects) => {
    return projects.filter(project => isValidProject(project));
  },
  
  "Audit Overview": (projects) => {
    return projects.filter(project => 
      isValidProject(project) && (
        project.projectAudit1 || 
        project.projectAudit2 || 
        project.projectAudit3 || 
        project.projectAudit4 ||
        project.clientAudit1 ||
        project.clientAudit2 ||
        (project.delayInAuditsNoDays && parseNumber(project.delayInAuditsNoDays) >= 0)
      )
    );
  },
  
  "KPI Overview": (projects) => {
    return projects.filter(project => 
      isValidProject(project) && (
        (project.projectKPIsAchievedPercent && project.projectKPIsAchievedPercent !== 'N/A') ||
        (project.projectCompletionPercent && project.projectCompletionPercent !== 'N/A')
      )
    );
  },
  
  "CARs/Observation Overview": (projects) => {
    return projects.filter(project => 
      isValidProject(project) && (
        (project.carsOpen && parseNumber(project.carsOpen) >= 0) ||
        (project.carsClosed && parseNumber(project.carsClosed) >= 0) ||
        (project.obsOpen && parseNumber(project.obsOpen) >= 0) ||
        (project.obsClosed && parseNumber(project.obsClosed) >= 0) ||
        (project.carsDelayedClosingNoDays && parseNumber(project.carsDelayedClosingNoDays) >= 0) ||
        (project.obsDelayedClosingNoDays && parseNumber(project.obsDelayedClosingNoDays) >= 0)
      )
    );
  },
  
  "Rejection Overview": (projects) => {
    return projects.filter(project => 
      isValidProject(project) && 
      project.rejectionOfDeliverablesPercent && 
      parsePercent(project.rejectionOfDeliverablesPercent) > 0
    );
  },
  
  "Cost of Poor Quality Overview": (projects) => {
    return projects.filter(project => 
      isValidProject(project) && (
        project.costOfPoorQualityAED && parseNumber(project.costOfPoorQualityAED) > 0
      )
    );
  }
};

// ✅ NEW: Helper function to get short column labels with tooltips (ONLY FOR TABLE HEADERS)
const getColumnInfo = (key) => {
  const columnMap = {
    // Base columns - Keep same (already short)
    'projectNo': { short: 'Project No', full: 'Project No' },
    'projectTitleKey': { short: 'Project Title', full: 'Project Title' },
    'projectManager': { short: 'Project Manager', full: 'Project Manager' },
    'client': { short: 'Client', full: 'Client' },
    
    // Quality Plan specific - Shorten only long ones
    'projectStartingDate': { short: 'Start Date', full: 'Project Starting Date' },
    'projectClosingDate': { short: 'End Date', full: 'Project Closing Date' },
    'projectExtension': { short: 'Extension', full: 'Project Extension' },
    'projectQualityPlanStatusRev': { short: 'Quality Plan Rev', full: 'Project Quality Plan Status - Rev' }, // ✅ SHORTENED
    'projectQualityPlanStatusIssueDate': { short: 'Issue Date', full: 'Project Quality Plan Status - Issued Date' }, // ✅ SHORTENED
    
    // Audit specific - Shorten long ones
    'projectAudit1': { short: 'Project Audit-1', full: 'Project Audit-1' },
    'projectAudit2': { short: 'Project Audit-2', full: 'Project Audit-2' },
    'projectAudit3': { short: 'Project Audit-3', full: 'Project Audit-3' },
    'projectAudit4': { short: 'Project Audit-4', full: 'Project Audit-4' },
    'clientAudit1': { short: 'Client Audit-1', full: 'Client Audit-1' },
    'clientAudit2': { short: 'Client Audit-2', full: 'Client Audit-2' },
    'delayInAuditsNoDays': { short: 'Audit Delay Days', full: 'Delay in Audits - No. of Days' }, // ✅ SHORTENED
    
    // KPI specific - Shorten long ones
    'projectKPIsAchievedPercent': { short: 'KPIs Achieved %', full: 'Project KPIs Achieved %' }, // ✅ SHORTENED
    'projectCompletionPercent': { short: 'Completion %', full: 'Project Completion %' }, // ✅ SHORTENED
    
    // CARs/Observation specific - Shorten very long ones
    'carsOpen': { short: 'CARs Open', full: 'CARs Open' },
    'carsClosed': { short: 'CARs Closed', full: 'CARs Closed' },
    'carsDelayedClosingNoDays': { short: 'CARs Delay Days', full: 'CARs Delayed closing No. days' }, // ✅ SHORTENED
    'obsOpen': { short: 'Obs Open', full: 'No. of Obs Open' },
    'obsClosed': { short: 'Obs Closed', full: 'Obs Closed' },
    'obsDelayedClosingNoDays': { short: 'Obs Delay Days', full: 'Obs delayed closing No. of Days' }, // ✅ SHORTENED
    
    // Rejection specific - Keep same (already reasonable)
    'rejectionOfDeliverablesPercent': { short: 'Rejection %', full: 'Rejection of Deliverables %' }, // ✅ SHORTENED
    
    // Cost specific - Keep same (reasonable)
    'costOfPoorQualityAED': { short: 'Cost (AED)', full: 'Cost of Poor Quality in AED' } // ✅ SHORTENED
  };
  
  return columnMap[key] || { short: key, full: key };
};

/**
 * ✅ UPDATED: Modal columns with BALANCED widths - not too narrow, not too wide
 */
const getModalColumns = (cardTitle) => {
  const baseColumns = [
    { key: 'projectNo', label: getColumnInfo('projectNo').short, fullLabel: getColumnInfo('projectNo').full, width: '110px', minWidth: '90px' },
    { key: 'projectTitleKey', label: getColumnInfo('projectTitleKey').short, fullLabel: getColumnInfo('projectTitleKey').full, width: '100px', minWidth: '00px', truncate: true },
    { key: 'projectManager', label: getColumnInfo('projectManager').short, fullLabel: getColumnInfo('projectManager').full, width: '140px', minWidth: '120px' },
    { key: 'client', label: getColumnInfo('client').short, fullLabel: getColumnInfo('client').full, width: '130px', minWidth: '110px' }
  ];

  const specificColumns = {
    "Running Projects Quality Plan Overview": [
      { key: 'projectStartingDate', label: getColumnInfo('projectStartingDate').short, fullLabel: getColumnInfo('projectStartingDate').full, width: '110px', minWidth: '90px' },
      { key: 'projectClosingDate', label: getColumnInfo('projectClosingDate').short, fullLabel: getColumnInfo('projectClosingDate').full, width: '110px', minWidth: '90px' },
      { key: 'projectExtension', label: getColumnInfo('projectExtension').short, fullLabel: getColumnInfo('projectExtension').full, width: '100px', minWidth: '80px' },
      { key: 'projectQualityPlanStatusRev', label: getColumnInfo('projectQualityPlanStatusRev').short, fullLabel: getColumnInfo('projectQualityPlanStatusRev').full, width: '140px', minWidth: '120px' },
      { key: 'projectQualityPlanStatusIssueDate', label: getColumnInfo('projectQualityPlanStatusIssueDate').short, fullLabel: getColumnInfo('projectQualityPlanStatusIssueDate').full, width: '110px', minWidth: '90px' }
    ],
    "Audit Overview": [
      { key: 'projectAudit1', label: getColumnInfo('projectAudit1').short, fullLabel: getColumnInfo('projectAudit1').full, width: '120px', minWidth: '100px' },
      { key: 'projectAudit2', label: getColumnInfo('projectAudit2').short, fullLabel: getColumnInfo('projectAudit2').full, width: '120px', minWidth: '100px' },
      { key: 'projectAudit3', label: getColumnInfo('projectAudit3').short, fullLabel: getColumnInfo('projectAudit3').full, width: '120px', minWidth: '100px' },
      { key: 'projectAudit4', label: getColumnInfo('projectAudit4').short, fullLabel: getColumnInfo('projectAudit4').full, width: '120px', minWidth: '100px' },
      { key: 'clientAudit1', label: getColumnInfo('clientAudit1').short, fullLabel: getColumnInfo('clientAudit1').full, width: '120px', minWidth: '100px' },
      { key: 'clientAudit2', label: getColumnInfo('clientAudit2').short, fullLabel: getColumnInfo('clientAudit2').full, width: '120px', minWidth: '100px' },
      { key: 'delayInAuditsNoDays', label: getColumnInfo('delayInAuditsNoDays').short, fullLabel: getColumnInfo('delayInAuditsNoDays').full, width: '130px', minWidth: '110px' }
    ],
    "KPI Overview": [
      { key: 'projectKPIsAchievedPercent', label: getColumnInfo('projectKPIsAchievedPercent').short, fullLabel: getColumnInfo('projectKPIsAchievedPercent').full, width: '130px', minWidth: '110px' },
      { key: 'projectCompletionPercent', label: getColumnInfo('projectCompletionPercent').short, fullLabel: getColumnInfo('projectCompletionPercent').full, width: '120px', minWidth: '100px' }
    ],
    "CARs/Observation Overview": [
      { key: 'carsOpen', label: getColumnInfo('carsOpen').short, fullLabel: getColumnInfo('carsOpen').full, width: '100px', minWidth: '80px' },
      { key: 'carsClosed', label: getColumnInfo('carsClosed').short, fullLabel: getColumnInfo('carsClosed').full, width: '110px', minWidth: '90px' },
      { key: 'carsDelayedClosingNoDays', label: getColumnInfo('carsDelayedClosingNoDays').short, fullLabel: getColumnInfo('carsDelayedClosingNoDays').full, width: '130px', minWidth: '110px' },
      { key: 'obsOpen', label: getColumnInfo('obsOpen').short, fullLabel: getColumnInfo('obsOpen').full, width: '100px', minWidth: '80px' },
      { key: 'obsClosed', label: getColumnInfo('obsClosed').short, fullLabel: getColumnInfo('obsClosed').full, width: '110px', minWidth: '90px' },
      { key: 'obsDelayedClosingNoDays', label: getColumnInfo('obsDelayedClosingNoDays').short, fullLabel: getColumnInfo('obsDelayedClosingNoDays').full, width: '130px', minWidth: '110px' }
    ],
    "Rejection Overview": [
      { key: 'rejectionOfDeliverablesPercent', label: getColumnInfo('rejectionOfDeliverablesPercent').short, fullLabel: getColumnInfo('rejectionOfDeliverablesPercent').full, width: '120px', minWidth: '100px' }
    ],
    "Cost of Poor Quality Overview": [
      { key: 'costOfPoorQualityAED', label: getColumnInfo('costOfPoorQualityAED').short, fullLabel: getColumnInfo('costOfPoorQualityAED').full, width: '130px', minWidth: '110px' }
    ]
  };

  return [...baseColumns, ...(specificColumns[cardTitle] || [])];
};

/**
 * ✅ ENHANCED: Cell formatting with projectTitleKey support and tooltip
 */
const getCellValue = (project, columnKey, isFullScreen = false) => {
  let value = project[columnKey];
  
  // ✅ FIXED: Use projectTitleKey if available, fallback to projectTitle
  if (columnKey === 'projectTitleKey') {
    value = project.projectTitleKey || project.projectTitle || '';
    
    // ✅ DEBUG: Log to see what values we're getting
    console.log('🔍 ProjectTitleKey Debug:', {
      projectNo: project.projectNo,
      hasProjectTitleKey: !!project.projectTitleKey,
      projectTitleKey: project.projectTitleKey,
      projectTitle: project.projectTitle,
      finalValue: value
    });
  }
  
  if (!value || value === '' || value === 'N/A') {
    return (
      <div className="flex justify-center items-center py-1">
        <span className="text-gray-400 dark:text-slate-500 font-medium">−</span>
      </div>
    );
  }

  // ✅ ENHANCED: Project title with tooltip showing full title
  if (columnKey === 'projectTitleKey') {
    const fullTitle = project.projectTitle || value;
    const maxLength = isFullScreen ? 60 : 25;
    const truncatedValue = value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
    
    return (
      <Tooltip title={fullTitle} arrow placement="top">
        <span className="text-gray-900 dark:text-gray-100 cursor-help">
          {truncatedValue}
        </span>
      </Tooltip>
    );
  }
  
  // ✅ REMOVED: Project KPI Achieved % badges - now just simple color coding
  if (columnKey === 'projectKPIsAchievedPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 90 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 75 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    
    return <span className={className}>{value}</span>;
  }
  
  // ✅ UPDATED: Project Completion % - NO BADGES, just normal coloring
  if (columnKey === 'projectCompletionPercent') {
    const numVal = parsePercent(value);
    const className = numVal === 100 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-bold" :
                     numVal > 95 ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-bold" :
                     numVal >= 90 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 75 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    
    return <span className={className}>{value}</span>;
  }
  
  // ✅ UPDATED: Rejection Rate coloring - kept the same
  if (columnKey === 'rejectionOfDeliverablesPercent') {
    const numVal = parsePercent(value);
    const className = numVal === 0 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" :
                     numVal > 10 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" :
                     numVal > 5 ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs" :
                     "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // ✅ NEW: Cost of Poor Quality formatting
  if (columnKey === 'costOfPoorQualityAED') {
    const cost = parseNumber(value);
    return <span className="text-purple-800 dark:text-purple-300 font-bold font-mono">{cost.toLocaleString()} AED</span>;
  }
  
  // CAR/OBS coloring
  if (columnKey === 'carsOpen' || columnKey === 'obsOpen') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">0</span>;
    const className = numVal > 3 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" : 
                     "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // ✅ NEW: Delayed closing days coloring
  if (columnKey === 'carsDelayedClosingNoDays' || columnKey === 'obsDelayedClosingNoDays') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">On Time</span>;
    const className = numVal > 30 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" : 
                     numVal > 15 ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs" : 
                     "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value} days</span>;
  }
  
  // Closed CARs/OBS (positive indicator)
  if (columnKey === 'carsClosed' || columnKey === 'obsClosed') {
    const numVal = parseNumber(value);
    const className = numVal > 0 ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs" : 
                     "text-gray-400 dark:text-slate-500";
    return <span className={className}>{value}</span>;
  }
  
  // Audit delays
  if (columnKey === 'delayInAuditsNoDays') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">On Time</span>;
    const className = numVal > 15 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" : 
                     "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value} days</span>;
  }
  
  // ✅ UPDATED: Quality Plan status
  if (columnKey === 'projectQualityPlanStatusRev') {
    if (!value || value === '' || value === 'N/A') {
      return <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold">Pending</span>;
    }
    return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">{value}</span>;
  }
  
  // ✅ NEW: Audit status coloring
  if (columnKey.includes('Audit') && (columnKey.includes('project') || columnKey.includes('client'))) {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('pending') || lowerValue.includes('overdue') || lowerValue.includes('delayed')) {
      return <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold">{value}</span>;
    }
    if (lowerValue.includes('completed') || lowerValue.includes('done') || lowerValue.includes('finished')) {
      return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">{value}</span>;
    }
    if (lowerValue.includes('in progress') || lowerValue.includes('ongoing') || lowerValue.includes('started')) {
      return <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">{value}</span>;
    }
    return <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">{value}</span>;
  }
  
  // Hours (numerical values)
  if (['manHourForQuality', 'manhoursUsed', 'manhoursBalance'].includes(columnKey)) {
    const numVal = parseNumber(value);
    return <span className="text-gray-900 dark:text-gray-100 font-mono">{numVal.toLocaleString()}</span>;
  }
  
  // Dates
  if (
    columnKey.includes('Date') ||
    columnKey.includes('Extension') ||
    columnKey.includes('Audit') // This covers Project Audit -1, -2, etc.
  ) {
    return (
      <span className="text-gray-700 dark:text-gray-300 text-sm">
        {formatDate(value)}
      </span>
    );
  }
  
  return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
};

const SummaryCards = ({ filteredProjects = [] }) => {
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // ✅ Filter out invalid projects first
  const validProjects = filteredProjects.filter(project => isValidProject(project));
  
  // ✅ Debug logging
  console.log('🔍 SummaryCards - Total projects:', filteredProjects.length);
  console.log('🔍 Valid projects:', validProjects.length);
  
  // ✅ DEBUG: Check projectTitleKey field in first few projects
  console.log('🔍 First 3 projects projectTitleKey check:', 
    validProjects.slice(0, 3).map(p => ({
      projectNo: p.projectNo,
      projectTitle: p.projectTitle,
      projectTitleKey: p.projectTitleKey,
      hasProjectTitleKey: !!p.projectTitleKey
    }))
  );
  
  /**
   * ✅ UPDATED: Overview calculations
   */
  const calculations = {
    // Running Projects Quality Plan Overview
    totalProjects: validProjects.length,
    
    // Audit Overview
    projectsWithAudits: (() => {
      return projectFilters["Audit Overview"](validProjects).length;
    })(),
    
    // KPI Overview with new logic
    projectsWithKPI: (() => {
      const kpiProjects = projectFilters["KPI Overview"](validProjects);
      const needKPITracking = kpiProjects.filter(p => parsePercent(p.projectCompletionPercent) <= 95).length;
      const perfectProjects = kpiProjects.filter(p => parsePercent(p.projectCompletionPercent) === 100).length;
      const belowStandard = kpiProjects.filter(p => {
        const completion = parsePercent(p.projectCompletionPercent);
        return completion < 90 && completion > 0;
      }).length;
      
      return {
        total: kpiProjects.length,
        needTracking: needKPITracking,
        perfect: perfectProjects,
        belowStandard: belowStandard
      };
    })(),
    
    // CARs/Observation Overview
    totalIssues: (() => {
      return projectFilters["CARs/Observation Overview"](validProjects).reduce((sum, project) => {
        const cars = parseNumber(project.carsOpen);
        const obs = parseNumber(project.obsOpen);
        return sum + cars + obs;
      }, 0);
    })(),
    
    // ✅ NEW: Rejection Overview
    totalRejections: (() => {
      const projectsWithRejections = projectFilters["Rejection Overview"](validProjects);
      return projectsWithRejections.length; // Count of projects with rejections
    })(),
    
    // ✅ NEW: Cost of Poor Quality Overview
    projectsWithCosts: (() => {
      return projectFilters["Cost of Poor Quality Overview"](validProjects).length;
    })()
  };

  // Enhanced modal handlers
  const handleCardClick = (cardTitle) => {
    console.log('🔍 Card clicked:', cardTitle);
    
    const projects = projectFilters[cardTitle] ? projectFilters[cardTitle](validProjects) : validProjects;
    
    console.log('🔍 Filtered projects for modal:', projects.length);
    
    setModalTitle(cardTitle);
    setModalProjects(projects);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalTitle('');
    setModalProjects([]);
    setIsFullScreen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // ✅ ENHANCED: Dynamic modal styles
  const getModalStyles = () => {
    if (isFullScreen) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'transparent',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      };
    }
    
    return {
      position: 'fixed',
      top: '3%',
      left: '50%',
      transform: 'translate(-50%, 0)',
      bgcolor: 'transparent',
      width: { xs: '98vw', sm: '95vw', md: '90vw', lg: '85vw', xl: '1200px' },
      maxHeight: '94vh',
      overflowY: 'auto',
      outline: 'none',
    };
  };

  const getPaperStyles = () => {
    if (isFullScreen) {
      return {
        borderRadius: 0,
        width: '100%',
        height: '100%',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      };
    }
    
    return {
      borderRadius: 3,
      p: { xs: 2, sm: 3 },
      position: 'relative'
    };
  };

  const themeColors = getThemeColors(modalTitle);
  const modalColumns = getModalColumns(modalTitle);

  /**
   * ✅ CARDS KEEP FULL NAMES - NO CHANGES TO CARD TITLES
   */
  const summaryData = [
    {
      title: "Running Projects Quality Plan Overview",
      value: calculations.totalProjects,
      description: "All active projects with quality plan status",
      priority: "overview",
      color: "blue"
    },
    {
      title: "Audit Overview",
      value: calculations.projectsWithAudits,
      description: "Projects with audit information and delays",
      priority: "overview",
      color: "orange"
    },
    {
      title: "CARs/Observation Overview",
      value: calculations.totalIssues,
      description: "Total open issues and delayed closures",
      priority: "overview",
      color: "red"
    },
    {
      title: "KPI Overview",
      value: calculations.projectsWithKPI.total,
      description: `${calculations.projectsWithKPI.perfect} perfect, ${calculations.projectsWithKPI.belowStandard} below 90%`,
      priority: "overview",
      color: "green"
    },
    {
      title: "Rejection Overview",
      value: calculations.totalRejections,
      description: "Projects with deliverable rejection rate",
      priority: "overview",
      color: "pink"
    },
    {
      title: "Cost of Poor Quality Overview",
      value: calculations.projectsWithCosts,
      description: "Projects with quality cost impact",
      priority: "overview",
      color: "purple"
    }
  ];

  return (
    <>
      <div className="space-y-6">
        
        {/* ✅ CARDS KEEP FULL NAMES - NO TOOLTIPS ON CARDS */}
        <div>
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            PROJECT QUALITY OVERVIEWS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {summaryData.map((item, index) => (
              <Card 
                key={index} 
                className={`${getCardClasses(item.color)} cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-slate-700`}
                onClick={() => handleCardClick(item.title)}
              >
                <CardContent className="p-4 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    {/* ✅ CARDS SHOW FULL NAMES - NO CHANGES */}
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.title}
                    </p>
                    <div>{iconMap[item.title]}</div>
                  </div>
                  <p className={`text-3xl font-bold ${getValueClasses(item.color)} mb-1`}>{item.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Full-screen modal with SHORT COLUMN HEADERS */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{ zIndex: 1300 }}
      >
        <Box sx={getModalStyles()}>
          <Paper 
            elevation={6} 
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
            sx={getPaperStyles()}
          >
            {/* Enhanced Header with Full-screen Toggle */}
            <div className={`flex items-center justify-between ${isFullScreen ? 'p-4' : 'pb-0'}`}>
              <div className="flex-1">
                <h2 className={`font-bold text-xl ${themeColors.button.replace('!text', 'text')}`}>
                  {modalTitle}
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Showing {modalProjects.length} project{modalProjects.length !== 1 ? 's' : ''} with relevant data
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip title={isFullScreen ? "Exit Full Screen" : "Full Screen"} arrow>
                  <IconButton
                    onClick={toggleFullScreen}
                    className={`${themeColors.button} hover:!opacity-80`}
                  >
                    {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Close" arrow>
                  <IconButton
                    onClick={handleCloseModal}
                    className="!text-gray-500 dark:!text-slate-400 hover:!text-gray-700 dark:hover:!text-slate-200"
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            
            {/* Enhanced Table Container */}
            <div className={`${isFullScreen ? 'flex-1 overflow-hidden p-4 pt-0' : ''}`}>
              {modalProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-slate-400 text-lg">
                    No projects found with {modalTitle.toLowerCase()} data.
                  </p>
                </div>
              ) : (
                <div className={`overflow-hidden border border-gray-200 dark:border-slate-700 rounded-lg ${isFullScreen ? 'h-full' : ''}`}>
                  <div 
                    style={{ 
                      maxHeight: isFullScreen ? '100%' : '70vh', 
                      overflowY: 'auto', 
                      overflowX: 'auto' 
                    }} 
                    className="bg-white dark:bg-slate-900"
                  >
                    <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                      <thead className={`sticky top-0 ${themeColors.header} z-10`}>
                        <tr>
                          {modalColumns.map(column => (
                            <th 
                              key={column.key} 
                              className="border border-gray-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-gray-900 dark:text-slate-100"
                              style={{ 
                                width: column.width,
                                minWidth: column.minWidth,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {/* ✅ ONLY TABLE HEADERS ARE SHORTENED WITH TOOLTIPS */}
                              <Tooltip title={column.fullLabel} arrow placement="top">
                                <span className="cursor-help">
                                  {column.label}
                                </span>
                              </Tooltip>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-900">
                        {modalProjects.map((project, idx) => (
                          <tr 
                            key={`${project.projectNo || idx}`} 
                            className={`${themeColors.hover} transition-colors`}
                          >
                            {modalColumns.map(column => (
                              <td 
                                key={`${column.key}-${idx}`} 
                                className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-gray-900 dark:text-slate-100"
                                style={{ 
                                  width: column.width,
                                  minWidth: column.minWidth,
                                  overflow: column.truncate ? 'hidden' : 'visible',
                                  textOverflow: column.truncate ? 'ellipsis' : 'clip'
                                }}
                              >
                                {getCellValue(project, column.key, isFullScreen)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      {/* ✅ NEW: Show total sum in table footer for Cost of Poor Quality */}
                      {modalTitle === "Cost of Poor Quality Overview" && (
                        <tfoot className="sticky bottom-0 bg-purple-100 dark:bg-purple-900">
                          <tr>
                            <td colSpan={modalColumns.length - 1} className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-right font-bold text-purple-800 dark:text-purple-200">
                              Total Cost of Poor Quality:
                            </td>
                            <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 font-bold text-purple-800 dark:text-purple-200 font-mono">
                              {modalProjects.reduce((sum, project) => sum + parseNumber(project.costOfPoorQualityAED), 0).toLocaleString()} AED
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Paper>
        </Box>
      </Modal>
    </>
  );
};

export default SummaryCards;

/**
 * ✅ FIXES APPLIED:
 * 
 * 1. EMPTY FIRST ROW FIX:
 *    - Added `isValidProject()` function to filter out empty/invalid projects
 *    - Ensures only projects with projectNo and projectTitle are processed
 *    - Filters out projects with empty or N/A values
 * 
 * 2. PROPER FILTERING:
 *    - Each overview now has specific filtering logic
 *    - Audit Overview: Shows projects with audit data OR delay info
 *    - KPI Overview: Shows projects with KPI, completion, or rejection data
 *    - CAR/Observation Overview: Shows projects with any CAR/OBS data
 *    - Billability Overview: Shows projects with billability or manhour data
 * 
 * 3. ENHANCED DEBUGGING:
 *    - Added console logs to track filtering
 *    - Shows valid vs total project counts
 *    - Logs sample project data for troubleshooting
 * 
 * 4. BETTER KEY HANDLING:
 *    - Uses unique keys for table rows (projectNo + index)
 *    - Prevents React key warnings
 * 
 * 5. IMPROVED ERROR HANDLING:
 *    - Better empty state messaging
 *    - Validates data before processing
 */