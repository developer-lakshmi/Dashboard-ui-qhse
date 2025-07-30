import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { AlertTriangle } from 'lucide-react';

// Enhanced CARs & Observations Tooltip Component with controlled width
const CarsObsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Function to truncate project name for tooltip
    const truncateProjectName = (name, maxLength = 25) => {
      if (!name || name.length <= maxLength) return name;
      return name.slice(0, maxLength) + "...";
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[180px] max-w-[250px]">
        <div className="font-medium mb-2 text-red-700 dark:text-red-300 text-xs border-b border-gray-200 dark:border-gray-600 pb-1.5">
          {truncateProjectName(label)}
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
                {entry.value}
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

export const CarsObsChart = ({ data = [] }) => {
  // Data processing
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
        CARsOpen: Number(item.CARsOpen) || 0,
        CARsClosed: Number(item.CARsClosed) || 0,
        ObsOpen: Number(item.ObsOpen) || 0,
        ObsClosed: Number(item.ObsClosed) || 0
      }))
      .filter(item => item.CARsOpen > 0 || item.CARsClosed > 0 || item.ObsOpen > 0 || item.ObsClosed > 0); // Only show projects with CAR/Obs data
  }, [data]);

  const hasData = processedData.length > 0;

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
            CARs & Observations Status
          </h3>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
            Google Sheets
          </span>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-base font-medium mb-2">No CARs/Observations data available</p>
            <p className="text-sm">Data will appear when CARs and Observations are recorded in Google Sheets</p>
          </div>
        </div>

        {/* Legend in Empty State */}
        <div className="mt-6">
          <div className="flex justify-center gap-4 mb-3 flex-wrap">
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-red-600" />
              CARs Open
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-green-600" />
              CARs Closed
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-orange-500" />
              Obs Open
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="inline-block w-4 h-3 rounded mr-2 bg-yellow-500" />
              Obs Closed
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            📊 CARs & Observations data synced from Google Sheets
          </p>
        </div>

        {/* Main Legend */}
        <div className="flex justify-center gap-6">
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-red-600" />
            CARs Open
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-green-600" />
            CARs Closed
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-orange-500" />
            Obs Open
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-yellow-500" />
            Obs Closed
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
          CARs & Observations Status
        </h3>
        <span className="text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-1 rounded-full border border-red-200 dark:border-red-800">
          {processedData.length} project{processedData.length !== 1 ? 's' : ''} active
        </span>
      </div>

      {/* Chart Container with Horizontal Scroll - Same UI as ManhoursChart */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-900 scrollbar-track-transparent">
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
                barCategoryGap="10%" // Reduced from 15% to give more space for 4 bars
                barGap={2} // Reduced from 6 to make bars closer together
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
                    value: "Count",
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
                
                <Tooltip content={<CarsObsTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }} />
                
                <Bar 
                  dataKey="CARsOpen" 
                  fill="#dc2626" 
                  name="CARs Open"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={25}
                />
                
                <Bar 
                  dataKey="CARsClosed" 
                  fill="#16a34a" 
                  name="CARs Closed"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={25}
                />
                
                <Bar 
                  dataKey="ObsOpen" 
                  fill="#f97316" 
                  name="Obs Open"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={25}
                />
                
                <Bar 
                  dataKey="ObsClosed" 
                  fill="#eab308" 
                  name="Obs Closed"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend and Summary - Same UI as ManhoursChart */}
      <div className="mt-6 space-y-4">
        {/* Legend */}
        <div className="flex justify-center gap-6">
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-red-600" />
            CARs Open
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-green-600" />
            CARs Closed
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-orange-500" />
            Obs Open
          </span>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-block w-4 h-3 rounded mr-2 bg-yellow-500" />
            Obs Closed
          </span>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Total Open</div>
            <div className="text-xl font-bold text-red-700 dark:text-red-300">
              {processedData.reduce((sum, item) => sum + item.CARsOpen + item.ObsOpen, 0)}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Total Closed</div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300">
              {processedData.reduce((sum, item) => sum + item.CARsClosed + item.ObsClosed, 0)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Closure Rate</div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
              {(() => {
                const totalOpen = processedData.reduce((sum, item) => sum + item.CARsOpen + item.ObsOpen, 0);
                const totalClosed = processedData.reduce((sum, item) => sum + item.CARsClosed + item.ObsClosed, 0);
                const total = totalOpen + totalClosed;
                const closureRate = total > 0 ? (totalClosed / total * 100) : 0;
                return `${closureRate.toFixed(1)}%`;
              })()}

{/* 
              Project A: 5 CARs Open, 3 CARs Closed, 2 Obs Open, 4 Obs Closed
Project B: 2 CARs Open, 6 CARs Closed, 1 Obs Open, 3 Obs Closed

Total Open = (5 + 2) + (2 + 1) = 10
Total Closed = (3 + 6) + (4 + 3) = 16
Total Items = 10 + 16 = 26
Closure Rate = (16 ÷ 26) × 100 = 61.5% */}
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            📊 CARs & Observations data synced from Google Sheets • {processedData.length} projects shown
          </p>
        </div>
      </div>
    </div>
  );
};