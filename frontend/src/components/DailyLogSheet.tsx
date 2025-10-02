import React from 'react';
import { LogGrid, TripLogsResponse } from '../types';

interface DailyLogSheetProps {
  logsData?: TripLogsResponse;
  onExportPDF?: () => void;
}

const DailyLogSheet: React.FC<DailyLogSheetProps> = ({ logsData, onExportPDF }) => {
  if (!logsData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Log Data Available</h3>
          <p className="text-gray-500">Plan a trip first to see daily log sheets</p>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'off_duty':
        return 'bg-gray-200';
      case 'sleeper':
        return 'bg-purple-200';
      case 'driving':
        return 'bg-red-200';
      case 'on_duty':
        return 'bg-yellow-200';
      default:
        return 'bg-gray-200';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'off_duty':
        return 'Off Duty';
      case 'sleeper':
        return 'Sleeper Berth';
      case 'driving':
        return 'Driving';
      case 'on_duty':
        return 'On Duty (Not Driving)';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Daily Log Sheets</h2>
        <button
          onClick={onExportPDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>

      {/* HOS Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hours of Service Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {logsData.hos_summary.trip_duration_days}
            </div>
            <div className="text-sm text-gray-600">Days</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {logsData.hos_summary.total_driving_hours.toFixed(1)}
            </div>
            <div className="text-sm text-blue-600">Driving Hours</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {logsData.hos_summary.cycle_hours_remaining.toFixed(1)}
            </div>
            <div className="text-sm text-green-600">Hours Remaining</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {logsData.hos_summary.cycle_type === '70_8' ? '70/8' : '60/7'}
            </div>
            <div className="text-sm text-purple-600">Cycle Type</div>
          </div>
        </div>
      </div>

      {/* Daily Log Sheets */}
      {logsData.log_grids.map((grid, dayIndex) => (
        <div key={dayIndex} className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Day {dayIndex + 1} - {new Date(grid.date).toLocaleDateString()}
              </h3>
              <div className="text-sm text-gray-500">
                Total Driving: {formatTime(grid.total_driving_time)}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Time Grid Header */}
            <div className="mb-4">
              <div className="grid grid-cols-24 gap-px text-xs text-gray-500 mb-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-center">
                    {i.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
              
              {/* 24-hour grid visualization */}
              <div className="log-grid mb-4" style={{ gridTemplateColumns: `repeat(96, minmax(0, 1fr))` }}>
                {grid.grid.map((status, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`log-slot ${getStatusColor(status)}`}
                    title={`${Math.floor(slotIndex / 4).toString().padStart(2, '0')}:${((slotIndex % 4) * 15).toString().padStart(2, '0')} - ${getStatusLabel(status)}`}
                  />
                ))}
              </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Off Duty</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-200 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Sleeper Berth</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Driving</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
                <span className="text-sm text-gray-600">On Duty</span>
              </div>
            </div>

            {/* Daily Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-900">
                  {formatTime(grid.total_driving_time)}
                </div>
                <div className="text-sm text-red-600">Driving</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-semibold text-yellow-900">
                  {formatTime(grid.total_on_duty_time)}
                </div>
                <div className="text-sm text-yellow-600">On Duty</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-900">
                  {formatTime(grid.total_sleeper_time)}
                </div>
                <div className="text-sm text-purple-600">Sleeper</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {formatTime(grid.total_off_duty_time)}
                </div>
                <div className="text-sm text-gray-600">Off Duty</div>
              </div>
            </div>

            {/* Log Entries Table */}
            {grid.entries && grid.entries.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Log Entries</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {grid.entries.map((entry, entryIndex) => (
                        <tr key={entryIndex}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(entry.status)}`}></div>
                              <span className="text-sm text-gray-900">
                                {getStatusLabel(entry.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.start_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(entry.duration_minutes)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.location || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Violations */}
      {logsData.violations && logsData.violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4">
            HOS Violations ({logsData.violations.length})
          </h3>
          <div className="space-y-3">
            {logsData.violations.map((violation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  violation.severity === 'critical' ? 'bg-red-500' :
                  violation.severity === 'violation' ? 'bg-orange-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-red-900">
                    {violation.violation_type.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-sm text-red-700">{violation.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogSheet;
