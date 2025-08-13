import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { DollarSign } from 'lucide-react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';

/**
 * BILLABILITY CARD COMPONENT - Same UI as SummaryCards
 */

// Helper functions (same as SummaryCards)
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

// Modal columns for billability data (same as SummaryCards)
const getModalColumns = () => {
  return [
    { key: 'projectNo', label: 'Project No' },
    { key: 'projectTitle', label: 'Project Title' },
    { key: 'projectManager', label: 'Project Manager' },
    { key: 'client', label: 'Client' },
    { key: 'manHourForQuality', label: 'Man hour for Quality' },
    { key: 'manhoursUsed', label: 'Manhours Used' },
    { key: 'manhoursBalance', label: 'Manhours Balance' },
    { key: 'qualityBillabilityPercent', label: 'Quality billability %' }
  ];
};

// Enhanced cell formatting (same as SummaryCards)
const getCellValue = (project, columnKey) => {
  const value = project[columnKey];
  
  if (!value || value === '' || value === 'N/A') {
    return (
      <div className="flex justify-center items-center py-1">
        <span className="text-gray-400 dark:text-slate-500 font-medium text-lg">−</span>
      </div>
    );
  }

  // Billability percentage coloring
  if (columnKey === 'qualityBillabilityPercent') {
    const numVal = parsePercent(value);
    const className = numVal >= 85 ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs" : 
                     numVal >= 70 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs" : 
                     "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs";
    return <span className={className}>{value}</span>;
  }

  // Hours (numerical values)
  if (['manHourForQuality', 'manhoursUsed', 'manhoursBalance'].includes(columnKey)) {
    const numVal = parseNumber(value);
    return <span className="text-gray-900 dark:text-gray-100 font-mono">{numVal.toLocaleString()}</span>;
  }

  // Project title with truncation for display
  if (columnKey === 'projectTitle') {
    return (
      <span className="text-gray-900 dark:text-gray-100 max-w-xs truncate block" title={value}>
        {value}
      </span>
    );
  }

  return <span className="text-gray-900 dark:text-gray-100">{value}</span>;
};

const BillabilityCard = ({ filteredProjects = [] }) => {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Filter valid projects
  const validProjects = filteredProjects.filter(project => isValidProject(project));
  
  // Filter projects with billability data (same logic as BillabilityPage)
  const projectsWithBillability = validProjects.filter(project => 
    (project.qualityBillabilityPercent && project.qualityBillabilityPercent !== 'N/A') ||
    (project.manHourForQuality && parseNumber(project.manHourForQuality) > 0) ||
    (project.manhoursUsed && parseNumber(project.manhoursUsed) >= 0)
  );

  // Handle card click
  const handleCardClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const modalColumns = getModalColumns();

  return (
    <>
      <Card 
        className="border-l-4 border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-950/20 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-slate-700"
        onClick={handleCardClick}
      >
        <CardContent className="p-4 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Billability Overview
            </p>
            <DollarSign className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-1">
            {projectsWithBillability.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Projects with quality billability tracking
          </p>
        </CardContent>
      </Card>

      {/* Modal - Same style as SummaryCards */}
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
              Billability Overview - Project Details
            </h2>
            
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Showing {projectsWithBillability.length} project{projectsWithBillability.length !== 1 ? 's' : ''} with billability data
            </p>
            
            {projectsWithBillability.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-slate-400 py-8">
                No projects found with billability data.
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
                      {projectsWithBillability.map((project, idx) => (
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

export default BillabilityCard;