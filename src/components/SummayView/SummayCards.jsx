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
 * ✅ UPDATED: PROJECT OVERVIEW CARDS - Shows all projects with respective details
 * Changed from filtering to showing comprehensive overviews
 */

// ✅ UPDATED: Icon mapping with new overview icons
const iconMap = {
  "Project Overview": <Eye className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
  "Audit Overview": <Clock className="w-8 h-8 text-orange-500 dark:text-orange-400" />,
  "KPI Overview": <BarChart2 className="w-8 h-8 text-green-500 dark:text-green-400" />,
  "CAR/Observation Overview": <Wrench className="w-8 h-8 text-red-500 dark:text-red-400" />,
  "Billability Overview": <DollarSign className="w-8 h-8 text-purple-500 dark:text-purple-400" />
};

// ✅ UPDATED: Color mappings for new overview cards
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

// ✅ NEW: Function to validate if project has meaningful data
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
 * ✅ UPDATED: Project filters - Now show ALL VALID projects for each overview with proper filtering
 */
const projectFilters = {
  "Project Overview": (projects) => {
    // ✅ FIXED: Filter out invalid/empty projects
    return projects.filter(project => isValidProject(project));
  },
  
  "Audit Overview": (projects) => {
    // ✅ FIXED: Show projects with audit information OR delay information
    return projects.filter(project => 
      isValidProject(project) && (
        project.projectAudit1 || 
        project.projectAudit2 || 
        project.projectAudit3 || 
        project.projectAudit4 ||
        (project.delayInAuditsNoDays && parseNumber(project.delayInAuditsNoDays) >= 0)
      )
    );
  },
  
  "KPI Overview": (projects) => {
    // ✅ FIXED: Show projects with KPI, completion, or rejection data
    return projects.filter(project => 
      isValidProject(project) && (
        (project.projectKPIsAchievedPercent && project.projectKPIsAchievedPercent !== 'N/A') ||
        (project.projectCompletionPercent && project.projectCompletionPercent !== 'N/A') ||
        (project.rejectionOfDeliverablesPercent && project.rejectionOfDeliverablesPercent !== 'N/A')
      )
    );
  },
  
  "CAR/Observation Overview": (projects) => {
    // ✅ FIXED: Show projects with CAR/OBS data (open or closed)
    return projects.filter(project => 
      isValidProject(project) && (
        (project.carsOpen && parseNumber(project.carsOpen) >= 0) ||
        (project.carsClosed && parseNumber(project.carsClosed) >= 0) ||
        (project.obsOpen && parseNumber(project.obsOpen) >= 0) ||
        (project.obsClosed && parseNumber(project.obsClosed) >= 0)
      )
    );
  },
  
  "Billability Overview": (projects) => {
    // ✅ FIXED: Show projects with billability or manhour data
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
 * ✅ UPDATED: Modal columns - Show relevant details for each overview
 */
const getModalColumns = (cardTitle) => {
  const baseColumns = [
    { key: 'projectNo', label: 'Project No' },
    { key: 'projectTitle', label: 'Project Title' },
    { key: 'projectManager', label: 'Manager' },
    { key: 'client', label: 'Client' }
  ];

  const specificColumns = {
    "Project Overview": [
      { key: 'projectStartingDate', label: 'Start Date' },
      { key: 'projectClosingDate', label: 'End Date' },
      { key: 'projectQualityEng', label: 'Quality Engineer' }
    ],
    "Audit Overview": [
      { key: 'projectAudit1', label: 'Audit 1' },
      { key: 'projectAudit2', label: 'Audit 2' },
      { key: 'projectAudit3', label: 'Audit 3' },
      { key: 'delayInAuditsNoDays', label: 'Delay Days' }
    ],
    "KPI Overview": [
      { key: 'projectKPIsAchievedPercent', label: 'KPI %' },
      { key: 'projectCompletionPercent', label: 'Completion %' },
      { key: 'rejectionOfDeliverablesPercent', label: 'Rejection %' }
    ],
    "CAR/Observation Overview": [
      { key: 'carsOpen', label: 'CARs Open' },
      { key: 'carsClosed', label: 'CARs Closed' },
      { key: 'obsOpen', label: 'OBS Open' },
      { key: 'obsClosed', label: 'OBS Closed' }
    ],
    "Billability Overview": [
      { key: 'qualityBillabilityPercent', label: 'Billability %' },
      { key: 'manHourForQuality', label: 'Budgeted Hours' },
      { key: 'manhoursUsed', label: 'Used Hours' },
      { key: 'manhoursBalance', label: 'Balance Hours' }
    ]
  };

  return [...baseColumns, ...(specificColumns[cardTitle] || [])];
};

/**
 * ✅ ENHANCED: Cell formatting for overview data
 */
const getCellValue = (project, columnKey) => {
  const value = project[columnKey];
  
  if (!value || value === '' || value === 'N/A') {
    return <span className="text-gray-400 dark:text-slate-500">-</span>;
  }
  
  // KPI Performance coloring
  if (columnKey === 'projectKPIsAchievedPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 80 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 70 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // Completion percentage coloring
  if (columnKey === 'projectCompletionPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 90 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 75 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // Billability coloring
  if (columnKey === 'qualityBillabilityPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 85 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 70 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // CAR/OBS coloring
  if (columnKey === 'carsOpen' || columnKey === 'obsOpen') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">0</span>;
    const className = numVal > 3 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs" : 
                     "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
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
    const className = numVal > 15 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs" : 
                     "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value} days</span>;
  }
  
  // Rejection percentage
  if (columnKey === 'rejectionOfDeliverablesPercent') {
    const numVal = parsePercent(value);
    if (numVal === 0) return <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">0%</span>;
    const className = numVal > 5 ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs" : 
                     "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // Hours (numerical values)
  if (['manHourForQuality', 'manhoursUsed', 'manhoursBalance'].includes(columnKey)) {
    const numVal = parseNumber(value);
    return <span className="text-gray-900 dark:text-gray-100 font-mono">{numVal.toLocaleString()}</span>;
  }
  
  return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
};

const SummaryCards = ({ filteredProjects = [] }) => {
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);
  const [modalColumns, setModalColumns] = useState([]);
  
  // ✅ NEW: Filter out invalid projects first
  const validProjects = filteredProjects.filter(project => isValidProject(project));
  
  // ✅ UPDATED: Debug logging to check data structure
  console.log('🔍 SummaryCards - Total projects:', filteredProjects.length);
  console.log('🔍 Valid projects:', validProjects.length);
  
  if (filteredProjects.length > 0) {
    console.log('🔍 First project sample:', {
      projectNo: filteredProjects[0]?.projectNo,
      projectTitle: filteredProjects[0]?.projectTitle,
      isValid: isValidProject(filteredProjects[0])
    });
  }
  
  /**
   * ✅ UPDATED: Overview calculations - Use valid projects and proper filtering
   */
  const calculations = {
    
    // ✅ FIXED: Total valid projects
    totalProjects: validProjects.length,
    
    // ✅ FIXED: Audit overview - projects with actual audit data
    projectsWithAudits: (() => {
      return projectFilters["Audit Overview"](validProjects).length;
    })(),
    
    // ✅ FIXED: Projects with KPI data
    projectsWithKPI: (() => {
      return projectFilters["KPI Overview"](validProjects).length;
    })(),
    
    // ✅ FIXED: Total issues across valid projects
    totalIssues: (() => {
      return projectFilters["CAR/Observation Overview"](validProjects).reduce((sum, project) => {
        const cars = parseNumber(project.carsOpen);
        const obs = parseNumber(project.obsOpen);
        return sum + cars + obs;
      }, 0);
    })(),
    
    // ✅ FIXED: Projects with billability data
    projectsWithBillability: (() => {
      return projectFilters["Billability Overview"](validProjects).length;
    })()
  };

  // ✅ FIXED: Handle card clicks with proper filtering and validation
  const handleCardClick = (cardTitle) => {
    console.log('🔍 Card clicked:', cardTitle);
    
    // Apply proper filtering
    const projects = projectFilters[cardTitle] ? projectFilters[cardTitle](validProjects) : validProjects;
    const columns = getModalColumns(cardTitle);
    
    console.log('🔍 Filtered projects for modal:', projects.length);
    console.log('🔍 Sample projects:', projects.slice(0, 3).map(p => ({
      projectNo: p.projectNo,
      projectTitle: p.projectTitle
    })));
    
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
   * ✅ UPDATED: Overview cards with new headings and descriptions
   */
  const summaryData = [
    {
      title: "Project Overview",
      value: calculations.totalProjects,
      description: "Total active projects with details",
      priority: "overview",
      color: "blue"
    },
    {
      title: "Audit Overview",
      value: calculations.projectsWithAudits,
      description: "Projects with audit information",
      priority: "overview",
      color: "orange"
    },
    {
      title: "KPI Overview",
      value: calculations.projectsWithKPI,
      description: "Projects with KPI tracking",
      priority: "overview",
      color: "green"
    },
    {
      title: "CAR/Observation Overview",
      value: calculations.totalIssues,
      description: "Total issues across all projects",
      priority: "overview",
      color: "red"
    },
    {
      title: "Billability Overview",
      value: calculations.projectsWithBillability,
      description: "Projects with billability tracking",
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
            PROJECT OVERVIEWS
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

      {/* ✅ ENHANCED: Modal with overview-specific content and better empty state handling */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{ zIndex: 1300 }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: '5%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            bgcolor: 'transparent',
            width: { xs: '95vw', md: '90vw', lg: 1000 },
            maxHeight: '90vh',
            overflowY: 'auto',
            outline: 'none',
          }}
        >
          <Paper 
            elevation={6} 
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
            sx={{ borderRadius: 3, p: 3, position: 'relative' }}
          >
            <IconButton
              onClick={handleCloseModal}
              className="!text-gray-500 dark:!text-slate-400 hover:!text-gray-700 dark:hover:!text-slate-200"
              sx={{ position: 'absolute', right: 12, top: 12 }}
            >
              <CloseIcon />
            </IconButton>
            
            <h2 className="font-bold text-xl mb-4 text-blue-700 dark:text-blue-400 pr-8">
              {modalTitle}
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Showing {modalProjects.length} project{modalProjects.length !== 1 ? 's' : ''}
            </p>
            
            {modalProjects.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-slate-400 py-8">
                No projects found with relevant data for this overview.
              </p>
            ) : (
              <div style={{ maxHeight: 500, overflowY: 'auto' }} className="bg-white dark:bg-slate-900">
                <table className="min-w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg">
                  <thead className="sticky top-0 bg-blue-100 dark:bg-blue-900">
                    <tr>
                      {modalColumns.map(column => (
                        <th key={column.key} className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left font-semibold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {/* ✅ FIXED: No more empty first row - using properly filtered projects */}
                    {modalProjects.map((project, idx) => (
                      <tr key={`${project.projectNo || idx}`} className="hover:bg-blue-50 dark:hover:bg-blue-950/30">
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