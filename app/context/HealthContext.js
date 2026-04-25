"use client";

import { createContext, useContext, useState } from "react";

const HealthContext = createContext();

export function HealthProvider({ children }) {
  const [apiDown, setApiDown] = useState(false);

  return (
    <HealthContext.Provider value={{ apiDown, setApiDown }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  return useContext(HealthContext);
}