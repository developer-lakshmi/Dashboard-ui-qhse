import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Box, Chip, TablePagination, TableSortLabel, TextField, 
  InputAdornment, IconButton, Tooltip, LinearProgress, useTheme, 
  useMediaQuery, Button, ButtonGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as CriticalIcon,
  Schedule as DelayIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

const getChipColor = (value, type) => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : Number(value) || 0;
  
  if (type === "billability") {
    if (numValue >= 80) return "success";
    if (numValue >= 50) return "warning";
    return "error";
  }
  if (type === "cars" || type === "obs") {
    return numValue > 0 ? "error" : "success";
  }
  if (type === "kpi") {
    if (numValue >= 90) return "success";
    if (numValue >= 70) return "warning";
    return "error";
  }
  return "default";
};

const formatPercentage = (value) => {
  if (!value || value === '' || value === 'N/A') return "0%";
  const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : Number(value);
  return isNaN(numValue) ? "0%" : `${Math.round(numValue)}%`;
};

const formatNumber = (value) => {
  if (!value || value === '' || value === 'N/A') return 0;
  const numValue = Number(value);
  return isNaN(numValue) ? 0 : numValue;
};

const hasValidData = (project) => {
  return (
    (project.projectNo && project.projectNo !== '' && project.projectNo !== 'N/A') ||
    (project.projectTitle && project.projectTitle !== '' && project.projectTitle !== 'Untitled Project') ||
    (project.client && project.client !== '' && project.client !== 'N/A') ||
    (project.projectManager && project.projectManager !== '' && project.projectManager !== 'N/A')
  );
};

// 🎯 MANAGEMENT PERSPECTIVE: Enhanced Risk Assessment Logic
const getRiskLevel = (project) => {
  const completion = formatNumber(project.projectCompletionPercent);
  const billability = formatNumber(project.qualityBillabilityPercent);
  const carsOpen = formatNumber(project.carsOpen);
  const obsOpen = formatNumber(project.obsOpen);
  const auditDelay = formatNumber(project.delayInAuditsNoDays);
  const carsDelayed = formatNumber(project.carsDelayedClosingNoDays);
  const obsDelayed = formatNumber(project.obsDelayedClosingNoDays);
  const kpiAchieved = formatNumber(project.projectKPIsAchievedPercent);

  // CRITICAL RISK (Immediate Management Attention Required)
  if (
    carsOpen >= 3 ||                                    // Multiple CARs indicate serious quality issues
    obsOpen >= 5 ||                                     // Too many observations
    auditDelay >= 30 ||                                 // Audit delayed by more than a month
    (completion >= 80 && carsOpen > 0) ||               // Near completion but still has CARs
    (billability < 30 && completion > 50) ||            // Poor billability mid-project
    carsDelayed >= 45 ||                                // CARs delayed closing > 1.5 months
    obsDelayed >= 60                                    // OBS delayed closing > 2 months
  ) {
    return 'CRITICAL';
  }

  // HIGH RISK (Requires Management Review)
  if (
    carsOpen >= 1 ||                                    // Any open CARs
    obsOpen >= 2 ||                                     // Multiple observations
    auditDelay > 0 ||                                   // Any audit delays
    billability < 50 ||                                 // Poor billability
    kpiAchieved < 70 ||                                 // KPIs not meeting targets
    (completion >= 90 && (carsOpen > 0 || obsOpen > 0)) || // Near completion with issues
    carsDelayed > 0 ||                                  // Any delayed CAR closures
    obsDelayed > 0                                      // Any delayed OBS closures
  ) {
    return 'HIGH';
  }

  // MEDIUM RISK (Monitor Closely)
  if (
    billability < 70 ||                                 // Below optimal billability
    kpiAchieved < 85 ||                                 // KPIs below good performance
    (completion < 30 && billability < 60)               // Early stage with poor metrics
  ) {
    return 'MEDIUM';
  }

  // LOW RISK (On Track)
  return 'LOW';
};

