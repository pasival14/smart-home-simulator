import { Server } from 'socket.io';
import { Device } from './simulationEngine';
import { Rule } from './automationEngine';

export interface Analytics {
  totalEnergyConsumption: number;
  deviceUsage: Record<string, number>;
  ruleTriggerCount: Record<string, number>;
  activityLog: string[];
}

export class AnalyticsEngine {
  private analytics: Analytics = {
    totalEnergyConsumption: 0,
    deviceUsage: {},
    ruleTriggerCount: {},
    activityLog: [],
  };
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  logDeviceUsage(device: Device, property: string) {
    const key = `${device.name} (${property})`;
    this.analytics.deviceUsage[key] = (this.analytics.deviceUsage[key] || 0) + 1;
    this.logActivity(`Device used: ${key}`);
  }

  logRuleTrigger(rule: Rule) {
    this.analytics.ruleTriggerCount[rule.name] = (this.analytics.ruleTriggerCount[rule.name] || 0) + 1;
    this.logActivity(`Rule triggered: ${rule.name}`);
  }

  logEnergyConsumption(device: Device, consumption: number) {
    this.analytics.totalEnergyConsumption += consumption;
    this.logActivity(`Energy consumed by ${device.name}: ${consumption.toFixed(2)} kWh`);
  }

  logActivity(message: string) {
    this.analytics.activityLog.unshift(`${new Date().toLocaleTimeString()}: ${message}`);
    if (this.analytics.activityLog.length > 100) {
      this.analytics.activityLog.pop();
    }
    this.io.emit('analytics-update', this.analytics);
  }

  getStats(): Analytics {
    return this.analytics;
  }
}