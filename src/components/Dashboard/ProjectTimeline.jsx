import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, AlertCircle, User, Calendar } from "lucide-react";
import { useState } from "react";

// Enhanced status icon to show extension status
const getStatusIcon = (status, urgencyScore = 0) => {
  const baseSize = 20;
  const isHighUrgency = urgencyScore >= 6;
  const pulseClass = isHighUrgency ? "animate-pulse" : "";
  
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="text-green-500 hover:text-green-600 transition-colors" size={baseSize} />;
    case "Critical":
      return <AlertCircle className={`text-red-500 hover:text-red-600 transition-colors ${pulseClass}`} size={baseSize} />;
    case "Delayed":
      return <AlertTriangle className={`text-orange-500 hover:text-orange-600 transition-colors ${pulseClass}`} size={baseSize} />;
    case "Extended":
      return <Clock className={`text-blue-500 hover:text-blue-600 transition-colors ${pulseClass}`} size={baseSize} />;
    case "At Risk":
      return <Clock className="text-yellow-500 hover:text-yellow-600 transition-colors" size={baseSize} />;
    case "On Track":
      return <TrendingUp className="text-blue-500 hover:text-blue-600 transition-colors" size={baseSize} />;
    default:
      return <Clock className="text-gray-400 hover:text-gray-500 transition-colors" size={baseSize} />;
  }
};

// Enhanced badge variant to handle extensions
const getKPIBadgeVariant = (status) => {
  switch (status) {
    case "Critical": return "destructive";
    case "Delayed": return "warning";
    case "Extended": return "secondary";
    case "At Risk": return "secondary";
    case "Completed": return "success";
    case "On Track": return "success";
    default: return "default";
  }
};

