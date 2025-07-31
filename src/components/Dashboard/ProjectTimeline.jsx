import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, AlertCircle, User, Calendar } from "lucide-react";
import { useState } from "react";

// Helper to choose badge color based on status - Updated for all status types
const getKPIBadgeVariant = (status) => {
  if (status === "On Track") return "success";
  if (status === "Delayed") return "warning";
  if (status === "Completed") return "success";
  if (status === "Critical") return "destructive";
  if (status === "At Risk") return "secondary";
  return "default";
};

// Updated to handle all status types with correct logic
const getStatusIcon = (status) => {
  if (status === "Completed")
    return <CheckCircle2 className="text-green-500 hover:text-green-600 transition-colors" size={20} />;
  if (status === "Critical")
    return <AlertCircle className="text-red-500 hover:text-red-600 transition-colors" size={20} />;
  if (status === "Delayed")
    return <AlertTriangle className="text-orange-500 hover:text-orange-600 transition-colors" size={20} />;
  if (status === "At Risk")
    return <Clock className="text-yellow-500 hover:text-yellow-600 transition-colors" size={20} />;
  if (status === "On Track")
    return <TrendingUp className="text-blue-500 hover:text-blue-600 transition-colors" size={20} />;
  return <Clock className="text-gray-400 hover:text-gray-500 transition-colors" size={20} />;
};

