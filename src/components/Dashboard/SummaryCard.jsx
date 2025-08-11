import React, { useState } from 'react'
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AlertTriangle, FileText, TrendingUp, Users, Clock, XCircle, DollarSign } from "lucide-react";
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

const calculateDaysOverdue = (project) => {
  const today = new Date();
  const originalClosingDate = parseDate(project.projectClosingDate);
  const extensionDate = parseDate(project.projectExtension);
  
  let deadlineDate = originalClosingDate;
  if (extensionDate) {
    deadlineDate = extensionDate;
  }
  
  if (!deadlineDate) return 0;
  
  const timeDiff = today.getTime() - deadlineDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return daysDiff;
};

const getTotal = (data, key) =>
  data.reduce((sum, p) => sum + (Number(p[key]) || 0), 0);

const getAverage = (data, key) =>
  data.length
    ? Math.round(
        (data.reduce((sum, p) => sum + (Number(p[key]) || 0), 0) /
          data.length) *
          100
      ) / 100
    : 0;

const getTrend = (current, previous) => {
  const diff = current - previous;
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return `${diff}`;
  return "0";
};

const getTrendPercent = (current, previous) => {
  const diff = Math.round((current - previous) * 100) / 100;
  if (diff > 0) return `+${diff}%`;
  if (diff < 0) return `${diff}%`;
  return "0%";
};

const countProjects = (data, fn) => data.filter(fn).length;

