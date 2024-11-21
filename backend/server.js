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
    const overall_numbers = await pool.query(
      `SELECT *
FROM (SELECT COUNT(DISTINCT id) AS total_ds FROM opendata.datasets) t0
CROSS JOIN (SELECT COUNT(DISTINCT id) AS total_res FROM opendata.resources) t1
CROSS JOIN (SELECT COUNT(DISTINCT id) AS csv_res FROM opendata.resources WHERE format = 'CSV') t2
CROSS JOIN (SELECT COUNT(DISTINCT id) AS csv_ok FROM opendata.log_csv WHERE msg = 'OK') t3
CROSS JOIN (SELECT COUNT(DISTINCT id) AS csv_unavail FROM opendata.log_csv t WHERE msg != 'OK'
            AND NOT EXISTS 
            (SELECT 1 FROM opendata.log_csv s 
             WHERE s.id = t.id AND (msg = 'OK' OR msg LIKE '%Content-Type%'))) t4
CROSS JOIN (SELECT COUNT(DISTINCT id) AS csv_invalid FROM opendata.log_csv t WHERE msg LIKE '%Content-Type%'
            AND NOT EXISTS 
            (SELECT 1 FROM opendata.log_csv s 
             WHERE s.id = t.id AND msg = 'OK')) t5`
    );

    const daily_registered = await pool.query(
      `SELECT
	ROW_REGISTERED AS REFDATE_ORIG,
	TO_CHAR(ROW_REGISTERED, 'DD/MM') AS REFDATE,
	COUNT(DISTINCT DATASET_ID) AS DATASETS,
	COUNT(DISTINCT RESOURCE_ID) AS RESOURCES,
	SUM(CSV_FORMAT) AS CSV
FROM
	(
		SELECT
			CAST(R.ROW_REGISTERED AS DATE) AS ROW_REGISTERED,
			D.ID AS DATASET_ID,
			R.ID AS RESOURCE_ID,
			CASE
				WHEN R.FORMAT = 'CSV' THEN 1
				ELSE 0
			END AS CSV_FORMAT
		FROM
			OPENDATA.DATASETS D
			INNER JOIN OPENDATA.RESOURCES R ON D.ID = R.DATASET
		WHERE
			R.ROW_REGISTERED != '1900-01-01'
	) T
GROUP BY ROW_REGISTERED
ORDER BY REFDATE_ORIG DESC
LIMIT 7`
    );

    const daily_processed = await pool.query(
      `SELECT
	COALESCE(T1.TSCREATION, T2.TSCREATION, T3.TSCREATION) AS REFDATE_ORIG,
	TO_CHAR(
		COALESCE(T1.TSCREATION, T2.TSCREATION, T3.TSCREATION),
		'DD/MM'
	) AS REFDATE,
	COALESCE(T1.PROCESSED, 0) AS PROCESSED,
	COALESCE(T2.UNAVAILABLE, 0) AS UNAVAILABLE,
	COALESCE(T3.INVALID, 0) AS INVALID
FROM
	(
		SELECT
			CAST(TSCREATION AS DATE) AS TSCREATION,
			TO_CHAR(CAST(TSCREATION AS DATE), 'DD/MM') AS REFDATE,
			COUNT(DISTINCT ID) AS PROCESSED
		FROM OPENDATA.LOG_CSV
		WHERE MSG = 'OK'
		GROUP BY CAST(TSCREATION AS DATE)
		ORDER BY TSCREATION DESC
	) T1
	FULL JOIN (
		SELECT
			CAST(TSCREATION AS DATE) AS TSCREATION,
			TO_CHAR(CAST(TSCREATION AS DATE), 'DD/MM') AS REFDATE,
			COUNT(DISTINCT ID) AS UNAVAILABLE
		FROM OPENDATA.LOG_CSV T
		WHERE MSG != 'OK'
			AND NOT EXISTS (
				SELECT 1
				FROM OPENDATA.LOG_CSV S
				WHERE S.ID = T.ID
					AND (
						MSG = 'OK'
						OR MSG LIKE '%Content-Type%'
					)
			)
		GROUP BY CAST(TSCREATION AS DATE)
		ORDER BY TSCREATION DESC
	) T2 ON T1.TSCREATION = T2.TSCREATION
	FULL JOIN (
		SELECT
			CAST(TSCREATION AS DATE) AS TSCREATION,
			TO_CHAR(CAST(TSCREATION AS DATE), 'DD/MM') AS REFDATE,
			COUNT(DISTINCT ID) AS INVALID
		FROM OPENDATA.LOG_CSV T
		WHERE MSG LIKE '%Content-Type%'
			AND NOT EXISTS (
				SELECT 1
				FROM OPENDATA.LOG_CSV S
				WHERE S.ID = T.ID AND MSG = 'OK'
			)
		GROUP BY CAST(TSCREATION AS DATE)
		ORDER BY TSCREATION DESC
	) T3 ON T1.TSCREATION = T3.TSCREATION
ORDER BY REFDATE_ORIG DESC
LIMIT 7`
    );

    const measure_averages = await pool.query(
      `SELECT AV.MEASURE, COALESCE(MS.TITLE,'') as TITLE, COALESCE(MS.DESCR,'') as DESCR, AV.SCORE, AV.SCORE AS AMOUNT
FROM
	(
		SELECT ROUND(AVG(ACCI3), 3) AS SCORE, 'acci3' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(ACCI4), 3) AS SCORE, 'acci4' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(AVAD2), 3) AS SCORE, 'avad2' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(COMI1), 3) AS SCORE, 'comi1' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(COMI5), 3) AS SCORE, 'comi5' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(CONI2), 3) AS SCORE, 'coni2' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(CONI3), 3) AS SCORE, 'coni3' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(CONI4), 3) AS SCORE, 'coni4' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(CONI5), 3) AS SCORE, 'coni5' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
		SELECT ROUND(AVG(UNDI1), 3) AS SCORE, 'undi1' AS MEASURE FROM OPENDATA.QUALITY Q
	) AV
	LEFT JOIN OPENDATA.MEASURES MS ON AV.MEASURE = MS.MEASURE
ORDER BY AV.MEASURE ASC;`
    );

    const measure_distributions = await pool.query(
      `SELECT ROUND(ACCI3, 3) AS SCORE, 'acci3' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(ACCI4, 3) AS SCORE, 'acci4' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(AVAD2, 3) AS SCORE, 'avad2' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(COMI1, 3) AS SCORE, 'comi1' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(COMI5, 3) AS SCORE, 'comi5' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(CONI2, 3) AS SCORE, 'coni2' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(CONI3, 3) AS SCORE, 'coni3' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(CONI4, 3) AS SCORE, 'coni4' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(CONI5, 3) AS SCORE, 'coni5' AS MEASURE FROM OPENDATA.QUALITY Q UNION ALL
SELECT ROUND(UNDI1, 3) AS SCORE, 'undi1' AS MEASURE FROM OPENDATA.QUALITY Q`
    );

    result = {
      overall_numbers: overall_numbers.rows,
      daily_registered: daily_registered.rows,
      daily_processed: daily_processed.rows,
      measure_averages: measure_averages.rows,
      measure_distributions: measure_distributions.rows,
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
,ROUND(avad2,3) AS avad2
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
,ROUND(AVG(avad2),3) AS avad2
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
,ROUND(avad2,3) AS avad2
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
,ROUND(AVG(avad2),3) AS avad2
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
,ROUND(avad2,3) AS avad2
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
,ROUND(AVG(avad2),3) AS avad2
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
,ROUND(avad2,3) AS avad2
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
,ROUND(AVG(avad2),3) AS avad2
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
,ROUND(avad2,3) AS avad2
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
  console.log(`Server is running on port ${PORT}`);
});
