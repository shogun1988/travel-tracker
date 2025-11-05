import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

import "dotenv/config"

const app = express();
const port = 3000;

const USER = process.env.USER;
const HOST = process.env.HOST;
const DATABASE = process.env.DATABASE;
const PASSWORD = process.env.PASSWORD;
const PORT = process.env.PORT;

// Use a connection pool so we can acquire/release per request
const pool = new pg.Pool({
  user: USER,
  host: HOST,
  database: DATABASE,
  password: PASSWORD,
  port: PORT,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await pool.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// GET home page
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

// Country suggestions API (for autocomplete)
app.get("/api/countries", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim().toLowerCase();
    if (!q) {
      return res.json([]);
    }
    const result = await pool.query(
      "SELECT country_name FROM countries WHERE LOWER(country_name) LIKE $1 || '%' ORDER BY country_name LIMIT 10;",
      [q]
    );
    const names = result.rows.map((r) => r.country_name);
    res.json(names);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch country suggestions" });
  }
});

//INSERT new country
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data?.country_code;
    if (!countryCode) {
      const countries = await checkVisisted();
      return res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country name does not exist, try again.",
      });
    }

    try {
      await client.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      return res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    return res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  } finally {
    // Explicitly release the connection acquired for this request
    if (client) client.release();
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
