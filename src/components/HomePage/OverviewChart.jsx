import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";

const metricOptions = [
  { key: "carsOpen", label: "CARs Open", color: "#f97316", gradient: "carsOpenGradient" },
  { key: "obsOpen", label: "Obs Open", color: "#2563eb", gradient: "obsOpenGradient" },
  { key: "kpiAchieved", label: "KPI Achieved (%)", color: "#22c55e", gradient: "kpiAchievedGradient" },
  { key: "billability", label: "Billability (%)", color: "#eab308", gradient: "billabilityGradient" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded shadow p-2 text-xs">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const QHSEOverviewChart = ({ monthlyData, yearlyData }) => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState("monthly");

  const chartData = filter === "monthly" ? monthlyData : yearlyData;

  return (
    <div className="card col-span-1 md:col-span-2 lg:col-span-4">
      <div className="card-header flex justify-between items-center">
        <p className="card-title">Overview</p>
        <select
          className="border rounded px-2 py-1 text-xs"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="card-body p-0">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="carsOpenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="obsOpenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="kpiAchievedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="billabilityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
                strokeWidth={0}
                stroke={theme === "light" ? "#475569" : "#94a3b8"}
                tickMargin={6}
              />
              <YAxis
                strokeWidth={0}
                stroke={theme === "light" ? "#475569" : "#94a3b8"}
                tickMargin={6}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              {metricOptions.map(metric => (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  fill={`url(#${metric.gradient})`}
                  name={metric.label}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 8 }}
                  isAnimationActive={true}
                  fillOpacity={1}
                  stackId="1"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="p-4 text-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
};

export default QHSEOverviewChart;