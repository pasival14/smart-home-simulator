import React from 'react';
import type { Analytics } from '../types';

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Total Energy Consumption</h3>
          <p className="text-3xl">{analytics.totalEnergyConsumption.toFixed(2)} kWh</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Device Usage</h3>
          <ul>
            {Object.entries(analytics.deviceUsage).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Rule Triggers</h3>
          <ul>
            {Object.entries(analytics.ruleTriggerCount).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 p-4 border rounded-lg">
        <h3 className="font-semibold">Activity Log</h3>
        <ul className="h-48 overflow-y-auto">
          {analytics.activityLog.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;