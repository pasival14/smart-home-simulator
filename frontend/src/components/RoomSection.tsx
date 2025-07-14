import React from 'react';
import DeviceCard from './DeviceCard';
import type { Room } from '../types';

interface RoomSectionProps {
  room: Room;
  onDeviceControl: (deviceId: string, newState: any) => void;
}

const RoomSection: React.FC<RoomSectionProps> = ({ room, onDeviceControl }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{room.name}</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Turn Off All
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
            Scene: Relax
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {room.devices.map(device => (
          <DeviceCard 
            key={device.id} 
            device={device} 
            onControl={onDeviceControl} 
          />
        ))}
      </div>
    </div>
  );
};

export default RoomSection;