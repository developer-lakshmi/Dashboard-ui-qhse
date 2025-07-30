import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { AlertTriangle } from 'lucide-react';
import { LabelList } from "recharts";

// CARs & Observations Tooltip Component
const CarsObsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 min-w-[180px]">
        <div className="font-semibold mb-2 text-blue-700 dark:text-blue-300">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between mb-1 text-xs">
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: entry.color }} />
              <span className="font-medium" style={{ color: entry.color }}>{entry.name}</span>
            </span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const CarsObsChart = ({ data }) => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
        CARs & Observations Status
      </h3>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center w-full">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
            Open and closed CARs & Observations for each project.
          </div>
          <div className="flex justify-center gap-4 mb-2 flex-wrap">
            <span className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#dc2626" }} />
              CARs Open
            </span>
            <span className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#16a34a" }} />
              CARs Closed
            </span>
            <span className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#f97316" }} />
              Obs Open
            </span>
            <span className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#059669" }} />
              Obs Closed
            </span>
          </div>
          <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-900 scrollbar-track-transparent">
            <div className="min-w-[400px] sm:min-w-[320px] w-full">
              <ResponsiveContainer width="100%" minWidth={320} minHeight={220} height={Math.max(400, data.length * 36)}>
                <BarChart
                  layout="vertical"
                  data={data}
                  height={Math.max(400, data.length * 36)}
                  margin={{ top: 16, right: 24, left: 120, bottom: 40 }}
                  barCategoryGap="20%"
                  barSize={18}
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
                          {payload.value.length > 14 ? payload.value.slice(0, 13) + "…" : payload.value}
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
                    label={{
                      value: "Count",
                      position: "insideBottom",
                      offset: 0,
                      fill: "#64748b",
                      fontSize: 13
                    }}
                  />
                  <Tooltip content={<CarsObsTooltip />} />
                  <Bar dataKey="CARsOpen" fill="#dc2626" name="CARs Open" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="CARsOpen" position="right" fill="#dc2626" fontSize={12} />
                  </Bar>
                  <Bar dataKey="CARsClosed" fill="#16a34a" name="CARs Closed" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="CARsClosed" position="right" fill="#16a34a" fontSize={12} />
                  </Bar>
                  <Bar dataKey="ObsOpen" fill="#f97316" name="Obs Open" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="ObsOpen" position="right" fill="#f97316" fontSize={12} />
                  </Bar>
                  <Bar dataKey="ObsClosed" fill="#059669" name="Obs Closed" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="ObsClosed" position="right" fill="#059669" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center w-full">
            Status of CARs and Observations for each project.
          </div>
        </div>
      </div>
    </>
  );
};