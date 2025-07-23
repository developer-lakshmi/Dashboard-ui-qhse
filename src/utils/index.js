import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getMonthlyOverviewData(projects) {
  const monthly = {};
  projects.forEach(p => {
    const date = new Date(p.projectStartingDate);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // e.g., "2025-2"
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Mar 2025"
    if (!monthly[monthKey]) {
      monthly[monthKey] = { name: monthLabel, date: new Date(date.getFullYear(), date.getMonth()), carsOpen: 0, obsOpen: 0, kpiAchieved: 0, billability: 0, count: 0 };
    }
    monthly[monthKey].carsOpen += Number(p.carsOpen) || 0;
    monthly[monthKey].obsOpen += Number(p.obsOpen) || 0;
    monthly[monthKey].kpiAchieved += Number(p.projectKPIsAchievedPercent) || 0;
    monthly[monthKey].billability += Number(p.qualityBillabilityPercent) || 0;
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

export function getProjectTimelineData(projects) {
  const today = new Date();
  return projects
    .filter(p => p.projectStartingDate && p.projectClosingDate) // skip if missing dates
    .map(p => {
      const start = new Date(p.projectStartingDate);
      const end = new Date(p.projectClosingDate);
      if (isNaN(start) || isNaN(end)) {
        return null; // skip invalid dates
      }
      const total = (end - start) / (1000 * 60 * 60 * 24); // total days
      const elapsed = (today - start) / (1000 * 60 * 60 * 24); // days passed
      const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
      const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      let status = "On Track";
      if (daysRemaining < 0) status = "Completed";
      else if (progress < 80 && daysRemaining < total * 0.2) status = "Delayed";
      return {
        name: p.projectTitle,
        progress: isFinite(progress) ? progress : 0,
        daysRemaining: isFinite(daysRemaining) ? daysRemaining : 0,
        status,
      };
    })
    .filter(Boolean); // remove nulls
}

export function getYearlyOverviewData(projects) {
  const yearly = {};
  projects.forEach(p => {
    const date = new Date(p.projectStartingDate);
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
    yearly[yearKey].kpiAchieved += Number(p.projectKPIsAchievedPercent) || 0;
    yearly[yearKey].billability += Number(p.qualityBillabilityPercent) || 0;
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


