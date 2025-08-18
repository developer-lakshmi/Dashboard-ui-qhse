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
import QHSEOverviewChart from "./OverviewChart"
import QhseTimeline from "./QhseTimeline"
import ProjectStatus from "./ProjectStatus"

import { 
  getMonthlyOverviewData, 
  getYearlyOverviewData 
} from "../../utils"
import { generateQHSETimelineData } from "../../utils/chartUtils"
import { PageLayout } from '../../layouts/PageLayout'
import { useGoogleSheets } from '../../hooks/useGoogleSheets'
import DashSummaryCard from './DashSummaryCard'

const DashboardPage = () => {
  // Hooks
  const { theme } = useTheme()
  const { 
    data: projectsData, 
    loading, 
    isRefreshing, 
    error, 
    refetch, 
    lastUpdated,
    dataLastChanged // ✅ CHANGED: Use dataLastChanged instead of sheetLastModified
  } = useGoogleSheets();

  const chartData = React.useMemo(() => {
    if (!projectsData || projectsData.length === 0) {
      return { monthlyData: [], yearlyData: [], timelineData: [] }
    }
    const qhseTimelineData = generateQHSETimelineData(projectsData);

    return {
      monthlyData: getMonthlyOverviewData(projectsData),
      yearlyData: getYearlyOverviewData(projectsData),
      timelineData: qhseTimelineData
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
      {/* Responsive MainHeader */}
      <MainHeader 
        title="QHSE Dashboard"
        subtitle={`Monitoring for Project QHSE pending Activities `}
        lastUpdated={lastUpdated}
        dataLastChanged={dataLastChanged} // ✅ CHANGED: Pass dataLastChanged
        isRefreshing={isRefreshing}
        className="mb-4 sm:mb-5 md:mb-6"
      />
      
      <DashboardContent 
        projectsData={projectsData}
        chartData={chartData}
        loading={loading}
        onRefresh={refetch}
      />
      
      {/* Responsive Footer */}
      <Footer className="mt-6 sm:mt-8 md:mt-10 lg:mt-12" />
    </PageLayout>
  )
}

// Internal component with full responsive design
const DashboardContent = ({ projectsData, chartData, loading, onRefresh }) => (
  <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8">
    {/* Summary Cards Section - Fully responsive */}
    <section className="w-full">
      <DashSummaryCard projectsData={projectsData} />
    </section>
    
    {/* Charts Section - Responsive grid */}
    <section className="w-full">
      <ChartsGrid 
        monthlyData={chartData.monthlyData}
        yearlyData={chartData.yearlyData}
        timelineData={chartData.timelineData}
      />
    </section>
    
    {/* Project Status Section - Full width responsive */}
    <section className="w-full">
      <ProjectStatus 
        projectsData={projectsData} 
        loading={loading}
        onRefresh={onRefresh}
        className="w-full"
      />
    </section>
  </div>
)

// Fully responsive ChartsGrid for all device sizes with 2-row layout on lg screens
const ChartsGrid = ({ monthlyData, yearlyData, timelineData }) => (
  <div className="w-full">
    {/* Responsive container with proper spacing and 2-row layout for lg screens */}
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-1 lg:grid-rows-1 lg:gap-4 xl:grid-cols-7 xl:grid-rows-1 xl:gap-6 2xl:gap-8">
      {/* Overview Chart - Responsive column spans with better height control */}
      <div className="col-span-1 lg:col-span-1 lg:row-span-1 xl:col-span-7 xl:row-span-1 w-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[280px] xl:min-h-[450px]">
        <QHSEOverviewChart 
          monthlyData={monthlyData} 
          yearlyData={yearlyData} 
          className="w-full h-full"
        />
      </div>
      
      {/* Timeline Chart - Responsive column spans with better height control */}
      {/*
      <div className="col-span-1 lg:col-span-1 lg:row-span-1 xl:col-span-3 xl:row-span-1 w-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[280px] xl:min-h-[450px]">
        <QhseTimeline 
          timelineData={timelineData} 
          className="w-full h-full"
        />
      </div>
      */}
    </div>
  </div>
)

export default DashboardPage
