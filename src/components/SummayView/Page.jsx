import React, { useState } from 'react'
import SummaryCards from './SummayCards'
import Charts from '../charts/Charts'
import CriticalIssues from './CriticalIssues'
import Filters from './Filters'
import { Card, CardContent } from '../ui/Card'
import { useGoogleSheets } from '../../hooks/useGoogleSheets'
import { SearchX, BarChart2 } from 'lucide-react'

// Import reusable components (same as DashboardPage)
import {  MainHeader } from "../Common/MainHeader"
import { LoadingState } from "../common/LoadingState"
import { ErrorState } from "../common/ErrorState"
import { EmptyDataState } from "../common/EmptyDataState"
import { PageLayout } from '../../layouts/PageLayout'

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
  const { data: projectsData, loading, error, lastUpdated, refetch } = useGoogleSheets();

  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedKPIStatus, setSelectedKPIStatus] = useState("all")

  
  // Filter projects using utility function
  const filteredProjects = projectsData ? projectsData.filter(
    createProjectFilters(selectedYear, selectedMonth, selectedClient, selectedKPIStatus)
  ) : [];

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


  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <MainHeader/>
        <LoadingState message="Loading Google Sheets data..." />
      </PageLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <MainHeader 
          title="Dashboard Summary"
          subtitle="Error loading data from Google Sheets"
        />
        <ErrorState error={error} onRetry={refetch} />
      </PageLayout>
    )
  }

  // Empty state (no data at all)
  if (!projectsData || projectsData.length === 0) {
    return (
      <PageLayout>
        <MainHeader/>
        <EmptyDataState />
      </PageLayout>
    )
  }

  
  return (
    <PageLayout>
      <MainHeader 
        title="Dashboard Summary"
        subtitle="Get a quick overview of all QHSE Activities"
        lastUpdated={lastUpdated}
      >
        <div className="text-xs text-green-600 dark:text-green-400">
          • Live data ({projectsData.length} projects)
        </div>
      </ MainHeader>
      
      <SummaryContent 
        projectsData={projectsData}
        filteredProjects={filteredProjects}
        projectMetrics={projectMetrics}
        chartData={chartData}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedKPIStatus={selectedKPIStatus}
        setSelectedKPIStatus={setSelectedKPIStatus}
        resetFilters={resetFilters}
      />
    </PageLayout>
  )
}


const SummaryContent = ({ 
  projectsData,
  filteredProjects, 
  projectMetrics, 
  chartData,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedClient,
  setSelectedClient,
  selectedKPIStatus,
  setSelectedKPIStatus,
  resetFilters
}) => {
  
  // Handle filtered empty state
  if (filteredProjects.length === 0) {
    return (
      <>
        <FiltersSection 
          projectsData={projectsData}
          filteredProjects={filteredProjects}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          selectedKPIStatus={selectedKPIStatus}
          setSelectedKPIStatus={setSelectedKPIStatus}
          resetFilters={resetFilters}
        />
        <EmptyDataState 
          title="No projects found"
          message="Try adjusting your filters to see more results."
          troubleshootingSteps={[
            "Check if your filter criteria are too restrictive",
            "Try resetting all filters to see all projects",
            "Verify that projects exist for the selected time period"
          ]}
        />
      </>
    )
  }

  return (
    <>
      <FiltersSection 
        projectsData={projectsData}
        filteredProjects={filteredProjects}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedKPIStatus={selectedKPIStatus}
        setSelectedKPIStatus={setSelectedKPIStatus}
        resetFilters={resetFilters}
      />
      
      <SummaryCards
        totalProjects={projectMetrics.totalProjects}
        extendedProjects={projectMetrics.extendedProjects}
        totalOpenCARs={projectMetrics.totalOpenCARs}
        totalOpenObs={projectMetrics.totalOpenObs}
        avgProgress={projectMetrics.avgProgress}
        filteredProjects={filteredProjects}
      />

      <ChartsSection chartData={chartData} />

      <CriticalIssues filteredProjects={filteredProjects} />
    </>
  )
}

const FiltersSection = ({ 
  projectsData,
  filteredProjects,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedClient,
  setSelectedClient,
  selectedKPIStatus,
  setSelectedKPIStatus,
  resetFilters
}) => (
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
)

const ChartsSection = ({ chartData }) => (
  <Charts
    kpiStatusData={chartData.kpiStatus}
    manhoursData={chartData.manhours}
    auditStatusData={chartData.auditStatus}
    carsObsData={chartData.carsObs}
    timelineData={chartData.timeline}
    qualityPlanStatusData={chartData.qualityPlanStatus}
    getKPIBadgeVariant={getKPIBadgeVariant}
  />
)

export default SummaryView