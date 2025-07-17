import React from 'react'
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AlertTriangle, FileText, TrendingUp, Users } from "lucide-react";
import { projectsData } from "@/data/index";

// --- MOCK: Replace this with real previous period data when available ---
const previousProjectsData = [
  // Copy of projectsData with slightly different values for demo
  // In real use, fetch previous period's data from API or storage
  ...projectsData.map(p => ({
    ...p,
    carsOpen: Math.max(0, (p.carsOpen || 0) - 2),
    obsOpen: Math.max(0, (p.obsOpen || 0) - 1),
    delayInAuditsNoDays: Math.max(0, (p.delayInAuditsNoDays || 0) - 5),
    projectKPIsAchievedPercent: (p.projectKPIsAchievedPercent || 0) - 3,
  }))
];
// ---------------------------------------------------------------

// Helper functions
const getTotal = (data, key) =>
  data.reduce((sum, p) => sum + (Number(p[key]) || 0), 0);

const getAverage = (data, key) =>
  data.length
    ? Math.round(
        (data.reduce((sum, p) => sum + (Number(p[key]) || 0), 0) /
          data.length) *
          100
      ) / 100
    : 0;

// Trend calculation helpers
const getTrend = (current, previous) => {
  const diff = current - previous;
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return `${diff}`;
  return "0";
};
const getTrendPercent = (current, previous) => {
  const diff = Math.round((current - previous) * 100) / 100;
  if (diff > 0) return `+${diff}%`;
  if (diff < 0) return `${diff}%`;
  return "0%";
};

const SummaryCard = () => {
  // Current and previous values
  const carsOpenNow = getTotal(projectsData, "carsOpen");
  const carsOpenPrev = getTotal(previousProjectsData, "carsOpen");

  const obsOpenNow = getTotal(projectsData, "obsOpen");
  const obsOpenPrev = getTotal(previousProjectsData, "obsOpen");

  const delayNow = getTotal(projectsData, "delayInAuditsNoDays");
  const delayPrev = getTotal(previousProjectsData, "delayInAuditsNoDays");

  const kpiNow = getAverage(projectsData, "projectKPIsAchievedPercent");
  const kpiPrev = getAverage(previousProjectsData, "projectKPIsAchievedPercent");

  const importantSummary = [
    {
      title: "CARs Open",
      value: carsOpenNow,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      trend: getTrend(carsOpenNow, carsOpenPrev),
      trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
    },
    {
      title: "Obs Open",
      value: obsOpenNow,
      icon: FileText,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      trend: getTrend(obsOpenNow, obsOpenPrev),
      trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
    },
    {
      title: "Delay in Audits (days)",
      value: delayNow,
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      trend: getTrend(delayNow, delayPrev),
      trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
    },
    {
      title: "Project KPIs Achieved (%)",
      value: `${kpiNow}%`,
      icon: Users,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      trend: getTrendPercent(kpiNow, kpiPrev),
      trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
    }
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {importantSummary.map((item) => (
        <Card key={item.title}>
          <CardHeader>
            <div className={`w-fit rounded-lg p-2 transition-colors ${item.color}`}>
              <item.icon size={26} />
            </div>
            <p className="card-title">{item.title}</p>
          </CardHeader>
          <CardBody className="bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{item.value}</p>
            <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium ${item.trendColor}`}>
              <TrendingUp size={18} />
              {item.trend}
            </span>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}

export default SummaryCard

