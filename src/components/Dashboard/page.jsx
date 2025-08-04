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
import QhseTimeline from "./QhseTimeline" // ✅ UPDATED: Use QhseTimeline component
import ProjectStatus from "./ProjectStatus"

import { 
  getMonthlyOverviewData, 
  getYearlyOverviewData 
} from "../../utils"
import { generateQHSETimelineData } from "../../utils/chartUtils" // ✅ UPDATED: Use QHSE function
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
    const qhseTimelineData = generateQHSETimelineData(projectsData); // ✅ UPDATED: Use QHSE function with REAL data

    return {
      monthlyData: getMonthlyOverviewData(projectsData),
      yearlyData: getYearlyOverviewData(projectsData),
      timelineData: qhseTimelineData // ✅ UPDATED: Use QHSE data
    }
  }, [projectsData])

  // Debug logging to see what we're getting
  React.useEffect(() => {
    console.log("🛡️ Dashboard - Generated QHSE timeline data:", chartData.timelineData);
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

// ✅ UPDATED: Fully responsive ChartsGrid for QHSE view
const ChartsGrid = ({ monthlyData, yearlyData, timelineData }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-7">
    <QHSEOverviewChart 
      monthlyData={monthlyData} 
      yearlyData={yearlyData} 
      className="col-span-1 lg:col-span-2 xl:col-span-4" // ✅ Responsive: Chart takes 4/7 columns on xl, full width on smaller screens
    />
    <QhseTimeline 
      timelineData={timelineData} 
      className="col-span-1 lg:col-span-2 xl:col-span-3" // ✅ Responsive: Timeline takes 3/7 columns on xl, full width on smaller screens
    />
  </div>
)

export default DashboardPage