const getBadge = (title, value) => {
  // ✅ CHANGED: Project Quality Plan Status now shows "Total" badge like billability
  if (title.includes("Project Quality Plan Status")) {
    return <span className="ml-1 sm:ml-2 rounded bg-blue-200 px-1.5 sm:px-2 py-0.5 text-xs text-blue-800">Total</span>;
  }
  
  if (value === 0) {
    // Better messaging for zero counts
    if (title.includes("Overdue")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">On Time</span>;
    if (title.includes("CAR")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Issues</span>;
    if (title.includes("Observation")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Issues</span>;
    if (title.includes("Rejection")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Rejections</span>;
    if (title.includes("Cost")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Costs</span>;
    return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">OK</span>;
  }
  
  if (title.includes("Low") || title.includes("Overdue") || title.includes("CAR") || title.includes("OBS") || title.includes("Rejection") || title.includes("Cost")) {
    if (value > 10) return <span className="ml-1 sm:ml-2 rounded bg-red-200 px-1.5 sm:px-2 py-0.5 text-xs text-red-800">Critical</span>;
    if (value > 5) return <span className="ml-1 sm:ml-2 rounded bg-orange-200 px-1.5 sm:px-2 py-0.5 text-xs text-orange-800">High</span>;
    if (value > 0) return <span className="ml-1 sm:ml-2 rounded bg-yellow-200 px-1.5 sm:px-2 py-0.5 text-xs text-yellow-800">Warning</span>;
  }
  
  if (title.includes("Project with Billability")) {
    return <span className="ml-1 sm:ml-2 rounded bg-blue-200 px-1.5 sm:px-2 py-0.5 text-xs text-blue-800">Total</span>;
  }
  return null;
};

// ✅ UPDATED: Filter functions - Project Quality Plan Status now shows ALL projects
const filterProjects = {
  "Project Quality Plan Status": (p) => {
    // ✅ CHANGED: Show ALL projects instead of filtering by missing status
    return true; // Show all projects regardless of their quality plan status
  },
  
  "Projects with Overdue Audits": (p) => {
    const delayDays = Number(p.delayInAuditsNoDays || 0);
    if (p.projectNo) {
      console.log(`🔍 Project ${p.projectNo} Audit Check:`, {
        delayInAuditsNoDays: p.delayInAuditsNoDays,
        parsed: delayDays,
        willBeFiltered: delayDays > 0
      });
    }
    return delayDays > 0;
  },
  
  "CAR Status": (p) => {
    const openCars = Number(p.carsOpen || 0);
    const delayedDays = Number(p.carsDelayedClosingNoDays || 0);
    const hasIssues = openCars > 0 || delayedDays > 0;
    
    if (p.projectNo && hasIssues) {
      console.log(`🔍 Project ${p.projectNo} CAR Check:`, {
        carsOpen: p.carsOpen,
        carsDelayedClosingNoDays: p.carsDelayedClosingNoDays,
        openCars,
        delayedDays,
        willBeFiltered: hasIssues
      });
    }
    return hasIssues;
  },
  
  "Observation Status": (p) => {
    const openObs = Number(p.obsOpen || 0);
    const delayedDays = Number(p.obsDelayedClosingNoDays || 0);
    const hasIssues = openObs > 0 || delayedDays > 0;
    
    if (p.projectNo && hasIssues) {
      console.log(`🔍 Project ${p.projectNo} OBS Check:`, {
        obsOpen: p.obsOpen,
        obsDelayedClosingNoDays: p.obsDelayedClosingNoDays,
        openObs,
        delayedDays,
        willBeFiltered: hasIssues
      });
    }
    return hasIssues;
  },
  
  "Rejection Rate": (p) => {
    const rejectionStr = p.rejectionOfDeliverablesPercent || '0';
    const rejection = Number(rejectionStr.toString().replace('%', ''));
    const hasRejection = rejection > 0;
    
    if (p.projectNo && hasRejection) {
      console.log(`🔍 Project ${p.projectNo} Rejection Check:`, {
        rejectionOfDeliverablesPercent: p.rejectionOfDeliverablesPercent,
        parsed: rejection,
        willBeFiltered: hasRejection
      });
    }
    return hasRejection;
  },
  
  "Cost of poor Quality": (p) => {
    const cost = Number(p.costOfPoorQualityAED || 0);
    const hasCosts = cost > 0;
    
    if (p.projectNo && hasCosts) {
      console.log(`🔍 Project ${p.projectNo} Cost Check:`, {
        costOfPoorQualityAED: p.costOfPoorQualityAED,
        parsed: cost,
        willBeFiltered: hasCosts
      });
    }
    return hasCosts;
  },
  
  "Project with Billability": (p) => {
    const billability = p.qualityBillabilityPercent;
    const hasBillability = billability && 
                          billability !== '' && 
                          billability !== 'N/A' &&
                          billability !== null &&
                          billability !== undefined;
    
    if (p.projectNo) {
      console.log(`🔍 Project ${p.projectNo} Billability Check:`, {
        qualityBillabilityPercent: `"${billability}"`,
        willBeFiltered: hasBillability
      });
    }
    return hasBillability;
  },
};

const SummaryCard = ({ projectsData = [] }) => {
  // State management
  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);

  // ✅ ADD: Enhanced debugging for data structure
  console.log('🔍 SummaryCard - Total projects:', projectsData.length);
  
  if (projectsData.length > 0) {
    console.log('🔍 First project data structure:', {
      projectNo: projectsData[0].projectNo,
      projectQualityPlanStatusRev: `"${projectsData[0].projectQualityPlanStatusRev}"`,
      projectQualityPlanStatusIssueDate: `"${projectsData[0].projectQualityPlanStatusIssueDate}"`,
      delayInAuditsNoDays: projectsData[0].delayInAuditsNoDays,
      carsOpen: projectsData[0].carsOpen,
      obsOpen: projectsData[0].obsOpen,
      rejectionOfDeliverablesPercent: projectsData[0].rejectionOfDeliverablesPercent,
      costOfPoorQualityAED: projectsData[0].costOfPoorQualityAED,
      qualityBillabilityPercent: `"${projectsData[0].qualityBillabilityPercent}"`
    });
  }

  // Calculate counts with debugging
  console.log('🔍 Starting filter calculations...');
  
  // ✅ CHANGED: Project Quality Plan Status now shows ALL projects
  const allQualityPlanProjects = countProjects(projectsData, filterProjects["Project Quality Plan Status"]);
  console.log('✅ Project Quality Plan Status count (ALL):', allQualityPlanProjects);
  
  const overdueAudits = countProjects(projectsData, filterProjects["Projects with Overdue Audits"]);
  console.log('✅ Projects with Overdue Audits count:', overdueAudits);
  
  const carIssues = countProjects(projectsData, filterProjects["CAR Status"]);
  console.log('✅ CAR Status count:', carIssues);
  
  const obsIssues = countProjects(projectsData, filterProjects["Observation Status"]);
  console.log('✅ Observation Status count:', obsIssues);
  
  const highRejection = countProjects(projectsData, filterProjects["Rejection Rate"]);
  console.log('✅ Rejection Rate count:', highRejection);
  
  const highQualityCosts = countProjects(projectsData, filterProjects["Cost of poor Quality"]);
  console.log('✅ Cost of poor Quality count:', highQualityCosts);
  
  const allProjectsWithBillability = countProjects(projectsData, filterProjects["Project with Billability"]);
  console.log('✅ Project with Billability count:', allProjectsWithBillability);

  const importantSummary = [
    {
      title: "Project Quality Plan Status",
      value: allQualityPlanProjects, // ✅ CHANGED: Now shows total count of ALL projects
      icon: FileText,
      color: "text-red-600 bg-red-100/60 dark:bg-red-900/30 dark:text-red-400",
      description: "All projects with quality plan status information" // ✅ CHANGED: Updated description
    },
    {
      title: "Projects with Overdue Audits",
      value: overdueAudits,
      icon: Clock,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      description: "Projects with delayed audits requiring attention"
    },
    {
      title: "CAR Status",
      value: carIssues,
      icon: AlertTriangle,
      color: "text-yellow-600 bg-yellow-100/60 dark:bg-yellow-900/30 dark:text-yellow-400",
      description: "Projects with open CARs or delayed closures"
    },
    {
      title: "Observation Status",
      value: obsIssues,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100/60 dark:bg-blue-900/30 dark:text-blue-400",
      description: "Projects with open observations or delayed closures"
    },
    {
      title: "Rejection Rate",
      value: highRejection,
      icon: XCircle,
      color: "text-purple-600 bg-purple-100/60 dark:bg-purple-900/30 dark:text-purple-400",
      description: "Projects with deliverable rejection issues"
    },
    {
      title: "Cost of poor Quality",
      value: highQualityCosts,
      icon: DollarSign,
      color: "text-pink-600 bg-pink-100/60 dark:bg-pink-900/30 dark:text-pink-400",
      description: "Projects with poor quality cost impacts"
    },
    {
      title: "Project with Billability",
      value: allProjectsWithBillability,
      icon: Users,
      color: "text-green-600 bg-green-100/60 dark:bg-green-900/30 dark:text-green-400",
      description: "All projects with billability information"
    }
  ];

  // ✅ UPDATED: Modal handlers - Remove zero count restriction for Project Quality Plan Status
  const handleOpen = (item) => {
    console.log('🔍 Opening modal for:', item.title, 'Count:', item.value);
    
    // ✅ CHANGED: Allow Project Quality Plan Status to open modal even if it was 0 before
    if (item.value === 0 && !item.title.includes("Project with Billability") && !item.title.includes("Project Quality Plan Status")) {
      console.log('⏹️ Skipping modal - no items to show');
      return; // Don't open modal for zero counts (except billability and quality plan status)
    }
    
    console.log('🔍 Using filter function:', filterProjects[item.title]);
    
    try {
      const filteredProjects = projectsData.filter(filterProjects[item.title]);
      console.log('✅ Filtered projects count:', filteredProjects.length);
      console.log('✅ Filtered projects:', filteredProjects.map(p => ({
        projectNo: p.projectNo,
        projectTitle: p.projectTitle
      })));
      
      setModalTitle(item.title);
      setModalProjects(filteredProjects);
      setOpen(true);
    } catch (error) {
      console.error('❌ Error in handleOpen:', error);
    }
  };

  const handleClose = () => {
    console.log('Closing modal');
    setOpen(false);
    setModalTitle('');
    setModalProjects([]);
  };

  const getColumnHeader = (modalTitle) => {
    const headers = {
      "Project Quality Plan Status": "Quality Plan Status",
      "Projects with Overdue Audits": "Days Delayed",
      "CAR Status": "Open CARs / Delayed Days",
      "Observation Status": "Open Observations / Delayed Days",
      "Rejection Rate": "Rejection of Deliverables",
      "Cost of poor Quality": "Cost of Poor Quality (AED)",
      "Project with Billability": "Quality Billability"
    };
    return headers[modalTitle] || "Issue Details";
  };

  const getDetailedStatus = (project, modalTitle) => {
    switch (modalTitle) {
      case "Project Quality Plan Status":
        const qualityPlanRev = project.projectQualityPlanStatusRev || "";
        const qualityPlanIssueDate = project.projectQualityPlanStatusIssueDate || "";
        
        // ✅ CHANGED: Show actual status instead of what's missing
        if (qualityPlanRev && qualityPlanIssueDate) {
          return {
            value: `Rev: ${qualityPlanRev} | Date: ${qualityPlanIssueDate}`,
            severity: "info"
          };
        } else if (qualityPlanRev) {
          return {
            value: `Rev: ${qualityPlanRev} | Date: Missing`,
            severity: "warning"
          };
        } else if (qualityPlanIssueDate) {
          return {
            value: `Rev: Missing | Date: ${qualityPlanIssueDate}`,
            severity: "warning"
          };
        } else {
          return {
            value: "Rev: Missing | Date: Missing",
            severity: "critical"
          };
        }

      case "Projects with Overdue Audits":
        return {
          value: `${project.delayInAuditsNoDays || 0} days`,
          severity: Number(project.delayInAuditsNoDays || 0) > 10 ? "critical" : "warning"
        };
      
      case "CAR Status":
        const openCars = Number(project.carsOpen || 0);
        const delayedCarDays = Number(project.carsDelayedClosingNoDays || 0);
        
        if (openCars > 0 && delayedCarDays > 0) {
          return {
            value: `${openCars} open • ${delayedCarDays} days delayed`,
            severity: openCars > 5 || delayedCarDays > 14 ? "critical" : "warning"
          };
        } else if (openCars > 0) {
          return {
            value: `${openCars} open`,
            severity: openCars > 5 ? "critical" : "warning"
          };
        } else {
          return {
            value: `${delayedCarDays} days delayed`,
            severity: delayedCarDays > 14 ? "critical" : "warning"
          };
        }
      
      case "Observation Status":
        const openObs = Number(project.obsOpen || 0);
        const delayedObsDays = Number(project.obsDelayedClosingNoDays || 0);
        
        if (openObs > 0 && delayedObsDays > 0) {
          return {
            value: `${openObs} open • ${delayedObsDays} days delayed`,
            severity: openObs > 10 || delayedObsDays > 14 ? "critical" : "warning"
          };
        } else if (openObs > 0) {
          return {
            value: `${openObs} open`,
            severity: openObs > 10 ? "critical" : "warning"
          };
        } else {
          return {
            value: `${delayedObsDays} days delayed`,
            severity: delayedObsDays > 14 ? "critical" : "warning"
          };
        }
      
      case "Rejection Rate":
        const rejectionRate = Number(project.rejectionOfDeliverablesPercent?.toString().replace('%', '') || 0);
        return {
          value: project.rejectionOfDeliverablesPercent || "0%",
          severity: rejectionRate > 3 ? "critical" : rejectionRate > 1 ? "warning" : "info"
        };
      
      case "Cost of poor Quality":
        const qualityCost = Number(project.costOfPoorQualityAED || 0);
        return {
          value: `${qualityCost.toLocaleString()} AED`,
          severity: qualityCost > 5000 ? "critical" : qualityCost > 1000 ? "warning" : "info"
        };
      
      case "Project with Billability":
        const billabilityPercent = Number(project.qualityBillabilityPercent?.toString().replace('%', '') || 0);
        return {
          value: project.qualityBillabilityPercent || "0%",
          severity: billabilityPercent > 150 ? "critical" : 
                   billabilityPercent > 100 ? "warning" : 
                   billabilityPercent >= 80 ? "info" : "warning"
        };
      
      default:
        return {
          value: "Unknown",
          severity: "info"
        };
    }
  };

  // ✅ UPDATED: getBadge function for Project Quality Plan Status
  const getBadge = (title, value) => {
    // ✅ CHANGED: Project Quality Plan Status now shows "Total" badge like billability
    if (title.includes("Project Quality Plan Status")) {
      return <span className="ml-1 sm:ml-2 rounded bg-blue-200 px-1.5 sm:px-2 py-0.5 text-xs text-blue-800">Total</span>;
    }
    
    if (value === 0) {
      // Better messaging for zero counts
      if (title.includes("Overdue")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">On Time</span>;
      if (title.includes("CAR")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Issues</span>;
      if (title.includes("Observation")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Issues</span>;
      if (title.includes("Rejection")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Rejections</span>;
      if (title.includes("Cost")) return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">No Costs</span>;
      return <span className="ml-1 sm:ml-2 rounded bg-green-200 px-1.5 sm:px-2 py-0.5 text-xs text-green-800">OK</span>;
    }
    
    if (title.includes("Low") || title.includes("Overdue") || title.includes("CAR") || title.includes("OBS") || title.includes("Rejection") || title.includes("Cost")) {
      if (value > 10) return <span className="ml-1 sm:ml-2 rounded bg-red-200 px-1.5 sm:px-2 py-0.5 text-xs text-red-800">Critical</span>;
      if (value > 5) return <span className="ml-1 sm:ml-2 rounded bg-orange-200 px-1.5 sm:px-2 py-0.5 text-xs text-orange-800">High</span>;
      if (value > 0) return <span className="ml-1 sm:ml-2 rounded bg-yellow-200 px-1.5 sm:px-2 py-0.5 text-xs text-yellow-800">Warning</span>;
    }
    
    if (title.includes("Project with Billability")) {
      return <span className="ml-1 sm:ml-2 rounded bg-blue-200 px-1.5 sm:px-2 py-0.5 text-xs text-blue-800">Total</span>;
    }
    return null;
  };

  if (!projectsData || projectsData.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No project data available for summary cards.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {importantSummary.map((item) => (
          <Card
            key={item.title}
            className={`hover:scale-[1.02] sm:hover:scale-[1.03] transition-transform duration-300 shadow-lg ${
              item.value === 0 && !item.title.includes("Project with Billability") && !item.title.includes("Project Quality Plan Status")
                ? 'cursor-default opacity-90' // ✅ UPDATED: Exclude Project Quality Plan Status from zero-count styling
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
                  {getBadge(item.title, item.value)}
                </div>
              </div>
            </CardHeader>
            <CardBody className="bg-slate-100 dark:bg-slate-950 rounded-b-xl p-3 sm:p-4 md:p-5">
              <p className={`text-2xl sm:text-3xl md:text-3xl font-bold mb-1 sm:mb-2 ${
              item.value === 0 && !item.title.includes("Project Quality Plan Status")
                ? 'text-green-600 dark:text-green-400' // ✅ UPDATED: Exclude Project Quality Plan Status from green styling
                : 'text-slate-900 dark:text-slate-50'
            }`}>
                {item.value}
              </p>
              <span className="text-xs sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed block">
                {/* ✅ UPDATED: Exclude Project Quality Plan Status from zero descriptions */}
                {item.value === 0 && !item.title.includes("Project with Billability") && !item.title.includes("Project Quality Plan Status")
                  ? getZeroDescription(item.title)
                  : item.description
                }
              </span>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ✅ FIXED: Modal with better error handling */}
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="project-details-modal"
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
              
              <h2 id="project-details-modal" className="font-bold text-lg sm:text-xl md:text-xl mb-3 sm:mb-4 text-blue-700 pr-8 sm:pr-12">
                {modalTitle}
              </h2>
              
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Found {modalProjects.length} project{modalProjects.length !== 1 ? 's' : ''} matching this criteria
              </p>
              
              {modalProjects.length === 0 ? (
                <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">
                  No projects found for this criteria.
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
                      <thead className="sticky top-0 bg-blue-100 dark:bg-blue-900 z-10">
                        <tr>
                          <th className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-2 text-left font-semibold">
                            Project No
                          </th>
                          <th className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-2 text-left font-semibold min-w-[120px] sm:min-w-[150px]">
                            Title
                          </th>
                          <th className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-2 text-left font-semibold hidden sm:table-cell">
                            Manager
                          </th>
                          <th className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-2 text-left font-semibold">
                            Client
                          </th>
                          <th className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-2 text-center font-semibold min-w-[100px] sm:min-w-[120px]">
                            {getColumnHeader(modalTitle)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalProjects.map((project) => {
                          const statusInfo = getDetailedStatus(project, modalTitle);
                          return (
                            <tr 
                              key={project.projectNo} 
                              className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                            >
                              <td className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm">
                                {project.projectNo}
                              </td>
                              <td 
                                className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm" 
                                title={project.projectTitle}
                              >
                                <div className="max-w-[100px] sm:max-w-[150px] md:max-w-[200px] overflow-hidden">
                                  {project.projectTitle?.length > 30
                                    ? `${project.projectTitle.substring(0, 30)}...` 
                                    : project.projectTitle}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hidden sm:table-cell">
                                <div className="max-w-[120px] overflow-hidden text-ellipsis">
                                  {project.projectManager}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                                <div className="max-w-[80px] sm:max-w-[120px] overflow-hidden text-ellipsis">
                                  {project.client}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-center">
                                <span className={`px-1.5 sm:px-2 py-1 rounded text-xs font-semibold inline-block max-w-full ${
                                  statusInfo.severity === "critical" 
                                    ? "bg-red-200 text-red-800" 
                                    : statusInfo.severity === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  <div className="truncate">
                                    {statusInfo.value}
                                  </div>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
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

export default SummaryCard;

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

