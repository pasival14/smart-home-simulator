import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Device, Room, simulateDevices } from './simulationEngine';
import { AutomationEngine } from './automationEngine';
import { SceneEngine } from './sceneEngine';
import { AnalyticsEngine } from './analyticsEngine';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;

const devices: Device[] = [];
const rooms: Room[] = [];

const analyticsEngine = new AnalyticsEngine(io);
const automationEngine = new AutomationEngine(devices, io, analyticsEngine);
const sceneEngine = new SceneEngine(devices, io, analyticsEngine);
simulateDevices(devices, rooms, io, analyticsEngine);

app.get('/rooms', (req, res) => {
  res.json(rooms.map(room => ({
    ...room,
    devices: room.devices.map(deviceId => 
      devices.find(d => d.id === deviceId)
    )
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
  } catch (error) {
    res.status(400).json({ error: 'Invalid rule data' });
  }
});

app.put('/rules/:id', (req, res) => {
  try {
    const rule = automationEngine.updateRule(req.params.id, req.body);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(400).json({ error: 'Invalid rule data' });
  }
});

app.delete('/rules/:id', (req, res) => {
  const success = automationEngine.deleteRule(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json({ success: true });
});

app.get('/automation/stats', (req, res) => {
  res.json(automationEngine.getStats());
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.emit('devices-update', devices);
  socket.emit('rooms-update', rooms.map(room => ({
    ...room,
    devices: room.devices.map(deviceId => 
      devices.find(d => d.id === deviceId))
  })));
  socket.emit('rules-update', automationEngine.getRules());
  socket.emit('scenes-update', sceneEngine.getScenes());
  
  socket.on('control-device', (data) => {
    const device = devices.find(d => d.id === data.id);
    if (device) {
      device.state = { ...device.state, ...data.state };
      analyticsEngine.logDeviceUsage(device, Object.keys(data.state)[0]);
      io.emit('device-update', device);
    }
  });

  socket.on('activate-scene', (sceneId) => {
    sceneEngine.activateScene(sceneId);
  });

  socket.on('create-rule', (ruleData) => {
    try {
      const rule = automationEngine.addRule(ruleData);
      socket.emit('rule-created', rule);
    } catch (error) {
      socket.emit('rule-error', { error: 'Failed to create rule' });
    }
  });

  socket.on('update-rule', ({ id, updates }) => {
    try {
      const rule = automationEngine.updateRule(id, updates);
      if (rule) {
        socket.emit('rule-updated', rule);
      } else {
        socket.emit('rule-error', { error: 'Rule not found' });
      }
    } catch (error) {
      socket.emit('rule-error', { error: 'Failed to update rule' });
    }
  });

  socket.on('delete-rule', (id) => {
    try {
      const success = automationEngine.deleteRule(id);
      if (success) {
        socket.emit('rule-deleted', id);
      } else {
        socket.emit('rule-error', { error: 'Rule not found' });
      }
    } catch (error) {
      socket.emit('rule-error', { error: 'Failed to delete rule' });
    }
  });

  socket.on('get-automation-stats', () => {
    socket.emit('automation-stats', automationEngine.getStats());
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  automationEngine.stopEvaluation();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Automation engine started');
});