# IPB Lost and Found Backend

FastAPI backend for the SEEKEM/IPB Lost and Found frontend.

## Setup

1. Start or create PostgreSQL database. With Docker:

```bash
docker compose up -d
```

Or create it manually:

```sql
CREATE DATABASE ipb_lost_found;
```

2. Create and activate a virtual environment, then install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and adjust `DATABASE_URL`.

4. Create tables and seed demo data:

```bash
python scripts/init_db.py
```

To clear existing rows and restore the migrated starter data:

```bash
python scripts/init_db.py --reset
```

5. Run the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The Docker Compose PostgreSQL service is exposed on host port `5433` to avoid conflicts with a local Windows PostgreSQL service on `5432`.

The frontend expects `VITE_API_BASE_URL` to point to `http://127.0.0.1:8000/api` unless using the default.
