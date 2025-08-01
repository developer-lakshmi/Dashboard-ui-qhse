import React, { useRef, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  AlertTriangle,
  Clock,
  BarChart2,
  DollarSign,
  Eye
} from 'lucide-react';

const iconMap = {
  CARs: <AlertTriangle className="w-7 h-7 text-red-500 drop-shadow" />,
  Audit: <Clock className="w-7 h-7 text-orange-500 drop-shadow" />,
  KPI: <BarChart2 className="w-7 h-7 text-red-500 drop-shadow" />,
  Billability: <DollarSign className="w-7 h-7 text-yellow-500 drop-shadow" />,
  Observations: <Eye className="w-7 h-7 text-orange-500 drop-shadow" />
};

const issueTypeMap = {
  "Critical CARs": "CARs",
  "Audit Delays": "Audit",
  "Poor KPI Performance": "KPI",
  "Billability Issues": "Billability"
};

// Helper function to safely parse percentage values
const parsePercentage = (value) => {
  if (!value || value === '' || value === 'N/A') return 0;
  
  const stringValue = value.toString();
  // Remove % symbol and parse as number
  const numericValue = parseFloat(stringValue.replace('%', ''));
  return isNaN(numericValue) ? 0 : numericValue;
};

// Helper function to safely parse numeric values
const parseNumber = (value) => {
  if (!value || value === '' || value === 'N/A') return 0;
  const numericValue = Number(value);
  return isNaN(numericValue) ? 0 : numericValue;
};

