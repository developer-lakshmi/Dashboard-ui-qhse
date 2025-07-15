import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

const CriticalIssues = ({ filteredProjects }) => {
  // Enhanced critical issues detection
  const getCriticalIssues = () => {
    const issues = [];
    
    filteredProjects.forEach(project => {
      // High Priority CARs
      if (project.carsOpen > 5) {
        issues.push({
          type: 'CARs',
          severity: 'Critical',
          title: `${project.carsOpen} Open CARs`,
          project: project.projectTitle,
          projectNo: project.projectNo,
          details: `${project.carsDelayedClosingNoDays} days delayed`,
          count: project.carsOpen,
          icon: '🚨',
          color: 'bg-red-50 border-red-200 text-red-800'
        });
      }
      
      // Audit Delays
      if (project.delayInAuditsNoDays > 10) {
        issues.push({
          type: 'Audit',
          severity: 'High',
          title: `Audit Delayed ${project.delayInAuditsNoDays} Days`,
          project: project.projectTitle,
          projectNo: project.projectNo,
          details: 'Critical audit timeline breach',
          count: project.delayInAuditsNoDays,
          icon: '⏰',
          color: 'bg-orange-50 border-orange-200 text-orange-800'
        });
      }
      
      // Poor KPI Performance
      if (project.projectKPIsAchievedPercent < 70) {
        issues.push({
          type: 'KPI',
          severity: 'Critical',
          title: `KPI Achievement: ${project.projectKPIsAchievedPercent}%`,
          project: project.projectTitle,
          projectNo: project.projectNo,
          details: 'Below acceptable threshold',
          count: project.projectKPIsAchievedPercent,
          icon: '📊',
          color: 'bg-red-50 border-red-200 text-red-800'
        });
      }
      
      // Quality Billability Issues
      if (project.qualityBillabilityPercent < 80) {
        issues.push({
          type: 'Billability',
          severity: 'Medium',
          title: `Quality Billability: ${project.qualityBillabilityPercent}%`,
          project: project.projectTitle,
          projectNo: project.projectNo,
          details: 'Below target billability',
          count: project.qualityBillabilityPercent,
          icon: '💰',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        });
      }
      
      // Observation Delays
      if (project.obsDelayedClosingNoDays > 7) {
        issues.push({
          type: 'Observations',
          severity: 'Medium',
          title: `${project.obsOpen} Open Observations`,
          project: project.projectTitle,
          projectNo: project.projectNo,
          details: `${project.obsDelayedClosingNoDays} days delayed`,
          count: project.obsOpen,
          icon: '👁️',
          color: 'bg-orange-50 border-orange-200 text-orange-800'
        });
      }
    });
    
    return issues.sort((a, b) => {
      const severityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const criticalIssues = getCriticalIssues();

  const issuesData = [
    {
      title: "Critical CARs",
      count: filteredProjects.filter(p => p.carsOpen > 5).length,
      description: "Projects with >5 open CARs",
      icon: "🚨",
      bgColor: "bg-gradient-to-r from-red-50 to-red-100",
      textColor: "text-red-800",
      countColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      title: "Audit Delays",
      count: filteredProjects.filter(p => p.delayInAuditsNoDays > 10).length,
      description: "Audits delayed >10 days",
      icon: "⏰",
      bgColor: "bg-gradient-to-r from-orange-50 to-orange-100",
      textColor: "text-orange-800",
      countColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      title: "Poor KPI Performance",
      count: filteredProjects.filter(p => p.projectKPIsAchievedPercent < 70).length,
      description: "KPI achievement <70%",
      icon: "📊",
      bgColor: "bg-gradient-to-r from-red-50 to-red-100",
      textColor: "text-red-800",
      countColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      title: "Billability Issues",
      count: filteredProjects.filter(p => p.qualityBillabilityPercent < 80).length,
      description: "Quality billability <80%",
      icon: "💰",
      bgColor: "bg-gradient-to-r from-yellow-50 to-yellow-100",
      textColor: "text-yellow-800",
      countColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🚨 Critical Issues Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {issuesData.map((issue, index) => (
              <div 
                key={index}
                className={`${issue.bgColor} p-4 rounded-lg border ${issue.borderColor} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${issue.textColor}`}>{issue.title}</h4>
                  <span className="text-2xl">{issue.icon}</span>
                </div>
                <p className={`text-3xl font-bold ${issue.countColor} mb-1`}>
                  {issue.count}
                </p>
                <p className={`text-sm ${issue.textColor}`}>{issue.description}</p>
                {issue.count > 0 && (
                  <div className="mt-3">
                    <button className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 transition-colors">
                      View Details →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🚨 Detailed Critical Issues</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {criticalIssues.map((issue, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${issue.color} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{issue.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-sm">{issue.title}</h4>
                          <Badge variant={
                            issue.severity === 'Critical' ? 'red' :
                            issue.severity === 'High' ? 'orange' : 'yellow'
                          }>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{issue.project}</p>
                        <p className="text-xs opacity-75">Project No: {issue.projectNo}</p>
                        <p className="text-xs mt-1">{issue.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{issue.count}</div>
                      <div className="text-xs opacity-75">{issue.type}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CriticalIssues;