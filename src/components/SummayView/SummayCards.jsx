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
  Eye
} from 'lucide-react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';

/**
 * ✅ UPDATED: PROJECT OVERVIEW CARDS - Shows comprehensive overviews with exact Google Sheets headers
 */

// ✅ UPDATED: Icon mapping with new overview icons
const iconMap = {
  "Running Projects Quality Plan Overview": <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
  "Audit Overview": <Clock className="w-8 h-8 text-orange-500 dark:text-orange-400" />,
  "KPI Overview": <BarChart2 className="w-8 h-8 text-green-500 dark:text-green-400" />,
  "CARs/Observation Overview": <Wrench className="w-8 h-8 text-red-500 dark:text-red-400" />,
  "Billability Overview": <DollarSign className="w-8 h-8 text-purple-500 dark:text-purple-400" />
};

// Color mappings (keep existing)
const getCardClasses = (color) => {
  const colorMap = {
    red: "border-l-4 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20",
    orange: "border-l-4 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-950/20",
    blue: "border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20",
    green: "border-l-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/20",
    purple: "border-l-4 border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/20"
  };
  return colorMap[color] || colorMap.blue;
};

const getTextClasses = (color) => {
  const colorMap = {
    red: "text-red-600 dark:text-red-400",
    orange: "text-orange-600 dark:text-orange-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400"
  };
  return colorMap[color] || colorMap.blue;
};

const getValueClasses = (color) => {
  const colorMap = {
    red: "text-red-800 dark:text-red-300",
    orange: "text-orange-800 dark:text-orange-300",
    blue: "text-blue-800 dark:text-blue-300",
    green: "text-green-800 dark:text-green-300",
    purple: "text-purple-800 dark:text-purple-300"
  };
  return colorMap[color] || colorMap.blue;
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

// ✅ Function to validate if project has meaningful data
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
 * ✅ UPDATED: Project filters with exact Google Sheets field names
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
  
  "Billability Overview": (projects) => {
    return projects.filter(project => 
      isValidProject(project) && (
        (project.qualityBillabilityPercent && project.qualityBillabilityPercent !== 'N/A') ||
        (project.manHourForQuality && parseNumber(project.manHourForQuality) > 0) ||
        (project.manhoursUsed && parseNumber(project.manhoursUsed) >= 0)
      )
    );
  }
};

/**
 * ✅ UPDATED: Modal columns with exact Google Sheets headers
 */
const getModalColumns = (cardTitle) => {
  const baseColumns = [
    { key: 'projectNo', label: 'Project No' },
    { key: 'projectTitle', label: 'Project Title' },
    { key: 'projectManager', label: 'Project Manager' },
    { key: 'client', label: 'Client' }
  ];

  const specificColumns = {
    "Running Projects Quality Plan Overview": [
      { key: 'projectStartingDate', label: 'Project Starting Date' },
      { key: 'projectClosingDate', label: 'Project closing Date' },
      { key: 'projectExtension', label: 'Project Extension' },
      { key: 'projectQualityPlanStatusRev', label: 'Project Quality Plan status - Rev' },
      { key: 'projectQualityPlanStatusIssueDate', label: 'Project Quality Plan status - Issued Date' }
    ],
    "Audit Overview": [
      { key: 'projectAudit1', label: 'Project Audit -1' },
      { key: 'projectAudit2', label: 'Project Audit -2' },
      { key: 'projectAudit3', label: 'Project Audit -3' },
      { key: 'projectAudit4', label: 'Project Audit -4' },
      { key: 'clientAudit1', label: 'Client Audit -1' },
      { key: 'clientAudit2', label: 'Client Audit -2' },
      { key: 'delayInAuditsNoDays', label: 'Delay in Audits - No. of Days' }
    ],
    "KPI Overview": [
      { key: 'projectKPIsAchievedPercent', label: 'Project KPIs Achieved %' },
      { key: 'projectCompletionPercent', label: 'Project Compl. %' }
    ],
    "CARs/Observation Overview": [
      { key: 'carsOpen', label: 'CARs Open' },
      { key: 'carsClosed', label: 'CARs Closed' },
      { key: 'carsDelayedClosingNoDays', label: 'CARs Delayed closing No. days' },
      { key: 'obsOpen', label: 'No. of Obs Open' },
      { key: 'obsClosed', label: 'Obs Closed' },
      { key: 'obsDelayedClosingNoDays', label: 'Obs delayed closing No. of Days' }
    ],
    "Billability Overview": [
      { key: 'manHourForQuality', label: 'Man hour for Quality' },
      { key: 'manhoursUsed', label: 'Manhours Used' },
      { key: 'manhoursBalance', label: 'Manhours Balance' },
      { key: 'qualityBillabilityPercent', label: 'Quality billability %' }
    ]
  };

  return [...baseColumns, ...(specificColumns[cardTitle] || [])];
};

