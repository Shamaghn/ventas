"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoProducto() {
  const router = useRouter();

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    precio: "",
    stock: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí irá el POST al backend
    console.log(form);

    router.push("/admin/inventario");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">

      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        Nuevo Producto
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4"
      >

        <div>
          <label className="block text-sm mb-1">Código</label>
          <input
            name="codigo"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            name="nombre"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Precio</label>
          <input
            name="precio"
            type="number"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Stock inicial</label>
          <input
            name="stock"
            type="number"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="flex gap-4">
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
