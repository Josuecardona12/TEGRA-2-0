// /workspaces/TEGRA-2-0/frontend/mes-frontend/server-trazabilidad/server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

const PORT = 8080;

// Datos en memoria
let lotes = [];
let ultimoMovimiento = null;

const AREAS = [
  { id: 'recepcion', nombre: 'Recepción', codigo: '9001', icono: '📦' },
  { id: 'diseno', nombre: 'Diseño', codigo: '9002', icono: '🎨' },
  { id: 'plotter', nombre: 'Plotter', codigo: '9003', icono: '🖨️' },
  { id: 'corte', nombre: 'Corte', codigo: '9004', icono: '✂️' },
  { id: 'sublimado', nombre: 'Sublimado', codigo: '9005', icono: '🔥' },
  { id: 'calidad', nombre: 'Calidad', codigo: '9006', icono: '✅' },
  { id: 'almacen', nombre: 'Almacén', codigo: '9007', icono: '🏢' }
];

// Generar datos iniciales
for (let i = 1; i <= 5; i++) {
  lotes.push({
    id: `LOTE-${String(i).padStart(3, '0')}`,
    codigo: `V132274/IF212${i}`,
    producto: `Producto ${i}`,
    cliente: `Cliente ${i}`,
    cantidad: 100 + i * 50,
    fechaInicio: new Date().toISOString(),
    estado: 'en_proceso',
    areaActual: 'Recepción',
    progreso: 10 * i,
    prioridad: 'media',
    responsable: 'Sistema',
    historial: [{
      area: 'Recepción',
      codigoArea: '9001',
      fecha: new Date().toISOString(),
      timestamp: Date.now(),
      operador: 'Sistema',
      actual: true
    }]
  });
}

console.log(`📦 Datos iniciales: ${lotes.length} lotes`);

// WebSocket
wss.on('connection', (ws) => {
  console.log(`✅ Cliente conectado (Total: ${wss.clients.size})`);
  
  ws.send(JSON.stringify({
    type: 'INIT',
    data: { lotes, areas: AREAS, ultimoMovimiento }
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📦 Recibido:', data.type);
      
      if (data.type === 'MOVIMIENTO') {
        const { loteId, area, codigoLote } = data.payload;
        ultimoMovimiento = { lote: codigoLote || loteId, area };
        
        // Broadcast a todos los clientes
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'ACTUALIZACION',
              data: { lotes, ultimoMovimiento }
            }));
          }
        });
      }
    } catch (e) { 
      console.error('Error:', e); 
    }
  });
  
  ws.on('close', () => {
    console.log(`❌ Cliente desconectado (Total: ${wss.clients.size})`);
  });
});

// API REST
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    lotes: lotes.length, 
    clients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/lotes', (req, res) => {
  res.json(lotes);
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SERVIDOR LISTO');
  console.log('📡 WebSocket: ws://localhost:' + PORT);
  console.log('🌐 HTTP: http://localhost:' + PORT);
  console.log('📊 ' + lotes.length + ' lotes cargados');
  console.log('='.repeat(50) + '\n');
});