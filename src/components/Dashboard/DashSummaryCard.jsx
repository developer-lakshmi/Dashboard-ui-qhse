import React, { useState } from 'react'
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AlertTriangle, FileText, Clock, Wrench, Eye, DollarSign } from "lucide-react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';

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
    if (title.includes("Cost of Poor Quality")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Cost</span>;
    return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">OK</span>;
  }
  
  if (title.includes("Quality Plan Pending") || title.includes("Audits Pending") || title.includes("CAR Open") || title.includes("Observation Open")) {
    if (value > 10) return <span className="ml-1 sm:ml-2 rounded bg-red-200 px-1.5 sm:px-2 py-0.5 text-xs text-red-800">Critical</span>;
    if (value > 5) return <span className="ml-1 sm:ml-2 rounded bg-orange-200 px-1.5 sm:px-2 py-0.5 text-xs text-orange-800">High</span>;
    if (value > 0) return <span className="ml-1 sm:ml-2 rounded bg-yellow-200 px-1.5 sm:px-2 py-0.5 text-xs text-yellow-800">Attention</span>;
  }
  
  if (title.includes("Cost of Poor Quality")) {
    // ✅ CHANGED: More suitable badge for cost-related metric
    if (value > 10) return <span className="ml-1 sm:ml-2 rounded bg-red-200 px-1.5 sm:px-2 py-0.5 text-xs text-red-800">High Cost</span>;
    if (value > 5) return <span className="ml-1 sm:ml-2 rounded bg-orange-200 px-1.5 sm:px-2 py-0.5 text-xs text-orange-800">Medium Cost</span>;
    if (value > 0) return <span className="ml-1 sm:ml-2 rounded bg-purple-200 px-1.5 sm:px-2 py-0.5 text-xs text-purple-800">With Cost</span>;
  }
  
  return null;
};

// ✅ SIMPLE FIX: Add valid project helper function
const isValidProject = (project) => {
  return project && 
         project.projectNo && 
         project.projectNo.trim() !== '' && 
         project.projectNo !== 'N/A' &&
         project.projectTitle && 
         project.projectTitle.trim() !== '' && 
         project.projectTitle !== 'N/A';
};

// ✅ UPDATED: Filter functions - Only fix Quality Plan Pending
const filterProjects = {
  "Quality Plan Pending": (p) => {
    // ✅ FIRST CHECK: Only process valid projects (this is the missing piece!)
    if (!isValidProject(p)) return false;
    
    // ✅ THEN CHECK: Show projects with MISSING quality plan information
    const hasQualityPlanRev = p.projectQualityPlanStatusRev && 
                             p.projectQualityPlanStatusRev !== '' && 
                             p.projectQualityPlanStatusRev !== 'N/A';
    const hasQualityPlanDate = p.projectQualityPlanStatusIssueDate && 
                              p.projectQualityPlanStatusIssueDate !== '' && 
                              p.projectQualityPlanStatusIssueDate !== 'N/A';
    
    // Return projects that are MISSING either revision or date
    return !hasQualityPlanRev || !hasQualityPlanDate;
  },
  
  // ✅ KEEP OTHER FILTERS UNCHANGED - they work fine as they are
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
  },
  
  "Cost of Poor Quality": (p) => {
    const cost = Number(p.costOfPoorQualityAED || 0);
    return cost > 0;
  }
};

