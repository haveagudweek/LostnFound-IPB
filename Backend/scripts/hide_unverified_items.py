import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import Item, VerificationReport  # noqa: E402


def main() -> None:
    db = SessionLocal()
    try:
        hidden = 0
        reports = db.query(VerificationReport).filter(VerificationReport.status != "verified").all()
        for report in reports:
            item = db.get(Item, report.item_id)
            if item:
                db.delete(item)
                hidden += 1

        db.commit()
        print(f"Hidden {hidden} unverified public items.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
