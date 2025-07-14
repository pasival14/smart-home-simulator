import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Device } from './simulationEngine';
import { AnalyticsEngine } from './analyticsEngine';

export interface Scene {
  id: string;
  name: string;
  deviceStates: Array<{
    deviceId: string;
    state: any;
  }>;
  createdAt: Date;
}

export class SceneEngine {
  private scenes: Scene[] = [];
  private devices: Device[] = [];
  private io: Server;
  private analyticsEngine: AnalyticsEngine;

  constructor(devices: Device[], io: Server, analyticsEngine: AnalyticsEngine) {
    this.devices = devices;
    this.io = io;
    this.analyticsEngine = analyticsEngine;
    this.initializeDefaultScenes();
  }

  private initializeDefaultScenes() {
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

  addScene(sceneData: Omit<Scene, 'id' | 'createdAt'>): Scene {
    const scene: Scene = {
      id: uuidv4(),
      createdAt: new Date(),
      ...sceneData,
    };
    this.scenes.push(scene);
    this.io.emit('scenes-update', this.scenes);
    return scene;
  }

  activateScene(sceneId: string) {
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
  
  getScenes(): Scene[] {
    return this.scenes;
  }
}