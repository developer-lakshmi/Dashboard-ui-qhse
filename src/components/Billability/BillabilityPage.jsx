import React, { useState } from 'react'
import { useGoogleSheets } from '../../hooks/useGoogleSheets'
import { BarChart3 } from 'lucide-react'

// Import reusable components
import { MainHeader } from "../Common/MainHeader"
import { LoadingState } from "../common/LoadingState"
import { ErrorState } from "../common/ErrorState"
import { EmptyDataState } from "../common/EmptyDataState"
import { PageLayout } from '../../layouts/PageLayout'
import { Card, CardContent } from '../ui/Card'
import { ManhoursChart } from '../charts/ChartComponents/ManhoursChart'
// import Filters from '../SummayView/Filters' // ✅ Commented out for future use

import {
  getUniqueYears,
  getUniqueClients,
  createProjectFilters,
  generateManhoursData
} from '../../utils'

const BillabilityPage = () => {
  const { data: projectsData, loading, error, lastUpdated, refetch, isRefreshing, dataLastChanged } = useGoogleSheets();

  // ✅ FUTURE: Filter states (commented for now)
  // const [selectedYear, setSelectedYear] = useState("all")
  // const [selectedMonth, setSelectedMonth] = useState("all")
  // const [selectedClient, setSelectedClient] = useState("all")
  // const [selectedKPIStatus, setSelectedKPIStatus] = useState("all")

  // ✅ SIMPLIFIED: Use all projects for now (no filtering)
  const filteredProjects = projectsData || [];

  // ✅ FUTURE: Reset filters function (commented for now)
  // const resetFilters = () => {
  //   setSelectedYear("all");
  //   setSelectedMonth("all");
  //   setSelectedClient("all");
  //   setSelectedKPIStatus("all");
  // };

  // Generate manhours data using utility function
  const manhoursData = generateManhoursData(filteredProjects);

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <MainHeader />
        <LoadingState message="Loading Google Sheets data..." />
      </PageLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <MainHeader 
          title="Billability Overview"
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
        <MainHeader />
        <EmptyDataState />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <MainHeader 
        title="Billability Overview"
        subtitle="Manhours utilization analysis across all projects"
        lastUpdated={lastUpdated}
        dataLastChanged={dataLastChanged}
        isRefreshing={isRefreshing}
      >
        <div className="text-xs text-green-600 dark:text-green-400">
          • Live data ({projectsData.length} projects)
        </div>
      </MainHeader>
      
      <BillabilityContent 
        manhoursData={manhoursData}
        filteredProjects={filteredProjects}
      />
    </PageLayout>
  )
}

const BillabilityContent = ({ 
  manhoursData,
  filteredProjects
}) => {
  
  // Handle empty state
  if (filteredProjects.length === 0) {
    return (
      <EmptyDataState 
        title="No projects found"
        message="No project data available for manhours analysis."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* ✅ FUTURE: Filters Section (commented for now) */}
      {/* <FiltersSection 
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
      /> */}

      {/* Manhours Chart Section - Main Content */}
      <ManhoursChartSection manhoursData={manhoursData} />
    </div>
  )
}

// ✅ FUTURE: Filters Section Component (commented for now)
// const FiltersSection = ({ 
//   projectsData,
//   filteredProjects,
//   selectedYear,
//   setSelectedYear,
//   selectedMonth,
//   setSelectedMonth,
//   selectedClient,
//   setSelectedClient,
//   selectedKPIStatus,
//   setSelectedKPIStatus,
//   resetFilters
// }) => (
//   <Filters
//     selectedYear={selectedYear}
//     setSelectedYear={setSelectedYear}
//     selectedMonth={selectedMonth}
//     setSelectedMonth={setSelectedMonth}
//     selectedClient={selectedClient}
//     setSelectedClient={setSelectedClient}
//     selectedKPIStatus={selectedKPIStatus}
//     setSelectedKPIStatus={setSelectedKPIStatus}
//     resetFilters={resetFilters}
//     filteredProjects={filteredProjects}
//     getUniqueYears={() => getUniqueYears(projectsData)}
//     getUniqueClients={() => getUniqueClients(projectsData)}
//     totalProjects={projectsData ? projectsData.length : 0}
//   />
// )

const ManhoursChartSection = ({ manhoursData }) => (
  <div>
    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
      <BarChart3 className="w-5 h-5 mr-2" />
      MANHOURS ANALYSIS
    </h3>
    <Card className="border border-gray-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="min-h-[600px]">
          <ManhoursChart data={manhoursData} />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default BillabilityPage;