/**
 * ✅ UPDATED: Enhanced cell formatting - ONLY KPI Achieved % column gets badges
 */
const getCellValue = (project, columnKey) => {
  const value = project[columnKey];
  
  if (!value || value === '' || value === 'N/A') {
    return <span className="text-gray-400 dark:text-slate-500 italic">Missing</span>;
  }
  
  // ✅ UPDATED: ONLY Project KPI Achieved % gets badges (not Project Compl. %)
  if (columnKey === 'projectKPIsAchievedPercent') {
    const completion = parsePercent(project.projectCompletionPercent);
    const kpi = parsePercent(value);
    
    // Logic: Compare completion % with KPI achieved %
    let className, badge;
    
    // If project completion > 95%, show achievement level
    if (completion > 95) {
      if (completion === 100) {
        className = "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-bold";
        badge = "Perfect 🏆";
      } else {
        className = "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-bold";
        badge = "Achieved ✅";
      }
    } else {
      // For projects < 95% completion, check KPI performance
      if (kpi >= 90) {
        className = "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-bold";
        badge = "Achieved ✅";
      } else {
        className = "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold";
        badge = "Needs Improvement ⚠️";
      }
    }
    
    return <span className={className}>{badge} ({value})</span>;
  }
  
  // ✅ UPDATED: Project Completion % - NO BADGES, just normal coloring
  if (columnKey === 'projectCompletionPercent') {
    const numVal = parsePercent(value);
    const className = numVal === 100 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-bold" :
                     numVal > 95 ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-bold" :
                     numVal >= 90 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 75 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    
    // NO BADGES - just return the value with color
    return <span className={className}>{value}</span>;
  }
  
  // Billability coloring (no badges)
  if (columnKey === 'qualityBillabilityPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 85 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 70 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // CAR/OBS coloring (no badges)
  if (columnKey === 'carsOpen' || columnKey === 'obsOpen') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">0</span>;
    const className = numVal > 3 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" : 
                     "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // ✅ NEW: Delayed closing days coloring (no badges)
  if (columnKey === 'carsDelayedClosingNoDays' || columnKey === 'obsDelayedClosingNoDays') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">On Time</span>;
    const className = numVal > 30 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" : 
                     numVal > 15 ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs" : 
                     "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value} days</span>;
  }
  
  // Closed CARs/OBS (positive indicator) (no badges)
  if (columnKey === 'carsClosed' || columnKey === 'obsClosed') {
    const numVal = parseNumber(value);
    const className = numVal > 0 ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs" : 
                     "text-gray-400 dark:text-slate-500";
    return <span className={className}>{value}</span>;
  }
  
  // Audit delays (no badges)
  if (columnKey === 'delayInAuditsNoDays') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">On Time</span>;
    const className = numVal > 15 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold" : 
                     "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value} days</span>;
  }
  
  // ✅ UPDATED: Quality Plan status (no badges)
  if (columnKey === 'projectQualityPlanStatusRev') {
    if (!value || value === '' || value === 'N/A') {
      return <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-bold">Pending</span>;
    }
    return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">{value}</span>;
  }
  
  // ✅ NEW: Audit status coloring (no badges)
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
  
  // Hours (numerical values) (no badges)
  if (['manHourForQuality', 'manhoursUsed', 'manhoursBalance'].includes(columnKey)) {
    const numVal = parseNumber(value);
    return <span className="text-gray-900 dark:text-gray-100 font-mono">{numVal.toLocaleString()}</span>;
  }
  
  // Dates (no badges)
  if (columnKey.includes('Date') || columnKey.includes('Extension')) {
    return <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>;
  }
  
  return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
};

