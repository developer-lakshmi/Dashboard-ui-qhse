import React, { useState } from 'react'
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AlertTriangle, FileText, Clock, Wrench, Eye, Maximize2, Minimize2 } from "lucide-react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

// Helper functions (keep existing)
const parseDate = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === '') return null;
  return new Date(dateStr);
};

const parseNumber = (val) => {
  if (!val || val === '' || val === 'N/A') return 0;
  return Number(val) || 0;
};

const countProjects = (data, fn) => data.filter(fn).length;

const getBadge = (title, value) => {
  if (value === 0) {
    if (title.includes("Quality Plan Pending")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">All Complete</span>;
    if (title.includes("Projects Audits Pending")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">On Time</span>;
    if (title.includes("CAR Open")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Issues</span>;
    if (title.includes("Observation Open")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Issues</span>;
    return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">OK</span>;
  }
  
  if (title.includes("Quality Plan Pending") || title.includes("Audits Pending") || title.includes("CAR Open") || title.includes("Observation Open")) {
    if (value > 10) return <span className="ml-1 sm:ml-2 rounded bg-red-200 px-1.5 sm:px-2 py-0.5 text-xs text-red-800">Critical</span>;
    if (value > 5) return <span className="ml-1 sm:ml-2 rounded bg-orange-200 px-1.5 sm:px-2 py-0.5 text-xs text-orange-800">High</span>;
    if (value > 0) return <span className="ml-1 sm:ml-2 rounded bg-yellow-200 px-1.5 sm:px-2 py-0.5 text-xs text-yellow-800">Attention</span>;
  }
  
  return null;
};

const isValidProject = (project) => {
  return project && 
         project.projectNo && 
         project.projectNo.trim() !== '' && 
         project.projectNo !== 'N/A' &&
         project.projectTitle && 
         project.projectTitle.trim() !== '' && 
         project.projectTitle !== 'N/A';
};

const filterProjects = {
  "Quality Plan Pending": (p) => {
    if (!isValidProject(p)) return false;
    
    const hasQualityPlanRev = p.projectQualityPlanStatusRev && 
                             p.projectQualityPlanStatusRev !== '' && 
                             p.projectQualityPlanStatusRev !== 'N/A';
    const hasQualityPlanDate = p.projectQualityPlanStatusIssueDate && 
                              p.projectQualityPlanStatusIssueDate !== '' && 
                              p.projectQualityPlanStatusIssueDate !== 'N/A';
    
    return !hasQualityPlanRev || !hasQualityPlanDate;
  },
  
  "Projects Audits Pending": (p) => {
    const delayDays = Number(p.delayInAuditsNoDays || 0);
    return delayDays > 0;
  },
  
  "CAR Open": (p) => {
    const openCars = Number(p.carsOpen || 0);
    return openCars > 0;
  },
  
  "Observation Open": (p) => {
    const openObs = Number(p.obsOpen || 0);
    return openObs > 0;
  }
};

// ✅ NEW: Helper function to get column information with short and full labels
const getColumnInfo = (key) => {
  const columnMap = {
    // Base columns
    'projectNo': { short: 'Project No', full: 'Project No' },
    'projectTitleKey': { short: 'Project Title', full: 'Project Title' },
    'projectManager': { short: 'Project Manager', full: 'Project Manager' },
    'client': { short: 'Client', full: 'Client' },
    
    // Quality Plan specific
    'projectQualityPlanStatusRev': { short: 'Quality Plan Rev', full: 'Project Quality Plan Status - Rev' },
    'projectQualityPlanStatusIssueDate': { short: 'Issue Date', full: 'Project Quality Plan Status - Issue Date' },
    
    // Audit specific  
    'projectAudit1': { short: 'Project Audit-1', full: 'Project Audit-1' },
    'projectAudit2': { short: 'Project Audit-2', full: 'Project Audit-2' },
    'projectAudit3': { short: 'Project Audit-3', full: 'Project Audit-3' },
    'projectAudit4': { short: 'Project Audit-4', full: 'Project Audit-4' },
    'clientAudit1': { short: 'Client Audit-1', full: 'Client Audit-1' },
    'clientAudit2': { short: 'Client Audit-2', full: 'Client Audit-2' },
    'delayInAuditsNoDays': { short: 'Delay Days', full: 'Delay in Audits - No. of Days' },
    
    // CAR/Observation specific
    'carsOpen': { short: 'CARs Open', full: 'CARs Open' },
    'carsDelayedClosingNoDays': { short: 'CARs Delay Days', full: 'CARs Delayed Closing No. of Days' },
    'carsClosed': { short: 'CARs Closed', full: 'CARs Closed' },
    'obsOpen': { short: 'Obs Open', full: 'Observations Open' },
    'obsDelayedClosingNoDays': { short: 'Obs Delay Days', full: 'Observations Delayed Closing No. of Days' },
    'obsClosed': { short: 'Obs Closed', full: 'Observations Closed' }
  };
  
  return columnMap[key] || { short: key, full: key };
};

const DashSummaryCard = ({ projectsData = [] }) => {
  // State management
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Calculate pending activities counts
  const qualityPlanPending = countProjects(projectsData, filterProjects["Quality Plan Pending"]);
  const auditsPending = countProjects(projectsData, filterProjects["Projects Audits Pending"]);
  const carOpen = projectsData.reduce((sum, p) => sum + parseNumber(p.carsOpen), 0);
  const obsOpen = projectsData.reduce((sum, p) => sum + parseNumber(p.obsOpen), 0);

  const pendingActivitiesSummary = [
    {
      title: "Quality Plan Pending",
      value: qualityPlanPending,
      icon: FileText,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      description: "Projects with missing quality plan documentation"
    },
    {
      title: "Projects Audits Pending",
      value: auditsPending,
      icon: Clock,
      color: "text-red-600 bg-red-100/60 dark:bg-red-900/30 dark:text-red-400",
      description: "Projects with delayed audits requiring attention"
    },
    {
      title: "CAR Open",
      value: carOpen,
      icon: Wrench,
      color: "text-red-600 bg-red-100/60 dark:bg-red-900/30 dark:text-red-400",
      description: "Total corrective actions pending closure"
    },
    {
      title: "Observation Open",
      value: obsOpen,
      icon: Eye,
      color: "text-yellow-600 bg-yellow-100/60 dark:bg-yellow-900/30 dark:text-yellow-400",
      description: "Total observations pending closure"
    }
  ];

  // Enhanced modal handlers
  const handleOpen = (item) => {
    console.log('🔍 Opening modal for:', item.title);
    
    if ((item.title.includes("CAR Open") || item.title.includes("Observation Open")) && 
        (typeof item.value === 'number' && item.value === 0)) {
      return;
    }
    
    const filteredProjects = projectsData.filter(filterProjects[item.title]);
    setModalTitle(item.title);
    setModalProjects(filteredProjects);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setModalTitle('');
    setModalProjects([]);
    setIsFullScreen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // ✅ ENHANCED: Optimized table columns with proper widths and column info
  const getTableColumns = (modalTitle) => {
    const baseColumns = [
      { 
        key: 'projectNo', 
        label: getColumnInfo('projectNo').short,
        fullLabel: getColumnInfo('projectNo').full,
        width: '100px', 
        minWidth: '100px' 
      },
      { 
        key: 'projectTitleKey', 
        label: getColumnInfo('projectTitleKey').short,
        fullLabel: getColumnInfo('projectTitleKey').full,
        width: '100px', 
        minWidth: '200px', 
        truncate: true 
      },
      { 
        key: 'projectManager', 
        label: getColumnInfo('projectManager').short,
        fullLabel: getColumnInfo('projectManager').full,
        width: '180px', 
        minWidth: '150px' 
      },
      { 
        key: 'client', 
        label: getColumnInfo('client').short,
        fullLabel: getColumnInfo('client').full,
        width: '160px', 
        minWidth: '140px' 
      }
    ];

    const specificColumns = {
      "Quality Plan Pending": [
        { 
          key: 'projectQualityPlanStatusRev', 
          label: getColumnInfo('projectQualityPlanStatusRev').short,
          fullLabel: getColumnInfo('projectQualityPlanStatusRev').full,
          width: '140px', 
          minWidth: '120px' 
        },
        { 
          key: 'projectQualityPlanStatusIssueDate', 
          label: getColumnInfo('projectQualityPlanStatusIssueDate').short,
          fullLabel: getColumnInfo('projectQualityPlanStatusIssueDate').full,
          width: '130px', 
          minWidth: '110px' 
        }
      ],
      "Projects Audits Pending": [
        { 
          key: 'projectAudit1', 
          label: getColumnInfo('projectAudit1').short,
          fullLabel: getColumnInfo('projectAudit1').full,
          width: '140px', 
          minWidth: '120px' 
        },
        { 
          key: 'projectAudit2', 
          label: getColumnInfo('projectAudit2').short,
          fullLabel: getColumnInfo('projectAudit2').full,
          width: '140px', 
          minWidth: '120px' 
        },
        { 
          key: 'projectAudit3', 
          label: getColumnInfo('projectAudit3').short,
          fullLabel: getColumnInfo('projectAudit3').full,
          width: '140px', 
          minWidth: '120px' 
        },
        { 
          key: 'projectAudit4', 
          label: getColumnInfo('projectAudit4').short,
          fullLabel: getColumnInfo('projectAudit4').full,
          width: '140px', 
          minWidth: '120px' 
        },
        { 
          key: 'clientAudit1', 
          label: getColumnInfo('clientAudit1').short,
          fullLabel: getColumnInfo('clientAudit1').full,
          width: '130px', 
          minWidth: '110px' 
        },
        { 
          key: 'clientAudit2', 
          label: getColumnInfo('clientAudit2').short,
          fullLabel: getColumnInfo('clientAudit2').full,
          width: '130px', 
          minWidth: '110px' 
        },
        { 
          key: 'delayInAuditsNoDays', 
          label: getColumnInfo('delayInAuditsNoDays').short,
          fullLabel: getColumnInfo('delayInAuditsNoDays').full,
          width: '110px', 
          minWidth: '90px' 
        }
      ],
      "CAR Open": [
        { 
          key: 'carsOpen', 
          label: getColumnInfo('carsOpen').short,
          fullLabel: getColumnInfo('carsOpen').full,
          width: '100px', 
          minWidth: '80px' 
        },
        { 
          key: 'carsDelayedClosingNoDays', 
          label: getColumnInfo('carsDelayedClosingNoDays').short,
          fullLabel: getColumnInfo('carsDelayedClosingNoDays').full,
          width: '120px', 
          minWidth: '100px' 
        },
        { 
          key: 'carsClosed', 
          label: getColumnInfo('carsClosed').short,
          fullLabel: getColumnInfo('carsClosed').full,
          width: '110px', 
          minWidth: '90px' 
        }
      ],
      "Observation Open": [
        { 
          key: 'obsOpen', 
          label: getColumnInfo('obsOpen').short,
          fullLabel: getColumnInfo('obsOpen').full,
          width: '100px', 
          minWidth: '80px' 
        },
        { 
          key: 'obsDelayedClosingNoDays', 
          label: getColumnInfo('obsDelayedClosingNoDays').short,
          fullLabel: getColumnInfo('obsDelayedClosingNoDays').full,
          width: '120px', 
          minWidth: '100px' 
        },
        { 
          key: 'obsClosed', 
          label: getColumnInfo('obsClosed').short,
          fullLabel: getColumnInfo('obsClosed').full,
          width: '110px', 
          minWidth: '90px' 
        }
      ]
    };

    return [...baseColumns, ...(specificColumns[modalTitle] || [])];
  };

  // ✅ ENHANCED: Cell value with projectTitleKey support and tooltip
  const getCellValue = (project, columnKey, isFullScreen = false) => {
    let value = project[columnKey];
    
    // ✅ NEW: Use projectTitleKey if available, fallback to projectTitle
    if (columnKey === 'projectTitleKey') {
      value = project.projectTitleKey || project.projectTitle || '';
    }
    
    if (!value || value === '' || value === 'N/A') {
      return (
        <div className="flex justify-center items-center py-1">
          <span className="text-red-500 dark:text-red-400 font-medium text-lg">−</span>
        </div>
      );
    }
    
    // ✅ ENHANCED: Project title with tooltip showing full title
    if (columnKey === 'projectTitleKey') {
      const fullTitle = project.projectTitle || value;
      const maxLength = isFullScreen ? 60 : 30;
      const truncatedValue = value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
      
      return (
        <Tooltip title={fullTitle} arrow placement="top">
          <span className="text-gray-900 dark:text-gray-100 cursor-help">
            {truncatedValue}
          </span>
        </Tooltip>
      );
    }
    
    // Highlight important values
    if (columnKey === 'delayInAuditsNoDays') {
      const days = parseNumber(value);
      const className = days > 30 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" :
                       days > 15 ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs font-bold" :
                       "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
      return <span className={className}>{value} days</span>;
    }
    
    if (columnKey.includes('Audit') && (columnKey.includes('projectAudit') || columnKey.includes('clientAudit'))) {
      if (value.toLowerCase().includes('pending') || value.toLowerCase().includes('overdue') || value.toLowerCase().includes('delayed')) {
        return <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold">{value}</span>;
      }
      if (value.toLowerCase().includes('completed') || value.toLowerCase().includes('done') || value.toLowerCase().includes('finished')) {
        return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">{value}</span>;
      }
      if (value.toLowerCase().includes('in progress') || value.toLowerCase().includes('ongoing') || value.toLowerCase().includes('started')) {
        return <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">{value}</span>;
      }
      return <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">{value}</span>;
    }
    
    if (columnKey === 'carsOpen' || columnKey === 'obsOpen') {
      const count = parseNumber(value);
      if (count === 0) return <span className="text-green-600 dark:text-green-400">0</span>;
      const className = count > 5 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" :
                       "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs font-bold";
      return <span className={className}>{value}</span>;
    }
    
    return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
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

  if (!projectsData || projectsData.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No project data available for summary cards.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ UPDATED: Responsive Grid - Adjusted for 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
        {pendingActivitiesSummary.map((item) => (
          <Card
            key={item.title}
            className={`hover:scale-[1.02] sm:hover:scale-[1.03] transition-transform duration-300 shadow-lg ${
              (typeof item.value === 'number' && item.value === 0)
                ? 'cursor-default opacity-90'
                : 'cursor-pointer'
            } bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 w-full max-w-none`}
            onClick={() => handleOpen(item)}
          >
            <CardHeader className="p-3 sm:p-4 md:p-5">
              <div className={`w-fit rounded-lg p-2 transition-colors ${item.color}`}>
                <item.icon size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <div className="flex items-start justify-between w-full gap-2">
                <p className="card-title font-semibold text-xs sm:text-sm md:text-sm leading-tight flex-1">
                  {item.title}
                </p>
                <div className="flex-shrink-0">
                  {getBadge(item.title, typeof item.value === 'string' ? parseNumber(item.value) : item.value)}
                </div>
              </div>
            </CardHeader>
            <CardBody className="bg-slate-100 dark:bg-slate-950 rounded-b-xl p-3 sm:p-4 md:p-5">
              <p className={`text-2xl sm:text-3xl md:text-3xl font-bold mb-1 sm:mb-2 ${
                (typeof item.value === 'number' && item.value === 0)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-900 dark:text-slate-50'
              }`}>
                {item.value}
              </p>
              <span className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed block">
                {item.description}
              </span>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ✅ ENHANCED: Full-screen modal with tooltips on column headers */}
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="pending-activities-modal"
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
                  <h2 className="font-bold text-xl text-orange-700 dark:text-orange-400">
                    {modalTitle}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Found {modalProjects.length} project{modalProjects.length !== 1 ? 's' : ''} requiring attention
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip title={isFullScreen ? "Exit Full Screen" : "Full Screen"} arrow>
                    <IconButton
                      onClick={toggleFullScreen}
                      className="!text-orange-600 dark:!text-orange-400 hover:!text-orange-800 dark:hover:!text-orange-200"
                    >
                      {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Close" arrow>
                    <IconButton
                      onClick={handleClose}
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
                    <p className="text-center text-green-600 dark:text-green-400 text-lg font-semibold">
                      ✅ No pending activities found - All projects are on track!
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
                        <thead className="sticky top-0 bg-orange-100 dark:bg-orange-900 z-10">
                          <tr>
                            {getTableColumns(modalTitle).map(column => (
                              <th 
                                key={column.key} 
                                className="border border-gray-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-gray-900 dark:text-slate-100"
                                style={{ 
                                  width: column.width,
                                  minWidth: column.minWidth,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {/* ✅ NEW: Column headers with tooltips showing full labels */}
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
                              className="hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                            >
                              {getTableColumns(modalTitle).map(column => (
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
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </Paper>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default DashSummaryCard;

// ✅ NEW: Helper function for zero count descriptions
const getZeroDescription = (title) => {
  switch (title) {
    case "Project Quality Plan Status":
      return "All projects have quality plan status documented";
    case "Projects with Overdue Audits":
      return "All project audits are on schedule";
    case "CAR Status":
      return "No open CARs or delayed closures";
    case "Observation Status":
      return "No open observations or delayed closures";
    case "Rejection Rate":
      return "No deliverable rejections reported";
    case "Cost of poor Quality":
      return "No poor quality costs incurred";
    default:
      return "No issues found - everything looks good!";
  }
};

