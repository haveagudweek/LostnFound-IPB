import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.seed import seed_database  # noqa: E402


def main() -> None:
    reset = "--reset" in sys.argv
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db, reset=reset)
    finally:
        db.close()
    action = "reset, recreated, and seeded" if reset else "created and seed data inserted"
    print(f"Database tables {action}.")


if __name__ == "__main__":
    main()
