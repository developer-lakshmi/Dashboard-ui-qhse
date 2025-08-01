import React, { useState } from 'react'
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AlertTriangle, FileText, TrendingUp, Users, Clock, XCircle, DollarSign } from "lucide-react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';

// ✅ ADDED: Simple date parsing function (same as chartUtils)
const parseDate = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === '') return null;
  return new Date(dateStr);
};

// ✅ ADDED: Simple overdue calculation function (same as chartUtils)
const calculateDaysOverdue = (project) => {
  const today = new Date();
  const originalClosingDate = parseDate(project.projectClosingDate);
  const extensionDate = parseDate(project.projectExtension);
  
  // Step 1: Which date should we use?
  let deadlineDate = originalClosingDate; // Default: use original closing date
  
  if (extensionDate) {
    deadlineDate = extensionDate; // If extension exists, use extension date instead
  }
  
  // Step 2: Calculate days difference
  if (!deadlineDate) return 0; // No date = no overdue
  
  const timeDiff = today.getTime() - deadlineDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return daysDiff; // Positive = overdue, Negative = time remaining
};

// Helper functions
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

// Trend calculation helpers
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

// Helper: Get count of projects with a condition
const countProjects = (data, fn) => data.filter(fn).length;

const getBadge = (title, value) => {
  if (value === 0) return <span className="ml-2 rounded bg-green-200 px-2 py-0.5 text-xs text-green-800">OK</span>;
  if (title.includes("Low") || title.includes("Overdue") || title.includes("CAR") || title.includes("OBS") || title.includes("Rejection") || title.includes("Cost")) {
    if (value > 10) return <span className="ml-2 rounded bg-red-200 px-2 py-0.5 text-xs text-red-800">Critical</span>;
    if (value > 5) return <span className="ml-2 rounded bg-orange-200 px-2 py-0.5 text-xs text-orange-800">High</span>;
    if (value > 0) return <span className="ml-2 rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800">Warning</span>;
  }
  return null;
};

// ✅ SIMPLIFIED: Updated filter functions using the same logic as chartUtils
const filterProjects = {
  "Projects with Overdue Audits": p => Number(p.delayInAuditsNoDays) > 0,
  "CAR Management Issues": p => Number(p.carsOpen) > 0 || Number(p.carsDelayedClosingNoDays) > 0,
  "Observation Management Issues": p => Number(p.obsOpen) > 0 || Number(p.obsDelayedClosingNoDays) > 0,
  "Projects with Over Billability": p => Number(p.qualityBillabilityPercent?.toString().replace('%', '')) > 100,
  "Project Closure Overdue": p => { // ✅ SIMPLIFIED: Use the same calculation as chartUtils
    const completion = Number(p.projectCompletionPercent?.toString().replace('%', '')) || 0;
    const daysOverdue = calculateDaysOverdue(p);
    
    // Project is overdue if days overdue is positive and completion is less than 100%
    return daysOverdue > 0 && completion < 100;
  },
  "Projects with Rejection Rate": p => Number(p.rejectionOfDeliverablesPercent?.toString().replace('%', '')) > 0,
  "Projects with Poor Quality Costs": p => Number(p.costOfPoorQualityAED) > 0,
};

