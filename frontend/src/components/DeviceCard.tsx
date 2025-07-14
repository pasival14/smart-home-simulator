import React from 'react';
import type { Device } from '../types';
import { Lightbulb, Thermometer, Video, Lock, BarChart3, ToggleLeft, ToggleRight, Heater, Wind } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onControl: (deviceId: string, newState: any) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onControl }) => {
  const getDeviceIcon = () => {
    const commonProps = { className: "w-6 h-6 text-slate-500" };
    switch (device.type) {
      case 'light': return <Lightbulb {...commonProps} />;
      case 'thermostat': return <Thermometer {...commonProps} />;
      case 'camera': return <Video {...commonProps} />;
      case 'lock': return <Lock {...commonProps} />;
      case 'sensor': return <BarChart3 {...commonProps} />;
      default: return null;
    }
  };

  const renderControls = () => {
    switch (device.type) {
      case 'light':
        return (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onControl(device.id, { on: !device.state.on })}
              className={`flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2 rounded-lg font-semibold transition ${
                device.state.on ? 'bg-amber-400 text-slate-800' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {device.state.on ? <ToggleRight /> : <ToggleLeft />}
              <span>{device.state.on ? 'ON' : 'OFF'}</span>
            </button>
            <div className="w-full flex items-center gap-2">
              <span className="text-sm text-slate-500">Bright</span>
              <input
                type="range"
                min="0"
                max="100"
                value={device.state.brightness}
                onChange={(e) => onControl(device.id, { brightness: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                disabled={!device.state.on}
              />
            </div>
          </div>
        );
      
      case 'thermostat':
        return (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-3xl font-bold text-slate-700">{Math.round(device.state.temperature)}°F</div>
            <div className="flex gap-2">
              <button
                onClick={() => onControl(device.id, { mode: 'cool' })}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  device.state.mode === 'cool' ? 'bg-sky-500 text-white' : 'bg-slate-200'
                }`}
              >
                <Wind className="w-4 h-4" /> Cool
              </button>
              <button
                onClick={() => onControl(device.id, { mode: 'heat' })}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  device.state.mode === 'heat' ? 'bg-red-500 text-white' : 'bg-slate-200'
                }`}
              >
                <Heater className="w-4 h-4" /> Heat
              </button>
            </div>
          </div>
        );

      case 'lock':
        return (
          <button
            onClick={() => onControl(device.id, { locked: !device.state.locked })}
            className={`w-full py-2 rounded-lg font-bold text-white transition ${
              device.state.locked ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {device.state.locked ? 'LOCKED' : 'UNLOCKED'}
          </button>
        );

      case 'camera':
      case 'sensor':
      default:
        return (
          <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(device.state, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between gap-4 border-b-4 border-transparent hover:border-sky-500 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {getDeviceIcon()}
          <div>
            <h3 className="font-bold text-slate-800">{device.name}</h3>
            <span className="text-xs text-slate-500 capitalize">{device.type}</span>
          </div>
        </div>
        <div title={device.state.on || device.state.active || device.state.locked ? 'Active' : 'Inactive'}
          className={`w-3 h-3 rounded-full transition ${
            (device.state.on || device.state.active) ? 'bg-green-500' : 
            (device.type === 'lock' && !device.state.locked) ? 'bg-green-500' :
            'bg-slate-300'
          }`}
        ></div>
      </div>
      <div className="mt-2">
        {renderControls()}
      </div>
    </div>
  );
};

export default DeviceCard;