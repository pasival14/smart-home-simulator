"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneEngine = void 0;
const uuid_1 = require("uuid");
class SceneEngine {
    constructor(devices, io, analyticsEngine) {
        this.scenes = [];
        this.devices = [];
        this.devices = devices;
        this.io = io;
        this.analyticsEngine = analyticsEngine;
        this.initializeDefaultScenes();
    }
    initializeDefaultScenes() {
        this.addScene({
            name: 'Movie Mode',
            deviceStates: [
                {
                    deviceId: this.devices.find(d => d.type === 'light')?.id || '',
                    state: { on: true, brightness: 20 },
                },
                {
                    deviceId: this.devices.find(d => d.type === 'lock')?.id || '',
                    state: { locked: true },
                },
            ],
        });
    }
    addScene(sceneData) {
        const scene = {
            id: (0, uuid_1.v4)(),
            createdAt: new Date(),
            ...sceneData,
        };
        this.scenes.push(scene);
        this.io.emit('scenes-update', this.scenes);
        return scene;
    }
    activateScene(sceneId) {
        const scene = this.scenes.find(s => s.id === sceneId);
        if (scene) {
            scene.deviceStates.forEach(deviceState => {
                const device = this.devices.find(d => d.id === deviceState.deviceId);
                if (device) {
                    device.state = { ...device.state, ...deviceState.state };
                    this.analyticsEngine.logDeviceUsage(device, 'scene activation');
                    this.io.emit('device-update', device);
                }
            });
            this.analyticsEngine.logActivity(`Scene activated: ${scene.name}`);
            this.io.emit('scene-activated', sceneId);
        }
    }
    getScenes() {
        return this.scenes;
    }
}
exports.SceneEngine = SceneEngine;
