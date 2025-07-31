import React, { useState } from 'react'
import SummaryCards from './SummayCards'
import Charts from '../charts/Charts'
import CriticalIssues from './CriticalIssues'
import Filters from './Filters'
import { Card, CardContent } from '../ui/Card'
import { useGoogleSheets } from '../../hooks/useGoogleSheets'
import { SearchX, BarChart2 } from 'lucide-react'
import {
  getUniqueYears,
  getUniqueClients,
  createProjectFilters,
  calculateProjectMetrics,
  generateKPIStatusData,
  generateManhoursData,
  generateAuditStatusData,
  generateCarsObsData,
  generateTimelineData,
  generateQualityPlanStatusData,
  getKPIBadgeVariant
} from '../../utils'

const SummaryView = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  const { data: projectsData, loading, error, refetch } = useGoogleSheets();

  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedKPIStatus, setSelectedKPIStatus] = useState("all")

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================
  
  // Filter projects using utility function
  const filteredProjects = projectsData.filter(
    createProjectFilters(selectedYear, selectedMonth, selectedClient, selectedKPIStatus)
  );

  // Reset filters function
  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
    setSelectedClient("all");
    setSelectedKPIStatus("all");
  };

  // Calculate metrics using utility functions
  const projectMetrics = calculateProjectMetrics(filteredProjects);

  // Generate chart data using utility functions
  const chartData = {
    kpiStatus: generateKPIStatusData(filteredProjects),
    manhours: generateManhoursData(filteredProjects),
    auditStatus: generateAuditStatusData(filteredProjects),
    carsObs: generateCarsObsData(filteredProjects),
    timeline: generateTimelineData(filteredProjects),
    qualityPlanStatus: generateQualityPlanStatusData(filteredProjects)
  };

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {renderHeader("Loading data from Google Sheets...", "blue")}
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                Loading Projects...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fetching latest data from Google Sheets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {renderHeader("Error loading data from Google Sheets", "red")}
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center text-red-500 dark:text-red-400">
              <SearchX className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                Failed to Load Data
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {error}
              </p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshIcon />
                  Retry Loading
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (filteredProjects.length === 0) {
    return (
      <div className="space-y-6">
        {renderHeader("Get a quick overview of your most important QHSE project metrics.", "blue", projectsData.length)}
        
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
          getUniqueYears={() => getUniqueYears(projectsData)}
          getUniqueClients={() => getUniqueClients(projectsData)}
        />

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
                  <RefreshIcon />
                  Reset All Filters
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {renderHeader("Get a quick overview of your most important QHSE project metrics.", "blue", projectsData.length)}

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
        getUniqueYears={() => getUniqueYears(projectsData)}
        getUniqueClients={() => getUniqueClients(projectsData)}
      />

      <SummaryCards
        totalProjects={projectMetrics.totalProjects}
        extendedProjects={projectMetrics.extendedProjects}
        totalOpenCARs={projectMetrics.totalOpenCARs}
        totalOpenObs={projectMetrics.totalOpenObs}
        avgProgress={projectMetrics.avgProgress}
        filteredProjects={filteredProjects}
      />

      <Charts
        kpiStatusData={chartData.kpiStatus}
        manhoursData={chartData.manhours}
        auditStatusData={chartData.auditStatus}
        carsObsData={chartData.carsObs}
        timelineData={chartData.timeline}
        qualityPlanStatusData={chartData.qualityPlanStatus}
        getKPIBadgeVariant={getKPIBadgeVariant}
      />

      <CriticalIssues filteredProjects={filteredProjects} />
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const renderHeader = (subtitle, color = "blue", totalProjects = null) => (
  <div className="mb-8 flex items-center gap-3">
    <span className={`inline-flex items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900 p-3`}>
      <BarChart2 className={`w-7 h-7 text-${color}-600 dark:text-${color}-300`} aria-hidden="true" />
    </span>
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        Dashboard Summary
      </h1>
      <p className={`text-gray-600 dark:text-gray-300 text-sm sm:text-base ${color === "red" ? "text-red-600 dark:text-red-300" : ""}`}>
        {subtitle}
        {totalProjects && (
          <span className="ml-2 text-xs text-green-600 dark:text-green-400">
            • Live data ({totalProjects} projects)
          </span>
        )}
      </p>
    </div>
  </div>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581m-2.62-7.38A7.974 7.974 0 0012 4a8 8 0 100 16 7.974 7.974 0 006.38-3.02M4.582 9A7.974 7.974 0 0112 20a8 8 0 100-16 7.974 7.974 0 00-6.38 3.02" />
  </svg>
);

export default SummaryView