const CriticalIssues = ({ filteredProjects }) => {
  const [selectedType, setSelectedType] = useState(null);
  const detailsRef = useRef(null);

  // Debug: Log the first project to see actual field structure
  if (filteredProjects.length > 0) {
    console.log('🔍 CriticalIssues - First project data structure:', {
      projectTitle: filteredProjects[0].projectTitle,
      projectNo: filteredProjects[0].projectNo,
      carsOpen: filteredProjects[0].carsOpen,
      carsDelayedClosingNoDays: filteredProjects[0].carsDelayedClosingNoDays,
      delayInAuditsNoDays: filteredProjects[0].delayInAuditsNoDays,
      projectKPIsAchievedPercent: filteredProjects[0].projectKPIsAchievedPercent,
      qualityBillabilityPercent: filteredProjects[0].qualityBillabilityPercent,
      obsOpen: filteredProjects[0].obsOpen,
      obsDelayedClosingNoDays: filteredProjects[0].obsDelayedClosingNoDays
    });
  }

  // Dynamically detect critical issues using correct field names from Google Sheets
  const getCriticalIssues = () => {
    const issues = [];

    filteredProjects.forEach(project => {
      // Safely parse values using the correct field names from Google Sheets
      const carsOpen = parseNumber(project.carsOpen);
      const carsDelayedClosingNoDays = parseNumber(project.carsDelayedClosingNoDays);
      const delayInAuditsNoDays = parseNumber(project.delayInAuditsNoDays);
      const projectKPIsAchievedPercent = parsePercentage(project.projectKPIsAchievedPercent);
      const qualityBillabilityPercent = parsePercentage(project.qualityBillabilityPercent);
      const obsOpen = parseNumber(project.obsOpen);
      const obsDelayedClosingNoDays = parseNumber(project.obsDelayedClosingNoDays);

      // Project identification with fallbacks
      const projectTitle = project.projectTitle || 'Unnamed Project';
      const projectNo = project.projectNo || project.srNo || 'No Project Number';

      // High Priority CARs (>5 open CARs)
      if (carsOpen > 5) {
        issues.push({
          type: 'CARs',
          severity: 'Critical',
          title: `${carsOpen} Open CARs`,
          project: projectTitle,
          projectNo: projectNo,
          details: carsDelayedClosingNoDays > 0 
            ? `${carsDelayedClosingNoDays} days delayed closing`
            : 'Multiple open CARs requiring attention',
          count: carsOpen,
          sortValue: carsOpen
        });
      }

      // Medium Priority CARs (3-5 open CARs)
      else if (carsOpen >= 3) {
        issues.push({
          type: 'CARs',
          severity: 'High',
          title: `${carsOpen} Open CARs`,
          project: projectTitle,
          projectNo: projectNo,
          details: carsDelayedClosingNoDays > 0 
            ? `${carsDelayedClosingNoDays} days delayed closing`
            : 'Several open CARs need attention',
          count: carsOpen,
          sortValue: carsOpen
        });
      }

      // Critical Audit Delays (>10 days)
      if (delayInAuditsNoDays > 10) {
        issues.push({
          type: 'Audit',
          severity: 'Critical',
          title: `Audit Delayed ${delayInAuditsNoDays} Days`,
          project: projectTitle,
          projectNo: projectNo,
          details: 'Critical audit timeline breach requiring immediate action',
          count: delayInAuditsNoDays,
          sortValue: delayInAuditsNoDays
        });
      }

      // Medium Audit Delays (5-10 days)
      else if (delayInAuditsNoDays >= 5) {
        issues.push({
          type: 'Audit',
          severity: 'High',
          title: `Audit Delayed ${delayInAuditsNoDays} Days`,
          project: projectTitle,
          projectNo: projectNo,
          details: 'Audit schedule needs attention',
          count: delayInAuditsNoDays,
          sortValue: delayInAuditsNoDays
        });
      }

      // Critical KPI Performance (<60%)
      if (projectKPIsAchievedPercent > 0 && projectKPIsAchievedPercent < 60) {
        issues.push({
          type: 'KPI',
          severity: 'Critical',
          title: `KPI Achievement: ${projectKPIsAchievedPercent}%`,
          project: projectTitle,
          projectNo: projectNo,
          details: 'Significantly below acceptable performance threshold',
          count: projectKPIsAchievedPercent,
          sortValue: 100 - projectKPIsAchievedPercent // Higher sort value for lower percentage
        });
      }

      // Poor KPI Performance (60-70%)
      else if (projectKPIsAchievedPercent > 0 && projectKPIsAchievedPercent < 70) {
        issues.push({
          type: 'KPI',
          severity: 'High',
          title: `KPI Achievement: ${projectKPIsAchievedPercent}%`,
          project: projectTitle,
          projectNo: projectNo,
          details: 'Below target performance threshold',
          count: projectKPIsAchievedPercent,
          sortValue: 100 - projectKPIsAchievedPercent
        });
      }

      // Critical Quality Billability Issues (<70%)
      if (qualityBillabilityPercent > 0 && qualityBillabilityPercent < 70) {
        issues.push({
          type: 'Billability',
          severity: 'Critical',
          title: `Quality Billability: ${qualityBillabilityPercent}%`,
          project: projectTitle,
          projectNo: projectNo,
          details: 'Significantly below target billability - revenue impact',
          count: qualityBillabilityPercent,
          sortValue: 100 - qualityBillabilityPercent
        });
      }

      // Medium Quality Billability Issues (70-80%)
      else if (qualityBillabilityPercent > 0 && qualityBillabilityPercent < 80) {
        issues.push({
          type: 'Billability',
          severity: 'Medium',
          title: `Quality Billability: ${qualityBillabilityPercent}%`,
          project: projectTitle,
          projectNo: projectNo,
          details: 'Below target billability threshold',
          count: qualityBillabilityPercent,
          sortValue: 100 - qualityBillabilityPercent
        });
      }

      // Critical Observation Delays (>14 days)
      if (obsDelayedClosingNoDays > 14) {
        issues.push({
          type: 'Observations',
          severity: 'Critical',
          title: `${obsOpen} Open Observations`,
          project: projectTitle,
          projectNo: projectNo,
          details: `${obsDelayedClosingNoDays} days delayed - critical overdue`,
          count: obsOpen,
          sortValue: obsDelayedClosingNoDays
        });
      }

      // Medium Observation Delays (7-14 days)
      else if (obsDelayedClosingNoDays >= 7) {
        issues.push({
          type: 'Observations',
          severity: 'Medium',
          title: `${obsOpen} Open Observations`,
          project: projectTitle,
          projectNo: projectNo,
          details: `${obsDelayedClosingNoDays} days delayed closing`,
          count: obsOpen,
          sortValue: obsDelayedClosingNoDays
        });
      }

      // High Count of Open Observations (>10)
      else if (obsOpen > 10) {
        issues.push({
          type: 'Observations',
          severity: 'High',
          title: `${obsOpen} Open Observations`,
          project: projectTitle,
          projectNo: projectNo,
          details: 'High volume of open observations requiring attention',
          count: obsOpen,
          sortValue: obsOpen
        });
      }
    });

    // Sort by severity and then by sort value
    return issues.sort((a, b) => {
      const severityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.sortValue - a.sortValue; // Higher values first within same severity
    });
  };

  const criticalIssues = getCriticalIssues();

  // Summary cards data using correct field names
  const issuesData = [
    {
      title: "Critical CARs",
      count: filteredProjects.filter(p => parseNumber(p.carsOpen) > 5).length,
      description: "Projects with >5 open CARs",
      icon: <AlertTriangle className="w-8 h-8 text-red-500 drop-shadow" />,
      bgColor: "bg-gradient-to-br from-red-50 via-white to-red-100",
      textColor: "text-red-800",
      countColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      title: "Audit Delays",
      count: filteredProjects.filter(p => parseNumber(p.delayInAuditsNoDays) > 10).length,
      description: "Audits delayed >10 days",
      icon: <Clock className="w-8 h-8 text-orange-500 drop-shadow" />,
      bgColor: "bg-gradient-to-br from-orange-50 via-white to-orange-100",
      textColor: "text-orange-800",
      countColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      title: "Poor KPI Performance",
      count: filteredProjects.filter(p => {
        const kpiPercent = parsePercentage(p.projectKPIsAchievedPercent);
        return kpiPercent > 0 && kpiPercent < 70;
      }).length,
      description: "KPI achievement <70%",
      icon: <BarChart2 className="w-8 h-8 text-red-500 drop-shadow" />,
      bgColor: "bg-gradient-to-br from-red-50 via-white to-red-100",
      textColor: "text-red-800",
      countColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      title: "Billability Issues",
      count: filteredProjects.filter(p => {
        const billabilityPercent = parsePercentage(p.qualityBillabilityPercent);
        return billabilityPercent > 0 && billabilityPercent < 80;
      }).length,
      description: "Quality billability <80%",
      icon: <DollarSign className="w-8 h-8 text-yellow-500 drop-shadow" />,
      bgColor: "bg-gradient-to-br from-yellow-50 via-white to-yellow-100",
      textColor: "text-yellow-800",
      countColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    }
  ];

  // Log summary for debugging
  console.log('🔍 CriticalIssues Summary:', {
    totalProjects: filteredProjects.length,
    criticalCARs: issuesData[0].count,
    auditDelays: issuesData[1].count,
    poorKPI: issuesData[2].count,
    billabilityIssues: issuesData[3].count,
    totalIssues: criticalIssues.length
  });

  // Filtered issues for details section
  const filteredDetails = selectedType
    ? criticalIssues.filter(issue => issue.type === selectedType)
    : criticalIssues;

  // Scroll to details section when View Details is clicked
  const handleViewDetails = (type) => {
    setSelectedType(type);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Critical Issues Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {issuesData.map((issue, index) => (
              <div
                key={index}
                className={`
                  ${issue.bgColor} dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
                  p-4 rounded-lg border ${issue.borderColor} dark:border-gray-700
                  hover:shadow-md transition-shadow flex flex-col h-full min-h-[180px]
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${issue.textColor} dark:text-gray-100 text-base`}>{issue.title}</h4>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{issue.icon}</span>
                      <p className={`text-3xl font-bold ${issue.countColor} dark:text-white`}>{issue.count}</p>
                    </div>
                    <p className={`text-sm ${issue.textColor} dark:text-gray-300`}>{issue.description}</p>
                  </div>
                  {issue.count > 0 && (
                    <div className="mt-3">
                      <button
                        className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-200"
                        onClick={() => handleViewDetails(issueTypeMap[issue.title])}
                      >
                        View Details →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card ref={detailsRef}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Detailed Critical Issues ({filteredDetails.length})
              </h3>
              {selectedType && (
                <button
                  className="text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium transition-colors"
                  onClick={() => setSelectedType(null)}
                >
                  Show All ({criticalIssues.length})
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredDetails.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  {selectedType ? 
                    `No ${selectedType} issues found in current data.` :
                    '🎉 No critical issues found! All projects are performing well.'
                  }
                </div>
              )}
              {filteredDetails.map((issue, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start"
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <span>{iconMap[issue.type]}</span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 break-words">{issue.title}</h4>
                        <Badge variant={
                          issue.severity === 'Critical' ? 'destructive' :
                          issue.severity === 'High' ? 'warning' : 'secondary'
                        }>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 break-words">{issue.project}</p>
                      <p className="text-xs opacity-75 text-gray-500 dark:text-gray-400 break-words">Project No: {issue.projectNo}</p>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 break-words">{issue.details}</p>
                    </div>
                  </div>
                  <div className="text-right mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{issue.count}</div>
                    <div className="text-xs opacity-75 text-gray-500 dark:text-gray-400">{issue.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-2">Debug Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Total Projects: {filteredProjects.length}</div>
              <div>Critical Issues Found: {criticalIssues.length}</div>
              <div>Selected Filter: {selectedType || 'All'}</div>
              <div>Showing: {filteredDetails.length} issues</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CriticalIssues;