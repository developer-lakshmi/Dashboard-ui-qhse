import { parseDate } from './dateUtils.js';
import { parsePercent, getKPIStatus } from './projectUtils.js';

// Helper function to safely parse percentage values
const parsePercentage = (value) => {
  if (typeof value === 'string') {
    return Number(value.replace('%', '')) || 0;
  }
  return Number(value) || 0;
};

// Generate KPI status data for charts
export const generateKPIStatusData = (filteredProjects) => {
  return [
    { 
      name: "Green", 
      value: filteredProjects.filter(p => getKPIStatus(p.projectKPIsAchievedPercent) === "Green").length 
    },
    { 
      name: "Yellow", 
      value: filteredProjects.filter(p => getKPIStatus(p.projectKPIsAchievedPercent) === "Yellow").length 
    },
    { 
      name: "Red", 
      value: filteredProjects.filter(p => getKPIStatus(p.projectKPIsAchievedPercent) === "Red").length 
    },
  ];
};

// Generate manhours data for charts
export const generateManhoursData = (filteredProjects) => {
  return filteredProjects.map(project => ({
    code: project.projectNo || 'N/A',
    name: project.projectTitle,
    Planned: (Number(project.manhoursUsed) || 0) + (Number(project.manhoursBalance) || 0),
    Used: Number(project.manhoursUsed) || 0,
    Balance: Number(project.manhoursBalance) || 0
  }));
};

// Generate audit status data for charts
export const generateAuditStatusData = (filteredProjects) => {
  const today = new Date();
  const auditFields = ['projectAudit1', 'projectAudit2', 'projectAudit3', 'projectAudit4'];

  return auditFields.map((field, idx) => {
    let completed = 0, upcoming = 0, notApplicable = 0;
    
    filteredProjects.forEach(p => {
      const auditValue = p[field];
      
      if (!auditValue || 
          auditValue === "" || 
          auditValue === "N/A" ||
          auditValue.toLowerCase() === "not applicable") {
        notApplicable++;
        return;
      }
      
      const auditDate = parseDate(auditValue);
      if (!auditDate) {
        notApplicable++;
      } else if (auditDate < today) {
        completed++;
      } else {
        upcoming++;
      }
    });
    
    return {
      name: `Audit ${idx + 1}`,
      Completed: completed,
      Upcoming: upcoming,
      NotApplicable: notApplicable
    };
  });
};

// Generate CARs & Observations data for charts
export const generateCarsObsData = (filteredProjects) => {
  return filteredProjects.map(project => ({
    name: project.projectTitle,
    CARsOpen: Number(project.carsOpen) || 0,
    CARsClosed: Number(project.carsClosed) || 0,
    ObsOpen: Number(project.obsOpen) || 0,
    ObsClosed: Number(project.obsClosed) || 0,
  }));
};

// Enhanced timeline data generation with extensions
export const generateTimelineData = (filteredProjects) => {
  return filteredProjects.map(project => {
    const startDate = parseDate(project.projectStartingDate);
    const endDate = parseDate(project.projectClosingDate);
    const today = new Date();
    const percentComplete = parsePercent(project.projectCompletionPercent);
    const hasExtension = project.projectExtension && project.projectExtension !== "" && project.projectExtension !== "N/A";
    
    let daysRemaining = 0;
    if (endDate) {
      daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    }
    
    // Enhanced status logic with extensions
    let enhancedStatus = getKPIStatus(project.projectKPIsAchievedPercent);
    if (percentComplete >= 100) {
      enhancedStatus = "Completed";
    } else if (hasExtension) {
      enhancedStatus = "Extended";
    }
    
    return {
      name: project.projectTitle,
      progress: percentComplete,
      projectCompletionPercent: percentComplete,
      status: enhancedStatus,
      daysRemaining: daysRemaining,
      isCompleted: percentComplete >= 100,
      projectExtension: project.projectExtension,
      hasExtension: hasExtension
    };
  });
};

// Generate quality plan status data for charts
export const generateQualityPlanStatusData = (filteredProjects) => {
  return [
    { 
      name: "Approved", 
      value: filteredProjects.filter(p => 
        p.projectQualityPlanStatusRev && 
        p.projectQualityPlanStatusRev !== "" && 
        p.projectQualityPlanStatusRev !== "N/A"
      ).length 
    },
    { 
      name: "Pending", 
      value: filteredProjects.filter(p => 
        !p.projectQualityPlanStatusRev || 
        p.projectQualityPlanStatusRev === "" || 
        p.projectQualityPlanStatusRev === "N/A"
      ).length 
    }
  ];
};

// Generate monthly overview data
export const getMonthlyOverviewData = (projects) => {
  if (!projects || projects.length === 0) {
    return [];
  }

  const monthly = {};
  
  projects.forEach(p => {
    const date = parseDate(p.projectStartingDate);
    if (!date) return; // Skip invalid dates
    
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // e.g., "2025-2"
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Mar 2025"
    
    if (!monthly[monthKey]) {
      monthly[monthKey] = { 
        name: monthLabel, 
        date: new Date(date.getFullYear(), date.getMonth()), 
        carsOpen: 0, 
        obsOpen: 0, 
        kpiAchieved: 0, 
        billability: 0, 
        count: 0 
      };
    }
    
    monthly[monthKey].carsOpen += Number(p.carsOpen) || 0;
    monthly[monthKey].obsOpen += Number(p.obsOpen) || 0;
    monthly[monthKey].kpiAchieved += parsePercentage(p.projectKPIsAchievedPercent);
    monthly[monthKey].billability += parsePercentage(p.qualityBillabilityPercent);
    monthly[monthKey].count += 1;
  });
  
  // Convert to array, average, and sort by date
  return Object.values(monthly)
    .map(m => ({
      ...m,
      kpiAchieved: m.count ? Math.round((m.kpiAchieved / m.count) * 100) / 100 : 0,
      billability: m.count ? Math.round((m.billability / m.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => a.date - b.date); // Sort by date ascending
};

// Generate yearly overview data
export const getYearlyOverviewData = (projects) => {
  if (!projects || projects.length === 0) {
    return [];
  }

  const yearly = {};
  
  projects.forEach(p => {
    const date = parseDate(p.projectStartingDate);
    if (!date) return; // Skip invalid dates
    
    const yearKey = `${date.getFullYear()}`; // e.g., "2025"
    
    if (!yearly[yearKey]) {
      yearly[yearKey] = { 
        name: yearKey, 
        date: new Date(date.getFullYear(), 0), 
        carsOpen: 0, 
        obsOpen: 0, 
        kpiAchieved: 0, 
        billability: 0, 
        count: 0 
      };
    }
    
    yearly[yearKey].carsOpen += Number(p.carsOpen) || 0;
    yearly[yearKey].obsOpen += Number(p.obsOpen) || 0;
    yearly[yearKey].kpiAchieved += parsePercentage(p.projectKPIsAchievedPercent);
    yearly[yearKey].billability += parsePercentage(p.qualityBillabilityPercent);
    yearly[yearKey].count += 1;
  });
  
  // Convert to array, average, and sort by date
  return Object.values(yearly)
    .map(y => ({
      ...y,
      kpiAchieved: y.count ? Math.round((y.kpiAchieved / y.count) * 100) / 100 : 0,
      billability: y.count ? Math.round((y.billability / y.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => a.date - b.date); // Sort by year ascending
};

// SIMPLIFIED: Generate management-focused timeline data for ProjectTimeline component
export const generateManagementTimelineData = (filteredProjects) => {
  return filteredProjects
    .filter(project => {
      // Filter out projects without proper identification
      const hasValidId = project.srNo && project.srNo !== "" && project.srNo !== "N/A";
      const hasValidProjectNo = project.projectNo && project.projectNo !== "" && project.projectNo !== "N/A";
      const hasValidName = project.projectTitle && project.projectTitle !== "" && project.projectTitle !== "N/A";
      
      // Only include projects that have at least ID/ProjectNo AND name
      return (hasValidId || hasValidProjectNo) && hasValidName;
    })
    .map(project => {
      // Basic project data
      const startDate = parseDate(project.projectStartingDate);
      const originalEndDate = parseDate(project.projectClosingDate);
      const today = new Date();
      const percentComplete = parsePercent(project.projectCompletionPercent);
      const kpiStatus = parsePercentage(project.projectKPIsAchievedPercent);
      
      // Handle project extension - use extended date if available
      const hasExtension = project.projectExtension && project.projectExtension !== "" && project.projectExtension !== "N/A";
      let effectiveEndDate = originalEndDate;
      
      if (hasExtension) {
        const extensionDate = parseDate(project.projectExtension);
        if (extensionDate && extensionDate > originalEndDate) {
          effectiveEndDate = extensionDate;
        }
      }
      
      // Quality issues
      const carsOpen = Number(project.carsOpen) || 0;
      const obsOpen = Number(project.obsOpen) || 0;
      const auditDelay = Number(project.delayInAuditsNoDays) || 0;
      
      // Calculate days remaining using effective end date (with extension if applicable)
      let daysRemaining = 0;
      if (startDate && effectiveEndDate) {
        daysRemaining = Math.ceil((effectiveEndDate - today) / (1000 * 60 * 60 * 24));
      }
      
      // Simple urgency scoring
      let urgencyScore = 0;
      if (auditDelay > 0) urgencyScore += auditDelay > 10 ? 4 : 2;  // Audit delays
      if (carsOpen > 0) urgencyScore += carsOpen > 5 ? 4 : 2;       // Quality issues
      if (obsOpen > 0) urgencyScore += obsOpen > 3 ? 2 : 1;        // Minor issues
      
      // Timeline urgency - consider extension status
      if (daysRemaining < 0) {
        // If overdue even with extension, higher urgency
        urgencyScore += hasExtension ? 5 : 4;  // More urgent if extended but still overdue
      } else if (daysRemaining === 0) {
        urgencyScore += 3;  // Due today
      } else if (daysRemaining <= 7) {
        urgencyScore += 2;  // Due this week
      }
      
      // Add urgency for projects with extensions (management attention needed)
      if (hasExtension) urgencyScore += 1;
      
      // Simple status assignment
      let status = "On Track";
      let priority = 1;
      
      if (percentComplete >= 100) {
        status = "Completed";
        priority = 0;
      } else if (urgencyScore >= 7 || (daysRemaining < 0 && hasExtension)) {
        status = "Critical";  // Extended but still overdue = Critical
        priority = 4;
      } else if (urgencyScore >= 6) {
        status = "Critical";
        priority = 4;
      } else if (urgencyScore >= 3 || hasExtension) {
        status = hasExtension ? "Extended" : "Delayed";
        priority = 3;
      } else if (urgencyScore > 0 || daysRemaining < 30) {
        status = "At Risk";
        priority = 2;
      }
      
      // Enhanced risk factors list with extension info
      const riskFactors = [
        auditDelay > 0 && `${auditDelay} days audit delay`,
        carsOpen > 0 && `${carsOpen} open CARs`,
        obsOpen > 0 && `${obsOpen} open observations`,
        daysRemaining === 0 && (hasExtension ? `Due TODAY (Extended)` : `Due TODAY`),
        daysRemaining < 0 && hasExtension && `OVERDUE by ${Math.abs(daysRemaining)} days (Even with extension)`,
        daysRemaining < 0 && !hasExtension && `OVERDUE by ${Math.abs(daysRemaining)} days`,
        hasExtension && daysRemaining > 0 && `Extended until ${effectiveEndDate.toLocaleDateString()}`,
        hasExtension && `Original deadline was ${originalEndDate?.toLocaleDateString()}`
      ].filter(Boolean);
      
      return {
        id: project.srNo || project.projectNo || `proj-${Date.now()}-${Math.random()}`,
        projectNo: project.projectNo,
        name: project.projectTitle,
        client: project.client && project.client !== "" && project.client !== "N/A" ? project.client : null,
        manager: project.projectManager && project.projectManager !== "" && project.projectManager !== "N/A" ? project.projectManager : null,
        progress: percentComplete,
        daysRemaining: daysRemaining,
        status: status,
        priority: priority,
        urgencyScore: urgencyScore,
        kpiStatus: kpiStatus,
        carsOpen: carsOpen,
        obsOpen: obsOpen,
        auditDelay: auditDelay,
        riskFactors: riskFactors,
        needsAttention: priority >= 2,  // Only show projects that need attention
        // Extension-related fields
        hasExtension: hasExtension,
        originalEndDate: originalEndDate,
        effectiveEndDate: effectiveEndDate,
        extensionDate: hasExtension ? project.projectExtension : null
      };
    })
    .filter(project => project.needsAttention)  // Only projects needing attention
    .sort((a, b) => b.priority - a.priority)    // Most urgent first
    .slice(0, 10); // Top 10 projects only
};