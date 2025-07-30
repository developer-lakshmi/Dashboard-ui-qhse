import React, { useState } from 'react'
import SummaryCards from './SummayCards'
import Charts from '../charts/Charts'
import CriticalIssues from './CriticalIssues'
import Filters from './Filters'
import { Card, CardContent } from '../ui/Card'
import { useGoogleSheets } from '../../hooks/useGoogleSheets' // Replace static import
import { SearchX, BarChart2 } from 'lucide-react'

const parsePercent = val => {
  if (!val || val === '' || val === 'N/A') return 0;
  const numVal = typeof val === "string" ? val.replace("%", "") : val;
  const parsed = Number(numVal);
  return isNaN(parsed) ? 0 : parsed;
};

const SummaryView = () => {
  // Use Google Sheets data instead of static import
  const { data: projectsData, loading, error, refetch } = useGoogleSheets();

  // Initialize filters with "all" for proper filtering
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedKPIStatus, setSelectedKPIStatus] = useState("all")

  // Enhanced filtering logic for Google Sheets data
  const filteredProjects = projectsData.filter(project => {
    // Year filter - handle empty/invalid dates
    const yearMatch = (() => {
      if (selectedYear === "all" || selectedYear === "") return true;
      
      const startDate = project.projectStartingDate;
      if (!startDate || startDate === '' || startDate === 'N/A') return false;
      
      try {
        const projectYear = new Date(startDate).getFullYear();
        return !isNaN(projectYear) && projectYear.toString() === selectedYear;
      } catch {
        return false;
      }
    })();

    // Month filter - handle empty/invalid dates
    const monthMatch = (() => {
      if (selectedMonth === "all" || selectedMonth === "") return true;
      
      const startDate = project.projectStartingDate;
      if (!startDate || startDate === '' || startDate === 'N/A') return false;
      
      try {
        const projectMonth = new Date(startDate).getMonth() + 1;
        return !isNaN(projectMonth) && projectMonth.toString() === selectedMonth;
      } catch {
        return false;
      }
    })();

    // Client filter - exact match
    const clientMatch = (() => {
      if (selectedClient === "all" || selectedClient === "") return true;
      
      const clientName = project.client;
      if (!clientName || clientName === '' || clientName === 'N/A') return false;
      
      return clientName === selectedClient;
    })();

    // KPI Status filter - calculate from percentage
    const kpiMatch = (() => {
      if (selectedKPIStatus === "all" || selectedKPIStatus === "") return true;
      
      const kpiStatus = getKPIStatus(project.projectKPIsAchievedPercent);
      return kpiStatus === selectedKPIStatus;
    })();

    return yearMatch && monthMatch && clientMatch && kpiMatch;
  });

  // Helper functions for filters
  const getUniqueYears = () => {
    const years = projectsData
      .map(p => {
        const startDate = p.projectStartingDate;
        if (!startDate || startDate === '' || startDate === 'N/A') return null;
        
        try {
          const year = new Date(startDate).getFullYear();
          return isNaN(year) ? null : year;
        } catch {
          return null;
        }
      })
      .filter(year => year !== null)
      .map(year => year.toString());
    
    return [...new Set(years)].sort((a, b) => parseInt(b) - parseInt(a));
  };

  const getUniqueClients = () => {
    const clients = projectsData
      .map(p => p.client)
      .filter(client => client && client !== '' && client !== 'N/A');
    
    return [...new Set(clients)].sort();
  };

  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
    setSelectedClient("all");
    setSelectedKPIStatus("all");
  };

  // Calculate metrics from filtered data
  const totalProjects = filteredProjects.length;
  const extendedProjects = filteredProjects.filter(p => 
    p.projectExtension && 
    p.projectExtension !== "No" && 
    p.projectExtension !== "" &&
    p.projectExtension !== "N/A"
  ).length;

  // Calculate totals using Google Sheets numeric fields
  const totalOpenCARs = filteredProjects.reduce((sum, p) => {
    const cars = Number(p.carsOpen) || 0;
    return sum + cars;
  }, 0);
  
  const totalOpenObs = filteredProjects.reduce((sum, p) => {
    const obs = Number(p.obsOpen) || 0;
    return sum + obs;
  }, 0);

  // Average progress calculation
  const avgProgress = totalProjects > 0
    ? filteredProjects.reduce((sum, p) => {
        const progress = parsePercent(p.projectCompletionPercent);
        return sum + progress;
      }, 0) / totalProjects
    : 0;

  // KPI Status calculation
  const getKPIStatus = (percentStr) => {
    const percent = parsePercent(percentStr);
    if (percent >= 90) return "Green";
    if (percent >= 70) return "Yellow";
    return "Red";
  };

  // Data for charts using Google Sheets data
  const kpiStatusData = [
    { 
      name: "Green", 
      value: filteredProjects.filter(p => getKPIStatus(p.projectKPIsAchievedPercent) === "Green").length 
    },
    { 
      name: "Yellow", 
      value: filteredProjects.filter(p => getKPIStatus(p.projectKPIsAchievedPercent) === "Yellow").length 
    },
    { 
      name: "Red", 
      value: filteredProjects.filter(p => getKPIStatus(p.projectKPIsAchievedPercent) === "Red").length 
    },
  ];

  const manhoursData = filteredProjects.map(project => ({
    code: project.projectNo || 'N/A',
    name: project.projectTitle || 'Untitled Project',
    Planned: (Number(project.manhoursUsed) || 0) + (Number(project.manhoursBalance) || 0),
    Used: Number(project.manhoursUsed) || 0,
    Balance: Number(project.manhoursBalance) || 0
  }));

  // Enhanced audit status using Google Sheets audit fields
  const today = new Date();
  const auditFields = ['projectAudit1', 'projectAudit2', 'projectAudit3', 'projectAudit4'];

  const auditStatusData = auditFields.map((field, idx) => {
    let completed = 0, upcoming = 0, notApplicable = 0;
    
    filteredProjects.forEach(p => {
      const auditValue = p[field];
      
      if (!auditValue || 
          auditValue === "" || 
          auditValue === "N/A" ||
          auditValue.toLowerCase() === "not applicable") {
        notApplicable++;
        return;
      }
      
      try {
        const auditDate = new Date(auditValue);
        if (isNaN(auditDate.getTime())) {
          notApplicable++;
        } else if (auditDate < today) {
          completed++;
        } else {
          upcoming++;
        }
      } catch {
        notApplicable++;
      }
    });
    
    return {
      name: `Audit ${idx + 1}`,
      Completed: completed,
      Upcoming: upcoming,
      NotApplicable: notApplicable
    };
  });

  const carsObsData = filteredProjects.map(project => ({
    name: project.projectTitle || 'Untitled Project',
    CARsOpen: Number(project.carsOpen) || 0,
    CARsClosed: Number(project.carsClosed) || 0,
    ObsOpen: Number(project.obsOpen) || 0,
    ObsClosed: Number(project.obsClosed) || 0,
  }));

  const timelineData = filteredProjects.map(project => {
    const startDate = project.projectStartingDate ? new Date(project.projectStartingDate) : null;
    const endDate = project.projectClosingDate ? new Date(project.projectClosingDate) : null;
    const today = new Date();
    const percentComplete = parsePercent(project.projectCompletionPercent);
    
    let daysRemaining = 0;
    if (endDate && !isNaN(endDate.getTime())) {
      daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    }
    
    return {
      name: project.projectTitle || 'Untitled Project',
      progress: percentComplete,
      status: getKPIStatus(project.projectKPIsAchievedPercent),
      daysRemaining: daysRemaining,
      isCompleted: percentComplete >= 100
    };
  });

  const qualityPlanStatusData = [
    { 
      name: "Approved", 
      value: filteredProjects.filter(p => 
        p.projectQualityPlanStatusRev && 
        p.projectQualityPlanStatusRev !== "" && 
        p.projectQualityPlanStatusRev !== "N/A"
      ).length 
    },
    { 
      name: "Pending", 
      value: filteredProjects.filter(p => 
        !p.projectQualityPlanStatusRev || 
        p.projectQualityPlanStatusRev === "" || 
        p.projectQualityPlanStatusRev === "N/A"
      ).length 
    }
  ];

  const getKPIBadgeVariant = (status) => {
    switch (status) {
      case "Green": return "green";
      case "Yellow": return "yellow";
      case "Red": return "red";
      default: return "default";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 p-3">
            <BarChart2 className="w-7 h-7 text-blue-600 dark:text-blue-300" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Dashboard Summary
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Loading data from Google Sheets...
            </p>
          </div>
        </div>
        
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                Loading Projects...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fetching latest data from Google Sheets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 p-3">
            <BarChart2 className="w-7 h-7 text-red-600 dark:text-red-300" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Dashboard Summary
            </h1>
            <p className="text-red-600 dark:text-red-300 text-sm sm:text-base">
              Error loading data from Google Sheets
            </p>
          </div>
        </div>
        
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center text-red-500 dark:text-red-400">
              <SearchX className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                Failed to Load Data
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {error}
              </p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581m-2.62-7.38A7.974 7.974 0 0012 4a8 8 0 100 16 7.974 7.974 0 006.38-3.02M4.582 9A7.974 7.974 0 0112 20a8 8 0 100-16 7.974 7.974 0 00-6.38 3.02" />
                  </svg>
                  Retry Loading
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 p-3">
          <BarChart2 className="w-7 h-7 text-blue-600 dark:text-blue-300" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Dashboard Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Get a quick overview of your most important QHSE project metrics.
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              • Live data ({projectsData.length} projects)
            </span>
          </p>
        </div>
      </div>

      <Filters
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedKPIStatus={selectedKPIStatus}
        setSelectedKPIStatus={setSelectedKPIStatus}
        resetFilters={resetFilters}
        filteredProjects={filteredProjects}
        getUniqueYears={getUniqueYears}
        getUniqueClients={getUniqueClients}
      />

      {filteredProjects.length === 0 ? (
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <SearchX className="w-16 h-16 mb-4 text-blue-400 dark:text-blue-500" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your filters to see more results.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581m-2.62-7.38A7.974 7.974 0 0012 4a8 8 0 100 16 7.974 7.974 0 006.38-3.02M4.582 9A7.974 7.974 0 0112 20a8 8 0 100-16 7.974 7.974 0 00-6.38 3.02" />
                  </svg>
                  Reset All Filters
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <SummaryCards
            totalProjects={totalProjects}
            extendedProjects={extendedProjects}
            totalOpenCARs={totalOpenCARs}
            totalOpenObs={totalOpenObs}
            avgProgress={avgProgress}
            filteredProjects={filteredProjects}
          />

          <Charts
            kpiStatusData={kpiStatusData}
            manhoursData={manhoursData}
            auditStatusData={auditStatusData}
            carsObsData={carsObsData}
            timelineData={timelineData}
            qualityPlanStatusData={qualityPlanStatusData}
            getKPIBadgeVariant={getKPIBadgeVariant}
          />

          <CriticalIssues filteredProjects={filteredProjects} />
        </>
      )}
    </div>
  )
}

export default SummaryView