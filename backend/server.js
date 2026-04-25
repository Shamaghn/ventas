import express from "express";
import cors from "cors";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { verifyToken } from "./middleware/auth.js";
import { JWT_SECRET } from "./config/jwt.js";

console.log("🔥 server.js ejecutándose");

/* =====================
   APP
===================== */
const app = express();
app.use(cors());
app.use(express.json()); // 👈 CLAVE: parsea JSON UNA sola vez

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
   LOGIN
===================== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(401).json({ msg: "Credenciales inválidas" });
      }

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ msg: "Credenciales inválidas" });

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          empresa_id: user.empresa_id,
        },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ token });
    }
  );
});

/* =====================
   INVENTARIO - MOVIMIENTOS
===================== */
app.get("/inventario/movimientos", verifyToken, (req, res) => {
  db.query(
    `
    SELECT id, producto_id, tipo, cantidad, fecha
    FROM movimientos_inventario
    WHERE empresa_id = ?
    ORDER BY fecha DESC
    `,
    [req.user.empresa_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

/* =====================
   ✅ FINALIZAR VENTA (COMPRA)
===================== */
app.post("/ventas/finalizar", verifyToken, (req, res) => {
  const { cliente_id, total, items } = req.body;

  // 👇 VALIDACIÓN BÁSICA
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Items inválidos" });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json(err);

    // 1️⃣ Insertar venta
    db.query(
      `
      INSERT INTO ventas (empresa_id, usuario_id, cliente_id, total)
      VALUES (?, ?, ?, ?)
      `,
      [req.user.empresa_id, req.user.id, cliente_id, total],
      (err, ventaRes) => {
        if (err) return db.rollback(() => res.status(500).json(err));

        const ventaId = ventaRes.insertId;

        // 2️⃣ Insertar detalle + movimientos
        const detalleQueries = items.map((item) => {
          return new Promise((resolve, reject) => {
            // detalle_ventas
            db.query(
              `
              INSERT INTO detalle_ventas
              (venta_id, producto_id, cantidad, precio)
              VALUES (?, ?, ?, ?)
              `,
              [ventaId, item.producto_id, item.cantidad, item.precio],
              (err) => {
                if (err) return reject(err);

                // movimiento inventario
                db.query(
                  `
                  INSERT INTO movimientos_inventario
                  (empresa_id, producto_id, tipo, cantidad)
                  VALUES (?, ?, 'salida', ?)
                  `,
                  [
                    req.user.empresa_id,
                    item.producto_id,
                    item.cantidad,
                  ],
                  (err) => {
                    if (err) return reject(err);
                    resolve();
                  }
                );
              }
            );
          });
        });

        Promise.all(detalleQueries)
          .then(() => {
            db.commit((err) => {
              if (err)
                return db.rollback(() => res.status(500).json(err));

              res.json({
                msg: "✅ Venta finalizada correctamente",
                venta_id: ventaId,
              });
            });
          })
          .catch((err) =>
            db.rollback(() => res.status(500).json(err))
          );
      }
    );
  });
});

/* =====================
   SERVER
===================== */
app.listen(3001, () => {
  console.log("✅ API http://localhost:3001");
});