import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { BarChart2, TrendingUp, Info, HelpCircle } from 'lucide-react';

// Enhanced Manhours Tooltip Component with Quality Billability %
const ManhoursTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload || {};
    // ✅ SIMPLIFIED: Use originalTitle (full Project Title) - no truncation
    const projectName = data?.originalTitle || data?.name || "Project";

    // Parse billability percentage
    const parseBillability = (value) => {
      if (typeof value === 'string') {
        return parseFloat(value.replace('%', '')) || 0;
      }
      return Number(value) || 0;
    };

    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[240px] max-w-[300px]">
        <div className="font-semibold mb-3 text-blue-700 dark:text-blue-300 text-sm border-b border-gray-200 dark:border-gray-600 pb-2">
          {projectName}
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-2.5">
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality Manhours</span>
            </span>
            <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
              {Number(data["Manhours for Quality"] || 0).toLocaleString()} hrs
            </span>
          </div>
          <div className="flex justify-between items-center bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg p-2.5">
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Used Manhours</span>
            </span>
            <span className="font-bold text-sm text-red-600 dark:text-red-400">
              {Number(data["Manhours Used"] || 0).toLocaleString()} hrs
            </span>
          </div>
          <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-2.5">
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-sm" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Balance</span>
            </span>
            <span className="font-bold text-sm text-green-600 dark:text-green-400">
              {Number(data["Manhours Balance"] || 0).toLocaleString()} hrs
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2.5 mt-3">
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-2.5">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality Billability</span>
              </span>
              <span className="font-bold text-sm text-purple-600 dark:text-purple-400">
                {parseBillability(data["Quality Billability %"]).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ✅ NEW: Management Info Tooltip Component
const InfoTooltip = ({ title, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative inline-block">
      <HelpCircle 
        className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          <div className="font-semibold mb-1">{title}</div>
          <div>{children}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Helper function to normalize project names
const normalizeProjectName = (name) => {
  if (!name || typeof name !== 'string') return 'Unknown Project';
  
  return name
    .trim()
    .replace(/\s+/g, ' ');
};

// Responsive helper function to get optimal settings based on screen size
const getResponsiveSettings = () => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width >= 1536) return { textLength: 20, yAxisWidth: 160, leftMargin: 180, needsScroll: false }; // 2xl
    if (width >= 1280) return { textLength: 18, yAxisWidth: 150, leftMargin: 170, needsScroll: false }; // xl
    if (width >= 1024) return { textLength: 16, yAxisWidth: 140, leftMargin: 160, needsScroll: false }; // lg
    if (width >= 768) return { textLength: 14, yAxisWidth: 130, leftMargin: 150, needsScroll: true }; // md
    return { textLength: 12, yAxisWidth: 120, leftMargin: 140, needsScroll: true }; // sm and below
  }
  return { textLength: 16, yAxisWidth: 140, leftMargin: 160, needsScroll: false }; // default
};

// Helper function to split text into two lines without breaking words
const splitTextIntoLines = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) return [text, ''];
  
  const words = text.split(' ');
  if (words.length === 1) {
    return [text.substring(0, maxLength - 3) + '...', ''];
  }
  
  let line1 = '';
  let line2 = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = line1 + (line1 ? ' ' : '') + word;
    
    if (testLine.length > maxLength && line1) {
      line2 = words.slice(i).join(' ');
      if (line2.length > maxLength) {
        line2 = line2.substring(0, maxLength - 3) + '...';
      }
      break;
    } else {
      line1 = testLine;
    }
  }
  
  return [line1, line2];
};

