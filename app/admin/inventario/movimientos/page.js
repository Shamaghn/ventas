"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/utils/api";
import MovimientoModal from "@/app/components/inventario/MovimientoModal";

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [open, setOpen] = useState(false);

  // ✅ Filtros
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // ✅ Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 50;

  const cargarMovimientos = async () => {
    const data = await apiFetch("/inventario/movimientos");
    setMovimientos(data);
    setPaginaActual(1);
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  /* =====================
     FILTRADO
  ===================== */
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const texto =
        `${m.producto} ${m.usuario} ${m.motivo}`.toLowerCase();
      const cumpleTexto = texto.includes(busqueda.toLowerCase());

      const fechaMovimiento = new Date(m.fecha);
      const cumpleDesde = fechaDesde
        ? fechaMovimiento >= new Date(fechaDesde)
        : true;
      const cumpleHasta = fechaHasta
        ? fechaMovimiento <= new Date(fechaHasta)
        : true;

      return cumpleTexto && cumpleDesde && cumpleHasta;
    });
  }, [movimientos, busqueda, fechaDesde, fechaHasta]);

  /* =====================
     PAGINACIÓN
  ===================== */
  const totalPaginas = Math.ceil(
    movimientosFiltrados.length / porPagina
  );

  const inicio = (paginaActual - 1) * porPagina;
  const visibles = movimientosFiltrados.slice(
    inicio,
    inicio + porPagina
  );

  /* =====================
     EXPORTAR CSV
  ===================== */
  const exportarCSV = () => {
    const encabezado = [
      "Fecha",
      "Producto",
      "Tipo",
      "Cantidad",
      "Motivo",
      "Usuario",
    ];

    const filas = movimientosFiltrados.map((m) => [
      new Date(m.fecha).toLocaleDateString(),
      m.producto,
      m.tipo,
      m.cantidad,
      m.motivo,
      m.usuario,
    ]);

    const csv =
      [encabezado, ...filas]
        .map((fila) => fila.join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "movimientos_inventario.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  /* =====================
     RESUMEN ENTRADAS / SALIDAS
  ===================== */
  const resumen = useMemo(() => {
    let entradas = 0;
    let salidas = 0;

    movimientosFiltrados.forEach((m) => {
      if (m.tipo === "entrada") entradas += m.cantidad;
      if (m.tipo === "salida") salidas += m.cantidad;
    });

    return { entradas, salidas };
  }, [movimientosFiltrados]);

  return (
    <div className="p-6 space-y-4">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Movimientos de Inventario
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            + Movimiento
          </button>
        </div>
      </div>

      {open && (
        <MovimientoModal
          onClose={() => setOpen(false)}
          onSuccess={cargarMovimientos}
        />
      )}

      {/* FILTROS */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Buscar producto, motivo, usuario..."
          className="border px-3 py-2 rounded"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
        />
      </div>

      {/* RESUMEN */}
      <div className="bg-white p-4 rounded shadow flex gap-8">
        <div>
          <p className="text-gray-500 text-sm">Entradas</p>
          <p className="text-xl font-bold text-green-600">
            +{resumen.entradas}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Salidas</p>
          <p className="text-xl font-bold text-red-600">
            -{resumen.salidas}
          </p>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Producto</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-right">Cantidad</th>
              <th className="p-3">Motivo</th>
              <th className="p-3">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((m) => (
              <tr
                key={m.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">
                  {new Date(m.fecha).toLocaleDateString()}
                </td>
                <td className="p-3">{m.producto}</td>
                <td className="p-3 capitalize">{m.tipo}</td>
                <td className="p-3 text-right font-medium">
                  {m.tipo === "salida" ? "-" : "+"}
                  {m.cantidad}
                </td>
                <td className="p-3">{m.motivo}</td>
                <td className="p-3">{m.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              setPaginaActual((p) => Math.max(p - 1, 1))
            }
            className="px-4 py-2 border rounded"
            disabled={paginaActual === 1}
          >
            ◀ Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
            onClick={() =>
              setPaginaActual((p) =>
                Math.min(p + 1, totalPaginas)
              )
            }
            className="px-4 py-2 border rounded"
            disabled={paginaActual === totalPaginas}
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
}