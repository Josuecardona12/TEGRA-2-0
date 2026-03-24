// context/ProduccionContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

const ProduccionContext = createContext();

export const useProduccion = () => {
  const context = useContext(ProduccionContext);
  if (!context) {
    throw new Error('useProduccion must be used within ProduccionProvider');
  }
  return context;
};

const WS_URL = 'https://miniature-adventure-v6q4r64gqq7qfr67-8080.app.github.dev/';

export const ProduccionProvider = ({ children }) => {
  // ================ ESTADOS GLOBALES ================
  const [lotes, setLotes] = useState([]);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [colaEscaneo, setColaEscaneo] = useState({ area: null, lote: null });
  const [estadisticas, setEstadisticas] = useState({
    totalLotes: 0,
    enProceso: 0,
    completados: 0,
    enCalidad: 0,
    eficiencia: 0
  });

  const wsRef = useRef(null);

  // ================ ÁREAS EN ORDEN LINEAL (FLUJO PRINCIPAL) ================
  const areas = useMemo(() => [
    { id: 'recepcion', nombre: 'Recepción', codigo: '9001', icono: '📦', color: '#3b82f6', orden: 1, siguiente: 'diseno', anterior: null },
    { id: 'diseno', nombre: 'Diseño', codigo: '9002', icono: '🎨', color: '#8b5cf6', orden: 2, siguiente: 'plotter', anterior: 'recepcion' },
    { id: 'plotter', nombre: 'Plotter', codigo: '9003', icono: '🖨️', color: '#ec4899', orden: 3, siguiente: 'corte', anterior: 'diseno' },
    { id: 'corte', nombre: 'Corte', codigo: '9004', icono: '✂️', color: '#f59e0b', orden: 4, siguiente: 'sublimado', anterior: 'plotter' },
    { id: 'sublimado', nombre: 'Sublimado', codigo: '9005', icono: '🔥', color: '#10b981', orden: 5, siguiente: 'calidad', anterior: 'corte' },
    { id: 'calidad', nombre: 'Control Calidad', codigo: '9006', icono: '✅', color: '#a855f7', orden: 6, siguiente: 'almacen', anterior: 'sublimado' },
    { id: 'almacen', nombre: 'Almacén', codigo: '9007', icono: '🏢', color: '#14b8a6', orden: 7, siguiente: null, anterior: 'calidad' }
  ], []);

  // ================ FUNCIONES AUXILIARES ================
  const getAreaById = useCallback((areaId) => {
    return areas.find(a => a.id === areaId);
  }, [areas]);

  const getAreaByCodigo = useCallback((codigo) => {
    return areas.find(a => a.codigo === codigo);
  }, [areas]);

  const getAreaSiguiente = useCallback((areaActual) => {
    const area = getAreaById(areaActual);
    if (!area || !area.siguiente) return null;
    return getAreaById(area.siguiente);
  }, [getAreaById]);

  const getAreaAnterior = useCallback((areaActual) => {
    const area = getAreaById(areaActual);
    if (!area || !area.anterior) return null;
    return getAreaById(area.anterior);
  }, [getAreaById]);

  // ================ WEB SOCKET ================
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ WebSocket conectado');
      setConectado(true);
      agregarEvento('success', '✅ Conectado al servidor', null, null);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ACTUALIZACION' && data.data) {
          if (data.data.lotes) setLotes(data.data.lotes);
          if (data.data.ultimoMovimiento) setUltimoMovimiento(data.data.ultimoMovimiento);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onclose = () => {
      setConectado(false);
    };
    
    return () => ws.close();
  }, []);

  const enviarAlServidor = useCallback((tipo, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: tipo, payload }));
    }
  }, []);

  // ================ AGREGAR EVENTO ================
  const agregarEvento = useCallback((tipo, mensaje, loteId = null, areaId = null) => {
    const nuevoEvento = {
      id: Date.now(),
      tipo,
      mensaje,
      loteId,
      areaId,
      timestamp: new Date().toLocaleTimeString()
    };
    setEventos(prev => [nuevoEvento, ...prev.slice(0, 99)]);
  }, []);

  // ================ CREAR NUEVO LOTE (Siempre comienza en RECEPCIÓN) ================
  const crearNuevoLote = useCallback((codigo) => {
    const nuevoId = `LOTE-${String(lotes.length + 1).padStart(3, '0')}`;
    const ahora = new Date().toISOString();
    const areaInicial = areas.find(a => a.id === 'recepcion');
    
    const nuevoLote = {
      id: nuevoId,
      codigo: codigo,
      producto: 'Producto',
      cliente: 'Cliente',
      cantidad: Math.floor(Math.random() * 500) + 100,
      fechaInicio: ahora,
      estado: 'en_proceso',
      areaActual: 'recepcion',
      progreso: 5,
      prioridad: 'media',
      responsable: 'Sistema',
      reingresos: [], // Historial de reingresos
      historial: [{
        area: 'recepcion',
        codigoArea: areaInicial.codigo,
        fecha: ahora,
        timestamp: Date.now(),
        operador: 'Sistema',
        tipo: 'entrada',
        actual: true
      }],
      tiempos: {
        recepcion: { entrada: ahora }
      }
    };
    
    setLotes(prev => [...prev, nuevoLote]);
    agregarEvento('success', `🆕 Nuevo lote creado: ${codigo} en Recepción`, nuevoLote.id);
    enviarAlServidor('NUEVO_LOTE', { lote: nuevoLote });
    return nuevoLote;
  }, [lotes, areas, agregarEvento, enviarAlServidor]);

  // ================ MOVER LOTE (FLUJO LINEAL CON REINGRESO) ================
  const moverLote = useCallback((area, lote) => {
    const areaInfo = getAreaById(area.id);
    const ahora = new Date().toISOString();
    const yaEstabaEnArea = lote.areaActual === area.id;
    
    // Si ya está en esta área, es un REINGRESO (no avanza, solo registra paso)
    const esReingreso = yaEstabaEnArea;
    
    setLotes(prev => prev.map(l => {
      if (l.id === lote.id) {
        const nuevoHistorial = [...(l.historial || [])];
        const nuevosTiempos = { ...(l.tiempos || {}) };
        const nuevosReingresos = [...(l.reingresos || [])];
        
        if (esReingreso) {
          // REGISTRAR REINGRESO
          nuevoHistorial.push({
            area: area.id,
            codigoArea: area.codigo,
            fecha: ahora,
            timestamp: Date.now(),
            operador: 'Operador',
            tipo: 'reingreso',
            actual: true,
            reingresoNumero: (l.reingresos?.filter(r => r.area === area.id).length || 0) + 1
          });
          
          nuevosReingresos.push({
            area: area.id,
            fecha: ahora,
            timestamp: Date.now(),
            numero: (l.reingresos?.filter(r => r.area === area.id).length || 0) + 1
          });
          
          agregarEvento('warning', `↩️ REINGRESO: ${l.codigo} vuelve a ${areaInfo.nombre} (${nuevosReingresos.filter(r => r.area === area.id).length}ª vez)`, l.id, area.id);
          
        } else {
          // SALIDA DEL ÁREA ACTUAL
          if (l.areaActual && nuevosTiempos[l.areaActual]) {
            nuevosTiempos[l.areaActual].salida = ahora;
            const entrada = new Date(nuevosTiempos[l.areaActual].entrada);
            const salida = new Date(ahora);
            nuevosTiempos[l.areaActual].duracion = salida - entrada;
          }
          
          // Registrar salida
          nuevoHistorial.push({
            area: l.areaActual,
            codigoArea: getAreaById(l.areaActual)?.codigo,
            fecha: ahora,
            timestamp: Date.now(),
            operador: 'Operador',
            tipo: 'salida',
            actual: false
          });
          
          // DETERMINAR SIGUIENTE ÁREA (FLUJO LINEAL)
          const areaSiguiente = getAreaSiguiente(area.id);
          
          if (areaSiguiente) {
            // MOVER A LA SIGUIENTE ÁREA
            nuevoHistorial.push({
              area: areaSiguiente.id,
              codigoArea: areaSiguiente.codigo,
              fecha: ahora,
              timestamp: Date.now(),
              operador: 'Operador',
              tipo: 'entrada',
              actual: true
            });
            
            if (!nuevosTiempos[areaSiguiente.id]) {
              nuevosTiempos[areaSiguiente.id] = {};
            }
            nuevosTiempos[areaSiguiente.id].entrada = ahora;
            
            // Calcular progreso
            const areaIndex = areas.findIndex(a => a.id === areaSiguiente.id);
            const nuevoProgreso = Math.min(100, Math.round((areaIndex + 1) / areas.length * 100));
            
            agregarEvento('movimiento', `🚀 ${l.codigo} → ${areaSiguiente.nombre}`, l.id, areaSiguiente.id);
            
            return {
              ...l,
              areaActual: areaSiguiente.id,
              progreso: nuevoProgreso,
              historial: nuevoHistorial,
              tiempos: nuevosTiempos,
              reingresos: nuevosReingresos
            };
            
          } else {
            // LOTE COMPLETADO (Llegó al final del flujo)
            agregarEvento('success', `🎉 ${l.codigo} COMPLETADO - Fin del proceso`, l.id);
            
            return {
              ...l,
              estado: 'completado',
              progreso: 100,
              historial: nuevoHistorial,
              tiempos: nuevosTiempos,
              reingresos: nuevosReingresos
            };
          }
        }
        
        return {
          ...l,
          historial: nuevoHistorial,
          tiempos: nuevosTiempos,
          reingresos: nuevosReingresos
        };
      }
      return l;
    }));
    
    // Actualizar último movimiento
    setUltimoMovimiento({
      lote: lote.codigo,
      area: areaInfo.nombre,
      fecha: new Date().toLocaleString(),
      tipo: esReingreso ? 'reingreso' : 'movimiento'
    });
    
    // Notificar a todos los clientes
    enviarAlServidor('ACTUALIZACION', { lotes: lotes.map(l => l.id === lote.id ? { ...l, areaActual: area.id } : l) });
    
  }, [areas, getAreaById, getAreaSiguiente, agregarEvento, enviarAlServidor]);

  // ================ PROCESAR ESCANEO (TRZ como centro de control) ================
  const procesarEscaneo = useCallback((codigo) => {
    const codigoLimpio = codigo.trim().toUpperCase();
    
    // Verificar si es código de área (9001-9007)
    if (codigoLimpio.match(/^9\d{3}$/)) {
      const area = getAreaByCodigo(codigoLimpio);
      if (area) {
        agregarEvento('area', `📍 Área escaneada: ${area.nombre}`, null, area.id);
        setColaEscaneo(prev => {
          if (prev.lote) {
            moverLote(area, prev.lote);
            return { area: null, lote: null };
          }
          return { ...prev, area };
        });
        return area;
      }
    } else {
      // Buscar lote existente
      const lote = lotes.find(l => l.codigo === codigoLimpio || l.id === codigoLimpio);
      if (lote) {
        agregarEvento('lote', `📦 Lote escaneado: ${lote.codigo} (Área actual: ${getAreaById(lote.areaActual)?.nombre})`, lote.id);
        setColaEscaneo(prev => {
          if (prev.area) {
            moverLote(prev.area, lote);
            return { area: null, lote: null };
          }
          return { ...prev, lote };
        });
        return lote;
      } else {
        // Crear nuevo lote (empieza en Recepción)
        const nuevoLote = crearNuevoLote(codigoLimpio);
        agregarEvento('success', `🆕 Nuevo lote creado: ${codigoLimpio}`, nuevoLote.id);
        
        setColaEscaneo(prev => {
          if (prev.area) {
            moverLote(prev.area, nuevoLote);
            return { area: null, lote: null };
          }
          return { ...prev, lote: nuevoLote };
        });
        return nuevoLote;
      }
    }
    return null;
  }, [lotes, getAreaByCodigo, getAreaById, agregarEvento, moverLote, crearNuevoLote]);

  // ================ ACTUALIZAR ESTADÍSTICAS ================
  useEffect(() => {
    const total = lotes.length;
    const enProceso = lotes.filter(l => l.estado === 'en_proceso').length;
    const completados = lotes.filter(l => l.estado === 'completado').length;
    const enCalidad = lotes.filter(l => l.areaActual === 'calidad').length;
    const reingresosTotales = lotes.reduce((sum, l) => sum + (l.reingresos?.length || 0), 0);
    const eficiencia = total > 0 ? Math.round((completados / total) * 100) : 0;
    
    setEstadisticas({ 
      totalLotes: total, 
      enProceso, 
      completados, 
      enCalidad, 
      eficiencia,
      reingresosTotales
    });
  }, [lotes]);

  // ================ VALOR DEL CONTEXTO ================
  const value = {
    lotes,
    areas,
    ultimoMovimiento,
    eventos,
    conectado,
    colaEscaneo,
    estadisticas,
    getAreaById,
    getAreaByCodigo,
    getAreaSiguiente,
    getAreaAnterior,
    getLotesPorArea: (areaId) => lotes.filter(l => l.areaActual === areaId),
    getTiempoEnArea: (lote) => {
      if (!lote || !lote.tiempos || !lote.tiempos[lote.areaActual]) return 0;
      const entrada = new Date(lote.tiempos[lote.areaActual].entrada);
      const ahora = new Date();
      return Math.floor((ahora - entrada) / 60000);
    },
    procesarEscaneo,
    moverLoteManual: moverLote,
    agregarEvento
  };

  return (
    <ProduccionContext.Provider value={value}>
      {children}
    </ProduccionContext.Provider>
  );
};