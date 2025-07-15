import React, { useState } from 'react'
import SummaryCards from './SummayCards'
import Charts from '../charts/Charts'
import CriticalIssues from './CriticalIssues'
import Filters from './Filters'
import { Card, CardContent } from '../ui/Card'
import { projectsData } from '../../data/index';

const SummaryView = () => {
  // Add state for filters
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedKPIStatus, setSelectedKPIStatus] = useState("")

  // Use real data for demo
  const filteredProjects = projectsData;

  // You also need to define or fetch these:
  // getUniqueYears, getUniqueClients, resetFilters,
  // totalProjects, extendedProjects, totalOpenCARs, totalOpenObs, avgProgress,
  // kpiStatusData, manhoursData, auditStatusData, carsObsData, timelineData, qualityPlanStatusData, getKPIBadgeVariant

  // For demo, you can set filteredProjects to an empty array:
  // const filteredProjects = []
  const getUniqueYears = () => []
  const getUniqueClients = () => []
  const resetFilters = () => { }

  const totalProjects = filteredProjects.length;
  const extendedProjects = filteredProjects.filter(p => p.projectExtension !== "No").length;
  const totalOpenCARs = filteredProjects.reduce((sum, p) => sum + (p.CARs ? p.CARs.filter(c => c.status === "Open").length : 0), 0);
  const totalOpenObs = filteredProjects.reduce((sum, p) => sum + (p.Observations ? p.Observations.filter(o => o.status === "Open").length : 0), 0);
  const avgProgress = totalProjects > 0 ? (filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects) : 0;

  const kpiStatusData = [
    { name: "Green", value: filteredProjects.filter(p => p.projectKPIStatus === "Green").length },
    { name: "Yellow", value: filteredProjects.filter(p => p.projectKPIStatus === "Yellow").length },
    { name: "Red", value: filteredProjects.filter(p => p.projectKPIStatus === "Red").length },
  ];

  const manhoursData = filteredProjects.map(project => ({
    name: project.projectTitle,
    Planned: project.manhoursUsed + project.manhoursBalance,
    Used: project.manhoursUsed,
    Balance: project.manhoursBalance
  }));

  const auditStatusData = [
    {
      name: "Audit 1",
      Completed: filteredProjects.filter(p => p.projectAudit1 === "Completed").length,
      InProgress: filteredProjects.filter(p => p.projectAudit1 === "In Progress").length,
      Pending: filteredProjects.filter(p => p.projectAudit1 === "Pending").length,
    },
    {
      name: "Audit 2",
      Completed: filteredProjects.filter(p => p.projectAudit2 === "Completed").length,
      InProgress: filteredProjects.filter(p => p.projectAudit2 === "In Progress").length,
      Pending: filteredProjects.filter(p => p.projectAudit2 === "Pending").length,
    },
    // Add similar for Audit 3, Audit 4, etc. if needed
  ];

  const carsObsData = filteredProjects.map(project => ({
    name: project.projectTitle,
    CARsOpen: project.carsOpen,
    CARsClosed: project.carsClosed,
    ObsOpen: project.obsOpen,
    ObsClosed: project.obsClosed,
  }));

  const timelineData = filteredProjects.map(project => {
    const startDate = new Date(project.projectStartingDate);
    const endDate = new Date(project.projectClosingDate);
    const today = new Date();
    const totalDuration = endDate - startDate;
    const elapsed = today - startDate;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
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
      {/* <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          🏢 QHSE Dashboard
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Quality, Health, Safety & Environment Monitoring System
        </p>
      </div> */}

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
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2 text-gray-900">No projects found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Reset All Filters
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