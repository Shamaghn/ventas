import express from "express";
import cors from "cors";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { verifyToken } from "./middleware/auth.js";
import { JWT_SECRET } from "./config/jwt.js";

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
   FUNCIÓN AUDITORÍA
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
   LOGIN (bcrypt)
===================== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err || result.length === 0) {
        return res.status(401).json({ success: false });
      }

      const user = result[0];
      const ok = await bcrypt.compare(password, user.password);

      if (!ok) {
        return res.status(401).json({ success: false });
      }

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
        },
      });
    }
  );
});

/* =====================
   USUARIOS – CRUD + AUDITORÍA
===================== */

/* LISTAR USUARIOS */
app.get("/usuarios", verifyToken, (req, res) => {
  db.query(
    `SELECT id, email, role
     FROM users
     WHERE empresa_id = ?`,
    [req.user.empresa_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

/* CREAR USUARIO */
app.post("/usuarios", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "No autorizado" });
  }

  const { email, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  db.query(
    `INSERT INTO users (empresa_id, email, password, role)
     VALUES (?, ?, ?, ?)`,
    [req.user.empresa_id, email, passwordHash, role],
    (err, result) => {
      if (err) return res.status(500).json(err);

      registrarAuditoria(
        req.user,
        "CREAR",
        "USUARIO",
        result.insertId
      );

      res.json({ msg: "Usuario creado" });
    }
  );
});

/* EDITAR USUARIO */
app.put("/usuarios/:id", verifyToken, (req, res) => {
  const { email, role } = req.body;

  db.query(
    `UPDATE users
     SET email = ?, role = ?
     WHERE id = ? AND empresa_id = ?`,
    [email, role, req.params.id, req.user.empresa_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      registrarAuditoria(
        req.user,
        "EDITAR",
        "USUARIO",
        req.params.id
      );

      res.json({ msg: "Usuario actualizado" });
    }
  );
});

/* ELIMINAR USUARIO */
app.delete("/usuarios/:id", verifyToken, (req, res) => {
  db.query(
    `DELETE FROM users
     WHERE id = ? AND empresa_id = ?`,
    [req.params.id, req.user.empresa_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      registrarAuditoria(
        req.user,
        "ELIMINAR",
        "USUARIO",
        req.params.id
      );

      res.json({ msg: "Usuario eliminado" });
    }
  );
});

/* =====================
   SERVER
===================== */
app.listen(3001, () => {
  console.log("API corriendo en http://localhost:3001");
});