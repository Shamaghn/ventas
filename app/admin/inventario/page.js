"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { apiFetch } from "@/app/utils/api";

export default function NuevoProducto() {
  const router = useRouter();

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    precio_costo: "",
    precio_venta: "",
    stock_inicial: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/inventario/productos", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          stock_inicial: Number(form.stock_inicial)
        })
      });

      Swal.fire({
        icon: "success",
        title: "Producto creado",
        confirmButtonColor: "#ef4444"
      });

      router.push("/admin/inventario");
    } catch {
      Swal.fire("Error", "No se pudo crear el producto", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">

      <h1 className="text-xl font-bold mb-6">
        Nuevo Producto
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4"
      >

        <input
          name="codigo"
          placeholder="Código"
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          name="nombre"
          placeholder="Nombre"
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          name="precio_costo"
          type="number"
          placeholder="Precio de costo"
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="precio_venta"
          type="number"
          placeholder="Precio de venta"
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          name="stock_inicial"
          type="number"
          placeholder="Stock inicial"
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="border px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
}