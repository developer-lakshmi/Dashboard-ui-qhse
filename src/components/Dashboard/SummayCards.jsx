import { Card, CardContent } from '../ui/Card';
import {
  Target,
  AlertTriangle,
  Clock,
  BarChart2,
  DollarSign,
  CheckCircle2,
  Wrench,
  Eye
} from 'lucide-react';

const iconMap = {
  "Total Projects": <Target className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
  "Critical CARs": <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />,
  "Audit Delays": <Clock className="w-8 h-8 text-orange-500 dark:text-orange-400" />,
  "Poor KPI Projects": <BarChart2 className="w-8 h-8 text-red-500 dark:text-red-400" />,
  "Avg Quality Billability": <DollarSign className="w-8 h-8 text-orange-500 dark:text-orange-400" />,
  "Completed Audits": <CheckCircle2 className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
  "Total CARs Closed": <Wrench className="w-8 h-8 text-green-500 dark:text-green-400" />,
  "Total Obs Closed": <Eye className="w-8 h-8 text-green-500 dark:text-green-400" />,
};

const SummaryCards = ({
  totalProjects,
  extendedProjects,
  totalOpenCARs,
  totalOpenObs,
  avgProgress,
  filteredProjects = []
}) => {
  const summaryData = [
    {
      title: "Total Projects",
      value: totalProjects,
      priority: "standard"
    },
    {
      title: "Critical CARs",
      value: filteredProjects.filter(p => p.carsOpen > 5).length,
      priority: "alert"
    },
    {
      title: "Audit Delays",
      value: filteredProjects.filter(p => p.delayInAuditsNoDays > 10).length,
      priority: "alert"
    },
    {
      title: "Poor KPI Projects",
      value: filteredProjects.filter(p => p.projectKPIsAchievedPercent < 70).length,
      priority: "alert"
    },
    {
      title: "Avg Quality Billability",
      value: `${(filteredProjects.reduce((sum, p) => sum + p.qualityBillabilityPercent, 0) / filteredProjects.length || 0).toFixed(1)}%`,
      priority: "alert"
    },
    {
      title: "Completed Audits",
      value: filteredProjects.filter(p =>
        p.projectAudit1 === "Completed" &&
        p.projectAudit2 === "Completed" &&
        p.projectAudit3 === "Completed" &&
        p.projectAudit4 === "Completed"
      ).length,
      priority: "focus"
    },
    {
      title: "Total CARs Closed",
      value: filteredProjects.reduce((sum, p) => sum + p.carsClosed, 0),
      priority: "focus"
    },
    {
      title: "Total Obs Closed",
      value: filteredProjects.reduce((sum, p) => sum + p.obsClosed, 0),
      priority: "focus"
    }
  ];

  // Card color mapping
  const cardStyle = {
    alert: "border-l-4 border-red-500 bg-red-50 dark:bg-red-950",
    focus: "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950",
    standard: "border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-900"
  };

  return (
    <div className="space-y-8">
      {/* Alert Priority Cards */}
      <div>
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          HIGH PRIORITY ALERTS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {summaryData.filter(item => item.priority === 'alert').map((item, index) => (
            <Card key={index} className={`${cardStyle.alert} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{item.title}</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{item.value}</p>
                </div>
                <div>{iconMap[item.title]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Focus Information Cards */}
      <div>
        <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2" />
          FOCUS INFORMATION
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryData.filter(item => item.priority === 'focus').map((item, index) => (
            <Card key={index} className={`${cardStyle.focus} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{item.title}</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.value}</p>
                </div>
                <div>{iconMap[item.title]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Standard Information Cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          STANDARD INFORMATION
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryData.filter(item => item.priority === 'standard').map((item, index) => (
            <Card key={index} className={`${cardStyle.standard} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{item.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                </div>
                <div>{iconMap[item.title]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;