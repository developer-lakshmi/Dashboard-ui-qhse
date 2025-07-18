import React, { useState } from "react";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { projectsData, fieldPriorities } from "../../data";
import { AlertTriangle, Star, Info, User, Calendar, ClipboardList, BadgeCheck, BadgeAlert, TrendingUp } from "lucide-react";

// Field labels and priorities
const fieldLabels = {
  srNo: "Sr No",
  projectNo: "Project No",
  projectTitle: "Project Title",
  client: "Client",
  projectManager: "Project Manager",
  projectStartingDate: "Project Starting Date",
  projectClosingDate: "Project Closing Date",
  projectExtension: "Project Extension",
  manhoursUsed: "Manhour Used",
  manhoursBalance: "Manhour Balance",
  qualityBillabilityPercent: "Quality Billability (%)",
  projectQualityPlanStatusRev: "Project Quality Plan Status - Rev",
  projectQualityPlanStatusIssueDate: "Project Quality Plan Status - Issue Date",
  projectAudit1: "Project Audit-1",
  projectAudit2: "Project Audit-2",
  projectAudit3: "Project Audit-3",
  projectAudit4: "Project Audit-4",
  clientAudit1: "Client Audit-1",
  clientAudit2: "Client Audit-2",
  delayInAuditsNoDays: "Delay in Audits - No of Days",
  carsOpen: "CARs Open",
  carsDelayedClosingNoDays: "CARs Delayed Closing No of Days",
  carsClosed: "CARs Closed",
  obsOpen: "No of Obs Open",
  obsDelayedClosingNoDays: "Obs Delayed Closing No of Days",
  obsClosed: "Obs Closed",
  projectKPIsAchievedPercent: "Project KPIs Achieved %",
  projectKPIStatus: "KPI Status",
  remarks: "Remarks"
};

const priorityMap = {};
fieldPriorities.highPriority.forEach(key => priorityMap[key] = "alert");
fieldPriorities.focusInformation.forEach(key => priorityMap[key] = "focus");
fieldPriorities.standardInformation.forEach(key => {
  if (!priorityMap[key]) priorityMap[key] = "standard";
});

const colorMap = {
  alert: "text-orange-600 font-semibold",
  focus: "text-blue-600 font-medium",
  standard: "text-gray-600"
};

// Compose all headers for "Show Everything"
const allHeaders = fieldPriorities.standardInformation.map((key) => ({
  key,
  label: fieldLabels[key] || key,
  priority: priorityMap[key] || "standard",
  color: colorMap[priorityMap[key] || "standard"]
}));

// Default headers for other views (short view)
const headers = [
  { key: "srNo", label: "Sr No", priority: "standard", color: colorMap.standard },
  { key: "projectNo", label: "Project No", priority: "standard", color: colorMap.standard },
  { key: "qualityBillabilityPercent", label: "Quality Billability %", priority: "alert", color: colorMap.alert },
  { key: "projectAudit1", label: "Project Audit 1", priority: "focus", color: colorMap.focus },
  { key: "remarks", label: "Remarks", priority: "standard", color: colorMap.standard }
];

