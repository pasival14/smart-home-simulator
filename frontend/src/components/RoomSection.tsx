import React from 'react';
import DeviceCard from './DeviceCard';
import type { Room } from '../types';
import { Building } from 'lucide-react';

interface RoomSectionProps {
  room: Room;
  onDeviceControl: (deviceId: string, newState: any) => void;
}

const RoomSection: React.FC<RoomSectionProps> = ({ room, onDeviceControl }) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Building className="w-8 h-8 text-sky-600" />
        <h2 className="text-2xl font-bold text-slate-800">{room.name}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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