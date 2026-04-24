"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/app/utils/api";

export default function MovimientoModal({ onClose, onSuccess }) {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    producto_id: "",
    tipo: "entrada",
    cantidad: "",
    motivo: ""
  });

  useEffect(() => {
    apiFetch("/inventario/productos")
      .then(setProductos)
      .catch(() =>
        Swal.fire("Error", "No se pudieron cargar los productos", "error")
      );
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/inventario/movimientos", {
        method: "POST",
        body: JSON.stringify(form)
      });

      Swal.fire({
        icon: "success",
        title: "Movimiento registrado",
        confirmButtonColor: "#ef4444"
      });

      onSuccess(); // refresca tabla
      onClose();
    } catch {
      Swal.fire("Error", "No se pudo registrar el movimiento", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">

        <h2 className="text-lg font-bold mb-4">
          Nuevo Movimiento
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <select
            name="producto_id"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Seleccione producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <select
            name="tipo"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="ajuste">Ajuste</option>
          </select>

          <input
            type="number"
            name="cantidad"
            placeholder="Cantidad"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            type="text"
            name="motivo"
            placeholder="Motivo (ej: Venta / Compra proveedor)"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}