// Enhanced tooltip component with extension details
const ProjectTooltip = ({ project, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

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
        <div className="absolute z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg shadow-lg min-w-80 -top-2 left-8">
          <div className="space-y-3">
            {/* Header with extension indicator */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-600">
              {getStatusIcon(project.status, project.urgencyScore)}
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>
                    {project.projectNo && project.projectNo !== "" && project.projectNo !== "N/A" 
                      ? `${project.projectNo} - ${project.name}` 
                      : project.name}
                  </span>
                  {project.hasExtension && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      EXTENDED
                    </span>
                  )}
                  {project.urgencyScore >= 6 && (
                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full animate-pulse">
                      HIGH URGENCY
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Management Focus Project
                </div>
              </div>
            </div>

            {/* Simple Priority Metrics */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Priority</div>
                <div className={`text-lg font-bold ${
                  project.priority === 4 ? "text-red-600" :
                  project.priority === 3 ? "text-orange-600" :
                  project.priority === 2 ? "text-yellow-600" : "text-blue-600"
                }`}>
                  {project.priority === 4 ? "CRITICAL" :
                   project.priority === 3 ? "HIGH" :
                   project.priority === 2 ? "MEDIUM" : "LOW"}
                </div>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Progress</div>
                <div className={`text-lg font-bold ${
                  project.progress >= 90 ? "text-green-600" :
                  project.progress >= 70 ? "text-blue-600" :
                  project.progress >= 50 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {Math.round(project.progress)}%
                </div>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Urgency</div>
                <div className={`text-lg font-bold ${
                  project.urgencyScore >= 6 ? "text-red-600" :
                  project.urgencyScore >= 3 ? "text-orange-600" : "text-yellow-600"
                }`}>
                  {project.urgencyScore}
                </div>
              </div>
            </div>

            {/* Risk Factors - Only show if there are actual risk factors */}
            {project.riskFactors && project.riskFactors.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <div className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide font-semibold">
                    Issues Requiring Action
                  </div>
                </div>
                <ul className="space-y-1 text-xs">
                  {project.riskFactors.map((factor, idx) => (
                    <li key={idx} className="text-red-600 dark:text-red-400 flex items-start gap-1">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enhanced Timeline Info with Extension Details */}
            {project.daysRemaining !== undefined && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timeline</div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <span className={`ml-2 font-semibold ${
                      project.daysRemaining < 0 ? "text-red-600" :
                      project.daysRemaining === 0 ? "text-orange-600" :
                      project.daysRemaining <= 7 ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {project.daysRemaining < 0 ? 
                        (project.hasExtension ? 
                          `OVERDUE by ${Math.abs(project.daysRemaining)} days (Even with extension)` :
                          `OVERDUE by ${Math.abs(project.daysRemaining)} days`
                        ) : 
                        project.daysRemaining === 0 ?
                        (project.hasExtension ? "Due TODAY (Extended)" : "Due TODAY") :
                        `${project.daysRemaining} days remaining`
                      }
                    </span>
                  </div>
                  
                  {/* Extension Details */}
                  {project.hasExtension && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">Extension Details:</div>
                      <div className="text-xs space-y-1">
                        {project.originalEndDate && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Original deadline:</span>
                            <span className="ml-1 text-red-600">{project.originalEndDate.toLocaleDateString()}</span>
                          </div>
                        )}
                        {project.effectiveEndDate && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Extended to:</span>
                            <span className="ml-1 text-blue-600">{project.effectiveEndDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Info - Only show if manager or client exists */}
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

            {/* Quality Issues Details - Only show if there are actual issues */}
            {(project.carsOpen > 0 || project.obsOpen > 0 || project.auditDelay > 0) && (
              <div className="space-y-2 pt-2 border-t border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-orange-500" />
                  <div className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wide font-semibold">
                    Quality Issues
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {project.carsOpen > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">CARs Open:</span>
                      <span className="text-orange-600 font-semibold">{project.carsOpen}</span>
                    </div>
                  )}
                  {project.obsOpen > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Observations Open:</span>
                      <span className="text-orange-600 font-semibold">{project.obsOpen}</span>
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

const ProjectTimeline = ({ timelineData }) => {
  // Filter out any remaining invalid projects at component level
  const validProjects = timelineData?.filter(project => 
    project && 
    project.name && 
    project.name !== "" && 
    project.name !== "N/A"
  ) || [];

  return (
    <div className="card col-span-1 md:col-span-2 lg:col-span-3">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <AlertTriangle className="text-red-500" size={22} />
          <p className="card-title font-semibold">🎯 Management Priority - Projects Needing Attention</p>
        </div>
        {validProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
              {validProjects.filter(p => p.priority === 4).length} critical
            </span>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
              {validProjects.filter(p => p.priority === 3).length} high
            </span>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
              {validProjects.length} total
            </span>
          </div>
        )}
      </div>
      <div className="card-body space-y-3 max-h-80 overflow-y-auto">
        {validProjects.length > 0 ? (
          validProjects.map((project, index) => (
            <div
              key={project.id || index}
              className={`space-y-2 p-3 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 ${
                project.priority === 4 ? 
                  'bg-gradient-to-r from-red-50 via-white to-red-50 dark:from-red-900/20 dark:via-gray-800 dark:to-red-900/20 border-red-200 dark:border-red-800' :
                project.priority === 3 ?
                  'bg-gradient-to-r from-orange-50 via-white to-orange-50 dark:from-orange-900/20 dark:via-gray-800 dark:to-orange-900/20 border-orange-200 dark:border-orange-800' :
                  'bg-gradient-to-r from-yellow-50 via-white to-yellow-50 dark:from-yellow-900/20 dark:via-gray-800 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}
            >
              {/* Project Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-x-2 flex-1 min-w-0">
                  <ProjectTooltip project={project}>
                    {getStatusIcon(project.status, project.urgencyScore)}
                  </ProjectTooltip>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate">
                        {project.projectNo && project.projectNo !== "" && project.projectNo !== "N/A" 
                          ? `${project.projectNo} - ${project.name}` 
                          : project.name}
                      </span>
                      {project.hasExtension && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          EXT
                        </span>
                      )}
                      {project.urgencyScore >= 6 && (
                        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full animate-pulse">
                          URGENT
                        </span>
                      )}
                    </div>
                    {/* Team Info - Only show if values exist */}
                    {(project.manager || project.client) && (
                      <div className="flex items-center gap-3 mt-1">
                        {project.manager && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400">
                            <User size={12} />
                            <span className="truncate">{project.manager}</span>
                          </div>
                        )}
                        {project.client && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400">
                            <Calendar size={12} />
                            <span className="truncate">{project.client}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex items-center gap-2 ml-2">
                  <span className="text-lg font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">
                    {Math.round(project.progress)}%
                  </span>
                  <Badge variant={getKPIBadgeVariant(project.status)} className="whitespace-nowrap">
                    {project.status}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-2">
                <Progress
                  value={project.progress}
                  className="flex-1 h-2 rounded-full"
                />
                {project.riskFactors && project.riskFactors.length > 0 && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">
                    {project.riskFactors.length} issues
                  </span>
                )}
              </div>

              {/* Enhanced Timeline Status with Extension Context */}
              <div className="text-xs flex items-center justify-between">
                <div className="flex items-center gap-x-1">
                  {project.status === "Completed" ? (
                    <>
                      <CheckCircle2 className="text-green-500" size={14} />
                      <span className="text-green-600 font-semibold">Project Completed</span>
                    </>
                  ) : project.daysRemaining !== undefined && project.daysRemaining > 0 ? (
                    <>
                      <Clock className={project.daysRemaining <= 7 ? "text-orange-500" : "text-blue-500"} size={14} />
                      <span className={project.daysRemaining <= 7 ? "text-orange-600 font-semibold" : "text-blue-700 dark:text-blue-400"}>
                        {project.daysRemaining} days remaining
                        {project.hasExtension && " (Extended)"}
                        {project.daysRemaining <= 7 && " ⚠️"}
                      </span>
                    </>
                  ) : project.daysRemaining === 0 ? (
                    <>
                      <AlertTriangle className="text-orange-500 animate-pulse" size={14} />
                      <span className="text-orange-600 font-bold bg-orange-100 dark:bg-orange-900/30 px-1 rounded">
                        🚨 DUE TODAY {project.hasExtension && "(Extended)"}
                      </span>
                    </>
                  ) : project.daysRemaining < 0 ? (
                    <>
                      <AlertCircle className="text-red-500 animate-pulse" size={14} />
                      <span className="text-red-600 font-bold bg-red-100 dark:bg-red-900/30 px-1 rounded">
                        OVERDUE: {Math.abs(project.daysRemaining)} days
                        {project.hasExtension && " (Even with extension!)"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="text-gray-500" size={14} />
                      <span className="text-gray-600">Timeline pending</span>
                    </>
                  )}
                </div>
                
                {/* Urgency Score */}
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Urgency:</span>
                  <span className={`font-bold text-xs ${
                    project.urgencyScore >= 6 ? 'text-red-600' :
                    project.urgencyScore >= 3 ? 'text-orange-600' : 'text-yellow-600'
                  }`}>
                    {project.urgencyScore}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <CheckCircle2 className="mx-auto mb-2 text-4xl text-green-400" />
            <p className="font-medium text-green-600">🎉 Excellent Management!</p>
            <p className="text-sm text-gray-500">No projects require immediate attention</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTimeline;