import React, { useState } from 'react'
import SummaryCards from './SummayCards'
import Charts from '../charts/Charts'
import CriticalIssues from './CriticalIssues'
import Filters from './Filters'
import { Card, CardContent } from '../ui/Card'
import { projectsData } from '../../data/index';
import { SearchX, BarChart2 } from 'lucide-react'; // Add this import at the top

const parsePercent = val =>
  typeof val === "string" ? Number(val.replace("%", "")) : Number(val);

const SummaryView = () => {
  // Add state for filters
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedKPIStatus, setSelectedKPIStatus] = useState("")

  // Use real data for demo
  const filteredProjects = projectsData.filter(project => {
    // Year filter
    const yearMatch =
      selectedYear === "" ||
      selectedYear === "all" ||
      new Date(project.projectStartingDate).getFullYear().toString() === selectedYear;

    // Month filter
    const monthMatch =
      selectedMonth === "" ||
      selectedMonth === "all" ||
      (new Date(project.projectStartingDate).getMonth() + 1).toString() === selectedMonth;

    // Client filter
    const clientMatch =
      selectedClient === "" ||
      selectedClient === "all" ||
      project.client === selectedClient;

    // KPI Status filter
    const kpiMatch =
      selectedKPIStatus === "" ||
      selectedKPIStatus === "all" ||
      project.projectKPIStatus === selectedKPIStatus;

    return yearMatch && monthMatch && clientMatch && kpiMatch;
  });

  // You also need to define or fetch these:
  // getUniqueYears, getUniqueClients, resetFilters,
  // totalProjects, extendedProjects, totalOpenCARs, totalOpenObs, avgProgress,
  // kpiStatusData, manhoursData, auditStatusData, carsObsData, timelineData, qualityPlanStatusData, getKPIBadgeVariant

  // For demo, you can set filteredProjects to an empty array:
  // const filteredProjects = []
  const getUniqueYears = () => [
    ...new Set(projectsData.map(p => new Date(p.projectStartingDate).getFullYear().toString()))
  ];

  const getUniqueClients = () => [
    ...new Set(projectsData.map(p => p.client))
  ];

  const resetFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedClient("");
    setSelectedKPIStatus("");
  };

  const totalProjects = filteredProjects.length;
  const extendedProjects = filteredProjects.filter(p => p.projectExtension !== "No").length;

  // Robust open CARs/Obs calculation (support both array and numeric fields)
  const totalOpenCARs = filteredProjects.reduce(
    (sum, p) =>
      sum +
      (Array.isArray(p.CARs)
        ? p.CARs.filter(c => c.status === "Open").length
        : Number(p.carsOpen) || 0),
    0
  );
  const totalOpenObs = filteredProjects.reduce(
    (sum, p) =>
      sum +
      (Array.isArray(p.Observations)
        ? p.Observations.filter(o => o.status === "Open").length
        : Number(p.obsOpen) || 0),
    0
  );

  // Average progress using percent field
  const avgProgress =
    totalProjects > 0
      ? filteredProjects.reduce(
          (sum, p) => sum + parsePercent(p.projectCompletionPercent),
          0
        ) / totalProjects
      : 0;

  const kpiStatusData = [
    { name: "Green", value: filteredProjects.filter(p => p.projectKPIStatus === "Green").length },
    { name: "Yellow", value: filteredProjects.filter(p => p.projectKPIStatus === "Yellow").length },
    { name: "Red", value: filteredProjects.filter(p => p.projectKPIStatus === "Red").length },
  ];

  const manhoursData = filteredProjects.map(project => ({
    code: project.projectNo,
    name: project.projectTitle,
    Planned: Number(project.manhoursUsed) + Number(project.manhoursBalance),
    Used: Number(project.manhoursUsed),
    Balance: Number(project.manhoursBalance)
  }));

  // Find all audit fields dynamically (e.g. projectAudit1, projectAudit2, ...)
  const today = new Date();
  const auditFields = Object.keys(filteredProjects[0] || {}).filter(key =>
    key.toLowerCase().startsWith("projectaudit")
  );

  const auditStatusData = auditFields.map((field, idx) => {
    let completed = 0, upcoming = 0, notApplicable = 0;
    filteredProjects.forEach(p => {
      const val = p[field];
      if (!val || val === "not applicable") {
        notApplicable++;
      } else {
        const date = new Date(val);
        if (isNaN(date)) {
          notApplicable++;
        } else if (date < today) {
          completed++;
        } else {
          upcoming++;
        }
      }
    });
    return {
      name: `Audit ${idx + 1}`,
      Completed: completed,
      Upcoming: upcoming,
      NotApplicable: notApplicable
    };
  });

  const carsObsData = filteredProjects.map(project => ({
    name: project.projectTitle,
    CARsOpen: Number(project.carsOpen),
    CARsClosed: Number(project.carsClosed),
    ObsOpen: Number(project.obsOpen),
    ObsClosed: Number(project.obsClosed),
  }));

  const timelineData = filteredProjects.map(project => {
    const startDate = new Date(project.projectStartingDate);
    const endDate = new Date(project.projectClosingDate);
    const today = new Date();
    const totalDuration = endDate - startDate;
    const elapsed = today - startDate;
    const progress =
      totalDuration > 0
        ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
        : 0;
    return {
      name: project.projectTitle,
      progress,
      status: project.projectKPIStatus,
      daysRemaining: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    };
  });

  const qualityPlanStatusData = [
    { name: "Approved", value: filteredProjects.filter(p => p.projectQualityPlanStatusRev).length },
    { name: "Pending", value: filteredProjects.filter(p => !p.projectQualityPlanStatusRev).length }
  ];

  const getKPIBadgeVariant = (status) => {
    switch (status) {
      case "Green": return "green";
      case "Yellow": return "yellow";
      case "Red": return "red";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 p-3">
          <BarChart2 className="w-7 h-7 text-blue-600 dark:text-blue-300" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Dashboard Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Get a quick overview of your most important QHSE project metrics.
          </p>
        </div>
      </div>

      <Filters
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedKPIStatus={selectedKPIStatus}
        setSelectedKPIStatus={setSelectedKPIStatus}
        resetFilters={resetFilters}
        filteredProjects={filteredProjects}
        getUniqueYears={getUniqueYears}
        getUniqueClients={getUniqueClients}
      />

      {filteredProjects.length === 0 ? (
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <SearchX className="w-16 h-16 mb-4 text-blue-400 dark:text-blue-500" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your filters to see more results.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581m-2.62-7.38A7.974 7.974 0 0012 4a8 8 0 100 16 7.974 7.974 0 006.38-3.02M4.582 9A7.974 7.974 0 0112 20a8 8 0 100-16 7.974 7.974 0 00-6.38 3.02" />
                  </svg>
                  Reset All Filters
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <SummaryCards
            totalProjects={totalProjects}
            extendedProjects={extendedProjects}
            totalOpenCARs={totalOpenCARs}
            totalOpenObs={totalOpenObs}
            avgProgress={avgProgress}
            filteredProjects={filteredProjects}
          />

          <Charts
            kpiStatusData={kpiStatusData}
            manhoursData={manhoursData}
            auditStatusData={auditStatusData}
            carsObsData={carsObsData}
            timelineData={timelineData}
            qualityPlanStatusData={qualityPlanStatusData}
            getKPIBadgeVariant={getKPIBadgeVariant}
          />

          <CriticalIssues filteredProjects={filteredProjects} />
        </>
      )}
    </div>
  )
}

export default SummaryView