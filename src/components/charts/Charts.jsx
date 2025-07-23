import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { pieColors } from '../../data/index';
import { BarChart2, PieChart as PieChartIcon, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LabelList } from "recharts";

const TruncatedTick = ({ x, y, payload }) => {
  const maxLen = 12;
  const name =
    payload.value.length > maxLen
      ? payload.value.slice(0, maxLen) + "…"
      : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#64748b"
        fontSize={12}
        fontWeight={500}
        style={{ pointerEvents: "none" }}
      >
        {name}
      </text>
    </g>
  );
};

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
            <span className="font-bold ml-2">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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

const AuditStatusTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 min-w-[180px]">
        <div className="font-semibold mb-2 text-blue-700 dark:text-blue-300">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between mb-1 text-xs ">
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
      title: (
        <span className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Manhours: Planned vs Used
        </span>
      ),
      component: (
        <div className="w-full flex flex-col items-center">
          {/* Responsive horizontal scroll for mobile */}
          <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
            <div className="min-w-[400px] sm:min-w-[320px] w-full">
              <ResponsiveContainer width="100%" minWidth={320} minHeight={220} height={Math.max(400, manhoursData.length * 36)}>
                <BarChart
                  layout="vertical"
                  data={manhoursData}
                  height={Math.max(400, manhoursData.length * 36)}
                  margin={{ top: 16, right: 24, left: 120, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        {/* Show truncated on small screens, full on md+ */}
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
                    label={{
                      value: "Manhours",
                      position: "insideBottom",
                      offset: -20,
                      fill: "#64748b",
                      fontSize: 13
                    }}
                  />
                  <Tooltip content={<ManhoursTooltip />} />
                  <Bar dataKey="Planned" fill="#3b82f6" name="Planned" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Used" fill="#ef4444" name="Used" radius={[6, 6, 0, 0]} />
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
      ),
      fullWidth: true
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          Audit Status Overview
        </span>
      ),
      component: (
        <div className="flex flex-col items-center w-full">
          {/* Subtitle for clarity */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
            Each bar shows how many projects are at each status for each audit.
          </div>
          {/* Custom legend above chart */}
          <div className="flex justify-center gap-4 mb-2 flex-wrap">
            <span className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#16a34a" }} />
              Completed
            </span>
            <span className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#facc15" }} />
              Upcoming
            </span>
            <span className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#64748b" }} />
              Not Applicable
            </span>
          </div>
          <ResponsiveContainer width="100%" minWidth={320} minHeight={220} height={320}>
            <BarChart
              data={auditStatusData}
              margin={{ top: 16, right: 24, left: 24, bottom: 40 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                axisLine={true}
                tickLine={false}
                label={{
                  value: "Audit",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#64748b",
                  fontSize: 14
                }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#64748b", fontSize: 13 }}
                axisLine={true}
                tickLine={false}
                label={{
                  value: "Number of Projects",
                  angle: -90,
                  position: "insideLeft",
                  offset: 30,
                  fill: "#64748b",
                  fontSize: 14,
                  dy: 120
                }}
              />
              <Tooltip content={<AuditStatusTooltip />} />
              <Bar dataKey="Completed" fill="#16a34a" name="Completed">
                <LabelList dataKey="Completed" position="top" fill="#16a34a" fontSize={12} />
              </Bar>
              <Bar dataKey="Upcoming" fill="#facc15" name="Upcoming">
                <LabelList dataKey="Upcoming" position="top" fill="#facc15" fontSize={12} />
              </Bar>
              <Bar dataKey="NotApplicable" fill="#64748b" name="Not Applicable">
                <LabelList dataKey="NotApplicable" position="top" fill="#64748b" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center w-full">
            Status of audits across all filtered projects.
          </div>
        </div>
      )
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          KPI Status Distribution
        </span>
      ),
      component: (
        <div className="flex flex-col items-center w-full">
          {/* Responsive wrapper for mobile scroll if needed */}
          <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
            <div className="min-w-[320px] w-full">
              <ResponsiveContainer width="100%" minWidth={220} minHeight={220} height={320}>
                <PieChart>
                  <Pie
                    data={kpiStatusData}
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
                    {kpiStatusData.map((entry, index) => (
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
          {/* Custom legend below, wraps on mobile */}
          <div className="flex justify-center gap-6 mt-4 flex-wrap">
            {kpiStatusData.map((entry, index) => (
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
      )
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
          CARs & Observations Status
        </span>
      ),
      component: (
        <div className="flex flex-col items-center w-full">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
            Open and closed CARs & Observations for each project.
          </div>
          {/* Responsive legend */}
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
          {/* Responsive horizontal scroll for mobile */}
          <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-900 scrollbar-track-transparent">
            <div className="min-w-[400px] sm:min-w-[320px] w-full">
              <ResponsiveContainer width="100%" minWidth={320} minHeight={220} height={Math.max(400, carsObsData.length * 36)}>
                <BarChart
                  layout="vertical"
                  data={carsObsData}
                  height={Math.max(400, carsObsData.length * 36)}
                  margin={{ top: 16, right: 24, left: 120, bottom: 40 }}
                  barCategoryGap="20%" // Match Manhours chart
                  barSize={18}         // Match Manhours chart
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        {/* Truncate on mobile, full on md+ */}
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
                      offset:0,
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
      ),
      fullWidth: true
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
          Project Timeline Progress
        </span>
      ),
      component: (
        <div className="flex flex-col w-full">
          {/* Responsive scroll for mobile, max height for desktop */}
          <div className="space-y-3 max-h-96 overflow-y-auto w-full px-1 sm:px-0">
            {timelineData.map((project, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 p-4 bg-gradient-to-r from-blue-50/60 via-white to-green-50/60 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-w-0"
              >
                <div className="flex justify-between items-center mb-1 gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100 text-base truncate max-w-[60vw] sm:max-w-full">{project.name}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {project.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="flex-1 h-3 rounded-full" />
                  <Badge
                    variant={getKPIBadgeVariant(project.status)}
                    className="ml-2 text-xs px-2 py-0.5"
                  >
                    {project.status === "Green" && "On Track"}
                    {project.status === "Red" && "Overdue/Critical"}
                    {project.status === "Yellow" && "Attention Needed"}
                    {/* fallback for any other status */}
                    {["Green", "Red", "Yellow"].indexOf(project.status) === -1 && project.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  {project.daysRemaining > 0 ? (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                      {project.daysRemaining} days remaining
                    </>
                  ) : (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-semibold text-red-600 dark:text-red-400">⚠️ Overdue</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Quality Plan Status
        </span>
      ),
      component: (
        <div className="flex flex-col items-center w-full">
      {/* Responsive wrapper for mobile scroll if needed */}
      <div className="w-full max-w-full flex justify-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900 scrollbar-track-transparent">
        <div className="min-w-[220px] w-full">
          <ResponsiveContainer width="100%" minWidth={220} minHeight={220} height={260}>
            <PieChart>
              <Pie
                data={qualityPlanStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {qualityPlanStatusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.name === "Approved"
                        ? "#16a34a"
                        : entry.name === "Pending"
                        ? "#facc15"
                        : pieColors[index % pieColors.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} project${value === 1 ? '' : 's'}`, name]}
                contentStyle={{
                  background: "#fff",
                  borderRadius: "0.5rem",
                  boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)"
                }}
                labelStyle={{ color: "#3b82f6" }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 13 }}
                formatter={(value) => {
                  if (value === "Approved") return <span className="text-green-700 dark:text-green-400 font-medium">Approved</span>;
                  if (value === "Pending") return <span className="text-yellow-700 dark:text-yellow-300 font-medium">Pending</span>;
                  return value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Custom legend for mobile if needed */}
      <div className="flex justify-center gap-6 mt-4 flex-wrap">
        {qualityPlanStatusData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 mb-2">
            <span
              className="inline-block w-4 h-4 rounded-full border border-gray-300 dark:border-gray-700"
              style={{
                background:
                  entry.name === "Approved"
                    ? "#16a34a"
                    : entry.name === "Pending"
                    ? "#facc15"
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
    </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {chartConfigs.map((chart, index) => (
        <div
          key={index}
          className={chart.fullWidth ? "md:col-span-2" : ""}
        >
          <Card
            className="h-full min-h-[400px] flex flex-col hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
          >
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">{chart.title}</h3>
              <div className="flex-1 flex flex-col justify-between">{chart.component}</div>
            </CardContent>
          </Card>
        </div>
      ))}
      
    </div>
  );
};

export default Charts;