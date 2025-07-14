import React from 'react'
import type { Device } from '../types';

interface DeviceCardProps {
  device: Device;
  onControl: (deviceId: string, newState: any) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onControl }) => {
  const renderControls = () => {
    switch(device.type) {
      case 'light':
        return (
          <div className="flex items-center space-x-2">
            <button 
              className={`px-3 py-1 rounded ${device.state.on ? 'bg-green-500' : 'bg-gray-300'}`}
              onClick={() => onControl(device.id, { on: !device.state.on })}
            >
              {device.state.on ? 'ON' : 'OFF'}
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={device.state.brightness} 
              onChange={(e) => onControl(device.id, { brightness: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )
      
      case 'thermostat':
        return (
          <div className="space-y-2">
            <div className="text-2xl font-bold">{device.state.temperature}°F</div>
            <div className="flex space-x-2">
              <button 
                className={`px-2 py-1 rounded ${device.state.mode === 'cool' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => onControl(device.id, { mode: 'cool' })}
              >
                Cool
              </button>
              <button 
                className={`px-2 py-1 rounded ${device.state.mode === 'heat' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                onClick={() => onControl(device.id, { mode: 'heat' })}
              >
                Heat
              </button>
            </div>
          </div>
        )
      
      case 'lock':
        return (
          <button 
            className={`px-4 py-2 rounded-full font-bold ${
              device.state.locked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
            onClick={() => onControl(device.id, { locked: !device.state.locked })}
          >
            {device.state.locked ? 'LOCKED' : 'UNLOCKED'}
          </button>
        )
      
      case 'camera':
        return (
          <div className="space-y-2">
            <div className={`px-3 py-1 inline-block rounded ${
              device.state.active ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}>
              {device.state.active ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => onControl(device.id, { active: !device.state.active })}
              >
                Toggle
              </button>
            </div>
          </div>
        )
      
      default:
        return <pre>{JSON.stringify(device.state, null, 2)}</pre>
    }
  }

  const getDeviceIcon = () => {
    switch(device.type) {
      case 'light': return '💡';
      case 'thermostat': return '🌡️';
      case 'camera': return '📷';
      case 'lock': return '🔒';
      case 'sensor': return '📊';
      default: return '📱';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <span className="text-2xl mr-2">{getDeviceIcon()}</span>
            <h3 className="font-bold text-lg">{device.name}</h3>
          </div>
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
            {device.type}
          </span>
        </div>
        
        {/* Status indicator */}
        <div className={`w-3 h-3 rounded-full ${
          device.type === 'light' ? (device.state.on ? 'bg-green-500' : 'bg-gray-300') :
          device.type === 'lock' ? (device.state.locked ? 'bg-red-500' : 'bg-green-500') :
          device.type === 'camera' ? (device.state.active ? 'bg-green-500' : 'bg-gray-300') :
          'bg-blue-500'
        }`}></div>
      </div>
      
      <div className="mt-4">
        {renderControls()}
      </div>
    </div>
  );
}

export default DeviceCard