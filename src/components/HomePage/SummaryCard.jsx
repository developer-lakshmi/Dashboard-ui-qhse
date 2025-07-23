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

// Helper: Get count of projects with a condition
const countProjects = (data, fn) => data.filter(fn).length;

const overdueAudits = countProjects(projectsData, p => Number(p.delayInAuditsNoDays) > 0);
const openCARs = countProjects(projectsData, p => Number(p.carsOpen) > 0);
const openObs = countProjects(projectsData, p => Number(p.obsOpen) > 0);
const delayedCARs = countProjects(projectsData, p => Number(p.carsDelayedClosingNoDays) > 0);
const delayedObs = countProjects(projectsData, p => Number(p.obsDelayedClosingNoDays) > 0);
const lowBillability = countProjects(projectsData, p => Number(p.qualityBillabilityPercent) < 90);
const lowCompletion = countProjects(projectsData, p => Number(p.projectCompletionPercent) < 50);

const getBadge = (title, value) => {
  if (value === 0) return <span className="ml-2 rounded bg-green-200 px-2 py-0.5 text-xs text-green-800">OK</span>;
  if (title.includes("Low") || title.includes("Overdue") || title.includes("Delayed")) {
    if (value > 5) return <span className="ml-2 rounded bg-red-200 px-2 py-0.5 text-xs text-red-800">Critical</span>;
    if (value > 0) return <span className="ml-2 rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800">Warning</span>;
  }
  return null;
};

const SummaryCard = () => {
  // Current and previous values for important fields
  const carsOpenNow = getTotal(projectsData, "carsOpen");
  const carsOpenPrev = getTotal(previousProjectsData, "carsOpen");

  const obsOpenNow = getTotal(projectsData, "obsOpen");
  const obsOpenPrev = getTotal(previousProjectsData, "obsOpen");

  const delayNow = getTotal(projectsData, "delayInAuditsNoDays");
  const delayPrev = getTotal(previousProjectsData, "delayInAuditsNoDays");

  const billabilityNow = getAverage(projectsData, "qualityBillabilityPercent");
  const billabilityPrev = getAverage(previousProjectsData, "qualityBillabilityPercent");

  const planRevNow = projectsData[0]?.projectQualityPlanStatusRev || "-";
  const planRevPrev = previousProjectsData[0]?.projectQualityPlanStatusRev || "-";

  const planIssueDateNow = projectsData[0]?.projectQualityPlanStatusIssueDate || "-";
  const planIssueDatePrev = previousProjectsData[0]?.projectQualityPlanStatusIssueDate || "-";

  const carsDelayNow = getTotal(projectsData, "carsDelayedClosingNoDays");
  const carsDelayPrev = getTotal(previousProjectsData, "carsDelayedClosingNoDays");

  const obsDelayNow = getTotal(projectsData, "obsDelayedClosingNoDays");
  const obsDelayPrev = getTotal(previousProjectsData, "obsDelayedClosingNoDays");

  const completionNow = getAverage(projectsData, "projectCompletionPercent");
  const completionPrev = getAverage(previousProjectsData, "projectCompletionPercent");

  const importantSummary = [
    {
      title: "Projects with Overdue Audits",
      value: overdueAudits,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100/60 dark:bg-red-900/30 dark:text-red-400",
      description: "Projects with delayed audits"
    },
    {
      title: "Projects with Open CARs",
      value: openCARs,
      icon: FileText,
      color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
      description: "Projects with unresolved CARs"
    },
    {
      title: "Projects with Open Observations",
      value: openObs,
      icon: FileText,
      color: "text-yellow-600 bg-yellow-100/60 dark:bg-yellow-900/30 dark:text-yellow-400",
      description: "Projects with open observations"
    },
    {
      title: "Projects with Delayed CAR Closure",
      value: delayedCARs,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100/60 dark:bg-red-900/30 dark:text-red-400",
      description: "Projects with overdue CAR closure"
    },
    {
      title: "Projects with Delayed OBS Closure",
      value: delayedObs,
      icon: FileText,
      color: "text-red-600 bg-red-100/60 dark:bg-red-900/30 dark:text-red-400",
      description: "Projects with overdue OBS closure"
    },
    {
      title: "Projects with Low Billability (<90%)",
      value: lowBillability,
      icon: Users,
      color: "text-blue-600 bg-blue-100/60 dark:bg-blue-900/30 dark:text-blue-400",
      description: "Projects with billability below 90%"
    },
    {
      title: "Projects with Low Completion (<50%)",
      value: lowCompletion,
      icon: TrendingUp,
      color: "text-green-600 bg-green-100/60 dark:bg-green-900/30 dark:text-green-400",
      description: "Projects less than 50% complete"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {importantSummary.map((item) => (
      
        <Card
  key={item.title}
 
  className="hover:scale-[1.03] transition-transform shadow-md min-w-[320px] max-w-[400px] mx-auto cursor-pointer"
>
          <CardHeader>
            <div className={`w-fit rounded-lg p-2 transition-colors ${item.color}`}>
              <item.icon size={26} />
            </div>
            <div className="flex items-center justify-between w-full">
              <p className="card-title font-semibold">{item.title}</p>
              {getBadge(item.title, item.value)}
            </div>
          </CardHeader>
          <CardBody className="bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50 animate-pulse">{item.value}</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCard;

