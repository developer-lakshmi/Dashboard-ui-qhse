import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { monthNames, projectsData } from '../../data';

const Filters = ({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedClient,
  setSelectedClient,
  selectedKPIStatus,
  setSelectedKPIStatus,
  resetFilters,
  filteredProjects,
  getUniqueYears,
  getUniqueClients
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">🔍 Filters:</h3>
          
          {/* Year Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Months</option>
              {monthNames.map((month, index) => (
                <option key={index + 1} value={(index + 1).toString()}>{month}</option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Client:</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clients</option>
              {getUniqueClients().map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          {/* KPI Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">KPI Status:</label>
            <select
              value={selectedKPIStatus}
              onChange={(e) => setSelectedKPIStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Green">🟢 Green</option>
              <option value="Yellow">🟡 Yellow</option>
              <option value="Red">🔴 Red</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="px-4 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            🔄 Reset
          </button>

          {/* Results Counter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
              📊 Showing {filteredProjects.length} of {projectsData.length} projects
            </span>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedYear !== "all" || selectedMonth !== "all" || selectedClient !== "all" || selectedKPIStatus !== "all") && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {selectedYear !== "all" && (
                <Badge variant="blue">📅 Year: {selectedYear}</Badge>
              )}
              {selectedMonth !== "all" && (
                <Badge variant="blue">📅 Month: {monthNames[parseInt(selectedMonth) - 1]}</Badge>
              )}
              {selectedClient !== "all" && (
                <Badge variant="blue">🏢 Client: {selectedClient}</Badge>
              )}
              {selectedKPIStatus !== "all" && (
                <Badge variant="blue">📊 KPI: {selectedKPIStatus}</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Filters;