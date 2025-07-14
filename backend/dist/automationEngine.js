"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationEngine = void 0;
const uuid_1 = require("uuid");
class AutomationEngine {
    constructor(devices, io, analyticsEngine) {
        this.rules = [];
        this.devices = [];
        this.evaluationInterval = null;
        this.devices = devices;
        this.io = io;
        this.analyticsEngine = analyticsEngine;
        this.startEvaluation();
        this.initializeDefaultRules();
    }
    initializeDefaultRules() {
        const sensor = this.devices.find(d => d.type === 'sensor');
        const light = this.devices.find(d => d.type === 'light');
        if (sensor && light) {
            this.addRule({
                name: "Motion Activated Lights",
                description: "Turn on lights when motion is detected",
                condition: {
                    deviceId: sensor.id,
                    property: 'motion',
                    operator: 'eq',
                    value: true
                },
                actions: [
                    {
                        deviceId: light.id,
                        property: 'on',
                        value: true
                    }
                ],
                enabled: true
            });
        }
        const cameraDevice = this.devices.find(d => d.type === 'camera');
        const lockDevice = this.devices.find(d => d.type === 'lock');
        if (cameraDevice && lockDevice) {
            this.addRule({
                name: "Security Lock",
                description: "Lock doors when motion detected on camera",
                condition: {
                    deviceId: cameraDevice.id,
                    property: 'motionDetected',
                    operator: 'eq',
                    value: true
                },
                actions: [
                    {
                        deviceId: lockDevice.id,
                        property: 'locked',
                        value: true
                    }
                ],
                enabled: true
            });
        }
    }
    addRule(ruleData) {
        const rule = {
            id: (0, uuid_1.v4)(),
            createdAt: new Date(),
            triggerCount: 0,
            ...ruleData
        };
        this.rules.push(rule);
        this.io.emit('rules-update', this.rules);
        return rule;
    }
    updateRule(id, updates) {
        const ruleIndex = this.rules.findIndex(r => r.id === id);
        if (ruleIndex === -1)
            return null;
        this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
        this.io.emit('rules-update', this.rules);
        return this.rules[ruleIndex];
    }
    deleteRule(id) {
        const ruleIndex = this.rules.findIndex(r => r.id === id);
        if (ruleIndex === -1)
            return false;
        this.rules.splice(ruleIndex, 1);
        this.io.emit('rules-update', this.rules);
        return true;
    }
    getRules() {
        return this.rules;
    }
    isConditionMet(condition) {
        const device = this.devices.find(d => d.id === condition.deviceId);
        if (!device)
            return false;
        const currentValue = device.state[condition.property];
        switch (condition.operator) {
            case 'eq': return currentValue === condition.value;
            case 'gt': return currentValue > condition.value;
            case 'lt': return currentValue < condition.value;
            case 'gte': return currentValue >= condition.value;
            case 'lte': return currentValue <= condition.value;
            case 'neq': return currentValue !== condition.value;
            default: return false;
        }
    }
    applyActions(actions, ruleId) {
        const rule = this.rules.find(r => r.id === ruleId);
        if (!rule)
            return;
        for (const action of actions) {
            const device = this.devices.find(d => d.id === action.deviceId);
            if (device) {
                device.state[action.property] = action.value;
                this.analyticsEngine.logDeviceUsage(device, action.property);
                this.io.emit('device-update', device);
            }
        }
        rule.lastTriggered = new Date();
        rule.triggerCount++;
        this.analyticsEngine.logRuleTrigger(rule);
        this.io.emit('rules-update', this.rules);
    }
    evaluateRules() {
        for (const rule of this.rules) {
            if (rule.enabled && this.isConditionMet(rule.condition)) {
                this.applyActions(rule.actions, rule.id);
            }
        }
    }
    startEvaluation() {
        this.evaluationInterval = setInterval(() => {
            this.evaluateRules();
        }, 1000);
    }
    stopEvaluation() {
        if (this.evaluationInterval) {
            clearInterval(this.evaluationInterval);
            this.evaluationInterval = null;
        }
    }
    getStats() {
        return {
            totalRules: this.rules.length,
            enabledRules: this.rules.filter(r => r.enabled).length,
            totalTriggers: this.rules.reduce((sum, r) => sum + r.triggerCount, 0),
        };
    }
}
exports.AutomationEngine = AutomationEngine;