const DetailedView = () => {
  const [viewMode, setViewMode] = useState("all");

  const getFilteredHeaders = () => {
    switch (viewMode) {
      case "alerts":
        return allHeaders.filter((h) => h.priority === "alert");
      case "focus":
        return allHeaders.filter((h) => h.priority === "focus");
      case "standard":
        return allHeaders.filter((h) => h.priority === "standard");
      case "everything":
        return allHeaders;
      default:
        return headers;
    }
  };

  const filteredHeaders = getFilteredHeaders();

  // Helper for cell highlighting
  const getCellBadge = (header, value) => {
    if (header.priority === "alert")
      return (
        <Badge className="ml-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
          <AlertTriangle size={12} /> Alert
        </Badge>
      );
    if (header.priority === "focus")
      return (
        <Badge className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
          Focus
        </Badge>
      );
    if (header.key === "projectKPIStatus") {
      let badgeColor =
        value === "Green"
          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
          : value === "Yellow"
          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
          : value === "Red"
          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200";
      return (
        <Badge className={`ml-2 ${badgeColor} px-2 py-0.5 rounded-full text-xs`}>
          {value}
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardContent className="p-6">
        {/* Description for new users */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex flex-col gap-1 items-start sm:flex-row sm:items-center sm:gap-2">
            <span className="flex items-center gap-2">
              <span role="img" aria-label="details">📋</span>
              Detailed Project Info
            </span>
             </h3>
            {/* <span className="block text-base font-normal text-gray-700 dark:text-gray-300">
              (All Project Details)
            </span>
         
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This table shows all project details. <br />
            <span className="font-medium text-orange-600 dark:text-orange-300">Orange</span> fields are high priority (alerts), 
            <span className="font-medium text-blue-600 dark:text-blue-300"> blue</span> are focus fields, 
            and <span className="font-medium text-gray-600 dark:text-gray-200">gray</span> are standard info. 
            <br />
            <span className="font-medium text-green-600 dark:text-green-300">KPI Status</span> badges show project health.
            <br />
            Use the buttons above the table to filter by priority.
          </p> */}
        </div>

        {/* Priority Legend */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            What do the colors and badges mean?
          </h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-1">
              <AlertTriangle size={16} className="text-orange-700 dark:text-orange-300" />
              <span className="font-medium">High Priority (Alert)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Info size={16} className="text-blue-700 dark:text-blue-300" />
              <span className="font-medium">Focus Field</span>
            </div>
            <div className="flex items-center space-x-1">
              <BadgeCheck size={16} className="text-green-700 dark:text-green-300" />
              <span className="font-medium">KPI Status: Good</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <span className="text-gray-700 dark:text-gray-200">Standard Info</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-200 dark:bg-green-700 rounded"></div>
              <span className="text-green-700 dark:text-green-300 font-medium">KPI Status: Good</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-700 rounded"></div>
              <span className="text-yellow-700 dark:text-yellow-300 font-medium">KPI Status: Warning</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-200 dark:bg-red-700 rounded"></div>
              <span className="text-red-700 dark:text-red-300 font-medium">KPI Status: Critical</span>
            </div>
          </div>
        </div>

        {/* Topbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span role="img" aria-label="details">📋</span> Detailed Project Info
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Switch views to highlight important fields or show everything
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {["all", "alerts", "focus", "standard", "everything"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === mode
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {mode === "all" && "All Fields"}
                  {mode === "alerts" && "🚨 Alerts"}
                  {mode === "focus" && "🔍 Focus"}
                  {mode === "standard" && "📋 Standard"}
                  {mode === "everything" && "🗂️ Show Everything"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <tr>
                {filteredHeaders.map((header) => (
                  <th
                    key={header.key}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${header.color} dark:text-inherit`}
                    style={{ maxWidth: 120, minWidth: 80, wordBreak: "break-word", whiteSpace: "normal" }}
                  >
                    <div className="flex flex-col items-start space-y-1">
                      <span className="flex items-center gap-1">
                        {/* Example: Add icons based on field */}
                        {header.key === "projectNo" && <ClipboardList size={14} />}
                        {header.key === "projectTitle" && <Star size={14} />}
                        {header.key === "client" && <User size={14} />}
                        {header.key === "projectManager" && <User size={14} />}
                        {header.key === "projectStartingDate" && <Calendar size={14} />}
                        {header.key === "projectClosingDate" && <Calendar size={14} />}
                        {header.key === "qualityBillabilityPercent" && <TrendingUp size={14} />}
                        {header.priority === "alert" && <AlertTriangle size={14} className="text-orange-500" />}
                        {header.priority === "focus" && <Info size={14} className="text-blue-500" />}
                        {header.key === "projectKPIStatus" && <BadgeCheck size={14} className="text-green-500" />}
                        {header.label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {projectsData.map((project, i) => (
                <tr
                  key={project.projectNo || i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {filteredHeaders.map((header) => (
                    <td key={header.key} className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm ${header.color} dark:text-inherit flex items-center`}>
                        <span>
                          {project[header.key] !== undefined && project[header.key] !== null
                            ? project[header.key]
                            : "-"}
                        </span>
                        {getCellBadge(header, project[header.key])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>{projectsData.length} projects</span>
          <span>
            Data as of {new Date().toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedView;