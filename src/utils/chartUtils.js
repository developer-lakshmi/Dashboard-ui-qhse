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