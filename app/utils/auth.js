export const isAuth = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("token");
};

export const getRole = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
};