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
        // FIX: This call belongs in this constructor.
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
    }
    toBoolean(value) {
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true')
                return true;
            if (value.toLowerCase() === 'false')
                return false;
        }
        return value;
    }
    addRule(ruleData) {
        const rule = {
            id: (0, uuid_1.v4)(),
            createdAt: new Date(),
            triggerCount: 0,
            ...ruleData,
            condition: {
                ...ruleData.condition,
                value: this.toBoolean(ruleData.condition.value)
            },
            actions: ruleData.actions.map(action => ({
                ...action,
                value: this.toBoolean(action.value)
            }))
        };
        this.rules.push(rule);
        this.io.emit('rules-update', this.rules);
        return rule;
    }
    isConditionMet(condition) {
        const device = this.devices.find(d => d.id === condition.deviceId);
        if (!device)
            return false;
        const currentValue = this.toBoolean(device.state[condition.property]);
        const conditionValue = this.toBoolean(condition.value);
        switch (condition.operator) {
            case 'eq': return currentValue === conditionValue;
            case 'gt': return currentValue > conditionValue;
            case 'lt': return currentValue < conditionValue;
            case 'gte': return currentValue >= conditionValue;
            case 'lte': return currentValue <= conditionValue;
            case 'neq': return currentValue !== conditionValue;
            default: return false;
        }
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
    applyActions(actions, ruleId) {
        const rule = this.rules.find(r => r.id === ruleId);
        if (!rule)
            return;
        for (const action of actions) {
            const device = this.devices.find(d => d.id === action.deviceId);
            if (device) {
                device.state[action.property] = this.toBoolean(action.value);
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
}
exports.AutomationEngine = AutomationEngine;
