export function getMonthlyOverviewData(projects) {
  const monthly = {};
  projects.forEach(p => {
    const date = new Date(p.projectStartingDate);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthly[month]) {
      monthly[month] = { name: month, carsOpen: 0, obsOpen: 0, kpiAchieved: 0, billability: 0, count: 0 };
    }
    monthly[month].carsOpen += Number(p.carsOpen) || 0;
    monthly[month].obsOpen += Number(p.obsOpen) || 0;
    monthly[month].kpiAchieved += Number(p.projectKPIsAchievedPercent) || 0;
    monthly[month].billability += Number(p.qualityBillabilityPercent) || 0;
    monthly[month].count += 1;
  });
  return Object.values(monthly).map(m => ({
    ...m,
    kpiAchieved: m.count ? Math.round((m.kpiAchieved / m.count) * 100) / 100 : 0,
    billability: m.count ? Math.round((m.billability / m.count) * 100) / 100 : 0,
  }));
}