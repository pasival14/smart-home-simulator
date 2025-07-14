"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const simulationEngine_1 = require("./simulationEngine");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 4000;
// Store devices in memory
const devices = [];
const rooms = [];
(0, simulationEngine_1.simulateDevices)(devices, rooms, io);
app.get('/rooms', (req, res) => {
    res.json(rooms.map(room => ({
        ...room,
        devices: room.devices.map(deviceId => devices.find(d => d.id === deviceId))
    })));
});
// API endpoint to get all devices
app.get('/devices', (req, res) => {
    res.json(devices);
});
// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('Client connected');
    // Send initial device states
    socket.emit('devices-update', devices);
    // Handle device control from frontend
    socket.on('control-device', (data) => {
        const device = devices.find(d => d.id === data.id);
        if (device) {
            device.state = { ...device.state, ...data.state };
            io.emit('device-update', device);
        }
    });
    socket.emit('rooms-update', rooms.map(room => ({
        ...room,
        devices: room.devices.map(deviceId => devices.find(d => d.id === deviceId))
    })));
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
