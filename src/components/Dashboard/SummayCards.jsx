import { Card, CardContent } from '../ui/Card';

const SummaryCards = ({ 
  totalProjects, 
  extendedProjects, 
  totalOpenCARs, 
  totalOpenObs, 
  avgProgress, 
  filteredProjects = [] 
}) => {
  const summaryData = [
    // Standard Information
    {
      title: "Total Projects",
      value: totalProjects,
      icon: "🎯",
      color: "text-gray-900",
      bgColor: "bg-gray-50",
      priority: "standard"
    },
    // Alert Information (Orange)
    {
      title: "Critical CARs",
      value: filteredProjects.filter(p => p.carsOpen > 5).length,
      icon: "🚨",
      color: "text-red-600",
      bgColor: "bg-red-50",
      priority: "alert"
    },
    {
      title: "Audit Delays",
      value: filteredProjects.filter(p => p.delayInAuditsNoDays > 10).length,
      icon: "⏰",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      priority: "alert"
    },
    {
      title: "Poor KPI Projects",
      value: filteredProjects.filter(p => p.projectKPIsAchievedPercent < 70).length,
      icon: "📊",
      color: "text-red-600",
      bgColor: "bg-red-50",
      priority: "alert"
    },
    {
      title: "Avg Quality Billability",
      value: `${(filteredProjects.reduce((sum, p) => sum + p.qualityBillabilityPercent, 0) / filteredProjects.length || 0).toFixed(1)}%`,
      icon: "💰",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      priority: "alert"
    },
    // Focus Information (Blue)
    {
      title: "Completed Audits",
      value: filteredProjects.filter(p => 
        p.projectAudit1 === "Completed" && 
        p.projectAudit2 === "Completed" && 
        p.projectAudit3 === "Completed" &&
        p.projectAudit4 === "Completed"
      ).length,
      icon: "✅",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      priority: "focus"
    },
    {
      title: "Total CARs Closed",
      value: filteredProjects.reduce((sum, p) => sum + p.carsClosed, 0),
      icon: "🔧",
      color: "text-green-600",
      bgColor: "bg-green-50",
      priority: "focus"
    },
    {
      title: "Total Obs Closed",
      value: filteredProjects.reduce((sum, p) => sum + p.obsClosed, 0),
      icon: "👁️",
      color: "text-green-600",
      bgColor: "bg-green-50",
      priority: "focus"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Alert Priority Cards */}
      <div>
        <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center">
          <span className="mr-2">🚨</span>
          HIGH PRIORITY ALERTS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {summaryData.filter(item => item.priority === 'alert').map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-orange-400">
              <CardContent className={`p-4 ${item.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">{item.title}</p>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                  <div className="text-2xl opacity-80">{item.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Focus Information Cards */}
      <div>
        <h3 className="text-sm font-semibold text-blue-600 mb-3 flex items-center">
          <span className="mr-2">🔍</span>
          FOCUS INFORMATION
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryData.filter(item => item.priority === 'focus').map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-blue-400">
              <CardContent className={`p-4 ${item.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">{item.title}</p>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                  <div className="text-2xl opacity-80">{item.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Standard Information Cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
          <span className="mr-2">📋</span>
          STANDARD INFORMATION
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryData.filter(item => item.priority === 'standard').map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-gray-400">
              <CardContent className={`p-4 ${item.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">{item.title}</p>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                  <div className="text-2xl opacity-80">{item.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;