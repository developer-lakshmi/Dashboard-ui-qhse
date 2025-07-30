import React from 'react';
import { Badge } from '../../ui/Badge';
import { Progress } from '../../ui/Progress';
import { CheckCircle2 } from 'lucide-react';

export const TimelineChart = ({ data, getKPIBadgeVariant }) => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
        Project Timeline Progress
      </h3>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col w-full">
          <div className="space-y-3 max-h-96 overflow-y-auto w-full px-1 sm:px-0">
            {data.map((project, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 p-4 bg-gradient-to-r from-blue-50/60 via-white to-green-50/60 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm min-w-0"
              >
                <div className="flex justify-between items-center mb-1 gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-100 text-base truncate max-w-[60vw] sm:max-w-full">
                    {project.name}
                  </span>
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
                    {["Green", "Red", "Yellow"].indexOf(project.status) === -1 && project.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  {project.isCompleted ? (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                      <span className="font-semibold text-green-600 dark:text-green-400">Completed</span>
                    </>
                  ) : project.daysRemaining > 0 ? (
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
      </div>
    </>
  );
};