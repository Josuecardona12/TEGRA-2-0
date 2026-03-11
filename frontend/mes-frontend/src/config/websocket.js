// src/config/websocket.js

// 🔴 CAMBIA ESTA URL POR LA TUYA
export const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

// Tipos de eventos
export const EVENTOS = {
  INIT: 'INIT',
  ACTUALIZACION: 'ACTUALIZACION',
  MOVIMIENTO: 'MOVIMIENTO',
  NUEVO_LOTE: 'NUEVO_LOTE',
  ERROR: 'ERROR'
};

// Hook personalizado para WebSocket
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (onMessage) => {
  const [conectado, setConectado] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    console.log('🔌 Conectando a servidor...');
    
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('✅ Conectado al servidor');
      setConectado(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Recibido:', data.type);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error:', error);
      setConectado(false);
    };
    
    ws.onclose = () => {
      console.log('❌ Desconectado');
      setConectado(false);
    };
    
    wsRef.current = ws;
    
    return () => ws.close();
  }, []);

  const enviar = (tipo, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: tipo, payload }));
      return true;
    }
    return false;
  };

  return { conectado, enviar, wsRef };
};