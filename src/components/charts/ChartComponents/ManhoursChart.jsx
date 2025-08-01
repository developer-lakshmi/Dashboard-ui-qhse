import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { BarChart2 } from 'lucide-react';

// Enhanced Manhours Tooltip Component with controlled width and smaller project name
const ManhoursTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const projectName = payload[0]?.payload?.name || "Project";
    
    // Function to truncate project name for tooltip
    const truncateProjectName = (name, maxLength = 25) => {
      if (!name || name.length <= maxLength) return name;
      return name.slice(0, maxLength) + "...";
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[180px] max-w-[250px]">
        <div className="font-medium mb-2 text-blue-700 dark:text-blue-300 text-xs border-b border-gray-200 dark:border-gray-600 pb-1.5">
          {truncateProjectName(projectName)}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span 
                  className="inline-block w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                  {entry.name}
                </span>
              </span>
              <span className="font-bold ml-2 text-gray-900 dark:text-gray-100 text-xs">
                {Number(entry.value || 0).toLocaleString()} hrs
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Helper function to normalize project names
const normalizeProjectName = (name) => {
  if (!name || typeof name !== 'string') return 'Unknown Project';
  
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length <= 2) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Helper function to split text into two lines without breaking words
const splitTextIntoLines = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return [text, ''];
  
  const words = text.split(' ');
  if (words.length === 1) {
    return [text, ''];
  }
  
  let line1 = '';
  let line2 = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = line1 + (line1 ? ' ' : '') + word;
    
    if (testLine.length > maxLength && line1) {
      line2 = words.slice(i).join(' ');
      break;
    } else {
      line1 = testLine;
    }
  }
  
  return [line1, line2];
};

export const ManhoursChart = ({ data = [] }) => {
  // Data processing with filtering for projects with actual manhour data
  const processedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data
      .filter(item => {
        const hasValidName = item?.name && 
                            typeof item.name === 'string' && 
                            item.name.trim() !== '' && 
                            item.name !== 'N/A' &&
                            item.name !== 'Unknown Project' &&
                            item.name.toLowerCase() !== 'untitled project';
        return hasValidName;
      })
      .map(item => ({
        name: normalizeProjectName(item.name),
        originalName: item.name,
        Planned: Number(item.Planned) || 0,
        Used: Number(item.Used) || 0
      }))
      .filter(item => item.Planned > 0 || item.Used > 0); // Only show projects with actual manhour data
  }, [data]);

  const hasData = processedData.length > 0;

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Manhours: Planned vs Used
          </h3>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
            Google Sheets
          </span>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-base font-medium mb-2">No manhour data available</p>
            <p className="text-sm">Projects will appear when they have manhour values in Google Sheets</p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6">
          <div className="flex justify-center gap-6 mb-3">
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-blue-500" />
              Planned Hours
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-red-500" />
              Used Hours
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            📊 Manhour data synced from Google Sheets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Manhours: Planned vs Used
          </h3>
          <span className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {processedData.length} project{processedData.length !== 1 ? 's' : ''} tracked
          </span>
      
      </div>

      {/* Chart Container with Horizontal Scroll */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
          <div className="min-w-[900px] w-full">
            <ResponsiveContainer 
              width="100%" 
              minWidth={900}
              height={Math.max(400, processedData.length * 50)}
            >
              <BarChart
                layout="vertical"
                data={processedData}
                margin={{ top: 20, right: 80, left: 320, bottom: 40 }}
                barCategoryGap="15%"
                barGap={6}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  strokeOpacity={0.7}
                  horizontal={true}
                  vertical={true}
                />
                
                <YAxis
                  dataKey="name"
                  type="category"
                  width={320}
                  tick={({ x, y, payload }) => {
                    const [line1, line2] = splitTextIntoLines(payload.value, 35);
                    
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={-15}
                          y={line2 ? -6 : 0}
                          dy={4}
                          textAnchor="end"
                          fill="#374151"
                          fontSize={12}
                          fontWeight={500}
                          className="fill-gray-700 dark:fill-gray-300"
                        >
                          {line1}
                        </text>
                        {line2 && (
                          <text
                            x={-15}
                            y={6}
                            dy={4}
                            textAnchor="end"
                            fill="#374151"
                            fontSize={12}
                            fontWeight={500}
                            className="fill-gray-700 dark:fill-gray-300"
                          >
                            {line2}
                          </text>
                        )}
                      </g>
                    );
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  label={{
                    value: "Projects",
                    angle: -90,
                    position: "insideLeft",
                    offset: -25,
                    style: { 
                      textAnchor: 'middle',
                      fill: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600"
                    }
                  }}
                />
                
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                  tickFormatter={(value) => value.toLocaleString()}
                  label={{
                    value: "Manhours",
                    position: "insideBottom",
                    offset: -5,
                    style: { 
                      textAnchor: 'middle',
                      fill: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600"
                    }
                  }}
                />
                
                <Tooltip content={<ManhoursTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                
                <Bar 
                  dataKey="Planned" 
                  fill="#3b82f6" 
                  name="Planned"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={30}
                />
                
                <Bar 
                  dataKey="Used" 
                  fill="#ef4444" 
                  name="Used"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend and Summary */}
      <div className="mt-6 space-y-4">
        {/* Legend */}
        <div className="flex justify-center gap-6">
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-blue-500" />
            Planned Hours
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-red-500" />
            Used Hours
          </span>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Total Planned</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {processedData.reduce((sum, item) => sum + item.Planned, 0).toLocaleString()} hrs
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Total Used</div>
            <div className="text-xl font-bold text-red-700 dark:text-red-300">
              {processedData.reduce((sum, item) => sum + item.Used, 0).toLocaleString()} hrs
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Utilization</div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
              {(() => {
                const totalPlanned = processedData.reduce((sum, item) => sum + item.Planned, 0);
                const totalUsed = processedData.reduce((sum, item) => sum + item.Used, 0);
                const utilization = totalPlanned > 0 ? (totalUsed / totalPlanned * 100) : 0;
                return `${utilization.toFixed(1)}%`;
              })()}
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            📊 Manhour data synced from Google Sheets • {processedData.length} projects shown
          </p>
        </div>
      </div>
    </div>
  );
};