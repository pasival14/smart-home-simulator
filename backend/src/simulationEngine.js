"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateDevices = void 0;
// Simulation logic
const simulateDevices = (devices, io) => {
    // Initialize devices
    const deviceTypes = ['light', 'thermostat', 'camera', 'lock', 'sensor'];
    const rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Garage'];
    // Create 10 sample devices
    for (let i = 0; i < 10; i++) {
        const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const device = {
            id: `device_${i}`,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
            type,
            room: rooms[Math.floor(Math.random() * rooms.length)],
            state: {}
        };
        // Set initial state based on device type
        switch (type) {
            case 'light':
                device.state = { on: Math.random() > 0.5, brightness: Math.floor(Math.random() * 100), color: '#ffffff' };
                break;
            case 'thermostat':
                device.state = {
                    temperature: Math.floor(Math.random() * 20) + 65,
                    mode: Math.random() > 0.5 ? 'cool' : 'heat',
                    active: Math.random() > 0.5
                };
                break;
            case 'camera':
                device.state = {
                    active: Math.random() > 0.5,
                    recording: false,
                    motionDetected: false
                };
                break;
            case 'lock':
                device.state = { locked: Math.random() > 0.5 };
                break;
            case 'sensor':
                device.state = {
                    temperature: Math.floor(Math.random() * 20) + 65,
                    humidity: Math.floor(Math.random() * 50) + 20,
                    motion: false
                };
                break;
        }
        devices.push(device);
    }
    // Simulate sensor data changes
    setInterval(() => {
        devices.forEach(device => {
            let shouldUpdate = false;
            switch (device.type) {
                case 'sensor':
                    // Random fluctuations
                    device.state.temperature += (Math.random() * 2 - 1);
                    device.state.humidity += (Math.random() * 4 - 2);
                    device.state.motion = Math.random() > 0.9;
                    shouldUpdate = true;
                    break;
                case 'thermostat':
                    // Temperature changes based on mode
                    if (device.state.active) {
                        const target = device.state.mode === 'cool' ? 68 : 72;
                        device.state.temperature += (target - device.state.temperature) * 0.1;
                        shouldUpdate = true;
                    }
                    break;
                case 'camera':
                    // Random motion detection
                    if (device.state.active && Math.random() > 0.95) {
                        device.state.motionDetected = true;
                        shouldUpdate = true;
                        // Reset after 5 seconds
                        setTimeout(() => {
                            device.state.motionDetected = false;
                            io.emit('device-update', device);
                        }, 5000);
                    }
                    break;
            }
            if (shouldUpdate) {
                io.emit('device-update', device);
            }
        });
    }, 2000);
};
exports.simulateDevices = simulateDevices;
