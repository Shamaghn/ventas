// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "Token no proporcionado" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ msg: "Formato de token inválido" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
}