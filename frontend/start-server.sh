#!/bin/bash
# start-server.sh

echo "=========================================="
echo "🚀 TEGRA ERP - SERVER MODE"
echo "=========================================="

# Crear directorio de logs
mkdir -p logs

# Matar procesos existentes
echo "🔄 Deteniendo procesos antiguos..."
pm2 delete all 2>/dev/null

# Iniciar servidor backend
echo "📡 Iniciando servidor WebSocket..."
cd /workspaces/TEGRA-2-0/frontend/mes-frontend/server-trazabilidad
pm2 start server.js --name tegra-backend --watch=false

# Construir frontend para producción
echo "🏗️  Construyendo frontend..."
cd /workspaces/TEGRA-2-0/frontend/mes-frontend
npm run build

# Iniciar servidor frontend
echo "🌐 Iniciando frontend..."
pm2 start npm --name tegra-frontend -- run preview -- --port 5173 --host 0.0.0.0

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup

echo ""
echo "=========================================="
echo "✅ SERVICIOS INICIADOS"
echo "=========================================="
echo "📡 Backend WebSocket: ws://localhost:8080"
echo "🌐 Frontend: http://localhost:5173"
echo "📊 Ver logs: pm2 logs"
echo "🔄 Ver estado: pm2 list"
echo "=========================================="

# Mostrar estado
pm2 list