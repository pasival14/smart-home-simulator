"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEngine = void 0;
class AnalyticsEngine {
    constructor(io) {
        this.analytics = {
            totalEnergyConsumption: 0,
            deviceUsage: {},
            ruleTriggerCount: {},
            activityLog: [],
        };
        this.io = io;
    }
    logDeviceUsage(device, property) {
        const key = `${device.name} (${property})`;
        this.analytics.deviceUsage[key] = (this.analytics.deviceUsage[key] || 0) + 1;
        this.logActivity(`Device used: ${key}`);
    }
    logRuleTrigger(rule) {
        this.analytics.ruleTriggerCount[rule.name] = (this.analytics.ruleTriggerCount[rule.name] || 0) + 1;
        this.logActivity(`Rule triggered: ${rule.name}`);
    }
    logEnergyConsumption(device, consumption) {
        this.analytics.totalEnergyConsumption += consumption;
        this.logActivity(`Energy consumed by ${device.name}: ${consumption.toFixed(2)} kWh`);
    }
    logActivity(message) {
        this.analytics.activityLog.unshift(`${new Date().toLocaleTimeString()}: ${message}`);
        if (this.analytics.activityLog.length > 100) {
            this.analytics.activityLog.pop();
        }
        this.io.emit('analytics-update', this.analytics);
    }
    getStats() {
        return this.analytics;
    }
}
exports.AnalyticsEngine = AnalyticsEngine;
