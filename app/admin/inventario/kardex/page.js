"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/utils/api";

export default function KardexPage() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    apiFetch("/inventario/productos").then(setProductos);
    apiFetch("/inventario/movimientos").then(setMovimientos);
  }, []);

  const movimientosFiltrados = useMemo(() => {
    let saldo = 0;

    return movimientos
      .filter((m) =>
        productoId ? m.producto_id === Number(productoId) : true
      )
      .filter((m) => {
        const f = new Date(m.fecha);
        return (
          (!desde || f >= new Date(desde)) &&
          (!hasta || f <= new Date(hasta))
        );
      })
      .map((m) => {
        if (m.tipo === "entrada") saldo += m.cantidad;
        if (m.tipo === "salida") saldo -= m.cantidad;

        return { ...m, saldo };
      });
  }, [movimientos, productoId, desde, hasta]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Kardex por Producto</h2>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          className="border p-2 rounded"
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
        >
          <option value="">Todos los productos</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
      </div>

      {/* TABLA KARDEX */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-right">Entrada</th>
              <th className="p-3 text-right">Salida</th>
              <th className="p-3 text-right">Saldo</th>
              <th className="p-3 text-left">Motivo</th>
              <th className="p-3 text-left">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">
                  {new Date(m.fecha).toLocaleDateString()}
                </td>
                <td className="p-3 capitalize">{m.tipo}</td>
                <td className="p-3 text-right">
                  {m.tipo === "entrada" ? m.cantidad : ""}
                </td>
                <td className="p-3 text-right">
                  {m.tipo === "salida" ? m.cantidad : ""}
                </td>
                <td className="p-3 text-right font-medium">
                  {m.saldo}
                </td>
                <td className="p-3">{m.motivo}</td>
                <td className="p-3">{m.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
