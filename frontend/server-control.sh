#!/bin/bash
# server-control.sh

case "$1" in
  start)
    echo "🚀 Iniciando servidor TEGRA..."
    cd /workspaces/TEGRA-2-0/frontend/mes-frontend
    pm2 start ecosystem.config.js
    ;;
  stop)
    echo "🛑 Deteniendo servidor TEGRA..."
    pm2 stop all
    ;;
  restart)
    echo "🔄 Reiniciando servidor TEGRA..."
    pm2 restart all
    ;;
  status)
    echo "📊 Estado del servidor:"
    pm2 list
    ;;
  logs)
    echo "📜 Logs del servidor:"
    pm2 logs
    ;;
  monitor)
    echo "📈 Monitoreo en tiempo real:"
    pm2 monit
    ;;
  *)
    echo "Uso: $0 {start|stop|restart|status|logs|monitor}"
    exit 1
    ;;
esac