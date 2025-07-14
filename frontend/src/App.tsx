import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DeviceCard from './components/DeviceCard';
import RoomSection from './components/RoomSection';

import type { Device, Room } from './types';

const socket = io('http://localhost:4000');

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    // Fetch initial devices and rooms
    fetch('http://localhost:4000/devices')
      .then(res => res.json())
      .then(data => setDevices(data));

    fetch('http://localhost:4000/rooms')
      .then(res => res.json())
      .then(data => setRooms(data));

    // Setup WebSocket listeners
    socket.on('devices-update', setDevices);
    socket.on('device-update', (updatedDevice: Device) => {
      setDevices(prev => prev.map(d => 
        d.id === updatedDevice.id ? updatedDevice : d
      ));
      
      // Update room devices
      setRooms(prev => prev.map(room => ({
        ...room,
        devices: room.devices.map(device => 
          device.id === updatedDevice.id ? updatedDevice : device
        )
      })));
    });
    
    socket.on('rooms-update', setRooms);

    return () => {
      socket.off('devices-update');
      socket.off('device-update');
      socket.off('rooms-update');
    };
  }, []);

  const handleDeviceControl = (deviceId: string, newState: any) => {
    socket.emit('control-device', { id: deviceId, state: newState });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Smart Home Dashboard</h1>
      
      <div className="space-y-8">
        {rooms.map(room => (
          <RoomSection 
            key={room.id}
            room={room}
            onDeviceControl={handleDeviceControl}
          />
        ))}
      </div>
    </div>
  );
}

export default App;