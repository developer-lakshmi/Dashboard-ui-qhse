import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, AlertTriangle, Clock, TrendingUp } from "lucide-react";

// Helper to choose badge color based on status
const getKPIBadgeVariant = (status) => {
  if (status === "On Track") return "success";
  if (status === "Delayed") return "warning";
  if (status === "Completed") return "info";
  return "default";
};

const getStatusIcon = (status) => {
  if (status === "Completed")
    return <CheckCircle2 className="text-green-500" size={20} />;
  if (status === "Delayed")
    return <AlertTriangle className="text-orange-500" size={20} />;
  if (status === "On Track")
    return <TrendingUp className="text-blue-500" size={20} />;
  return <Clock className="text-gray-400" size={20} />;
};

const ProjectTimeline = ({ timelineData }) => (
  <div className="card col-span-1 md:col-span-2 lg:col-span-3">
    <div className="card-header flex items-center gap-x-2">
      <Clock className="text-blue-500" size={22} />
      <p className="card-title font-semibold">Project Timeline Progress</p>
    </div>
    <div className="card-body space-y-3 max-h-80 overflow-y-auto">
      {timelineData && timelineData.length > 0 ? (
        timelineData.map((project, index) => (
          <div
            key={index}
            className="space-y-2 p-3 bg-gradient-to-r from-blue-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-x-2">
                {getStatusIcon(project.status)}
                <span className="font-semibold text-gray-800 dark:text-slate-200">
                  {project.name}
                </span>
              </div>
              <span className="text-gray-600 dark:text-slate-400 font-medium">
                {project.progress.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress
                value={project.progress}
                className="flex-1 h-2 rounded-full"
              />
              <Badge variant={getKPIBadgeVariant(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="text-xs flex items-center gap-x-1 mt-1">
              {project.daysRemaining > 0 ? (
                <>
                  <Clock className="text-blue-400 dark:text-blue-300" size={14} />
                  <span className="text-blue-700">
                    {project.daysRemaining} days remaining
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="text-orange-500" size={14} />
                  <span className="text-orange-600 font-semibold">Overdue</span>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400 py-8">
          <Clock className="mx-auto mb-2 text-3xl text-blue-300" />
          No timeline data available
        </div>
      )}
    </div>
  </div>
);

export default ProjectTimeline;