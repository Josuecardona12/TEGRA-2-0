const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;


app.use(cors({
  origin: [
    'https://minature-adventure-v6q4r64gqq7qfr67-5001.app.github.dev',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true,                    
        trustServerCertificate: false,    
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;


const connectDB = async () => {
    try {
        if (pool && pool.connected) {
            console.log('✅ Ya existe una conexión activa');
            return pool;
        }

        console.log('\n📡 Conectando a Azure SQL Database...');
        console.log(`   Servidor: ${process.env.DB_SERVER}`);
        console.log(`   Base de datos: ${process.env.DB_NAME}`);
        console.log(`   Usuario: ${process.env.DB_USER}`);
        
        pool = await sql.connect(dbConfig);
        console.log(' Conexión exitosa a Azure SQL Database');
        
        // Probar conexión
        const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as databaseName, GETDATE() as currentTime');
        console.log(` Versión: ${result.recordset[0].version.substring(0, 60)}...`);
        console.log(` Base de datos: ${result.recordset[0].databaseName}`);
        console.log(` Fecha del servidor: ${result.recordset[0].currentTime}`);
        
        return pool;
    } catch (error) {
        console.error('\n Error conectando a Azure SQL Database:');
        console.error(`   Mensaje: ${error.message}`);
        console.error(`   Código: ${error.code || 'N/A'}`);
        if (error.originalError) {
            console.error(`   Error original: ${error.originalError.message}`);
        }
        throw error;
    }
};


app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend Azure SQL Database funcionando',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await connectDB();
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            server: process.env.DB_SERVER,
            databaseName: process.env.DB_NAME,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});


app.get('/api/tables', async (req, res) => {
    try {
        await connectDB();
        
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        res.json({ 
            success: true, 
            tables: result.recordset.map(t => t.TABLE_NAME),
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error en /api/tables:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        await connectDB();
        
        // Buscar tabla de usuarios
        const tables = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            AND (TABLE_NAME LIKE '%usuario%' OR TABLE_NAME LIKE '%user%' OR TABLE_NAME LIKE '%User%')
        `);
        
        if (tables.recordset.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No se encontró tabla de usuarios',
                tables: await pool.request().query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`).then(r => r.recordset.map(t => t.TABLE_NAME))
            });
        }
        
        const tablaUsuario = tables.recordset[0].TABLE_NAME;
        const result = await pool.request().query(`SELECT TOP 10 * FROM [${tablaUsuario}]`);
        
        res.json({ 
            success: true, 
            data: result.recordset,
            count: result.recordset.length,
            tableName: tablaUsuario
        });
    } catch (error) {
        console.error('Error en /api/usuarios:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`\n Servidor Express corriendo en http://localhost:${port}`);
    console.log(` API disponible en: http://localhost:${port}/api/health`);
    console.log(` URL pública: https://minature-adventure-v6q4r64gqq7qfr67-${port}.app.github.dev\n`);
});


connectDB().catch(console.error);


process.on('SIGINT', async () => {
    console.log('\n Cerrando conexiones...');
    if (pool) await pool.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n Cerrando conexiones...');
    if (pool) await pool.close();
    process.exit(0);
});

module.exports = { app, connectDB };