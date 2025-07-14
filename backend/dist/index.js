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
const automationEngine_1 = require("./automationEngine");
const sceneEngine_1 = require("./sceneEngine");
const analyticsEngine_1 = require("./analyticsEngine");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        // FIX: Allow connections from any origin
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 4000;
const devices = [];
const rooms = [];
const analyticsEngine = new analyticsEngine_1.AnalyticsEngine(io);
const automationEngine = new automationEngine_1.AutomationEngine(devices, io, analyticsEngine);
const sceneEngine = new sceneEngine_1.SceneEngine(devices, io, analyticsEngine);
(0, simulationEngine_1.simulateDevices)(devices, rooms, io, analyticsEngine);
// --- API Endpoints ---
app.get('/rooms', (req, res) => {
    res.json(rooms.map(room => ({
        ...room,
        devices: room.devices.map(deviceId => devices.find(d => d.id === deviceId))
    })));
});
app.get('/devices', (req, res) => {
    res.json(devices);
});
app.get('/scenes', (req, res) => {
    res.json(sceneEngine.getScenes());
});
app.post('/scenes/:id/activate', (req, res) => {
    sceneEngine.activateScene(req.params.id);
    res.json({ success: true });
});
app.get('/rules', (req, res) => {
    res.json(automationEngine.getRules());
});
app.post('/rules', (req, res) => {
    try {
        const rule = automationEngine.addRule(req.body);
        res.json(rule);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid rule data' });
    }
});
app.put('/rules/:id', (req, res) => {
    try {
        const rule = automationEngine.updateRule(req.params.id, req.body);
        if (!rule)
            return res.status(404).json({ error: 'Rule not found' });
        res.json(rule);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid rule data' });
    }
});
app.delete('/rules/:id', (req, res) => {
    const success = automationEngine.deleteRule(req.params.id);
    if (!success)
        return res.status(404).json({ error: 'Rule not found' });
    res.json({ success: true });
});
app.get('/analytics/stats', (req, res) => {
    res.json(analyticsEngine.getStats());
});
// --- WebSocket Connection Handler ---
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('devices-update', devices);
    socket.emit('rooms-update', rooms.map(room => ({
        ...room,
        devices: room.devices.map(deviceId => devices.find(d => d.id === deviceId))
    })));
    socket.emit('rules-update', automationEngine.getRules());
    socket.emit('scenes-update', sceneEngine.getScenes());
    socket.emit('analytics-update', analyticsEngine.getStats());
    socket.on('control-device', (data) => {
        const device = devices.find(d => d.id === data.id);
        if (device) {
            device.state = { ...device.state, ...data.state };
            analyticsEngine.logDeviceUsage(device, Object.keys(data.state)[0]);
            io.emit('device-update', device);
        }
    });
    socket.on('activate-scene', (sceneId) => sceneEngine.activateScene(sceneId));
    socket.on('create-rule', (ruleData) => automationEngine.addRule(ruleData));
    socket.on('update-rule', ({ id, updates }) => automationEngine.updateRule(id, updates));
    socket.on('delete-rule', (id) => automationEngine.deleteRule(id));
    socket.on('disconnect', () => console.log('Client disconnected'));
});
// --- Server Startup & Shutdown ---
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Automation engine started');
});
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    automationEngine.stopEvaluation();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
