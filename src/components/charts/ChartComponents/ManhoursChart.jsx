import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { BarChart2 } from 'lucide-react';

// Enhanced Manhours Tooltip Component - Better data handling
const ManhoursTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const projectName = payload[0]?.payload?.name || "Project";
    return (
      <div className="bg-white dark:bg-slate-800 rounded shadow p-3 text-xs border border-slate-200 dark:border-slate-700 min-w-[180px]">
        <div className="font-semibold mb-2 text-blue-700 dark:text-blue-300">{projectName}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex justify-between mb-1">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.name}
            </span>
            <span className="font-bold ml-2">
              {entry.value ? Number(entry.value).toLocaleString() : '0'} hrs
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ManhoursChart = ({ data = [] }) => {
  // Data validation and processing - handles empty/invalid data
  const processedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
      name: item?.name || 'Unknown Project',
      Planned: Number(item?.Planned) || 0,
      Used: Number(item?.Used) || 0
    })).filter(item => item.name !== 'Unknown Project' || item.Planned > 0 || item.Used > 0);
  }, [data]);

  // Check if we have valid data to display
  const hasData = processedData.length > 0;

  // Handle empty state - same UI structure but with no data message
  if (!hasData) {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Manhours: Planned vs Used
        </h3>
        <div className="flex-1 flex flex-col justify-between">
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
              <div className="min-w-[400px] sm:min-w-[320px] w-full h-[400px] flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No manhours data available</p>
                  <p className="text-xs mt-1">Data will appear when manhours are recorded in Google Sheets</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-2 mb-1">
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#3b82f6" }} />
                Planned
              </span>
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#ef4444" }} />
                Used
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center w-full">
              Shows planned vs actual manhours for each project.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Manhours: Planned vs Used
      </h3>
      <div className="flex-1 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
            <div className="min-w-[400px] sm:min-w-[320px] w-full">
              <ResponsiveContainer 
                width="100%" 
                minWidth={320} 
                minHeight={220} 
                height={Math.max(400, processedData.length * 36)}
              >
                <BarChart
                  layout="vertical"
                  data={processedData}
                  height={Math.max(400, processedData.length * 36)}
                  margin={{ top: 16, right: 24, left: 120, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={16}
                          textAnchor="end"
                          fill="#64748b"
                          fontSize={12}
                          fontWeight={500}
                          className="block md:hidden"
                          style={{ pointerEvents: "none" }}
                        >
                          {payload.value && payload.value.length > 14 ? payload.value.slice(0, 13) + "…" : payload.value}
                        </text>
                        <text
                          x={0}
                          y={0}
                          dy={16}
                          textAnchor="end"
                          fill="#64748b"
                          fontSize={12}
                          fontWeight={500}
                          className="hidden md:block"
                          style={{ pointerEvents: "none" }}
                        >
                          {payload.value}
                        </text>
                      </g>
                    )}
                    tickLine={true}
                    axisLine={true}
                    interval={0}
                    label={{
                      value: "Project",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      fill: "#64748b",
                      fontSize: 13
                    }}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    tickLine={true}
                    axisLine={true}
                    tickFormatter={(value) => value.toLocaleString()}
                    label={{
                      value: "Manhours",
                      position: "insideBottom",
                      offset: -20,
                      fill: "#64748b",
                      fontSize: 13
                    }}
                  />
                  <Tooltip content={<ManhoursTooltip />} />
                  <Bar 
                    dataKey="Planned" 
                    fill="#3b82f6" 
                    name="Planned" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40}
                  />
                  <Bar 
                    dataKey="Used" 
                    fill="#ef4444" 
                    name="Used" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2 mb-1">
            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#3b82f6" }} />
              Planned
            </span>
            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#ef4444" }} />
              Used
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center w-full">
            Shows planned vs actual manhours for each project.
          </div>
        </div>
      </div>
    </>
  );
};