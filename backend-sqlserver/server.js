const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intente más tarde' }
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api', limiter);

// ============================================
// RUTAS DE PRUEBA
// ============================================

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection().catch(() => false);
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbConnected,
      name: process.env.DB_NAME,
      server: process.env.DB_HOST
    }
  });
});

// Ruta de prueba para obtener datos
app.get('/api/test', async (req, res) => {
  try {
    const result = await testConnection();
    res.json({
      success: true,
      message: 'Conexión exitosa a SQL Server',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ruta para ejecutar consultas personalizadas (solo para desarrollo)
app.post('/api/query', async (req, res) => {
  const { sqlQuery, params = {} } = req.body;
  
  if (!sqlQuery) {
    return res.status(400).json({ error: 'Se requiere una consulta SQL' });
  }
  
  try {
    const { query } = require('./config/db');
    const result = await query(sqlQuery, params);
    res.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Base de datos conectada');
    
    app.listen(PORT, () => {
      console.log(`
      ════════════════════════════════════════════
      🚀 Servidor SQL Server corriendo
      📡 Puerto: ${PORT}
      🔗 URL: http://localhost:${PORT}
      📊 Health: http://localhost:${PORT}/api/health
      ════════════════════════════════════════════
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

startServer();