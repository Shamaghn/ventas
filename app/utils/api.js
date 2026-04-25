export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:3001${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body || null,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "ERROR");
  }

  return res.json();
}