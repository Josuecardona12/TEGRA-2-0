const sql = require('mssql');
require('dotenv').config();

// Configuración de conexión a SQL Server
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

if (process.env.DB_INSTANCE) {
  dbConfig.options.instanceName = process.env.DB_INSTANCE;
}

let pool = null;

const connectDB = async () => {
  if (pool) return pool;
  
  try {
    console.log('📡 Conectando a SQL Server...');
    console.log(`   Servidor: ${dbConfig.server}`);
    console.log(`   Base de datos: ${dbConfig.database}`);
    
    pool = await sql.connect(dbConfig);
    console.log('✅ Conectado exitosamente a SQL Server');
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a SQL Server:', error.message);
    throw error;
  }
};

const query = async (sqlQuery, params = {}) => {
  try {
    const connection = await connectDB();
    const request = connection.request();
    
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(sqlQuery);
    return result.recordset;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  }
};

const testConnection = async () => {
  try {
    await connectDB();
    const result = await query('SELECT GETDATE() as serverTime');
    console.log('✅ Prueba de conexión exitosa');
    console.log(`   Hora del servidor: ${result[0]?.serverTime}`);
    return true;
  } catch (error) {
    console.error('❌ Prueba de conexión fallida:', error.message);
    return false;
  }
};

module.exports = {
  connectDB,
  query,
  testConnection,
  sql
};