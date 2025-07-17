import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

import { useTheme } from "@/hooks/use-theme";

import { projectsData } from "@/data";

import { Footer } from "@/layouts/footer";

import { CreditCard, DollarSign, Package, PencilLine, Star, Trash, TrendingUp, Users } from "lucide-react";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.svg";
import Assets from "../../assets/Assets";
import SummaryCard from "../../components/HomePage/SummaryCard";
import QHSEOverviewChart from "../../components/HomePage/OverviewChart";
import ProjectTimeline from "../../components/HomePage/ProjectTimeline";
import ProjectStatus from "../../components/HomePage/ProjectStatus";
import { getMonthlyOverviewData, getProjectTimelineData } from "../../utils";

const monthlyData = getMonthlyOverviewData(projectsData);

// Generate timeline data dynamically
const timelineData = getProjectTimelineData(projectsData);

const DashboardPage = () => {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col gap-y-4">
          <div className="mb-8">
        <div className="flex  items-center">
            <img
                    src={Assets.qhseLogo}
                    alt="Logoipsum"
                    className="dark:hidden drop-shadow-md w-24 max-w-full h-auto rounded-full"
                />
                           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"> QHSE Dashboard </h1>
        </div>

              <p className="text-gray-600 text-sm sm:text-base">
                Quality, Health, Safety & Environment Monitoring System
              </p>
            </div>
           <SummaryCard/>
            

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              
                <QHSEOverviewChart monthlyData={monthlyData} yearlyData={[]} />
              
                <ProjectTimeline timelineData={timelineData} />
            </div>
           
            <ProjectStatus/>
            <Footer />
        </div>
    );
};

export default DashboardPage;
