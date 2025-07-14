export interface Device {
  id: string;
  name: string;
  type: string;
  roomId: string;
  state: any;
}

export interface Room {
  id: string;
  name: string;
  devices: Device[];
}

export interface Rule {
  id: string;
  name: string;
  condition: {
    deviceId: string;
    property: string;
    operator: string;
    value: any;
  };
  actions: Array<{
    deviceId: string;
    property: string;
    value: any;
  }>;
  enabled: boolean;
}

export interface Scene {
  id: string;
  name: string;
}

export interface Analytics {
  totalEnergyConsumption: number;
  deviceUsage: Record<string, number>;
  ruleTriggerCount: Record<string, number>;
  activityLog: string[];
}