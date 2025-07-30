import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";
import { PieChart as PieChartIcon } from 'lucide-react';
import { pieColors } from '../../../data/index';

// KPI Status Tooltip Component
const KPIStatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 min-w-[180px]">
        <div className="font-semibold mb-2 text-blue-700 dark:text-blue-300 text-base">
          {entry?.payload?.name || "KPI Status"}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: entry?.payload?.fill || entry?.color }}
          />
          <span className="font-medium" style={{ color: entry?.payload?.fill || entry?.color }}>
            {entry?.name}
          </span>
          <span className="ml-auto font-bold text-gray-700 dark:text-gray-200">
            {entry?.value}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {entry?.name === "Green" && "On Track"}
          {entry?.name === "Yellow" && "Attention Needed"}
          {entry?.name === "Red" && "Critical"}
        </div>
      </div>
    );
  }
  return null;
};

export const KPIStatusChart = ({ data }) => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <PieChartIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        KPI Status Distribution
      </h3>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
            <div className="min-w-[320px] w-full">
              <ResponsiveContainer width="100%" minWidth={220} minHeight={220} height={320}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={2}
                    label={({ percent, name }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.name === "Green"
                            ? "#16a34a"
                            : entry.name === "Yellow"
                            ? "#facc15"
                            : entry.name === "Red"
                            ? "#ef4444"
                            : pieColors[index % pieColors.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<KPIStatusTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 flex-wrap">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-gray-700"
                  style={{
                    background:
                      entry.name === "Green"
                        ? "#16a34a"
                        : entry.name === "Yellow"
                        ? "#facc15"
                        : entry.name === "Red"
                        ? "#ef4444"
                        : pieColors[index % pieColors.length]
                  }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                  {entry.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({entry.value})
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            <span>
              <strong>Green</strong>: On Track &nbsp;|&nbsp;
              <strong>Yellow</strong>: Attention Needed &nbsp;|&nbsp;
              <strong>Red</strong>: Critical
            </span>
          </div>
        </div>
      </div>
    </>
  );
};