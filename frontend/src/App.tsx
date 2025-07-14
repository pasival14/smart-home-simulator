import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomSection from './components/RoomSection';
import AutomationSection from './components/AutomationSection';
import SceneSection from './components/SceneSection';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Header from './components/Header'; // Import the new Header
import type { Device, Room, Rule, Scene, Analytics } from './types';

const socket = io('http://localhost:4000');

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalEnergyConsumption: 0,
    deviceUsage: {},
    ruleTriggerCount: {},
    activityLog: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, roomsRes, rulesRes, scenesRes, analyticsRes] = await Promise.all([
          fetch('http://localhost:4000/devices'),
          fetch('http://localhost:4000/rooms'),
          fetch('http://localhost:4000/rules'),
          fetch('http://localhost:4000/scenes'),
          fetch('http://localhost:4000/analytics/stats'),
        ]);

        if (!devicesRes.ok || !roomsRes.ok || !rulesRes.ok || !scenesRes.ok || !analyticsRes.ok) {
          throw new Error('Network response was not ok');
        }

        const devicesData = await devicesRes.json();
        const roomsData = await roomsRes.json();
        const rulesData = await rulesRes.json();
        const scenesData = await scenesRes.json();
        const analyticsData = await analyticsRes.json();

        setDevices(devicesData);
        setRooms(roomsData.map((room: Room) => ({
          ...room,
          devices: room.devices.filter(device => device != null)
        })));
        setRules(rulesData);
        setScenes(scenesData);
        setAnalytics(analyticsData);

      } catch (err) {
        setError('Failed to fetch initial data. Please ensure the backend server is running.');
        console.error(err);
      }
    };

    fetchData();

    socket.on('connect_error', () => {
      setError('Failed to connect to the WebSocket server.');
    });

    socket.on('device-update', (updatedDevice: Device) => {
      if (!updatedDevice) return;
      setDevices(prev => prev.map(d => (d && d.id === updatedDevice.id ? updatedDevice : d)));
      setRooms(prev => prev.map(room => ({
        ...room,
        devices: room.devices.map(device => (device && device.id === updatedDevice.id ? updatedDevice : device)),
      })));
    });

    socket.on('rules-update', (newRules: Rule[]) => setRules(newRules || []));
    socket.on('scenes-update', (newScenes: Scene[]) => setScenes(newScenes || []));
    socket.on('analytics-update', (newAnalytics: Analytics) => setAnalytics(newAnalytics));

    return () => {
      socket.off('connect_error');
      socket.off('device-update');
      socket.off('rules-update');
      socket.off('scenes-update');
      socket.off('analytics-update');
    };
  }, []);

  const handleDeviceControl = (deviceId: string, newState: any) => {
    socket.emit('control-device', { id: deviceId, state: newState });
  };

  const handleActivateScene = (sceneId: string) => {
    socket.emit('activate-scene', sceneId);
  };

  const handleAddRule = (rule: Omit<Rule, 'id'>) => {
    socket.emit('create-rule', rule);
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    socket.emit('update-rule', { id: ruleId, updates: { enabled } });
  };

  const handleDeleteRule = (ruleId: string) => {
    socket.emit('delete-rule', ruleId);
  };

  if (error) {
    return <div className="p-6 text-red-500 bg-red-100 min-h-screen"><strong>Error:</strong> {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-8">
            <SceneSection scenes={scenes} onActivateScene={handleActivateScene} />
            {rooms.map(room => (
              <RoomSection key={room.id} room={room} onDeviceControl={handleDeviceControl} />
            ))}
          </div>

          {/* Sidebar column */}
          <div className="lg:col-span-1 space-y-8">
            <AutomationSection
              rules={rules}
              devices={devices}
              onAddRule={handleAddRule}
              onToggleRule={handleToggleRule}
              onDeleteRule={handleDeleteRule}
            />
            <AnalyticsDashboard analytics={analytics} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;