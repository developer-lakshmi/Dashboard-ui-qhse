import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { ManhoursChart } from './ChartComponents/ManhoursChart';
import { AuditStatusChart } from './ChartComponents/AuditStatusChart';
import { KPIStatusChart } from './ChartComponents/KPIStatusChart';
import { CarsObsChart } from './ChartComponents/CarsObsChart';
import { TimelineChart } from './ChartComponents/TimelineChart';
import { QualityPlanChart } from './ChartComponents/QualityPlanChart';

/**
 * MAIN CHARTS COMPONENT - PARENT ORCHESTRATOR
 * 
 * This component manages the layout and coordination of all individual chart components
 * Each chart is imported from its own separate file for better maintainability
 */
const Charts = ({
  kpiStatusData,
  manhoursData,
  auditStatusData,
  carsObsData,
  timelineData,
  qualityPlanStatusData,
  getKPIBadgeVariant
}) => {
  
  // Chart configuration with individual components
  const chartConfigs = [
    {
      id: 'manhours',
      component: <ManhoursChart data={manhoursData} />,
      fullWidth: true
    },
    {
      id: 'audit-status',
      component: <AuditStatusChart data={auditStatusData} />,
      fullWidth: false
    },
    {
      id: 'kpi-status',
      component: <KPIStatusChart data={kpiStatusData} />,
      fullWidth: false
    },
    {
      id: 'cars-obs',
      component: <CarsObsChart data={carsObsData} />,
      fullWidth: true
    },
    {
      id: 'timeline',
      component: <TimelineChart data={timelineData} getKPIBadgeVariant={getKPIBadgeVariant} />,
      fullWidth: false
    },
    {
      id: 'quality-plan',
      component: <QualityPlanChart data={qualityPlanStatusData} />,
      fullWidth: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Data Source Information */}
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            All charts display live data from Google Sheets
          </span>
          <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
            Auto-updating
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartConfigs.map((chart) => (
          <div
            key={chart.id}
            className={chart.fullWidth ? "md:col-span-2" : ""}
          >
            <Card className="h-full min-h-[400px] flex flex-col hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                {chart.component}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* No Data State */}
      {chartConfigs.length === 0 && (
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 mb-4 opacity-50">📊</div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                No chart data available
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Charts will appear when data is available in Google Sheets
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Charts;