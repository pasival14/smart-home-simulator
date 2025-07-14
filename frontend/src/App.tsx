import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomSection from './components/RoomSection';
import AutomationSection from './components/AutomationSection';
import SceneSection from './components/SceneSection';
import type { Device, Room, Rule, Scene } from './types';

const socket = io('http://localhost:4000');

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/devices').then(res => res.json()).then(data => setDevices(data));
    fetch('http://localhost:4000/rooms').then(res => res.json()).then(data => setRooms(data));
    fetch('http://localhost:4000/rules').then(res => res.json()).then(data => setRules(data));
    fetch('http://localhost:4000/scenes').then(res => res.json()).then(data => setScenes(data));

    socket.on('devices-update', setDevices);
    socket.on('device-update', (updatedDevice: Device) => {
      setDevices(prev => prev.map(d => (d.id === updatedDevice.id ? updatedDevice : d)));
      setRooms(prev => prev.map(room => ({
        ...room,
        devices: room.devices.map(device => (device.id === updatedDevice.id ? updatedDevice : device)),
      })));
    });
    socket.on('rooms-update', setRooms);
    socket.on('rules-update', setRules);
    socket.on('scenes-update', setScenes);

    return () => {
      socket.off('devices-update');
      socket.off('device-update');
      socket.off('rooms-update');
      socket.off('rules-update');
      socket.off('scenes-update');
    };
  }, []);

  const handleDeviceControl = (deviceId: string, newState: any) => {
    socket.emit('control-device', { id: deviceId, state: newState });
  };

  const handleActivateScene = (sceneId: string) => {
    socket.emit('activate-scene', sceneId);
  };

  const handleAddRule = (rule: Omit<Rule, 'id'>) => {
    fetch('http://localhost:4000/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    fetch(`http://localhost:4000/rules/${ruleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    fetch(`http://localhost:4000/rules/${ruleId}`, { method: 'DELETE' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Smart Home Dashboard</h1>
      <div className="space-y-8">
        <SceneSection scenes={scenes} onActivateScene={handleActivateScene} />
        {rooms.map(room => (
          <RoomSection key={room.id} room={room} onDeviceControl={handleDeviceControl} />
        ))}
        <AutomationSection
          rules={rules}
          devices={devices}
          onAddRule={handleAddRule}
          onToggleRule={handleToggleRule}
          onDeleteRule={handleDeleteRule}
        />
      </div>
    </div>
  );
}

export default App;