export const ManhoursChart = ({ data = [] }) => {
  const [responsiveSettings, setResponsiveSettings] = React.useState(getResponsiveSettings());

  // Handle responsive settings
  React.useEffect(() => {
    const handleResize = () => {
      setResponsiveSettings(getResponsiveSettings());
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data processing with filtering for projects with actual manhour data
  const processedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    // Parse billability percentage helper
    const parseBillability = (value) => {
      if (typeof value === 'string') {
        return parseFloat(value.replace('%', '')) || 0;
      }
      return Number(value) || 0;
    };
    
    return data
      .filter(item => {
        const hasValidName = item?.name && 
                            typeof item.name === 'string' && 
                            item.name.trim() !== '' && 
                            item.name !== 'N/A' &&
                            item.name !== 'Unknown Project' &&
                            item.name.toLowerCase() !== 'untitled project';
        
        // Check for actual manhour values using correct field names
        const hasManhoursData = (Number(item["Manhours for Quality"]) > 0) || 
                               (Number(item["Manhours Used"]) > 0) || 
                               (Number(item["Manhours Balance"]) !== 0);
        
        return hasValidName && hasManhoursData;
      })
      .map(item => ({
        name: normalizeProjectName(item.name),
        originalName: item.name,
        originalTitle: item.originalTitle,
        "Manhours for Quality": Number(item["Manhours for Quality"]) || 0,
        "Manhours Used": Number(item["Manhours Used"]) || 0,
        "Manhours Balance": Number(item["Manhours Balance"]) || 0,
        "Quality Billability %": parseBillability(item["Quality Billability %"]),
        billabilityRaw: item["Quality Billability %"]
      }))
      .sort((a, b) => {
        // Sort by total manhours (Quality + Used) descending
        const totalA = a["Manhours for Quality"] + Math.abs(a["Manhours Used"]);
        const totalB = b["Manhours for Quality"] + Math.abs(b["Manhours Used"]);
        return totalB - totalA;
      });
  }, [data]);

  const hasData = processedData.length > 0;

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (!hasData) return { totalQuality: 0, totalUsed: 0, totalBalance: 0, avgBillability: 0, utilization: 0 };
    
    const totalQuality = processedData.reduce((sum, item) => sum + item["Manhours for Quality"], 0);
    const totalUsed = processedData.reduce((sum, item) => sum + Math.abs(item["Manhours Used"]), 0);
    const totalBalance = processedData.reduce((sum, item) => sum + item["Manhours Balance"], 0);
    const avgBillability = processedData.reduce((sum, item) => sum + item["Quality Billability %"], 0) / processedData.length;
    const utilization = totalQuality > 0 ? (totalUsed / totalQuality * 100) : 0;
    
    return { totalQuality, totalUsed, totalBalance, avgBillability, utilization };
  }, [processedData, hasData]);

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Manhours Analysis & Quality Billability
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
          <div className="flex justify-center gap-4 mb-3 flex-wrap">
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-blue-500" />
              Quality Hours
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-red-500" />
              Used Hours
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-green-500" />
              Balance
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Manhours Analysis & Quality Billability
        </h3>
        <span className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          {processedData.length} project{processedData.length !== 1 ? 's' : ''} tracked
        </span>
      </div>

      {/* Enhanced Chart Container with Smart Scrolling */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-7xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg p-6">
          {/* Chart Container with Conditional Scroll */}
          <div className={`w-full h-full ${responsiveSettings.needsScroll ? 'overflow-x-auto overflow-y-hidden' : ''}`}>
            <div 
              className="w-full"
              style={{ 
                minWidth: responsiveSettings.needsScroll ? '800px' : 'auto'
              }}
            >
              <ResponsiveContainer 
                width="100%" 
                height={Math.max(700, Math.min(1000, processedData.length * 90))}
              >
                <BarChart
                  layout="vertical"
                  data={processedData}
                  margin={{ 
                    top: 40, 
                    right: 60, 
                    left: responsiveSettings.leftMargin, 
                    bottom: 40 
                  }}
                  barCategoryGap="15%"
                  barGap={4}
                >
                  <defs>
                    {/* Enhanced Gradients with Multiple Stops */}
                    <linearGradient id="qualityGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="usedGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                      <stop offset="50%" stopColor="#ef4444" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                    </linearGradient>

                    {/* Subtle Shadow Filters for Depth */}
                    <filter id="dropshadow" height="130%">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.15"/>
                    </filter>
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    strokeOpacity={0.3}
                    horizontal={true}
                    vertical={false}
                  />
                  
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={responsiveSettings.yAxisWidth}
                    tick={({ x, y, payload }) => {
                      const [line1, line2] = splitTextIntoLines(payload.value, responsiveSettings.textLength);
                      
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={-10}
                            y={line2 ? -8 : 0}
                            dy={4}
                            textAnchor="end"
                            fill="#374151"
                            fontSize={12}
                            fontWeight={700}
                            className="fill-gray-800 dark:fill-gray-100"
                          >
                            {line1}
                          </text>
                          {line2 && (
                            <text
                              x={-10}
                              y={8}
                              dy={4}
                              textAnchor="end"
                              fill="#6b7280"
                              fontSize={11}
                              fontWeight={500}
                              className="fill-gray-600 dark:fill-gray-300"
                            >
                              {line2}
                            </text>
                          )}
                        </g>
                      );
                    }}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    interval={0}
                    label={{
                      value: "Project Title Key",
                      angle: -90,
                      position: "insideLeft",
                      offset: -20,
                      style: { 
                        textAnchor: 'middle',
                        fill: "#6b7280",
                        fontSize: "13px",
                        fontWeight: "700"
                      }
                    }}
                  />
                  
                  <XAxis
                    type="number"
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    tickLine={{ stroke: "#d1d5db" }}
                    axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                    domain={['dataMin - 50', 'dataMax + 100']}
                    label={{
                      value: "Manhours",
                      position: "insideBottom",
                      offset: -15,
                      style: { 
                        textAnchor: 'middle',
                        fill: "#6b7280",
                        fontSize: "13px",
                        fontWeight: "700"
                      }
                    }}
                  />
                  
                  <Tooltip content={<ManhoursTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                  
                  {/* Enhanced: Much Larger Bars with Better Spacing */}
                  <Bar 
                    dataKey="Manhours for Quality" 
                    fill="url(#qualityGradient)"
                    name="Manhours for Quality"
                    radius={[0, 12, 12, 0]}
                    maxBarSize={60}
                    style={{ filter: "url(#dropshadow)" }}
                  />
                  
                  <Bar 
                    dataKey="Manhours Used" 
                    fill="url(#usedGradient)"
                    name="Manhours Used"
                    radius={[0, 12, 12, 0]}
                    maxBarSize={60}
                    style={{ filter: "url(#dropshadow)" }}
                  />
                  
                  <Bar 
                    dataKey="Manhours Balance" 
                    fill="url(#balanceGradient)"
                    name="Manhours Balance"
                    radius={[0, 12, 12, 0]}
                    maxBarSize={60}
                    style={{ filter: "url(#dropshadow)" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Legend and Summary */}
      <div className="mt-8 space-y-6">
        {/* Legend */}
        <div className="flex justify-center gap-6 flex-wrap">
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-sm" />
            Manhours for Quality
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-sm" />
            Manhours Used
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-gradient-to-r from-green-500 via-green-600 to-green-700 shadow-sm" />
            Manhours Balance
          </span>
        </div>

        {/* ✅ ENHANCED: Summary Statistics with Management Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800 rounded-2xl p-4 border border-blue-200 dark:border-blue-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="text-xs text-blue-600 dark:text-blue-300 font-bold">Quality Hours</div>
                <InfoTooltip title="Quality Budget">
                  Total hours allocated for quality work across all projects
                </InfoTooltip>
              </div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm" />
            </div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-200">
              {summaryStats.totalQuality.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">Total Hours</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-950 dark:via-red-900 dark:to-red-800 rounded-2xl p-4 border border-red-200 dark:border-red-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="text-xs text-red-600 dark:text-red-300 font-bold">Used Hours</div>
                <InfoTooltip title="Hours Spent">
                  Actual hours worked on quality tasks so far
                </InfoTooltip>
              </div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm" />
            </div>
            <div className="text-2xl font-black text-red-700 dark:text-red-200">
              {summaryStats.totalUsed.toLocaleString()}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">Total Hours</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-950 dark:via-green-900 dark:to-green-800 rounded-2xl p-4 border border-green-200 dark:border-green-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="text-xs text-green-600 dark:text-green-300 font-bold">Balance</div>
                <InfoTooltip title="Remaining Budget">
                  Quality Hours - Used Hours = Hours still available
                </InfoTooltip>
              </div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-sm" />
            </div>
            <div className="text-2xl font-black text-green-700 dark:text-green-200">
              {summaryStats.totalBalance.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Hours Remaining</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800 rounded-2xl p-4 border border-purple-200 dark:border-purple-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold">Avg Billability</div>
                <InfoTooltip title="Revenue Efficiency">
                  How much revenue generated per hour worked (100%+ is excellent)
                </InfoTooltip>
              </div>
              <TrendingUp className="w-3 h-3 text-purple-500 drop-shadow-sm" />
            </div>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-200">
              {summaryStats.avgBillability.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">Quality Focus</div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="text-xs text-gray-600 dark:text-gray-300 font-bold">Utilization</div>
                <InfoTooltip title="Budget Usage">
                  Percentage of quality budget used (optimal: 70-85%)
                </InfoTooltip>
              </div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 shadow-sm" />
            </div>
            <div className="text-2xl font-black text-gray-700 dark:text-gray-200">
              {summaryStats.utilization.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Efficiency Rate</div>
          </div>
        </div>

        {/* ✅ ENHANCED: Management Insights Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Management Insights</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3">
              <div className="font-semibold text-green-700 dark:text-green-300 mb-1">
                {summaryStats.totalBalance > 0 ? '✅ Budget Status: Healthy' : '⚠️ Budget Status: Watch'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {summaryStats.totalBalance > 0 
                  ? `${summaryStats.totalBalance.toLocaleString()} hours remaining in quality budget`
                  : 'Quality budget may be over-utilized'
                }
              </div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3">
              <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                {summaryStats.avgBillability >= 100 ? '🎯 Profitability: Excellent' : summaryStats.avgBillability >= 80 ? '📈 Profitability: Good' : '📉 Profitability: Review'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {summaryStats.avgBillability >= 100 
                  ? 'Quality work is highly profitable'
                  : summaryStats.avgBillability >= 80 
                  ? 'Quality work is reasonably profitable'
                  : 'Quality work profitability needs attention'
                }
              </div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {summaryStats.utilization >= 70 && summaryStats.utilization <= 85 ? '⚡ Efficiency: Optimal' : summaryStats.utilization < 70 ? '🐌 Efficiency: Low' : '🔥 Efficiency: High Risk'}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {summaryStats.utilization >= 70 && summaryStats.utilization <= 85 
                  ? 'Projects are progressing at good pace'
                  : summaryStats.utilization < 70 
                  ? 'Projects may be behind schedule'
                  : 'Risk of quality budget overrun'
                }
              </div>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
};
