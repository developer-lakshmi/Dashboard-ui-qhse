import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Helper function to safely parse percentage values
const parsePercentage = (value) => {
  if (typeof value === 'string') {
    return Number(value.replace('%', '')) || 0;
  }
  return Number(value) || 0;
};

// Helper function to safely parse dates
const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export function getMonthlyOverviewData(projects) {
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
}

export function getYearlyOverviewData(projects) {
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
}

export function getProjectTimelineData(projects) {
  if (!projects || projects.length === 0) {
    return [];
  }

  const today = new Date();
  
  return projects
    .map(p => {
      const start = parseDate(p.projectStartingDate);
      const end = parseDate(p.projectClosingDate);
      
      if (!start || !end) {
        return null; // Skip projects with invalid dates
      }
      
      // Calculate project timeline metrics
      const totalDuration = (end - start) / (1000 * 60 * 60 * 24);
      const elapsed = Math.max(0, (today - start) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      
      let timeProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
      timeProgress = Math.max(0, Math.min(100, timeProgress));
      
      const actualCompletion = parsePercentage(p.projectCompletionPercent);
      const progress = Math.max(timeProgress, actualCompletion);
      const kpiStatus = parsePercentage(p.projectKPIsAchievedPercent);
      const carsOpen = Number(p.carsOpen) || 0;
      const obsOpen = Number(p.obsOpen) || 0;
      const auditDelay = Number(p.delayInAuditsNoDays) || 0;
      
      // Enhanced status logic for management focus
      let status = "On Track";
      let priority = 1; // 1=Low, 2=Medium, 3=High, 4=Critical
      
      if (actualCompletion >= 100) {
        status = "Completed";
        priority = 0; // Lowest priority for completed
      } else if (auditDelay > 10 || carsOpen > 5 || daysRemaining < 0) {
        status = "Critical";
        priority = 4; // Highest priority
      } else if (auditDelay > 0 || carsOpen > 0 || obsOpen > 3 || (daysRemaining < totalDuration * 0.1 && progress < 90)) {
        status = "Delayed";
        priority = 3; // High priority
      } else if (kpiStatus < 70 || progress < timeProgress - 15 || daysRemaining < 30) {
        status = "At Risk";
        priority = 2; // Medium priority
      }
      
      return {
        id: p.srNo || Math.random(),
        projectNo: p.projectNo,
        name: p.projectTitle,
        title: p.projectTitle,
        client: p.client,
        manager: p.projectManager,
        startDate: start,
        endDate: end,
        progress: Math.round(progress * 100) / 100,
        daysRemaining: Math.max(0, daysRemaining),
        status,
        priority,
        completion: actualCompletion,
        kpiStatus,
        carsOpen,
        obsOpen,
        auditDelay,
        totalDays: Math.ceil(totalDuration),
        elapsedDays: Math.ceil(elapsed),
        // Management focus metrics
        needsAttention: priority >= 2,
        riskFactors: [
          auditDelay > 0 && `${auditDelay} days audit delay`,
          carsOpen > 0 && `${carsOpen} open CARs`,
          obsOpen > 0 && `${obsOpen} open observations`,
          kpiStatus < 70 && `Low KPI (${kpiStatus}%)`,
          daysRemaining < 30 && daysRemaining > 0 && `Due in ${daysRemaining} days`
        ].filter(Boolean)
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by priority first (Critical > Delayed > At Risk > On Track > Completed)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Then by days remaining (urgent deadlines first)
      if (a.daysRemaining !== b.daysRemaining) {
        return a.daysRemaining - b.daysRemaining;
      }
      // Finally by completion (less complete projects first)
      return a.completion - b.completion;
    })
    // 🎯 MANAGEMENT FOCUS: Show projects that need attention
    .filter(p => p.needsAttention || p.status === "Critical" || p.status === "Delayed")
    .slice(0, 12); // Show top 12 high-priority projects
}