const DashSummaryCard = ({ projectsData = [] }) => {
  // State management
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);

  // ✅ UPDATED: Calculate pending activities counts
  const qualityPlanPending = countProjects(projectsData, filterProjects["Quality Plan Pending"]);
  const auditsPending = countProjects(projectsData, filterProjects["Projects Audits Pending"]);
  const carOpen = projectsData.reduce((sum, p) => sum + parseNumber(p.carsOpen), 0); // Total count of open CARs
  const obsOpen = projectsData.reduce((sum, p) => sum + parseNumber(p.obsOpen), 0); // Total count of open observations
  const totalCostOfPoorQuality = projectsData.reduce((sum, p) => sum + parseNumber(p.costOfPoorQualityAED), 0); // Sum of all costs
  const costProjectsCount = countProjects(projectsData, filterProjects["Cost of Poor Quality"]); // Count of projects with costs

  // ✅ UPDATED: Pending Activities Summary - Show project count for Cost of Poor Quality card
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
    },
    {
      title: "Cost of Poor Quality",
      value: costProjectsCount, // ✅ CHANGED: Show count of projects, not total cost
      icon: DollarSign,
      color: "text-purple-600 bg-purple-100/60 dark:bg-purple-900/30 dark:text-purple-400",
      description: "Projects with quality cost impact"
    }
  ];

  // Modal handlers
  const handleOpen = (item) => {
    console.log('🔍 Opening modal for:', item.title);
    
    if ((item.title.includes("CAR Open") || item.title.includes("Observation Open")) && 
        (typeof item.value === 'number' && item.value === 0)) {
      return; // Don't open modal for zero counts on CAR/OBS totals
    }
    
    if (item.title === "Cost of Poor Quality") {
      // For cost of poor quality, show projects that have costs
      const filteredProjects = projectsData.filter(filterProjects["Cost of Poor Quality"]);
      setModalTitle(item.title);
      setModalProjects(filteredProjects);
      setOpen(true);
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
  };

  // ✅ UPDATED: Column headers using exact Google Sheets headers
  const getColumnHeader = (modalTitle) => {
    const headers = {
      "Quality Plan Pending": "Quality Plan Status",
      "Projects Audits Pending": "Delay in Audits - No. of Days",
      "CAR Open": "CARs Open",
      "Observation Open": "No. of Obs Open",
      "Cost of Poor Quality": "Cost of Poor Quality in AED"
    };
    return headers[modalTitle] || "Status";
  };

  // ✅ UPDATED: Table columns - Enhanced Projects Audits Pending columns
  const getTableColumns = (modalTitle) => {
    const baseColumns = [
      { key: 'projectNo', label: 'Project No' },
      { key: 'projectTitle', label: 'Project Title' },
      { key: 'projectManager', label: 'Project Manager' },
      { key: 'client', label: 'Client' }
    ];

    const specificColumns = {
      "Quality Plan Pending": [
        { key: 'projectQualityPlanStatusRev', label: 'Project Quality Plan status - Rev' },
        { key: 'projectQualityPlanStatusIssueDate', label: 'Project Quality Plan status - Issued Date' }
      ],
      "Projects Audits Pending": [
        { key: 'projectAudit1', label: 'Project Audit -1' },
        { key: 'projectAudit2', label: 'Project Audit -2' },
        { key: 'projectAudit3', label: 'Project Audit -3' },
        { key: 'projectAudit4', label: 'Project Audit -4' },
        { key: 'clientAudit1', label: 'Client Audit -1' },
        { key: 'clientAudit2', label: 'Client Audit -2' },
        { key: 'delayInAuditsNoDays', label: 'Delay in Audits - No. of Days' }
      ],
      "CAR Open": [
        { key: 'carsOpen', label: 'CARs Open' },
        { key: 'carsDelayedClosingNoDays', label: 'CARs Delayed closing No. days' },
        { key: 'carsClosed', label: 'CARs Closed' }
      ],
      "Observation Open": [
        { key: 'obsOpen', label: 'No. of Obs Open' },
        { key: 'obsDelayedClosingNoDays', label: 'Obs delayed closing No. of Days' },
        { key: 'obsClosed', label: 'Obs Closed' }
      ],
      "Cost of Poor Quality": [
        { key: 'costOfPoorQualityAED', label: 'Cost of Poor Quality in AED' }
      ]
    };

    return [...baseColumns, ...(specificColumns[modalTitle] || [])];
  };

  const getDetailedStatus = (project, modalTitle) => {
    switch (modalTitle) {
      case "Quality Plan Pending":
        const qualityPlanRev = project.projectQualityPlanStatusRev || "";
        const qualityPlanIssueDate = project.projectQualityPlanStatusIssueDate || "";
        
        if (!qualityPlanRev && !qualityPlanIssueDate) {
          return {
            value: "Rev: Missing | Date: Missing",
            severity: "critical"
          };
        } else if (!qualityPlanRev) {
          return {
            value: `Rev: Missing | Date: ${qualityPlanIssueDate}`,
            severity: "warning"
          };
        } else if (!qualityPlanIssueDate) {
          return {
            value: `Rev: ${qualityPlanRev} | Date: Missing`,
            severity: "warning"
          };
        } else {
          return {
            value: `Rev: ${qualityPlanRev} | Date: ${qualityPlanIssueDate}`,
            severity: "info"
          };
        }

      case "Projects Audits Pending":
        const delayDays = Number(project.delayInAuditsNoDays || 0);
        return {
          value: `${delayDays} days overdue`,
          severity: delayDays > 30 ? "critical" : delayDays > 15 ? "warning" : "info"
        };
      
      case "CAR Open":
        const openCars = Number(project.carsOpen || 0);
        return {
          value: `${openCars} open`,
          severity: openCars > 5 ? "critical" : openCars > 2 ? "warning" : "info"
        };
      
      case "Observation Open":
        const openObs = Number(project.obsOpen || 0);
        return {
          value: `${openObs} open`,
          severity: openObs > 10 ? "critical" : openObs > 5 ? "warning" : "info"
        };
      
      case "Cost of Poor Quality":
        const cost = Number(project.costOfPoorQualityAED || 0);
        return {
          value: `${cost.toLocaleString()} AED`,
          severity: cost > 10000 ? "critical" : cost > 5000 ? "warning" : "info"
        };
      
      default:
        return {
          value: "Unknown",
          severity: "info"
        };
    }
  };

  const getCellValue = (project, columnKey) => {
    const value = project[columnKey];
    
    if (!value || value === '' || value === 'N/A') {
      return <span className="text-red-500 dark:text-red-400 font-semibold italic">Missing</span>;
    }
    
    // Highlight important values
    if (columnKey === 'delayInAuditsNoDays') {
      const days = parseNumber(value);
      const className = days > 30 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" :
                       days > 15 ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs font-bold" :
                       "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
      return <span className={className}>{value} days</span>;
    }
    
    // ✅ NEW: Highlight audit status columns
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
    
    if (columnKey === 'costOfPoorQualityAED') {
      const cost = parseNumber(value);
      return <span className="text-purple-800 dark:text-purple-300 font-bold font-mono">{cost.toLocaleString()} AED</span>;
    }
    
    return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
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

      {/* ✅ ENHANCED: Modal with Cost of Poor Quality total shown in table footer */}
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="pending-activities-modal"
          sx={{ zIndex: 1300 }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: { xs: '20px', sm: '40px', md: '60px', lg: '80px' },
              left: '50%',
              transform: 'translate(-50%, 0)',
              bgcolor: 'transparent',
              width: { 
                xs: '95vw', 
                sm: '90vw', 
                md: '85vw', 
                lg: '800px',
                xl: '900px',
                '2xl': '1000px'
              },
              maxHeight: { 
                xs: 'calc(100vh - 40px)', 
                sm: 'calc(100vh - 80px)', 
                md: 'calc(100vh - 120px)',
                lg: 'calc(100vh - 160px)'
              },
              overflowY: 'auto',
              outline: 'none',
            }}
          >
            <Paper elevation={6} sx={{ 
              borderRadius: { xs: 2, sm: 3, md: 4 }, 
              p: { xs: 2, sm: 3, md: 3 }, 
              position: 'relative',
              bgcolor: 'background.paper'
            }}>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{ 
                  position: 'absolute', 
                  right: { xs: 8, sm: 12 }, 
                  top: { xs: 8, sm: 12 }, 
                  color: 'grey.600',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              
              <h2 id="pending-activities-modal" className="font-bold text-lg sm:text-xl md:text-xl mb-3 sm:mb-4 text-orange-700 dark:text-orange-400 pr-8 sm:pr-12">
                {modalTitle}
              </h2>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                {modalTitle === "Cost of Poor Quality" 
                  ? `Found ${modalProjects.length} project${modalProjects.length !== 1 ? 's' : ''} with quality costs`
                  : `Found ${modalProjects.length} project${modalProjects.length !== 1 ? 's' : ''} requiring attention`
                }
              </p>
              
              {modalProjects.length === 0 ? (
                <p className="text-center text-green-600 dark:text-green-400 py-6 sm:py-8 text-sm sm:text-base font-semibold">
                  ✅ No pending activities found - All projects are on track!
                </p>
              ) : (
                <div className="overflow-hidden">
                  <div 
                    style={{ 
                      maxHeight: '60vh', 
                      overflowY: 'auto',
                      overflowX: 'auto'
                    }}
                    className="border rounded-lg shadow-sm"
                  >
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead className="sticky top-0 bg-orange-100 dark:bg-orange-900 z-10">
                        <tr>
                          {getTableColumns(modalTitle).map(column => (
                            <th key={column.key} className="border border-gray-300 dark:border-slate-600 px-1.5 sm:px-2 md:px-3 py-2 text-left font-semibold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                              {column.label}
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
                              <td key={`${column.key}-${idx}`} className="border border-gray-300 dark:border-slate-600 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-gray-900 dark:text-slate-100">
                                {getCellValue(project, column.key)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      {/* ✅ NEW: Show total sum in table footer for Cost of Poor Quality */}
                      {modalTitle === "Cost of Poor Quality" && (
                        <tfoot className="sticky bottom-0 bg-purple-100 dark:bg-purple-900">
                          <tr>
                            <td colSpan={getTableColumns(modalTitle).length - 1} className="border border-gray-300 dark:border-slate-600 px-1.5 sm:px-2 md:px-3 py-2 text-right font-bold text-purple-800 dark:text-purple-200">
                              Total Cost of Poor Quality:
                            </td>
                            <td className="border border-gray-300 dark:border-slate-600 px-1.5 sm:px-2 md:px-3 py-2 font-bold text-purple-800 dark:text-purple-200 font-mono">
                              {totalCostOfPoorQuality.toLocaleString()} AED
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
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

