const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

// Middleware
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET",
};
app.use(cors(corsOptions));
app.use(express.json());

require("dotenv").config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get("/api/home", async (req, res) => {
  try {
    const measure_averages = await pool.query(
      `SELECT 
 ROUND(AVG(acci3),3) AS acci3
,ROUND(AVG(acci4),3) AS acci4
,ROUND(AVG(avad1),3) AS avad1
,ROUND(AVG(comi1),3) AS comi1
,ROUND(AVG(comi5),3) AS comi5
,ROUND(AVG(coni2),3) AS coni2
,ROUND(AVG(coni3),3) AS coni3
,ROUND(AVG(coni4),3) AS coni4
,ROUND(AVG(coni5),3) AS coni5
,ROUND(AVG(undi1),3) AS undi1
FROM opendata.quality q`
    );

    const overall_numbers = await pool.query(
      `SELECT *
FROM (SELECT COUNT(*) AS total_res FROM opendata.resources) t1
CROSS JOIN (SELECT COUNT(*) AS csv_res FROM opendata.resources WHERE format = 'CSV') t2
CROSS JOIN (SELECT COUNT(DISTINCT id) AS csv_ok FROM opendata.log_csv WHERE msg = 'OK') t3
CROSS JOIN (SELECT COUNT(DISTINCT id) AS csv_error FROM opendata.log_csv WHERE msg != 'OK') t4`
    );

    const daily_registered = await pool.query(
      `SELECT TO_CHAR(ROW_REGISTERED, 'DD/MM') as x, y 
FROM ( SELECT DISTINCT ROW_REGISTERED, COUNT(*) AS y
FROM ( SELECT CAST(ROW_REGISTERED AS DATE) AS ROW_REGISTERED
		FROM OPENDATA.RESOURCES	WHERE ROW_REGISTERED != '1900-01-01' ) T1
GROUP BY ROW_REGISTERED
ORDER BY ROW_REGISTERED DESC
LIMIT 7 ) T2
ORDER BY ROW_REGISTERED ASC`
    );

    const daily_processed = await pool.query(
      `SELECT TO_CHAR(ROW_PROCESSED, 'DD/MM') as x, y 
FROM ( SELECT DISTINCT ROW_PROCESSED, COUNT(*) AS y
FROM ( SELECT CAST(ROW_PROCESSED AS DATE) AS ROW_PROCESSED
		FROM OPENDATA.RESOURCES	WHERE ROW_PROCESSED != '1900-01-01' ) T1
GROUP BY ROW_PROCESSED
ORDER BY ROW_PROCESSED DESC
LIMIT 7 ) T2
ORDER BY ROW_PROCESSED ASC`
    );

    result = {
      measure_averages: measure_averages.rows,
      overall_numbers: overall_numbers.rows,
      daily_registered: daily_registered.rows,
      daily_processed: daily_processed.rows,
    };
    res.json(result);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/group", async (req, res) => {
  try {
    const detail = await pool.query(
      `SELECT COALESCE(g.grp,'N.A.') AS dimension
,r.url
,r.name AS resource
,d.name AS dataset
,d.organization
,r.format
,r.description
,ROUND(acci3,3) AS acci3
,ROUND(acci4,3) AS acci4
,ROUND(avad1,3) AS avad1
,ROUND(comi1,3) AS comi1
,ROUND(comi5,3) AS comi5
,ROUND(coni2,3) AS coni2
,ROUND(coni3,3) AS coni3
,ROUND(coni4,3) AS coni4
,ROUND(coni5,3) AS coni5
,ROUND(undi1,3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id
LEFT JOIN opendata.datasets_groups g ON d.id = g.dataset`
    );

    const dimension = await pool.query(
      `SELECT COALESCE(g.grp,'N.A.') AS dimension
,COUNT(*) AS total
,ROUND(AVG(acci3),3) AS acci3
,ROUND(AVG(acci4),3) AS acci4
,ROUND(AVG(avad1),3) AS avad1
,ROUND(AVG(comi1),3) AS comi1
,ROUND(AVG(comi5),3) AS comi5
,ROUND(AVG(coni2),3) AS coni2
,ROUND(AVG(coni3),3) AS coni3
,ROUND(AVG(coni4),3) AS coni4
,ROUND(AVG(coni5),3) AS coni5
,ROUND(AVG(undi1),3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id
LEFT JOIN opendata.datasets_groups g ON d.id = g.dataset
GROUP BY g.grp`
    );

    result = { dimension: dimension.rows, detail: detail.rows };
    res.json(result);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/tag", async (req, res) => {
  try {
    const detail = await pool.query(
      `SELECT COALESCE(g.tag,'N.A.') AS dimension
,r.url
,r.name AS resource
,d.name AS dataset
,d.organization
,r.format
,r.description
,ROUND(acci3,3) AS acci3
,ROUND(acci4,3) AS acci4
,ROUND(avad1,3) AS avad1
,ROUND(comi1,3) AS comi1
,ROUND(comi5,3) AS comi5
,ROUND(coni2,3) AS coni2
,ROUND(coni3,3) AS coni3
,ROUND(coni4,3) AS coni4
,ROUND(coni5,3) AS coni5
,ROUND(undi1,3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id
LEFT JOIN opendata.datasets_tags g ON d.id = g.tag`
    );

    const dimension = await pool.query(
      `SELECT COALESCE(g.tag,'N.A.') AS dimension
,COUNT(*) AS total
,ROUND(AVG(acci3),3) AS acci3
,ROUND(AVG(acci4),3) AS acci4
,ROUND(AVG(avad1),3) AS avad1
,ROUND(AVG(comi1),3) AS comi1
,ROUND(AVG(comi5),3) AS comi5
,ROUND(AVG(coni2),3) AS coni2
,ROUND(AVG(coni3),3) AS coni3
,ROUND(AVG(coni4),3) AS coni4
,ROUND(AVG(coni5),3) AS coni5
,ROUND(AVG(undi1),3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id
LEFT JOIN opendata.datasets_tags g ON d.id = g.tag
GROUP BY g.tag`
    );

    result = { dimension: dimension.rows, detail: detail.rows };
    res.json(result);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/organization", async (req, res) => {
  try {
    const detail = await pool.query(
      `SELECT COALESCE(d.organization,'N.A.') AS dimension
,r.url
,r.name AS resource
,d.name AS dataset
,r.format
,r.description
,ROUND(acci3,3) AS acci3
,ROUND(acci4,3) AS acci4
,ROUND(avad1,3) AS avad1
,ROUND(comi1,3) AS comi1
,ROUND(comi5,3) AS comi5
,ROUND(coni2,3) AS coni2
,ROUND(coni3,3) AS coni3
,ROUND(coni4,3) AS coni4
,ROUND(coni5,3) AS coni5
,ROUND(undi1,3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id`
    );

    const dimension = await pool.query(
      `SELECT COALESCE(d.organization,'N.A.') AS dimension
,COUNT(*) AS total
,ROUND(AVG(acci3),3) AS acci3
,ROUND(AVG(acci4),3) AS acci4
,ROUND(AVG(avad1),3) AS avad1
,ROUND(AVG(comi1),3) AS comi1
,ROUND(AVG(comi5),3) AS comi5
,ROUND(AVG(coni2),3) AS coni2
,ROUND(AVG(coni3),3) AS coni3
,ROUND(AVG(coni4),3) AS coni4
,ROUND(AVG(coni5),3) AS coni5
,ROUND(AVG(undi1),3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id
GROUP BY d.organization`
    );

    result = { dimension: dimension.rows, detail: detail.rows };
    res.json(result);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/dataset", async (req, res) => {
  try {
    const detail = await pool.query(
      `SELECT COALESCE(d.name,'N.A.') AS dimension
,r.url
,r.name AS resource
,d.organization
,r.format
,r.description
,ROUND(acci3,3) AS acci3
,ROUND(acci4,3) AS acci4
,ROUND(avad1,3) AS avad1
,ROUND(comi1,3) AS comi1
,ROUND(comi5,3) AS comi5
,ROUND(coni2,3) AS coni2
,ROUND(coni3,3) AS coni3
,ROUND(coni4,3) AS coni4
,ROUND(coni5,3) AS coni5
,ROUND(undi1,3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id`
    );

    const dimension = await pool.query(
      `SELECT COALESCE(d.name,'N.A.') AS dimension
,COUNT(*) AS total
,ROUND(AVG(acci3),3) AS acci3
,ROUND(AVG(acci4),3) AS acci4
,ROUND(AVG(avad1),3) AS avad1
,ROUND(AVG(comi1),3) AS comi1
,ROUND(AVG(comi5),3) AS comi5
,ROUND(AVG(coni2),3) AS coni2
,ROUND(AVG(coni3),3) AS coni3
,ROUND(AVG(coni4),3) AS coni4
,ROUND(AVG(coni5),3) AS coni5
,ROUND(AVG(undi1),3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id
GROUP BY d.name`
    );

    result = { dimension: dimension.rows, detail: detail.rows };
    res.json(result);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/resource", async (req, res) => {
  try {
    const detail = await pool.query(
      `SELECT r.url
,r.name AS resource
,d.name AS dataset
,d.organization
,r.format
,r.description
,ROUND(acci3,3) AS acci3
,ROUND(acci4,3) AS acci4
,ROUND(avad1,3) AS avad1
,ROUND(comi1,3) AS comi1
,ROUND(comi5,3) AS comi5
,ROUND(coni2,3) AS coni2
,ROUND(coni3,3) AS coni3
,ROUND(coni4,3) AS coni4
,ROUND(coni5,3) AS coni5
,ROUND(undi1,3) AS undi1
FROM opendata.quality q 
INNER JOIN opendata.resources r ON q.id = r.id
INNER JOIN opendata.datasets d ON r.dataset = d.id`
    );

    result = { detail: detail.rows };
    res.json(result);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  //console.log(process.env);
  console.log(`Server is running on port ${PORT}`);
});