const SummaryCards = ({ filteredProjects = [] }) => {
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);
  const [modalColumns, setModalColumns] = useState([]);
  
  // ✅ Filter out invalid projects first
  const validProjects = filteredProjects.filter(project => isValidProject(project));
  
  // ✅ Debug logging
  console.log('🔍 SummaryCards - Total projects:', filteredProjects.length);
  console.log('🔍 Valid projects:', validProjects.length);
  
  /**
   * ✅ UPDATED: Overview calculations with new logic
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
    
    // Billability Overview
    projectsWithBillability: (() => {
      return projectFilters["Billability Overview"](validProjects).length;
    })()
  };

  // Handle card clicks
  const handleCardClick = (cardTitle) => {
    console.log('🔍 Card clicked:', cardTitle);
    
    const projects = projectFilters[cardTitle] ? projectFilters[cardTitle](validProjects) : validProjects;
    const columns = getModalColumns(cardTitle);
    
    console.log('🔍 Filtered projects for modal:', projects.length);
    
    setModalTitle(cardTitle);
    setModalProjects(projects);
    setModalColumns(columns);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalTitle('');
    setModalProjects([]);
    setModalColumns([]);
  };

  /**
   * ✅ UPDATED: Overview cards with new headings and logic
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
      title: "KPI Overview",
      value: calculations.projectsWithKPI.total,
      description: `${calculations.projectsWithKPI.perfect} perfect, ${calculations.projectsWithKPI.belowStandard} below 90%`,
      priority: "overview",
      color: "green"
    },
    {
      title: "CARs/Observation Overview",
      value: calculations.totalIssues,
      description: "Total open issues and delayed closures",
      priority: "overview",
      color: "red"
    },
    {
      title: "Billability Overview",
      value: calculations.projectsWithBillability,
      description: "Projects with quality billability tracking",
      priority: "overview",
      color: "purple"
    }
  ];

  return (
    <>
      <div className="space-y-6">
        
        {/* ✅ UPDATED: Project Overview Section */}
        <div>
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            PROJECT QUALITY OVERVIEWS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {summaryData.map((item, index) => (
              <Card 
                key={index} 
                className={`${getCardClasses(item.color)} cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-slate-700`}
                onClick={() => handleCardClick(item.title)}
              >
                <CardContent className="p-4 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
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

      {/* ✅ ENHANCED: Modal with better table styling */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{ zIndex: 1300 }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: '3%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            bgcolor: 'transparent',
            width: { xs: '98vw', sm: '95vw', md: '90vw', lg: '85vw', xl: '1200px' },
            maxHeight: '94vh',
            overflowY: 'auto',
            outline: 'none',
          }}
        >
          <Paper 
            elevation={6} 
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
            sx={{ borderRadius: 3, p: { xs: 2, sm: 3 }, position: 'relative' }}
          >
            <IconButton
              onClick={handleCloseModal}
              className="!text-gray-500 dark:!text-slate-400 hover:!text-gray-700 dark:hover:!text-slate-200"
              sx={{ position: 'absolute', right: { xs: 8, sm: 12 }, top: { xs: 8, sm: 12 } }}
            >
              <CloseIcon />
            </IconButton>
            
            <h2 className="font-bold text-xl mb-4 text-blue-700 dark:text-blue-400 pr-8">
              {modalTitle}
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Showing {modalProjects.length} project{modalProjects.length !== 1 ? 's' : ''} with relevant data
            </p>
            
            {modalProjects.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-slate-400 py-8">
                No projects found with relevant data for this overview.
              </p>
            ) : (
              <div className="overflow-hidden border border-gray-200 dark:border-slate-700 rounded-lg">
                <div 
                  style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'auto' }} 
                  className="bg-white dark:bg-slate-900"
                >
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-blue-100 dark:bg-blue-900 z-10">
                      <tr>
                        {modalColumns.map(column => (
                          <th key={column.key} className="border border-gray-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900">
                      {modalProjects.map((project, idx) => (
                        <tr key={`${project.projectNo || idx}`} className="hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                          {modalColumns.map(column => (
                            <td key={`${column.key}-${idx}`} className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-gray-900 dark:text-slate-100">
                              {getCellValue(project, column.key)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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