"use client";

import { useHealth } from "@/app/context/HealthContext";

export default function SystemBanner() {
  const { apiDown } = useHealth();

  if (!apiDown) return null;

  return (
    <div className="bg-yellow-500 text-black text-sm px-4 py-2 text-center">
      ⚠️ El sistema está en mantenimiento o sin conexión.
      Algunas funciones pueden no estar disponibles.
    </div>
  );
}