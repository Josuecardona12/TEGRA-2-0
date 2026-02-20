import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {

  const [ultimaActualizacion, setUltimaActualizacion] = useState("");

  const [produccionSemanal, setProduccionSemanal] = useState([
    { dia: "Lun", valor: 120 },
    { dia: "Mar", valor: 210 },
    { dia: "Mié", valor: 180 },
    { dia: "Jue", valor: 250 },
    { dia: "Vie", valor: 300 },
  ]);

  const [produccionPorArea, setProduccionPorArea] = useState([
    { area: "Producción", valor: 500 },
    { area: "Sublimado", valor: 320 },
    { area: "Calidad", valor: 200 },
    { area: "Logística", valor: 150 },
  ]);

  const [estadosOrdenes, setEstadosOrdenes] = useState([
    { name: "En Proceso", value: 14 },
    { name: "Pendientes", value: 6 },
    { name: "Completadas", value: 27 },
  ]);

  const [kpis, setKpis] = useState({
    produccionHoy: 1024,
    ordenesActivas: 11,
    pedidosEnviados: 27,
    eficiencia: 92
  });

  const colores = ["#2563eb", "#f59e0b", "#16a34a"];

  useEffect(() => {

    const actualizarDashboard = () => {

      setKpis(prev => ({
        produccionHoy: prev.produccionHoy + Math.floor(Math.random() * 20),
        ordenesActivas: Math.max(5, prev.ordenesActivas + Math.floor(Math.random() * 3 - 1)),
        pedidosEnviados: prev.pedidosEnviados + Math.floor(Math.random() * 2),
        eficiencia: Math.min(100, Math.max(85, prev.eficiencia + (Math.random() > 0.5 ? 1 : -1)))
      }));

      setProduccionSemanal(prev =>
        prev.map(d => ({
          ...d,
          valor: d.valor + Math.floor(Math.random() * 20 - 10)
        }))
      );

      setProduccionPorArea(prev =>
        prev.map(a => ({
          ...a,
          valor: Math.max(100, a.valor + Math.floor(Math.random() * 30 - 15))
        }))
      );

      const enProceso = Math.floor(Math.random() * 20) + 5;
      const pendientes = Math.floor(Math.random() * 10) + 3;
      const completadas = Math.floor(Math.random() * 40) + 20;

      setEstadosOrdenes([
        { name: "En Proceso", value: enProceso },
        { name: "Pendientes", value: pendientes },
        { name: "Completadas", value: completadas },
      ]);

      setUltimaActualizacion(new Date().toLocaleTimeString());
    };

    actualizarDashboard();
    const interval = setInterval(actualizarDashboard, 5000);
    return () => clearInterval(interval);

  }, []);

  return (
    <div className="dashboard-container">

      {/* Indicador en vivo */}
      <div className="live-container">
        <span className="live-dot">●</span>
        <span>Actualizando en tiempo real</span>
        <span className="update-time">
          Última actualización: {ultimaActualizacion}
        </span>
      </div>

      <h1>Dashboard General</h1>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPI titulo="Producción Hoy" valor={kpis.produccionHoy} />
        <KPI titulo="Órdenes Activas" valor={kpis.ordenesActivas} />
        <KPI titulo="Pedidos Enviados" valor={kpis.pedidosEnviados} />
        <KPI titulo="Eficiencia" valor={`${kpis.eficiencia}%`} />
      </div>

      {/* Gráficas */}
      <div className="charts-grid">

        {/* Producción Semanal */}
        <div className="chart-card">
          <h3>Producción Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={produccionSemanal}>
              <defs>
                <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />

              <Line
                type="monotone"
                dataKey="valor"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Producción por Área */}
        <div className="chart-card">
          <h3>Producción por Área</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={produccionPorArea}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />

              <Bar
                dataKey="valor"
                fill="#16a34a"
                radius={[10, 10, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Órdenes por Estado (Donut) */}
        <div className="chart-card">
          <h3>Órdenes por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={estadosOrdenes}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                animationDuration={800}
              >
                {estadosOrdenes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

function KPI({ titulo, valor }) {
  return (
    <div className="kpi-card">
      <h2>{valor}</h2>
      <p>{titulo}</p>
    </div>
  );
}