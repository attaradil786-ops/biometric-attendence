const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Biometric Attendance API is working!"
  });
});
app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM employees ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", async (req, res) => {
  const { employee_id, full_name, email, department, role, status } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO employees
       (employee_id, full_name, email, department, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [employee_id, full_name, email, department, role, status || "active"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

