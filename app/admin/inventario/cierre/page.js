"use client";

import Swal from "sweetalert2";
import { apiFetch } from "@/app/utils/api";

export default function CierreInventarioPage() {
  const realizarCierre = async () => {
    const { value } = await Swal.fire({
      title: "Cierre mensual",
      text: "Ingresa mes (YYYY-MM)",
      input: "text",
      showCancelButton: true,
    });

    if (value) {
      await apiFetch("/inventario/cierre", {
        method: "POST",
        body: JSON.stringify({ mes: value }),
      });

      Swal.fire("Cierre realizado", "", "success");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Cierre Mensual de Inventario
      </h2>

      <button
        onClick={realizarCierre}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Ejecutar cierre
      </button>
    </div>
  );
}
``