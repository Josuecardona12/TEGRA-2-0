const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db.sqlite',
  logging: false
});

// Modelos
const Lote = sequelize.define('Lote', {
  id: { type: DataTypes.STRING, primaryKey: true },
  codigo: DataTypes.STRING,
  producto: DataTypes.STRING,
  cliente: DataTypes.STRING,
  cantidad: DataTypes.INTEGER,
  estado: { type: DataTypes.STRING, defaultValue: 'en_proceso' },
  areaActual: { type: DataTypes.STRING, defaultValue: 'Recepción' },
  progreso: { type: DataTypes.INTEGER, defaultValue: 5 }
});

const Historial = sequelize.define('Historial', {
  id: { type: DataTypes.STRING, primaryKey: true },
  loteId: DataTypes.STRING,
  area: DataTypes.STRING,
  fecha: DataTypes.STRING
});

// Datos iniciales
const lotesDemo = [
  { id: 'LOTE-001', codigo: '1001', producto: 'Camiseta Yankees', cliente: 'Nike', cantidad: 150 },
  { id: 'LOTE-002', codigo: '1002', producto: 'Gorra Lakers', cliente: 'Adidas', cantidad: 75 },
  { id: 'LOTE-003', codigo: '1003', producto: 'Uniforme Patriots', cliente: 'Puma', cantidad: 200 }
];

const areas = [
  'Recepción', 'Diseño', 'Plotter', 'Corte', 'Sublimado', 
  'Colorimetría', 'Preparacion', 'Calidad', 'Logística', 'Almacén'
];

// WebSocket
const clients = new Set();

wss.on('connection', async (ws) => {
  clients.add(ws);
  console.log('Cliente conectado. Total:', clients.size);

  // Enviar datos iniciales
  ws.send(JSON.stringify({
    type: 'INIT',
    data: {
      lotes: await Lote.findAll(),
      historial: await Historial.findAll(),
      areas
    }
  }));

  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg);
      
      if (data.type === 'MOVIMIENTO') {
        const { loteId, area } = data.payload;
        
        // Guardar historial
        await Historial.create({
          id: Date.now().toString(),
          loteId,
          area,
          fecha: new Date().toLocaleString()
        });
        
        // Actualizar lote
        await Lote.update(
          { areaActual: area, progreso: sequelize.literal('progreso + 5') },
          { where: { id: loteId } }
        );
        
        // Obtener datos actualizados
        const lotes = await Lote.findAll();
        const historial = await Historial.findAll();
        
        // Broadcast a todos
        const broadcast = JSON.stringify({
          type: 'ACTUALIZACION',
          data: { lotes, historial, ultimoMovimiento: { loteId, area } }
        });
        
        clients.forEach(c => {
          if (c.readyState === WebSocket.OPEN) c.send(broadcast);
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Cliente desconectado. Total:', clients.size);
  });
});

// API REST
app.get('/api/lotes', async (req, res) => {
  res.json(await Lote.findAll());
});

app.get('/api/historial', async (req, res) => {
  res.json(await Historial.findAll());
});

app.get('/api/areas', (req, res) => {
  res.json(areas);
});

app.post('/api/reset', async (req, res) => {
  await Lote.destroy({ where: {} });
  await Historial.destroy({ where: {} });
  await Lote.bulkCreate(lotesDemo);
  res.json({ message: 'Reset completado' });
});

// Iniciar servidor
const PORT = 8080;

sequelize.sync({ force: true }).then(async () => {
  await Lote.bulkCreate(lotesDemo);
  console.log('Base de datos lista');
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔════════════════════════════╗
    ║  🚀 SERVIDOR LISTO         ║
    ║  📡 Puerto: ${PORT}          ║
    ║  🔗 ws://localhost:${PORT}   ║
    ╚════════════════════════════╝
    `);
  });
});