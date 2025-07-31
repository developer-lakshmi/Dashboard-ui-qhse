import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import {
  AlertTriangle,
  Clock,
  BarChart2,
  DollarSign,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';

/**
 * ESSENTIAL SUMMARY CARDS - MANAGEMENT FOCUSED
 * Shows only the most critical metrics that require management decisions
 */

// Streamlined icon mapping - only for cards we keep
const iconMap = {
  "Projects Need Help": <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />,
  "Overdue Audits": <Clock className="w-8 h-8 text-orange-500 dark:text-orange-400" />,
  "Open Issues": <Wrench className="w-8 h-8 text-red-500 dark:text-red-400" />,
  "Average Performance": <BarChart2 className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
  "Revenue Quality": <DollarSign className="w-8 h-8 text-green-500 dark:text-green-400" />
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

/**
 * PROJECT FILTERS - Only for essential cards
 */
const projectFilters = {
  "Projects Need Help": (projects) => projects.filter(project => {
    const kpi = parsePercent(project.projectKPIsAchievedPercent);
    const cars = parseNumber(project.carsOpen);
    return kpi < 70 || cars > 3;
  }),
  
  "Overdue Audits": (projects) => projects.filter(project => {
    const delay = parseNumber(project.delayInAuditsNoDays);
    return delay > 0;
  }),
  
  "Open Issues": (projects) => projects.filter(project => {
    const cars = parseNumber(project.carsOpen);
    const obs = parseNumber(project.obsOpen);
    return cars > 0 || obs > 0;
  }),
  
  "Average Performance": (projects) => projects,
  "Revenue Quality": (projects) => projects
};

/**
 * MODAL COLUMNS - Simplified
 */
const getModalColumns = (cardTitle) => {
  const baseColumns = [
    { key: 'projectTitle', label: 'Project' },
    { key: 'projectManager', label: 'Manager' }
  ];

  const specificColumns = {
    "Projects Need Help": [
      { key: 'projectKPIsAchievedPercent', label: 'KPI %' },
      { key: 'carsOpen', label: 'CARs' }
    ],
    "Overdue Audits": [
      { key: 'delayInAuditsNoDays', label: 'Days Late' }
    ],
    "Open Issues": [
      { key: 'carsOpen', label: 'CARs' },
      { key: 'obsOpen', label: 'Observations' }
    ],
    "Average Performance": [
      { key: 'projectKPIsAchievedPercent', label: 'KPI %' }
    ],
    "Revenue Quality": [
      { key: 'qualityBillabilityPercent', label: 'Billability %' }
    ]
  };

  return [...baseColumns, ...(specificColumns[cardTitle] || [])];
};

/**
 * SIMPLIFIED CELL FORMATTING
 */
const getCellValue = (project, columnKey) => {
  const value = project[columnKey];
  
  if (!value || value === '' || value === 'N/A') {
    return <span className="text-gray-400">-</span>;
  }
  
  // KPI Performance coloring
  if (columnKey === 'projectKPIsAchievedPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 80 ? "bg-green-100 text-green-800 px-2 py-1 rounded text-xs" : 
                     numVal >= 70 ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 text-red-800 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // Revenue Quality coloring
  if (columnKey === 'qualityBillabilityPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 85 ? "bg-green-100 text-green-800 px-2 py-1 rounded text-xs" : 
                     numVal >= 70 ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 text-red-800 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // Issues coloring
  if (columnKey === 'carsOpen' || columnKey === 'obsOpen') {
    const numVal = parseNumber(value);
    if (numVal === 0) return <span className="text-gray-400">0</span>;
    const className = numVal > 3 ? "bg-red-100 text-red-800 px-2 py-1 rounded text-xs" : 
                     "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }
  
  // Audit delays
  if (columnKey === 'delayInAuditsNoDays') {
    const numVal = parseNumber(value);
    const className = numVal > 15 ? "bg-red-100 text-red-800 px-2 py-1 rounded text-xs" : 
                     "bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs";
    return <span className={className}>{value} days</span>;
  }
  
  return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
};

const SummaryCards = ({ filteredProjects = [] }) => {
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalProjects, setModalProjects] = useState([]);
  const [modalColumns, setModalColumns] = useState([]);
  
  /**
   * ESSENTIAL CALCULATIONS ONLY
   */
  const calculations = {
    
    // Critical Alert: Projects needing immediate action
    projectsNeedHelp: (() => {
      const needHelp = filteredProjects.filter(project => {
        const kpi = parsePercent(project.projectKPIsAchievedPercent);
        const cars = parseNumber(project.carsOpen);
        return kpi < 70 || cars > 3;
      });
      return needHelp.length;
    })(),
    
    // Compliance Risk: Overdue audits
    overdueAudits: (() => {
      const overdue = filteredProjects.filter(project => {
        const delay = parseNumber(project.delayInAuditsNoDays);
        return delay > 0;
      });
      return overdue.length;
    })(),
    
    // Workload: Total issues to resolve
    totalOpenIssues: (() => {
      return filteredProjects.reduce((sum, project) => {
        const cars = parseNumber(project.carsOpen);
        const obs = parseNumber(project.obsOpen);
        return sum + cars + obs;
      }, 0);
    })(),
    
    // Performance: Portfolio average
    averagePerformance: (() => {
      if (filteredProjects.length === 0) return 0;
      const total = filteredProjects.reduce((sum, project) => {
        return sum + parsePercent(project.projectKPIsAchievedPercent);
      }, 0);
      return Math.round(total / filteredProjects.length);
    })(),
    
    // Revenue: Quality billability
    revenueQuality: (() => {
      if (filteredProjects.length === 0) return 0;
      const total = filteredProjects.reduce((sum, project) => {
        return sum + parsePercent(project.qualityBillabilityPercent);
      }, 0);
      return Math.round(total / filteredProjects.length);
    })()
  };

  // Handle card clicks
  const handleCardClick = (cardTitle) => {
    const projects = projectFilters[cardTitle] ? projectFilters[cardTitle](filteredProjects) : [];
    const columns = getModalColumns(cardTitle);
    
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
   * ESSENTIAL CARDS ONLY - 5 TOTAL
   */
  const summaryData = [
    // CRITICAL ALERTS (3 cards)
    {
      title: "Projects Need Help",
      value: calculations.projectsNeedHelp,
      description: "Require immediate management attention",
      priority: "alert",
      color: "red"
    },
    {
      title: "Overdue Audits",
      value: calculations.overdueAudits,
      description: "Behind on compliance requirements",
      priority: "alert",
      color: "orange"
    },
    {
      title: "Open Issues",
      value: calculations.totalOpenIssues,
      description: "Total issues requiring resolution",
      priority: "alert",
      color: "red"
    },

    // KEY METRICS (2 cards)
    {
      title: "Average Performance",
      value: `${calculations.averagePerformance}%`,
      description: "Portfolio KPI performance",
      priority: "focus",
      color: "blue"
    },
    {
      title: "Revenue Quality",
      value: `${calculations.revenueQuality}%`,
      description: "Quality work billability",
      priority: "focus",
      color: "green"
    }
  ];

  return (
    <>
      <div className="space-y-6">
        
        {/* CRITICAL ALERTS */}
        <div>
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            CRITICAL ALERTS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryData.filter(item => item.priority === 'alert').map((item, index) => (
              <Card 
                key={index} 
                className={`border-l-4 border-${item.color}-500 bg-${item.color}-50 dark:bg-${item.color}-950 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => handleCardClick(item.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
                    <div>{iconMap[item.title]}</div>
                  </div>
                  <p className={`text-3xl font-bold text-${item.color}-600 dark:text-${item.color}-400 mb-1`}>{item.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* KEY METRICS */}
        <div>
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2" />
            KEY METRICS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summaryData.filter(item => item.priority === 'focus').map((item, index) => (
              <Card 
                key={index} 
                className={`border-l-4 border-${item.color}-500 bg-${item.color}-50 dark:bg-${item.color}-950 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => handleCardClick(item.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
                    <div>{iconMap[item.title]}</div>
                  </div>
                  <p className={`text-3xl font-bold text-${item.color}-600 dark:text-${item.color}-400 mb-1`}>{item.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* SIMPLIFIED MODAL */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{ zIndex: 1300 }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            bgcolor: 'transparent',
            width: { xs: '95vw', md: 700 },
            maxHeight: '80vh',
            overflowY: 'auto',
            outline: 'none',
          }}
        >
          <Paper elevation={6} sx={{ borderRadius: 3, p: 3, position: 'relative' }}>
            <IconButton
              onClick={handleCloseModal}
              sx={{ position: 'absolute', right: 12, top: 12 }}
            >
              <CloseIcon />
            </IconButton>
            
            <h2 className="font-bold text-xl mb-4 text-blue-700 pr-8">
              {modalTitle}
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              {modalProjects.length} project{modalProjects.length !== 1 ? 's' : ''}
            </p>
            
            {modalProjects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No projects found.</p>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                <table className="min-w-full text-sm border rounded-lg">
                  <thead className="sticky top-0 bg-blue-100 dark:bg-blue-900">
                    <tr>
                      {modalColumns.map(column => (
                        <th key={column.key} className="border px-3 py-2 text-left font-semibold">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modalProjects.map((project, idx) => (
                      <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                        {modalColumns.map(column => (
                          <td key={column.key} className="border px-3 py-2">
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
 * USAGE NOTES FOR FUTURE DEVELOPERS:
 * 
 * 1. DATA SOURCE: This component relies on `filteredProjects` array from Google Sheets
 * 
 * 2. MODAL FUNCTIONALITY: 
 *    - Click any card to see detailed project breakdown
 *    - Each card shows different columns relevant to its metric
 *    - Values are color-coded based on performance thresholds
 * 
 * 3. REQUIRED FIELDS: Each project object should have:
 *    - projectTitle: Project name
 *    - projectNo: Project number (for table display)
 *    - projectManager: Project manager name
 *    - client: Client name
 *    - projectKPIsAchievedPercent: KPI performance (as percentage)
 *    - carsOpen: Number of open CARs
 *    - obsOpen: Number of open observations
 *    - delayInAuditsNoDays: Audit delay in days
 *    - qualityBillabilityPercent: Billability percentage
 *    - projectAudit1, projectAudit2, projectAudit3, projectAudit4: Audit completion status
 * 
 * 4. THRESHOLDS: Current business rules:
 *    - Healthy: KPI ≥80% AND CARs ≤2
 *    - Need Help: KPI <70% OR CARs >3
 *    - Overdue: Any audit delay >0 days
 * 
 * 5. CUSTOMIZATION: 
 *    - Modify `projectFilters` to change card filtering logic
 *    - Update `getModalColumns` to show different columns in modal
 *    - Adjust `getCellValue` to change cell formatting and colors
 * 
 * 6. DEBUGGING: Check browser console for detailed calculation logs
 */