// Enhanced table head with proper column widths
const EnhancedTableHead = ({ order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCells = [
    { 
      id: 'displaySrNo', 
      label: 'Sr.No', 
      sortable: false, 
      width: '60px',
      align: 'center'
    },
    { 
      id: 'projectNo', 
      label: 'Project No', 
      sortable: true, 
      width: '140px'
    },
    { 
      id: 'projectTitle', 
      label: 'Project Title', 
      sortable: true, 
      width: 'auto', // Let this column expand
      minWidth: '250px'
    },
    { 
      id: 'client', 
      label: 'Client', 
      sortable: true, 
      width: '180px'
    },
    { 
      id: 'projectManager', 
      label: 'Project Manager', 
      sortable: true, 
      width: '160px'
    },
    { 
      id: 'qualityBillabilityPercent', 
      label: 'Billability (%)', 
      sortable: true, 
      width: '110px', 
      align: 'center' 
    },
    { 
      id: 'carsOpen', 
      label: 'CARs Open', 
      sortable: true, 
      width: '90px', 
      align: 'center' 
    },
    { 
      id: 'obsOpen', 
      label: 'OBS Open', 
      sortable: true, 
      width: '90px', 
      align: 'center' 
    },
    { 
      id: 'projectKPIsAchievedPercent', 
      label: 'KPIs (%)', 
      sortable: true, 
      width: '100px', 
      align: 'center' 
    },
    { 
      id: 'delayInAuditsNoDays', 
      label: 'Audit Delay (Days)', 
      sortable: true, 
      width: '130px', 
      align: 'center' 
    },
    { 
      id: 'projectCompletionPercent', 
      label: 'Completion (%)', 
      sortable: true, 
      width: '120px', 
      align: 'center' 
    },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
            align={headCell.align || 'left'}
            sx={{ 
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              width: headCell.width,
              minWidth: headCell.minWidth,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              whiteSpace: 'nowrap',
              padding: '12px 8px'
            }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
                sx={{ 
                  '& .MuiTableSortLabel-icon': {
                    fontSize: '1rem'
                  }
                }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const ProjectStatus = ({ projectsData = [], loading = false, onRefresh }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('displaySrNo');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Enhanced data processing with risk assessment
  const validProjects = useMemo(() => {
    return projectsData
      .filter(hasValidData)
      .map((project, index) => ({
        ...project,
        displaySrNo: index + 1,
        riskLevel: getRiskLevel(project)
      }));
  }, [projectsData]);

  const filteredProjects = useMemo(() => {
    let filtered = validProjects.filter(project =>
      project.projectNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectManager?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply active filter
    if (activeFilter === 'CRITICAL') {
      filtered = filtered.filter(p => p.riskLevel === 'CRITICAL');
    } else if (activeFilter === 'HIGH_RISK') {
      filtered = filtered.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL');
    } else if (activeFilter === 'ON_TRACK') {
      filtered = filtered.filter(p => p.riskLevel === 'LOW');
    } else if (activeFilter === 'MEDIUM_RISK') {
      filtered = filtered.filter(p => p.riskLevel === 'MEDIUM');
    }

    return filtered;
  }, [validProjects, searchTerm, activeFilter]);

  const sortedProjects = useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy.includes('Percent') || orderBy.includes('Days') || orderBy.includes('Open')) {
        aValue = formatNumber(aValue);
        bValue = formatNumber(bValue);
      }

      if (bValue < aValue) {
        return order === 'desc' ? -1 : 1;
      }
      if (bValue > aValue) {
        return order === 'desc' ? 1 : -1;
      }
      return 0;
    };

    return filteredProjects.slice().sort(comparator);
  }, [filteredProjects, order, orderBy]);

  // Enhanced statistics calculations for filter buttons
  const stats = useMemo(() => {
    const total = validProjects.length;
    const critical = validProjects.filter(p => p.riskLevel === 'CRITICAL').length;
    const highRisk = validProjects.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length;
    const mediumRisk = validProjects.filter(p => p.riskLevel === 'MEDIUM').length;
    const onTrack = validProjects.filter(p => p.riskLevel === 'LOW').length;

    return { total, critical, highRisk, mediumRisk, onTrack };
  }, [validProjects]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(0);
  };

  const paginatedProjects = sortedProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Filter Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <ButtonGroup 
          variant="outlined" 
          size="small"
          sx={{
            '& .MuiButton-root': {
              borderRadius: 1,
              px: 2
            }
          }}
        >
          <Button 
            variant={activeFilter === 'ALL' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('ALL')}
            startIcon={<FilterIcon />}
          >
            All ({stats.total})
          </Button>
          <Button 
            variant={activeFilter === 'CRITICAL' ? 'contained' : 'outlined'}
            color="error"
            onClick={() => handleFilterChange('CRITICAL')}
            startIcon={<CriticalIcon />}
          >
            Critical ({stats.critical})
          </Button>
          <Button 
            variant={activeFilter === 'HIGH_RISK' ? 'contained' : 'outlined'}
            color="warning"
            onClick={() => handleFilterChange('HIGH_RISK')}
            startIcon={<WarningIcon />}
          >
            High Risk ({stats.highRisk})
          </Button>
          <Button 
            variant={activeFilter === 'MEDIUM_RISK' ? 'contained' : 'outlined'}
            color="info"
            onClick={() => handleFilterChange('MEDIUM_RISK')}
            startIcon={<DelayIcon />}
          >
            Medium ({stats.mediumRisk})
          </Button>
          <Button 
            variant={activeFilter === 'ON_TRACK' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => handleFilterChange('ON_TRACK')}
            startIcon={<CheckCircleIcon />}
          >
            On Track ({stats.onTrack})
          </Button>
        </ButtonGroup>
      </Box>

      {/* Main Table */}
      <Paper 
        sx={{ 
          width: '100%', 
          mb: 2,
          boxShadow: 2,
          borderRadius: 2
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        }}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            flexWrap="wrap" 
            gap={2}
          >
            <Box>
              <Typography variant="h6" component="div" fontWeight={600}>
                Project Status Overview
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {filteredProjects.length} projects
                {activeFilter !== 'ALL' && (
                  <span> • Filtered by: {activeFilter.replace('_', ' ')}</span>
                )}
              </Typography>
            </Box>
            
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  minWidth: isMobile ? '200px' : '300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={onRefresh} 
                  disabled={loading}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {loading && <LinearProgress />}

        {/* Table with proper column widths */}
        <TableContainer sx={{ 
          maxHeight: isMobile ? 500 : 600,
          overflowX: 'auto'
        }}>
          <Table 
            stickyHeader 
            size="small"
            sx={{
              tableLayout: 'fixed',
              width: '100%'
            }}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {paginatedProjects.map((project, index) => {
                // Apply subtle row highlighting based on risk
                const getRowColor = (riskLevel) => {
                  switch (riskLevel) {
                    case 'CRITICAL':
                      return '#ffebee'; // Light red
                    case 'HIGH':
                      return '#fff3e0'; // Light orange
                    default:
                      return index % 2 === 0 ? '#fafafa' : 'white';
                  }
                };

                return (
                  <TableRow
                    key={`project-${project.displaySrNo}`}
                    hover
                    sx={{ 
                      backgroundColor: getRowColor(project.riskLevel),
                      '&:hover': {
                        backgroundColor: getRowColor(project.riskLevel) === 'white' 
                          ? '#f5f5f5' 
                          : `${getRowColor(project.riskLevel)}cc`,
                      }
                    }}
                  >
                    {/* Sr.No - Fixed width, centered */}
                    <TableCell 
                      align="center"
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {project.displaySrNo}
                    </TableCell>
                    
                    {/* Project No - Fixed width */}
                    <TableCell sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Typography variant="body2" component="div">
                        {project.projectNo || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    {/* Project Title - Expandable width */}
                    <TableCell sx={{ 
                      minWidth: '250px',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal'
                    }}>
                      <Typography 
                        variant="body2" 
                        component="div"
                        sx={{ 
                          fontWeight: 500,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={project.projectTitle}
                      >
                        {project.projectTitle || 'Untitled Project'}
                      </Typography>
                    </TableCell>
                    
                    {/* Client - Fixed width with ellipsis */}
                    <TableCell sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Typography 
                        variant="body2"
                        title={project.client}
                      >
                        {project.client || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    {/* Project Manager - Fixed width with ellipsis */}
                    <TableCell sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Typography 
                        variant="body2"
                        title={project.projectManager}
                      >
                        {project.projectManager || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    {/* Metric columns - All centered with fixed widths */}
                    <TableCell align="center">
                      <Chip
                        label={formatPercentage(project.qualityBillabilityPercent)}
                        color={getChipColor(project.qualityBillabilityPercent, "billability")}
                        size="small"
                        sx={{ minWidth: '60px', fontWeight: 600 }}
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={formatNumber(project.carsOpen)}
                        color={getChipColor(project.carsOpen, "cars")}
                        size="small"
                        sx={{ minWidth: '50px', fontWeight: 600 }}
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={formatNumber(project.obsOpen)}
                        color={getChipColor(project.obsOpen, "obs")}
                        size="small"
                        sx={{ minWidth: '50px', fontWeight: 600 }}
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={formatPercentage(project.projectKPIsAchievedPercent)}
                        color={getChipColor(project.projectKPIsAchievedPercent, "kpi")}
                        size="small"
                        sx={{ minWidth: '60px', fontWeight: 600 }}
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={formatNumber(project.delayInAuditsNoDays)}
                        color={formatNumber(project.delayInAuditsNoDays) > 0 ? "error" : "success"}
                        size="small"
                        sx={{ minWidth: '50px', fontWeight: 600 }}
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={formatPercentage(project.projectCompletionPercent)}
                        color={getChipColor(project.projectCompletionPercent, "kpi")}
                        size="small"
                        sx={{ minWidth: '60px', fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {paginatedProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {searchTerm ? 'No projects match your search' : `No ${activeFilter.toLowerCase().replace('_', ' ')} projects found`}
                    </Typography>
                    {searchTerm && (
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search terms or clear the filter
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Enhanced Pagination */}
        <Box sx={{ 
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={filteredProjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-toolbar': {
                minHeight: '52px'
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 500
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectStatus;