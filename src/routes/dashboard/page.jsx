import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useTheme } from "@/hooks/use-theme";
import { useGoogleSheets } from "../../hooks/useGoogleSheets";
import { Footer } from "@/layouts/footer";
import { CreditCard, DollarSign, Package, PencilLine, Star, Trash, TrendingUp, Users } from "lucide-react";
import Assets from "../../assets/Assets";
import SummaryCard from "../../components/HomePage/SummaryCard";
import QHSEOverviewChart from "../../components/HomePage/OverviewChart";
import ProjectTimeline from "../../components/HomePage/ProjectTimeline";
import ProjectStatus from "../../components/HomePage/ProjectStatus";
import { getMonthlyOverviewData, getProjectTimelineData, getYearlyOverviewData } from "../../utils";
import { Box } from "@mui/material";

const DashboardPage = () => {
    const { theme } = useTheme();
    const { data: projectsData, loading, error, lastUpdated, refetch } = useGoogleSheets();

    // Show loading state
    if (loading) {
        return (
            <div className="flex flex-col gap-y-4">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading Google Sheets data...</p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Fetching latest project data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col gap-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
                        Failed to Load Data
                    </h3>
                    <p className="text-red-700 dark:text-red-300">Error loading data: {error}</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        Please check your internet connection and try refreshing the page.
                    </p>
                </div>
            </div>
        );
    }

    // Ensure we have data before processing
    if (!projectsData || projectsData.length === 0) {
        return (
            <div className="flex flex-col gap-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                        No Data Available
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                        No project data found in the Google Sheet. Please check if the sheet contains data.
                    </p>
                </div>
            </div>
        );
    }

    // Generate data only after projectsData is loaded
    const monthlyData = getMonthlyOverviewData(projectsData);
    const yearlyData = getYearlyOverviewData(projectsData);
    const timelineData = getProjectTimelineData(projectsData);

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <div className="flex flex-col gap-y-4">
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <img
                            src={Assets.qhseLogo}
                            alt="QHSE Logo"
                            className="dark:hidden drop-shadow-md w-24 max-w-full h-auto rounded-full"
                        />
                        <img
                            src={Assets.qhse_dark}
                            alt="QHSE Logo"
                            className="hidden dark:block drop-shadow-md w-24 max-w-full h-auto rounded-full"
                        />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                QHSE Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                                Quality, Health, Safety & Environment Monitoring System
                            </p>
                            {lastUpdated && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Last updated: {lastUpdated.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pass projectsData to SummaryCard */}
                <SummaryCard projectsData={projectsData} />
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <QHSEOverviewChart monthlyData={monthlyData} yearlyData={yearlyData} />
                    <ProjectTimeline timelineData={timelineData} />
                </div>
               
                {/* Pass projectsData to ProjectStatus */}
                <ProjectStatus 
                    projectsData={projectsData} 
                    loading={loading}
                    onRefresh={refetch}
                />
                
                <Footer />
            </div>
        </Box>
    );
};

export default DashboardPage;
