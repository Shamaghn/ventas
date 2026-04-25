import express from "express";
import cors from "cors";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { verifyToken } from "./middleware/auth.js";
import { JWT_SECRET } from "./config/jwt.js";

/* 🔥 DEBUG */
console.log("🔥 ESTE server.js SE ESTÁ EJECUTANDO 🔥");

/* =====================
   APP
===================== */
const app = express();
app.use(cors());
app.use(express.json());

/* =====================
   DB
===================== */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "saas_db",
});

/* =====================
   AUDITORÍA GENÉRICA
===================== */
function registrarAuditoria(user, accion, entidad, entidadId) {
  db.query(
    `INSERT INTO auditoria
     (empresa_id, usuario_id, accion, entidad, entidad_id)
     VALUES (?, ?, ?, ?, ?)`,
    [user.empresa_id, user.id, accion, entidad, entidadId]
  );
}

/* =====================
   TEST
===================== */
app.get("/", (req, res) => {
  res.send("API FUNCIONANDO 🚀");
});

/* =====================
   LOGIN
===================== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err || result.length === 0)
        return res.status(401).json({ success: false });

      const user = result[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ success: false });

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          empresa_id: user.empresa_id,
        },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          empresa_id: user.empresa_id,
        },
      });
    }
  );
});

/* =====================
   INVENTARIO - PRODUCTOS
===================== */
app.get("/inventario/productos", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM productos WHERE empresa_id = ?",
    [req.user.empresa_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

/* =====================
   INVENTARIO - MOVIMIENTOS
===================== */
app.get("/inventario/movimientos", verifyToken, (req, res) => {
  db.query(
    `
    SELECT m.id,
           m.tipo,
           m.cantidad,
           m.fecha,
           p.nombre AS producto
    FROM movimientos_inventario m
    JOIN productos p ON p.id = m.producto_id
    WHERE m.empresa_id = ?
    ORDER BY m.fecha DESC
    `,
    [req.user.empresa_id],
    (err, rows) => {
      if (err) {
        console.error("❌ ERROR MOVIMIENTOS:", err);
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

/* =====================
   AUDITORÍA DE INVENTARIO ✅
===================== */
app.get("/inventario/auditoria", verifyToken, (req, res) => {
  db.query(
    `
    SELECT
      p.id AS producto_id,
      p.nombre AS producto,
      p.stock_actual AS stock_sistema,
      IFNULL(
        SUM(
          CASE 
            WHEN UPPER(TRIM(m.tipo)) = 'ENTRADA' THEN m.cantidad
            WHEN UPPER(TRIM(m.tipo)) = 'SALIDA'  THEN -m.cantidad
            ELSE 0
          END
        ),
        0
      ) AS stock_calculado,
      p.stock_actual -
      IFNULL(
        SUM(
          CASE 
            WHEN UPPER(TRIM(m.tipo)) = 'ENTRADA' THEN m.cantidad
            WHEN UPPER(TRIM(m.tipo)) = 'SALIDA'  THEN -m.cantidad
            ELSE 0
          END
        ),
        0
      ) AS diferencia
    FROM productos p
    LEFT JOIN movimientos_inventario  m
      ON m.producto_id = p.id
      AND m.empresa_id = p.empresa_id
    WHERE p.empresa_id = ?
    GROUP BY p.id, p.nombre, p.stock_actual
    ORDER BY p.nombre
    `,
    [req.user.empresa_id],
    (err, rows) => {
      if (err) {
        console.error("❌ ERROR AUDITORÍA:", err);
        return res.status(500).json(err);
      }
      res.json(rows);
    }
  );
});

/* =====================
   SERVER
===================== */
app.listen(3001, () => {
  console.log("✅ API corriendo en http://localhost:3001");
});