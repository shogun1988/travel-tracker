# Travel Tracker

A simple Node.js + Express app that lets you track the countries you’ve visited. It renders an interactive world map (EJS view) and highlights countries you add. Data is stored in PostgreSQL: a reference table of countries and a table of visited country codes.

## Features
- Add a country by name (partial matches allowed)
- Prevents duplicates with a friendly error message
- Displays total number of countries visited
- EJS templates and static assets served from `public/`

## Prerequisites
- Node.js 18+ (ES modules enabled via `"type": "module"`)
- PostgreSQL 13+ (local or remote)
- psql client (optional, for easy CSV import)

## Installation
1. Clone the repo and install dependencies:
   - Windows PowerShell example
     - From the project root, run:
       - `npm install`
2. Copy the example environment file and fill in your PostgreSQL credentials:
   - `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`)
   - Edit `.env` with your DB settings (see below).

## Configuration (.env)
The application expects these environment variables for the PostgreSQL connection:

- `USER`     – database username (e.g., `postgres`)
- `PASSWORD` – database user password
- `HOST`     – database host (e.g., `localhost`)
- `DATABASE` – database name (e.g., `travel_tracker`)
- `PORT`     – database port (default Postgres is `5432`)

Note: The Express server listens on http://localhost:3000. The `PORT` in `.env` is for PostgreSQL, not the web server.

## Database Setup
The app expects two tables: `countries` and `visited_countries`.

1) Create tables

Run these SQL statements in your database:

```sql
-- Reference list of countries (id, ISO alpha-2 code, name)
CREATE TABLE IF NOT EXISTS countries (
  id            SERIAL PRIMARY KEY,
  country_code  VARCHAR(2) UNIQUE NOT NULL,
  country_name  TEXT NOT NULL
);

-- Tracks visited countries by ISO alpha-2 code
CREATE TABLE IF NOT EXISTS visited_countries (
  id            SERIAL PRIMARY KEY,
  country_code  VARCHAR(2) UNIQUE NOT NULL REFERENCES countries(country_code)
);
```

2) Load country data from CSV

The repository includes `countries.csv` matching the `countries` schema. You can bulk import with the psql client’s `\copy` (runs from your machine; no superuser required):

```psql
\copy countries(id, country_code, country_name)
FROM 'd:/udemy/full-stack-dev/travel-tracker/countries.csv' DELIMITER ',' CSV HEADER;
```

- Adjust the path if your project is located elsewhere.
- If you prefer, you can omit the `id` column and let it auto-generate by importing only `country_code,country_name` and recreating the CSV accordingly.

## Run the app
- Development (auto-reload): `npm run dev`
- Production: `npm start`

The server will start at:

- http://localhost:3000

## How to use
- Open http://localhost:3000
- Type a country name (full or partial) and click “Add”
- If the country exists, it’s inserted into `visited_countries` and highlighted on the map
- If it’s already added, you’ll see “Country has already been added, try again.”
- If the name doesn’t match any record in `countries`, you’ll see “Country name does not exist, try again.”

## Project structure
- `index.js` – Express server and routes
- `views/index.ejs` – Main page with world map and form
- `public/styles/main.css` – Styling for the app
- `countries.csv` – Seed data for the `countries` table

## Troubleshooting
- “error: relation ... does not exist” – Ensure you ran the “Create tables” SQL.
- “duplicate key value violates unique constraint” – The country has already been added to `visited_countries`.
- Connection errors – Verify `.env` values and that PostgreSQL is running and reachable.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.