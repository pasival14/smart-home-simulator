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