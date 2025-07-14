import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Device, Room, simulateDevices } from './simulationEngine';
import { AutomationEngine } from './automationEngine';

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

// Store devices and rooms in memory
const devices: Device[] = [];
const rooms: Room[] = [];

// Initialize simulation and automation
simulateDevices(devices, rooms, io);
const automationEngine = new AutomationEngine(devices, io);

// API endpoints
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

// Automation rules endpoints
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

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial data
  socket.emit('devices-update', devices);
  socket.emit('rooms-update', rooms.map(room => ({
    ...room,
    devices: room.devices.map(deviceId => 
      devices.find(d => d.id === deviceId))
  })));
  socket.emit('rules-update', automationEngine.getRules());
  
  // Handle device control from frontend
  socket.on('control-device', (data) => {
    const device = devices.find(d => d.id === data.id);
    if (device) {
      device.state = { ...device.state, ...data.state };
      io.emit('device-update', device);
    }
  });

  // Handle rule management
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

// Graceful shutdown
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