// src/hooks/useTrazabilidadWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// CONFIGURACIÓN CENTRAL - MISMA PARA TODAS
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

// Eventos globales
export const EVENTOS = {
  INIT: 'INIT',
  ACTUALIZACION: 'ACTUALIZACION',
  MOVIMIENTO: 'MOVIMIENTO',
  NUEVO_LOTE: 'NUEVO_LOTE',
  ESCANEO: 'ESCANEO',
  ASIGNACION: 'ASIGNACION',
  FINALIZACION: 'FINALIZACION'
};

export const useTrazabilidadWebSocket = (nombreInterfaz, onMessageCallback) => {
  const [conectado, setConectado] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const [lotesGlobales, setLotesGlobales] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    console.log(`🔌 ${nombreInterfaz} conectando...`);
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log(`✅ ${nombreInterfaz} conectado`);
      setConectado(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`📦 ${nombreInterfaz} recibió:`, data.type);
        
        // Actualizar estado global
        if (data.type === EVENTOS.INIT || data.type === EVENTOS.ACTUALIZACION) {
          setLotesGlobales(data.data.lotes || []);
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
          }
        }
        
        // Llamar al callback específico de cada interfaz
        if (onMessageCallback) {
          onMessageCallback(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error(`❌ ${nombreInterfaz} error:`, error);
      setConectado(false);
    };
    
    ws.onclose = () => {
      console.log(`❌ ${nombreInterfaz} desconectado`);
      setConectado(false);
    };
    
    return () => ws.close();
  }, [nombreInterfaz]);

  // Función para enviar mensajes al servidor
  const enviar = useCallback((tipo, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: tipo, payload }));
      return true;
    }
    return false;
  }, []);

  // Función para escanear un lote (TODAS las interfaces la usan)
  const escanearLote = useCallback((codigo) => {
    enviar(EVENTOS.ESCANEO, { codigo, timestamp: Date.now() });
  }, [enviar]);

  // Función para mover un lote
  const moverLote = useCallback((loteId, area) => {
    enviar(EVENTOS.MOVIMIENTO, { loteId, area, timestamp: Date.now() });
  }, [enviar]);

  // Función para asignar a máquina
  const asignarMaquina = useCallback((loteId, maquinaId, area) => {
    enviar(EVENTOS.ASIGNACION, { loteId, maquinaId, area, timestamp: Date.now() });
  }, [enviar]);

  // Función para finalizar lote
  const finalizarLote = useCallback((loteId) => {
    enviar(EVENTOS.FINALIZACION, { loteId, timestamp: Date.now() });
  }, [enviar]);

  return {
    conectado,
    ultimoMovimiento,
    lotesGlobales,
    enviar,
    escanearLote,
    moverLote,
    asignarMaquina,
    finalizarLote,
    wsRef
  };
};