// Optimized tooltip component with clean UI and relevant data only
const ProjectTooltip = ({ project, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Helper to format dates nicely
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper to get status color for tooltip
  const getStatusColor = (status) => {
    switch (status) {
      case "Critical": return "text-red-300";
      case "Delayed": return "text-orange-300";
      case "At Risk": return "text-yellow-300";
      case "Completed": return "text-green-300";
      case "On Track": return "text-blue-300";
      default: return "text-gray-300";
    }
  };

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help inline-block"
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg shadow-lg min-w-72 -top-2 left-8">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
              {getStatusIcon(project.status)}
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {project.projectNo || 'No Project ID'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {project.name || project.title || 'Untitled Project'}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</div>
                <div className={`font-semibold ${getStatusColor(project.status)}`}>
                  {project.status}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progress</div>
                <div className={`font-semibold ${
                  project.progress >= 90 ? "text-green-600" :
                  project.progress >= 70 ? "text-blue-600" :
                  project.progress >= 50 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {Math.round(project.progress || 0)}%
                </div>
              </div>
            </div>

            {/* Timeline Info - Only if available */}
            {(project.startDate || project.endDate || project.daysRemaining !== undefined) && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timeline</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {project.startDate && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Start:</span>
                      <div className="font-medium">{formatDate(project.startDate)}</div>
                    </div>
                  )}
                  {project.endDate && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">End:</span>
                      <div className="font-medium">{formatDate(project.endDate)}</div>
                    </div>
                  )}
                </div>
                {project.daysRemaining !== undefined && (
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Days Remaining:</span>
                    <span className={`ml-2 font-semibold ${
                      project.daysRemaining < 0 ? "text-red-600" :
                      project.daysRemaining === 0 ? "text-orange-600" :
                      project.daysRemaining <= 7 ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {project.daysRemaining < 0 ? 
                        `${Math.abs(project.daysRemaining)} days overdue` : 
                        `${project.daysRemaining} days`
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Team Info - Only if available */}
            {(project.manager || project.client) && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Team</div>
                <div className="space-y-1 text-sm">
                  {project.manager && (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">Manager:</span>
                      <span className="font-medium">{project.manager}</span>
                    </div>
                  )}
                  {project.client && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">Client:</span>
                      <span className="font-medium">{project.client}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* KPI - Only if meaningful */}
            {project.kpiStatus !== undefined && project.kpiStatus !== null && project.kpiStatus > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Performance</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">KPI Achievement:</span>
                  <span className={`font-semibold ${
                    project.kpiStatus >= 90 ? "text-green-600" :
                    project.kpiStatus >= 70 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {Math.round(project.kpiStatus)}%
                  </span>
                </div>
              </div>
            )}

            {/* Issues - Only if there are actual problems */}
            {(project.carsOpen > 0 || project.obsOpen > 0 || project.auditDelay > 0) && (
              <div className="space-y-2 pt-2 border-t border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <div className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide font-semibold">
                    Issues Requiring Attention
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {project.carsOpen > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">CARs Open:</span>
                      <span className="text-red-600 font-semibold">{project.carsOpen}</span>
                    </div>
                  )}
                  {project.obsOpen > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Observations Open:</span>
                      <span className="text-red-600 font-semibold">{project.obsOpen}</span>
                    </div>
                  )}
                  {project.auditDelay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Audit Delay:</span>
                      <span className="text-red-600 font-semibold">{project.auditDelay} days</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Arrow pointer */}
          <div className="absolute top-4 -left-1 w-2 h-2 bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-600 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const ProjectTimeline = ({ timelineData }) => (
  <div className="card col-span-1 md:col-span-2 lg:col-span-3">
    <div className="card-header flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        <Clock className="text-blue-500" size={22} />
        <p className="card-title font-semibold">Management Focus - Priority Projects</p>
      </div>
      {timelineData && timelineData.length > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {timelineData.length} project{timelineData.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
    <div className="card-body space-y-3 max-h-80 overflow-y-auto">
      {timelineData && timelineData.length > 0 ? (
        timelineData.map((project, index) => (
          <div
            key={project.id || index}
            className="space-y-2 p-3 bg-gradient-to-r from-blue-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-200"
          >
            {/* Project Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-x-2 flex-1">
                <ProjectTooltip project={project}>
                  {getStatusIcon(project.status)}
                </ProjectTooltip>
                <div className="flex-1">
                  <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">
                    {project.projectNo ? `${project.projectNo} - ` : ''}{project.name || project.title}
                  </span>
                  {/* Show manager and client if available */}
                  {(project.manager || project.client) && (
                    <div className="flex items-center gap-3 mt-1">
                      {project.manager && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400">
                          <User size={12} />
                          <span>{project.manager}</span>
                        </div>
                      )}
                      {project.client && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400">
                          <Calendar size={12} />
                          <span>{project.client}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800 dark:text-slate-200">
                  {Math.round(project.progress || 0)}%
                </span>
                <Badge variant={getKPIBadgeVariant(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
              <Progress
                value={project.progress || 0}
                className="flex-1 h-2 rounded-full"
              />
            </div>

            {/* Timeline Status */}
            <div className="text-xs flex items-center justify-between">
              <div className="flex items-center gap-x-1">
                {project.status === "Completed" || (project.progress && project.progress >= 100) ? (
                  <>
                    <CheckCircle2 className="text-green-500" size={14} />
                    <span className="text-green-600 font-semibold">Project Completed</span>
                  </>
                ) : project.daysRemaining !== undefined && project.daysRemaining > 0 ? (
                  <>
                    <Clock className="text-blue-500" size={14} />
                    <span className="text-blue-700 dark:text-blue-400">
                      {project.daysRemaining} days remaining
                    </span>
                  </>
                ) : project.daysRemaining === 0 ? (
                  <>
                    <AlertTriangle className="text-orange-500" size={14} />
                    <span className="text-orange-600 font-semibold">Due Today</span>
                  </>
                ) : project.daysRemaining < 0 ? (
                  <>
                    <AlertCircle className="text-red-500" size={14} />
                    <span className="text-red-600 font-semibold">
                      Overdue by {Math.abs(project.daysRemaining)} days
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="text-gray-500" size={14} />
                    <span className="text-gray-600">Timeline pending</span>
                  </>
                )}
              </div>
              
              {/* KPI Status - Show if available and meaningful */}
              {project.kpiStatus !== undefined && project.kpiStatus !== null && project.kpiStatus > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">KPI:</span>
                  <span className={`font-semibold text-xs ${
                    project.kpiStatus >= 90 ? 'text-green-600' :
                    project.kpiStatus >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(project.kpiStatus)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-8">
          <CheckCircle2 className="mx-auto mb-2 text-4xl text-green-400" />
          <p className="font-medium text-green-600">Great! No high-priority projects</p>
          <p className="text-sm text-gray-500">All projects are on track or completed</p>
        </div>
      )}
    </div>
  </div>
);

export default ProjectTimeline;