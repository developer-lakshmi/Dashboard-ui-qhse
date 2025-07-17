import React from 'react'
import { projectsData } from '../../data'
const ProjectStatus = () => {
  return (
    <div className="card">
      <div className="card-header">
        <p className="card-title">Project Status Overview</p>
      </div>
      <div className="card-body p-0">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[700px] w-full table-auto text-xs md:text-sm">
            <thead className="table-header bg-slate-100 dark:bg-slate-800">
              <tr className="table-row">
                <th className="table-head whitespace-nowrap text-slate-700 dark:text-slate-200">#</th>
                <th className="table-head whitespace-nowrap text-slate-700 dark:text-slate-200">Project No</th>
                <th className="table-head whitespace-nowrap text-slate-700 dark:text-slate-200">Title</th>
                <th className="table-head whitespace-nowrap text-slate-700 dark:text-slate-200">Client</th>
                <th className="table-head whitespace-nowrap text-slate-700 dark:text-slate-200">Manager</th>
                <th className="table-head whitespace-nowrap text-orange-700 dark:text-orange-400">Billability (%)</th>
                <th className="table-head whitespace-nowrap text-orange-700 dark:text-orange-400">CARs Open</th>
                <th className="table-head whitespace-nowrap text-orange-700 dark:text-orange-400">Obs Open</th>
                <th className="table-head whitespace-nowrap text-orange-700 dark:text-orange-400">KPIs Achieved (%)</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {projectsData && projectsData.length > 0 ? (
                projectsData.map((project, idx) => (
                  <tr key={project.srNo || idx} className="table-row hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="table-cell text-slate-700 dark:text-slate-200">{project.srNo || idx + 1}</td>
                    <td className="table-cell text-slate-700 dark:text-slate-200">{project.projectNo}</td>
                    <td className="table-cell text-slate-700 dark:text-slate-200">{project.projectTitle}</td>
                    <td className="table-cell text-slate-700 dark:text-slate-200">{project.client}</td>
                    <td className="table-cell text-slate-700 dark:text-slate-200">{project.projectManager}</td>
                    <td className="table-cell text-orange-600 dark:text-orange-400 font-bold">{project.qualityBillabilityPercent}%</td>
                    <td className="table-cell text-orange-600 dark:text-orange-400 font-bold">{project.carsOpen}</td>
                    <td className="table-cell text-orange-600 dark:text-orange-400 font-bold">{project.obsOpen}</td>
                    <td className="table-cell text-orange-600 dark:text-orange-400 font-bold">{project.projectKPIsAchievedPercent}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-slate-500 dark:text-slate-400">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProjectStatus