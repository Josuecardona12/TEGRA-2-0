import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ProduccionContext = createContext();

export const useProduccion = () => {
  const context = useContext(ProduccionContext);
  if (!context) {
    throw new Error('useProduccion must be used within ProduccionProvider');
  }
  return context;
};

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

  // ================ CONFIGURACIÓN DE ÁREAS (FLUJO LINEAL) ================
  const areas = useMemo(() => [
    { id: 'recepcion', nombre: 'Recepción', codigo: '9001', icono: '📦', color: '#3b82f6', orden: 1, siguiente: 'diseno' },
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

  const getLotesPorArea = useCallback((areaId) => {
    return lotes.filter(l => l.areaActual === areaId);
  }, [lotes]);

  const getTiempoEnArea = useCallback((lote) => {
    if (!lote || !lote.tiempos || !lote.tiempos[lote.areaActual]) return 0;
    const areaTime = lote.tiempos[lote.areaActual];
    if (!areaTime.entrada) return 0;
    const entrada = new Date(areaTime.entrada);
    const ahora = new Date();
    return Math.floor((ahora - entrada) / 60000);
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
    
    // Notificar a todas las ventanas
    const eventoGlobal = {
      type: 'NUEVO_EVENTO',
      payload: nuevoEvento
    };
    window.dispatchEvent(new CustomEvent('produccion-evento', { detail: eventoGlobal }));
  }, []);

  // ================ PROCESAR ESCANEO GLOBAL ================
  const procesarEscaneo = useCallback((codigo) => {
    // Verificar si es código de área (9001-9007)
    if (codigo.match(/^9\d{3}$/)) {
      const area = getAreaByCodigo(codigo);
      if (area) {
        agregarEvento('area', `📍 Área escaneada: ${area.nombre}`, null, area.id);
        setColaEscaneo(prev => {
          if (prev.lote) {
            procesarMovimiento(area, prev.lote);
            return { area: null, lote: null };
          }
          return { ...prev, area };
        });
        return area;
      }
    } else {
      // Buscar lote existente
      const lote = lotes.find(l => l.codigo === codigo || l.id === codigo);
      if (lote) {
        agregarEvento('lote', `📦 Lote escaneado: ${lote.codigo}`, lote.id);
        setColaEscaneo(prev => {
          if (prev.area) {
            procesarMovimiento(prev.area, lote);
            return { area: null, lote: null };
          }
          return { ...prev, lote };
        });
        return lote;
      } else {
        // Crear nuevo lote
        const nuevoLote = crearNuevoLote(codigo);
        agregarEvento('success', `🆕 Nuevo lote creado: ${codigo}`, nuevoLote.id);
        setColaEscaneo(prev => {
          if (prev.area) {
            procesarMovimiento(prev.area, nuevoLote);
            return { area: null, lote: null };
          }
          return { ...prev, lote: nuevoLote };
        });
        return nuevoLote;
      }
    }
    return null;
  }, [lotes, getAreaByCodigo, agregarEvento]);

  // ================ CREAR NUEVO LOTE ================
  const crearNuevoLote = useCallback((codigo) => {
    const nuevoId = `LOTE-${String(lotes.length + 1).padStart(3, '0')}`;
    const ahora = new Date().toISOString();
    
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
      historial: [{
        area: 'recepcion',
        codigoArea: '9001',
        fecha: ahora,
        timestamp: Date.now(),
        operador: 'Sistema',
        tipo: 'entrada',
        actual: true
      }],
      tiempos: {
        recepcion: {
          entrada: ahora
        }
      }
    };
    
    setLotes(prev => [...prev, nuevoLote]);
    return nuevoLote;
  }, [lotes]);

  // ================ PROCESAR MOVIMIENTO ================
  const procesarMovimiento = useCallback((area, lote) => {
    const areaInfo = getAreaById(area.id);
    const ahora = new Date().toISOString();
    
    // Verificar si ya hay un registro de entrada en esta área
    const yaTieneEntrada = lote.tiempos?.[area.id]?.entrada;
    
    setLotes(prev => prev.map(l => {
      if (l.id === lote.id) {
        const nuevoHistorial = [...(l.historial || [])];
        const nuevosTiempos = { ...(l.tiempos || {}) };
        
        if (!yaTieneEntrada) {
          // Es entrada al área
          nuevoHistorial.push({
            area: area.id,
            codigoArea: area.codigo,
            fecha: ahora,
            timestamp: Date.now(),
            operador: 'Operador',
            tipo: 'entrada',
            actual: true
          });
          
          if (!nuevosTiempos[area.id]) {
            nuevosTiempos[area.id] = {};
          }
          nuevosTiempos[area.id].entrada = ahora;
          
          agregarEvento('movimiento', `⏱️ ${l.codigo} ingresó a ${areaInfo.nombre}`, l.id, area.id);
          
        } else {
          // Es salida del área - mover a la siguiente
          nuevoHistorial.push({
            area: area.id,
            codigoArea: area.codigo,
            fecha: ahora,
            timestamp: Date.now(),
            operador: 'Operador',
            tipo: 'salida',
            actual: false
          });
          
          if (nuevosTiempos[area.id]) {
            nuevosTiempos[area.id].salida = ahora;
            const entrada = new Date(nuevosTiempos[area.id].entrada);
            const salida = new Date(ahora);
            nuevosTiempos[area.id].duracion = salida - entrada;
          }
          
          // Calcular progreso
          const areaIndex = areas.findIndex(a => a.id === area.id);
          const nuevoProgreso = Math.min(100, Math.round((areaIndex + 1) / areas.length * 100));
          
          // Determinar siguiente área
          const siguienteArea = areaInfo.siguiente;
          let nuevaArea = area.id;
          let nuevoEstado = l.estado;
          
          if (siguienteArea) {
            nuevaArea = siguienteArea;
            // Registrar entrada automática en la siguiente área
            nuevoHistorial.push({
              area: siguienteArea,
              codigoArea: areas.find(a => a.id === siguienteArea)?.codigo,
              fecha: ahora,
              timestamp: Date.now(),
              operador: 'Sistema (Automático)',
              tipo: 'entrada',
              actual: true
            });
            
            if (!nuevosTiempos[siguienteArea]) {
              nuevosTiempos[siguienteArea] = {};
            }
            nuevosTiempos[siguienteArea].entrada = ahora;
            
            agregarEvento('movimiento', `🚀 ${l.codigo} salió de ${areaInfo.nombre} → ${areas.find(a => a.id === siguienteArea)?.nombre}`, l.id, area.id);
          } else {
            nuevoEstado = 'completado';
            agregarEvento('success', `🎉 ${l.codigo} COMPLETADO - Fin del flujo`, l.id);
          }
          
          // Actualizar estadísticas
          setUltimoMovimiento({
            lote: l.codigo,
            area: areaInfo.nombre,
            fecha: new Date().toLocaleString(),
            tipo: 'salida'
          });
          
          return {
            ...l,
            areaActual: nuevaArea,
            estado: nuevoEstado,
            progreso: nuevoProgreso,
            historial: nuevoHistorial,
            tiempos: nuevosTiempos
          };
        }
        
        return {
          ...l,
          historial: nuevoHistorial,
          tiempos: nuevosTiempos
        };
      }
      return l;
    }));
    
    // Actualizar último movimiento si fue salida
    if (yaTieneEntrada) {
      setUltimoMovimiento({
        lote: lote.codigo,
        area: areaInfo.nombre,
        fecha: new Date().toLocaleString(),
        tipo: 'salida'
      });
    } else {
      setUltimoMovimiento({
        lote: lote.codigo,
        area: areaInfo.nombre,
        fecha: new Date().toLocaleString(),
        tipo: 'entrada'
      });
    }
    
    // Notificar a todas las ventanas
    const eventoGlobal = {
      type: 'MOVIMIENTO_LOTE',
      payload: {
        loteId: lote.id,
        loteCodigo: lote.codigo,
        areaOrigen: area.id,
        areaDestino: yaTieneEntrada ? areaInfo.siguiente : null,
        tipo: yaTieneEntrada ? 'salida' : 'entrada',
        timestamp: ahora
      }
    };
    window.dispatchEvent(new CustomEvent('produccion-actualizada', { detail: eventoGlobal }));
    
  }, [areas, getAreaById, agregarEvento]);

  // ================ MOVER LOTE MANUAL ================
  const moverLoteManual = useCallback((loteId, areaDestino) => {
    const lote = lotes.find(l => l.id === loteId);
    if (!lote) return;
    
    const areaDest = getAreaById(areaDestino);
    if (!areaDest) return;
    
    const ahora = new Date().toISOString();
    
    setLotes(prev => prev.map(l => {
      if (l.id === loteId) {
        const nuevoHistorial = [...(l.historial || [])];
        const nuevosTiempos = { ...(l.tiempos || {}) };
        
        // Marcar salida del área actual
        if (l.areaActual) {
          nuevoHistorial.push({
            area: l.areaActual,
            codigoArea: areas.find(a => a.id === l.areaActual)?.codigo,
            fecha: ahora,
            timestamp: Date.now(),
            operador: 'Sistema',
            tipo: 'salida',
            actual: false
          });
          
          if (nuevosTiempos[l.areaActual]) {
            nuevosTiempos[l.areaActual].salida = ahora;
          }
        }
        
        // Registrar entrada en nueva área
        nuevoHistorial.push({
          area: areaDestino,
          codigoArea: areaDest.codigo,
          fecha: ahora,
          timestamp: Date.now(),
          operador: 'Sistema',
          tipo: 'entrada',
          actual: true
        });
        
        if (!nuevosTiempos[areaDestino]) {
          nuevosTiempos[areaDestino] = {};
        }
        nuevosTiempos[areaDestino].entrada = ahora;
        
        // Calcular progreso
        const areaIndex = areas.findIndex(a => a.id === areaDestino);
        const nuevoProgreso = Math.min(100, Math.round((areaIndex + 1) / areas.length * 100));
        
        agregarEvento('movimiento', `🔄 Movimiento manual: ${l.codigo} → ${areaDest.nombre}`, l.id);
        
        return {
          ...l,
          areaActual: areaDestino,
          progreso: nuevoProgreso,
          historial: nuevoHistorial,
          tiempos: nuevosTiempos
        };
      }
      return l;
    }));
  }, [lotes, areas, getAreaById, agregarEvento]);

  // ================ ACTUALIZAR ESTADÍSTICAS ================
  useEffect(() => {
    const total = lotes.length;
    const enProceso = lotes.filter(l => l.estado === 'en_proceso').length;
    const completados = lotes.filter(l => l.estado === 'completado').length;
    const enCalidad = lotes.filter(l => l.areaActual === 'calidad').length;
    const eficiencia = total > 0 ? Math.round((completados / total) * 100) : 0;
    
    setEstadisticas({ totalLotes: total, enProceso, completados, enCalidad, eficiencia });
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
    getLotesPorArea,
    getTiempoEnArea,
    procesarEscaneo,
    moverLoteManual,
    agregarEvento
  };

  return (
    <ProduccionContext.Provider value={value}>
      {children}
    </ProduccionContext.Provider>
  );
};