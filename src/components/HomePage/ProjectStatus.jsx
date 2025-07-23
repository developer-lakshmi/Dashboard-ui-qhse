import React from 'react';
import { projectsData } from '../../data';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip
} from '@mui/material';

const getChipColor = (value, type) => {
  if (type === "billability") {
    if (value >= 80) return "success";
    if (value >= 50) return "warning";
    return "error";
  }
  if (type === "cars") {
    return value > 0 ? "error" : "success";
  }
  if (type === "obs") {
    return value > 0 ? "warning" : "success";
  }
  if (type === "kpi") {
    if (value >= 90) return "success";
    if (value >= 70) return "warning";
    return "error";
  }
  return "default";
};

const ProjectStatus = () => {
  return (
    <Box component={Paper} elevation={4} sx={{ borderRadius: 3, p: 3, mb: 4, boxShadow: 4 }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
        Project Status Overview
      </Typography>
      <TableContainer sx={{ borderRadius: 2, maxHeight: 500 }}>
        <Table size="small" stickyHeader aria-label="project status table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5fa',textTransform: 'uppercase', }}>
              <TableCell sx={{ fontWeight: 700 }}>Sr.No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Project No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'orange.main' }}>Billability (%)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'orange.main' }}>CARs Open</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'orange.main' }}>Obs Open</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'orange.main' }}>KPIs Achieved (%)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'red.main' }}>Audit Delay (days)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'red.main' }}>CARs Delayed Closing (days)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'red.main' }}>OBS Delayed Closing (days)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'green.main' }}>Completion (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectsData && projectsData.length > 0 ? (
              projectsData.map((project, idx) => (
                <TableRow
                  key={project.srNo || idx}
                  hover
                  sx={{
                    backgroundColor: idx % 2 === 0 ? 'grey.50' : 'white',
                    '&:hover': { backgroundColor: 'primary.lighter' }
                  }}
                >
                  <TableCell>{project.srNo || idx + 1}</TableCell>
                  <TableCell>{project.projectNo}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {project.projectTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.projectManager}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${project.qualityBillabilityPercent}`}
                      color={getChipColor(project.qualityBillabilityPercent, "billability")}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.carsOpen}
                      color={getChipColor(project.carsOpen, "cars")}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.obsOpen}
                      color={getChipColor(project.obsOpen, "obs")}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${project.projectKPIsAchievedPercent}`}
                      color={getChipColor(project.projectKPIsAchievedPercent, "kpi")}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.delayInAuditsNoDays}
                      color={project.delayInAuditsNoDays > 0 ? "error" : "success"}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.carsDelayedClosingNoDays}
                      color={project.carsDelayedClosingNoDays > 0 ? "error" : "success"}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.obsDelayedClosingNoDays}
                      color={project.obsDelayedClosingNoDays > 0 ? "error" : "success"}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        project.projectCompletionPercent !== undefined
                          ? `${project.projectCompletionPercent}`
                          : "N/A"
                      }
                      color={getChipColor(
                        typeof project.projectCompletionPercent === "string"
                          ? Number(project.projectCompletionPercent.replace("%", ""))
                          : Number(project.projectCompletionPercent),
                        "kpi"
                      )}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'grey.500' }}>
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectStatus;