import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { pieColors } from '../../data/index'; // <-- Correct import

const Charts = ({ 
  kpiStatusData, 
  manhoursData, 
  auditStatusData, 
  carsObsData, 
  timelineData, 
  qualityPlanStatusData,
  getKPIBadgeVariant 
}) => {
  const chartConfigs = [
    {
      title: "📊 KPI Status Distribution",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={kpiStatusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({name, value}) => `${name}: ${value}`}
            >
              {kpiStatusData.map((entry, index) => (
                <Cell key={index} fill={pieColors[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "⏱️ Manhours: Planned vs Used",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={manhoursData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Planned" fill="#3b82f6" name="Planned" />
            <Bar dataKey="Used" fill="#ef4444" name="Used" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "🔍 Audit Status Overview",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={auditStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Completed" fill="#16a34a" name="Completed" />
            <Bar dataKey="InProgress" fill="#facc15" name="In Progress" />
            <Bar dataKey="Pending" fill="#ef4444" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "🔧 CARs & Observations Status",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={carsObsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="CARsOpen" fill="#dc2626" name="CARs Open" />
            <Bar dataKey="CARsClosed" fill="#16a34a" name="CARs Closed" />
            <Bar dataKey="ObsOpen" fill="#f97316" name="Obs Open" />
            <Bar dataKey="ObsClosed" fill="#059669" name="Obs Closed" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "⏳ Project Timeline Progress",
      component: (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {timelineData.map((project, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-800">{project.name}</span>
                <span className="text-gray-600">{project.progress.toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={project.progress} className="flex-1" />
                <Badge variant={getKPIBadgeVariant(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {project.daysRemaining > 0 ? `${project.daysRemaining} days remaining` : '⚠️ Overdue'}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "📋 Quality Plan Status",
      component: (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={qualityPlanStatusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({name, value}) => `${name}: ${value}`}
            >
              {qualityPlanStatusData.map((entry, index) => (
                <Cell key={index} fill={pieColors[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {chartConfigs.map((chart, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{chart.title}</h3>
            {chart.component}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Charts;