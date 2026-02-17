import { useEffect, useState } from "react";
import "./Ordenes.css";


export default function DashboardOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ordenEditando, setOrdenEditando] = useState(null);

  const [formOrden, setFormOrden] = useState({
    cliente: "",
    producto: "",
    cantidad: "",
    estado: "Pendiente"
  });

  // ==============================
  // OBTENER ORDENES
  // ==============================
  const obtenerOrdenes = async () => {
    try {
      const res = await fetch("http://localhost:8000/ordenes");
      const data = await res.json();
      setOrdenes(data);
    } catch (error) {
      console.error("Error obteniendo órdenes:", error);
    }
  };

  useEffect(() => {
    obtenerOrdenes();

    const interval = setInterval(() => {
      obtenerOrdenes();
    }, 5000); // refresco automático cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // ==============================
  // CREAR / EDITAR ORDEN
  // ==============================
  const guardarOrden = async (e) => {
    e.preventDefault();

    const metodo = ordenEditando ? "PUT" : "POST";
    const url = ordenEditando
      ? `http://localhost:8000/ordenes/${ordenEditando.id}`
      : "http://localhost:8000/ordenes";

    try {
      await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formOrden)
      });

      setMostrarModal(false);
      setOrdenEditando(null);
      setFormOrden({
        cliente: "",
        producto: "",
        cantidad: "",
        estado: "Pendiente"
      });

      obtenerOrdenes();
    } catch (error) {
      console.error("Error guardando orden:", error);
    }
  };

  // ==============================
  // EDITAR
  // ==============================
  const editarOrden = (orden) => {
    setOrdenEditando(orden);
    setFormOrden(orden);
    setMostrarModal(true);
  };

  // ==============================
  // ELIMINAR
  // ==============================
  const eliminarOrden = async (id) => {
    if (!window.confirm("¿Eliminar esta orden?")) return;

    try {
      await fetch(`http://localhost:8000/ordenes/${id}`, {
        method: "DELETE"
      });

      obtenerOrdenes();
    } catch (error) {
      console.error("Error eliminando orden:", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Órdenes de Producción</h1>

      <button className="btn-nueva" onClick={() => setMostrarModal(true)}>
        + Nueva Orden
      </button>

      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden.id}>
              <td>{orden.cliente}</td>
              <td>{orden.producto}</td>
              <td>{orden.cantidad}</td>
              <td>{orden.estado}</td>
              <td>
                <button
                  className="btn-editar"
                  onClick={() => editarOrden(orden)}
                >
                  Editar
                </button>

                <button
                  className="btn-eliminar"
                  onClick={() => eliminarOrden(orden.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==========================
          MODAL
      ========================== */}
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{ordenEditando ? "Editar Orden" : "Nueva Orden"}</h2>

            <form onSubmit={guardarOrden}>
              <input
                type="text"
                placeholder="Cliente"
                value={formOrden.cliente}
                onChange={(e) =>
                  setFormOrden({ ...formOrden, cliente: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Producto"
                value={formOrden.producto}
                onChange={(e) =>
                  setFormOrden({ ...formOrden, producto: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Cantidad"
                value={formOrden.cantidad}
                onChange={(e) =>
                  setFormOrden({ ...formOrden, cantidad: e.target.value })
                }
                required
              />

              <select
                value={formOrden.estado}
                onChange={(e) =>
                  setFormOrden({ ...formOrden, estado: e.target.value })
                }
              >
                <option>Pendiente</option>
                <option>En Producción</option>
                <option>Finalizado</option>
              </select>

              <div className="modal-buttons">
                <button type="submit" className="btn-guardar">
                  {ordenEditando ? "Actualizar" : "Guardar"}
                </button>

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => {
                    setMostrarModal(false);
                    setOrdenEditando(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
