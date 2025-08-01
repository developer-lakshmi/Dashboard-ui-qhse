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
      
      if (!auditValue || auditValue === "" || auditValue === "N/A" || auditValue.toLowerCase() === "not applicable") {
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

// ✅ SIMPLE: Calculate how many days overdue a project is
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

// ✅ SIMPLE: Get project status based on completion and deadlines
const getProjectStatus = (project) => {
  const completion = parsePercent(project.projectCompletionPercent);
  const daysOverdue = calculateDaysOverdue(project);
  const hasExtension = project.projectExtension && project.projectExtension !== "" && project.projectExtension !== "N/A";
  
  // Step 1: If project is complete, it's completed
  if (completion >= 100) {
    return "Completed";
  }
  
  // Step 2: Check if overdue
  if (daysOverdue > 0) {
    return hasExtension ? "Overdue (Extended)" : "Overdue";
  }
  
  // Step 3: Check if due soon
  if (daysOverdue >= -7) { // Due within 7 days
    return "Due Soon";
  }
  
  // Step 4: Check if has extension but not overdue
  if (hasExtension) {
    return "Extended";
  }
  
  // Step 5: Default status
  return getKPIStatus(project.projectKPIsAchievedPercent);
};

// ✅ SIMPLE: Timeline data generation
export const generateTimelineData = (filteredProjects) => {
  return filteredProjects.map(project => {
    const startDate = parseDate(project.projectStartingDate);
    const originalEndDate = parseDate(project.projectClosingDate);
    const extensionDate = parseDate(project.projectExtension);
    const completion = parsePercent(project.projectCompletionPercent);
    const hasExtension = extensionDate ? true : false;
    
    // Calculate days overdue (positive = overdue, negative = time remaining)
    const daysOverdue = calculateDaysOverdue(project);
    const daysRemaining = -daysOverdue; // Convert to remaining (negative = overdue)
    
    // Get simple status
    const status = getProjectStatus(project);
    
    return {
      name: project.projectTitle,
      progress: completion,
      projectCompletionPercent: completion,
      status: status,
      daysRemaining: daysRemaining,
      isCompleted: completion >= 100,
      projectExtension: project.projectExtension,
      hasExtension: hasExtension,
      effectiveEndDate: extensionDate || originalEndDate,
      originalEndDate: originalEndDate,
      daysOverdueAfterExtension: hasExtension && daysOverdue > 0 ? daysOverdue : 0
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
    if (!date) return;
    
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    
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
  
  return Object.values(monthly)
    .map(m => ({
      ...m,
      kpiAchieved: m.count ? Math.round((m.kpiAchieved / m.count) * 100) / 100 : 0,
      billability: m.count ? Math.round((m.billability / m.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => a.date - b.date);
};

// Generate yearly overview data
export const getYearlyOverviewData = (projects) => {
  if (!projects || projects.length === 0) {
    return [];
  }

  const yearly = {};
  
  projects.forEach(p => {
    const date = parseDate(p.projectStartingDate);
    if (!date) return;
    
    const yearKey = `${date.getFullYear()}`;
    
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
  
  return Object.values(yearly)
    .map(y => ({
      ...y,
      kpiAchieved: y.count ? Math.round((y.kpiAchieved / y.count) * 100) / 100 : 0,
      billability: y.count ? Math.round((y.billability / y.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => a.date - b.date);
};

// ✅ SIMPLE: Management timeline data
export const generateManagementTimelineData = (filteredProjects) => {
  return filteredProjects
    .filter(project => {
      // Only include projects with proper name and ID
      const hasValidId = project.srNo || project.projectNo;
      const hasValidName = project.projectTitle && project.projectTitle !== "" && project.projectTitle !== "N/A";
      return hasValidId && hasValidName;
    })
    .map(project => {
      const completion = parsePercent(project.projectCompletionPercent);
      const daysOverdue = calculateDaysOverdue(project);
      const hasExtension = project.projectExtension && project.projectExtension !== "" && project.projectExtension !== "N/A";
      
      // Quality issues
      const carsOpen = Number(project.carsOpen) || 0;
      const obsOpen = Number(project.obsOpen) || 0;
      const auditDelay = Number(project.delayInAuditsNoDays) || 0;
      
      // Simple urgency score
      let urgencyScore = 0;
      if (auditDelay > 10) urgencyScore += 4;
      else if (auditDelay > 0) urgencyScore += 2;
      
      if (carsOpen > 5) urgencyScore += 4;
      else if (carsOpen > 0) urgencyScore += 2;
      
      if (obsOpen > 3) urgencyScore += 2;
      else if (obsOpen > 0) urgencyScore += 1;
      
      if (daysOverdue > 0) urgencyScore += hasExtension ? 5 : 4;
      else if (daysOverdue >= -7) urgencyScore += 2;
      
      if (hasExtension) urgencyScore += 1;
      
      // Simple status
      let status = "On Track";
      let priority = 1;
      
      if (completion >= 100) {
        status = "Completed";
        priority = 0;
      } else if (urgencyScore >= 7) {
        status = "Critical";
        priority = 4;
      } else if (urgencyScore >= 4) {
        status = hasExtension ? "Extended" : "Delayed";
        priority = 3;
      } else if (urgencyScore > 0 || daysOverdue >= -30) {
        status = "At Risk";
        priority = 2;
      }
      
      // Simple risk factors
      const riskFactors = [
        auditDelay > 0 && `${auditDelay} days audit delay`,
        carsOpen > 0 && `${carsOpen} open CARs`,
        obsOpen > 0 && `${obsOpen} open observations`,
        daysOverdue === 0 && `Due TODAY`,
        daysOverdue > 0 && !hasExtension && `OVERDUE by ${daysOverdue} days`,
        daysOverdue > 0 && hasExtension && `OVERDUE by ${daysOverdue} days (Even with extension)`
      ].filter(Boolean);
      
      return {
        id: project.srNo || project.projectNo,
        projectNo: project.projectNo,
        name: project.projectTitle,
        client: project.client || null,
        manager: project.projectManager || null,
        progress: completion,
        daysRemaining: -daysOverdue,
        status: status,
        priority: priority,
        urgencyScore: urgencyScore,
        carsOpen: carsOpen,
        obsOpen: obsOpen,
        auditDelay: auditDelay,
        riskFactors: riskFactors,
        needsAttention: priority >= 2,
        hasExtension: hasExtension,
        daysOverdueTotal: daysOverdue > 0 ? daysOverdue : 0
      };
    })
    .filter(project => project.needsAttention)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10);
};