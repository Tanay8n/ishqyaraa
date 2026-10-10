const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const requireBackendToken = (req, res, next) => {
  const expected = process.env.BACKEND_API_TOKEN;
  if (!expected) {
    return res.status(503).json({ message: "The legacy backend API is not configured." });
  }
  const supplied = req.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (expectedBytes.length !== suppliedBytes.length || !require("node:crypto").timingSafeEqual(expectedBytes, suppliedBytes)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

app.get("/", (req, res) => {
  res.json({
    message: "IshqYara backend is running ❤️",
  });
});

app.get("/test-db", requireBackendToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully ❤️",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.post("/users", requireBackendToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not create user",
    });
  }
});

app.get("/users", requireBackendToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not fetch users",
    });
  }
});

const PORT = 5050;

app.listen(PORT, "127.0.0.1", () => {
  console.log(
    `IshqYara backend running on http://localhost:${PORT}`
  );
});
