"use client";

import { useEffect } from "react";
import { isAuth } from "../utils/auth";

export default function Dashboard() {
  useEffect(() => {
    if (!isAuth()) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="container mt-4">
      <h1>Dashboard General</h1>
    </div>
  );
}