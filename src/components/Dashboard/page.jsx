import React from 'react'
import { Box } from "@mui/material"
import { useTheme } from "@/hooks/use-theme"
import { Footer } from "@/layouts/footer"

// Import reusable components
import { MainHeader } from "../Common/MainHeader"
import { LoadingState } from "../common/LoadingState"
import { ErrorState } from "../common/ErrorState"
import { EmptyDataState } from "../common/EmptyDataState"

// Import dashboard-specific components
import SummaryCard from "./SummaryCard"
import QHSEOverviewChart from "./OverviewChart"
import ProjectTimeline from "./ProjectTimeline"
import ProjectStatus from "./ProjectStatus"

import { 
  getMonthlyOverviewData, 
  getYearlyOverviewData 
} from "../../utils"
import { generateManagementTimelineData } from "../../utils/chartUtils" // NEW: Management-focused timeline data
import { PageLayout } from '../../layouts/PageLayout'
import { useGoogleSheets } from '../../hooks/useGoogleSheets'

const DashboardPage = () => {
  // Hooks
  const { theme } = useTheme()
  const { data: projectsData, loading, error, lastUpdated, refetch } = useGoogleSheets()

  const chartData = React.useMemo(() => {
    if (!projectsData || projectsData.length === 0) {
      return { monthlyData: [], yearlyData: [], timelineData: [] }
    }

    return {
      monthlyData: getMonthlyOverviewData(projectsData),
      yearlyData: getYearlyOverviewData(projectsData),
      timelineData: generateManagementTimelineData(projectsData) // UPDATED: Use management-focused function
    }
  }, [projectsData])

  // Debug logging to see what we're getting
  React.useEffect(() => {
    console.log("Dashboard - Generated timeline data:", chartData.timelineData);
  }, [chartData.timelineData]);

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
        <MainHeader />
        <ErrorState error={error} onRetry={refetch} />
      </PageLayout>
    )
  }

  // Empty state
  if (!projectsData || projectsData.length === 0) {
    return (
      <PageLayout>
        <MainHeader />
        <EmptyDataState />
      </PageLayout>
    )
  }

  // Main dashboard
  return (
    <PageLayout>
      <MainHeader lastUpdated={lastUpdated} />
      
      <DashboardContent 
        projectsData={projectsData}
        chartData={chartData}
        loading={loading}
        onRefresh={refetch}
      />
      
      <Footer />
    </PageLayout>
  )
}

// Internal component (dashboard-specific, not reusable)
const DashboardContent = ({ projectsData, chartData, loading, onRefresh }) => (
  <>
    <SummaryCard projectsData={projectsData} />
    
    <ChartsGrid 
      monthlyData={chartData.monthlyData}
      yearlyData={chartData.yearlyData}
      timelineData={chartData.timelineData}
    />
    
    <ProjectStatus 
      projectsData={projectsData} 
      loading={loading}
      onRefresh={onRefresh}
    />
  </>
)

// Internal component (simple, dashboard-specific)
const ChartsGrid = ({ monthlyData, yearlyData, timelineData }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
    <QHSEOverviewChart 
      monthlyData={monthlyData} 
      yearlyData={yearlyData} 
    />
    <ProjectTimeline timelineData={timelineData} />
  </div>
)

export default DashboardPage