const SummaryCard = ({ projectsData = [] }) => {
  // Mock previous data (in production, fetch from previous period)
  const previousProjectsData = projectsData.map(p => ({
    ...p,
    carsOpen: Math.max(0, (p.carsOpen || 0) - 2),
    obsOpen: Math.max(0, (p.obsOpen || 0) - 1),
    delayInAuditsNoDays: Math.max(0, (p.delayInAuditsNoDays || 0) - 5),
    projectKPIsAchievedPercent: (p.projectKPIsAchievedPercent || 0) - 3,
  }));

  // Calculate counts using the passed projectsData
  const overdueAudits = countProjects(projectsData, p => Number(p.delayInAuditsNoDays) > 0);
  
  // Combined CAR issues (open CARs + delayed closures)
  const carIssues = countProjects(projectsData, p => 
    Number(p.carsOpen) > 0 || Number(p.carsDelayedClosingNoDays) > 0
  );
  
  // Combined Observation issues (open observations + delayed closures)
  const obsIssues = countProjects(projectsData, p => 
    Number(p.obsOpen) > 0 || Number(p.obsDelayedClosingNoDays) > 0
  );
  
  // Projects with over billability (>100%)
  const overBillability = countProjects(projectsData, p => {
    const billability = typeof p.qualityBillabilityPercent === 'string' 
      ? Number(p.qualityBillabilityPercent.replace('%', ''))
      : Number(p.qualityBillabilityPercent);
    return billability > 100;
  });
  
  // ✅ SIMPLIFIED: Projects with closure overdue using the same calculation as chartUtils
  const overdueClosures = countProjects(projectsData, p => {
    const completion = typeof p.projectCompletionPercent === 'string'
      ? Number(p.projectCompletionPercent.replace('%', ''))
      : Number(p.projectCompletionPercent);
    
    const daysOverdue = calculateDaysOverdue(p);
    
    // Project is overdue if days overdue is positive and completion is less than 100%
    return daysOverdue > 0 && completion < 100;
  });

  // Show ALL projects with any rejection rate (>0%)
  const highRejection = countProjects(projectsData, p => {
    const rejection = typeof p.rejectionOfDeliverablesPercent === 'string'
      ? Number(p.rejectionOfDeliverablesPercent.replace('%', ''))
      : Number(p.rejectionOfDeliverablesPercent);
    return rejection > 0;
  });

  // Show ALL projects with any poor quality costs (>0 AED)
  const highQualityCosts = countProjects(projectsData, p => {
    const cost = Number(p.costOfPoorQualityAED) || 0;
    return cost > 0;
  });

  const importantSummary = [
    {
      title: "Projects with Overdue Audits",
      value: overdueAudits,
      icon: Clock,
      color: "text-red-600 bg-red-100/60 dark:bg-red-900/30 dark:text-red-400",
      description: "Projects with delayed audits requiring attention"
    },
    {
      title: "CAR Management Issues",
      value: carIssues,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      description: "Projects with open CARs or delayed closures"
    },
    {
      title: "Observation Management Issues",
      value: obsIssues,
      icon: FileText,
      color: "text-yellow-600 bg-yellow-100/60 dark:bg-yellow-900/30 dark:text-yellow-400",
      description: "Projects with open observations or delayed closures"
    },
    {
      title: "Projects with Over Billability",
      value: overBillability,
      icon: Users,
      color: "text-blue-600 bg-blue-100/60 dark:bg-blue-900/30 dark:text-blue-400",
      description: "Projects with billability exceeding 100%"
    },
    {
      title: "Project Closure Overdue",
      value: overdueClosures,
      icon: TrendingUp,
      color: "text-green-600 bg-green-100/60 dark:bg-green-900/30 dark:text-green-400",
      description: "Projects overdue for closure and not completed"
    },
    {
      title: "Projects with Rejection Rate",
      value: highRejection,
      icon: XCircle,
      color: "text-purple-600 bg-purple-100/60 dark:bg-purple-900/30 dark:text-purple-400",
      description: "Projects with deliverable rejection issues"
    },
    {
      title: "Projects with Poor Quality Costs",
      value: highQualityCosts,
      icon: DollarSign,
      color: "text-pink-600 bg-pink-100/60 dark:bg-pink-900/30 dark:text-pink-400",
      description: "Projects with poor quality cost impacts"
    }
  ];

  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);

  const handleOpen = (item) => {
    setModalTitle(item.title);
    setModalProjects(projectsData.filter(filterProjects[item.title]));
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Helper function to get the appropriate column header for each modal type
  const getColumnHeader = (modalTitle) => {
    switch (modalTitle) {
      case "Projects with Overdue Audits":
        return "Days Delayed";
      case "CAR Management Issues":
        return "Open CARs / Delayed Days";
      case "Observation Management Issues":
        return "Open Observations / Delayed Days";
      case "Projects with Over Billability":
        return "Quality Billability";
      case "Project Closure Overdue":
        return "Days Overdue"; // ✅ SIMPLIFIED: Just show days overdue
      case "Projects with Rejection Rate":
        return "Rejection of Deliverables";
      case "Projects with Poor Quality Costs":
        return "Cost of Poor Quality (AED)";
      default:
        return "Issue Details";
    }
  };

  // ✅ SIMPLIFIED: Helper function using the same calculation as chartUtils
  const getDetailedStatus = (project, modalTitle) => {
    switch (modalTitle) {
      case "Projects with Overdue Audits":
        return {
          value: project.delayInAuditsNoDays || 0,
          severity: Number(project.delayInAuditsNoDays) > 10 ? "critical" : "warning"
        };
      
      case "CAR Management Issues":
        const openCars = Number(project.carsOpen) || 0;
        const delayedCarDays = Number(project.carsDelayedClosingNoDays) || 0;
        
        if (openCars > 0 && delayedCarDays > 0) {
          return {
            value: `${openCars} open • ${delayedCarDays} days delayed`,
            severity: openCars > 5 || delayedCarDays > 14 ? "critical" : "warning"
          };
        } else if (openCars > 0) {
          return {
            value: openCars,
            severity: openCars > 5 ? "critical" : "warning"
          };
        } else {
          return {
            value: `${delayedCarDays} days`,
            severity: delayedCarDays > 14 ? "critical" : "warning"
          };
        }
      
      case "Observation Management Issues":
        const openObs = Number(project.obsOpen) || 0;
        const delayedObsDays = Number(project.obsDelayedClosingNoDays) || 0;
        
        if (openObs > 0 && delayedObsDays > 0) {
          return {
            value: `${openObs} open • ${delayedObsDays} days delayed`,
            severity: openObs > 10 || delayedObsDays > 14 ? "critical" : "warning"
          };
        } else if (openObs > 0) {
          return {
            value: openObs,
            severity: openObs > 10 ? "critical" : "warning"
          };
        } else {
          return {
            value: `${delayedObsDays} days`,
            severity: delayedObsDays > 14 ? "critical" : "warning"
          };
        }
      
      case "Projects with Over Billability":
        const billabilityPercent = Number(project.qualityBillabilityPercent?.toString().replace('%', '')) || 0;
        return {
          value: project.qualityBillabilityPercent || "0%",
          severity: billabilityPercent > 150 ? "critical" : billabilityPercent > 120 ? "warning" : "info"
        };
      
      // ✅ SIMPLIFIED: Project closure overdue using the same calculation as chartUtils
      case "Project Closure Overdue":
        const completion = Number(project.projectCompletionPercent?.toString().replace('%', '')) || 0;
        const daysOverdue = calculateDaysOverdue(project);
        const hasExtension = project.projectExtension && project.projectExtension !== 'N/A' && project.projectExtension !== '';
        
        // Simple display: just show days overdue and completion
        let displayValue;
        if (hasExtension) {
          displayValue = `${daysOverdue} days overdue • ${completion}% • Extended`;
        } else {
          displayValue = `${daysOverdue} days overdue • ${completion}%`;
        }
        
        return {
          value: displayValue,
          severity: daysOverdue > 60 ? "critical" : daysOverdue > 30 ? "warning" : "info"
        };
      
      case "Projects with Rejection Rate":
        const rejectionRate = Number(project.rejectionOfDeliverablesPercent?.toString().replace('%', '')) || 0;
        return {
          value: project.rejectionOfDeliverablesPercent || "0%",
          severity: rejectionRate > 3 ? "critical" : rejectionRate > 1 ? "warning" : "info"
        };
      
      case "Projects with Poor Quality Costs":
        const qualityCost = Number(project.costOfPoorQualityAED) || 0;
        return {
          value: `${qualityCost.toLocaleString()} AED`,
          severity: qualityCost > 5000 ? "critical" : qualityCost > 1000 ? "warning" : "info"
        };
      
      default:
        return {
          value: "Unknown",
          severity: "info"
        };
    }
  };

  // Show message if no data available
  if (!projectsData || projectsData.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No project data available for summary cards.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {importantSummary.map((item) => (
          <Card
            key={item.title}
            className="hover:scale-[1.03] transition-transform shadow-lg min-w-[320px] max-w-[400px] mx-auto cursor-pointer bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800"
            onClick={() => handleOpen(item)}
          >
            <CardHeader>
              <div className={`w-fit rounded-lg p-2 transition-colors ${item.color}`}>
                <item.icon size={26} />
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="card-title font-semibold text-sm">{item.title}</p>
                {getBadge(item.title, item.value)}
              </div>
            </CardHeader>
            <CardBody className="bg-slate-100 dark:bg-slate-950 rounded-b-xl">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 animate-pulse">{item.value}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Enhanced Modal for project details */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="project-details-modal"
        sx={{ zIndex: 1300 }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: { xs: '60px', md: '80px' },
            left: '50%',
            transform: 'translate(-50%, 0)',
            bgcolor: 'transparent',
            width: { xs: '95vw', md: 800 },
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            outline: 'none',
          }}
        >
          <Paper elevation={6} sx={{ borderRadius: 4, p: 3, position: 'relative' }}>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{ position: 'absolute', right: 12, top: 12, color: 'grey.600' }}
            >
              <CloseIcon />
            </IconButton>
            <h2 id="project-details-modal" className="font-bold text-xl mb-4 text-blue-700">{modalTitle}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Found {modalProjects.length} project{modalProjects.length !== 1 ? 's' : ''} matching this criteria
            </p>
            
            {modalProjects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No projects found for this criteria.</p>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                <table className="min-w-full text-sm border rounded-lg shadow">
                  <thead className="sticky top-0 bg-blue-100 dark:bg-blue-900 z-10">
                    <tr>
                      <th className="border px-2 py-2 text-left">Project No</th>
                      <th className="border px-2 py-2 text-left">Title</th>
                      <th className="border px-2 py-2 text-left">Manager</th>
                      <th className="border px-2 py-2 text-left">Client</th>
                      <th className="border px-2 py-2 text-center">{getColumnHeader(modalTitle)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalProjects.map((project) => {
                      const statusInfo = getDetailedStatus(project, modalTitle);
                      return (
                        <tr key={project.projectNo} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                          <td className="border px-2 py-1 font-semibold">{project.projectNo}</td>
                          <td className="border px-2 py-1" title={project.projectTitle}>
                            {project.projectTitle?.length > 30 
                              ? `${project.projectTitle.substring(0, 30)}...` 
                              : project.projectTitle}
                          </td>
                          <td className="border px-2 py-1">{project.projectManager}</td>
                          <td className="border px-2 py-1">{project.client}</td>
                          <td className="border px-2 py-1 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              statusInfo.severity === "critical" 
                                ? "bg-red-200 text-red-800" 
                                : statusInfo.severity === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {statusInfo.value}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Paper>
        </Box>
      </Modal>
    </>
  );
};

export default SummaryCard;

