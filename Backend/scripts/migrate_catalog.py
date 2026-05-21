import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import Item, VerificationReport  # noqa: E402
from app.seed import DEFAULT_ITEMS  # noqa: E402


CATEGORY_FIXES = {
    "F002": "Botol Minum",
    "F004": "Kartu Identitas",
    "L002": "Tas",
    "L003": "Aksesori",
}

REPORT_CATEGORY_FIXES = {
    "LF-0891": "Dompet",
    "LF-0890": "Buku & Dokumen",
}


def main() -> None:
    db = SessionLocal()
    try:
        for item_id, category in CATEGORY_FIXES.items():
            item = db.get(Item, item_id)
            if item:
                item.category = category

        for report_id, category in REPORT_CATEGORY_FIXES.items():
            report = db.get(VerificationReport, report_id)
            if report:
                report.category = category

        inserted = 0
        for item_data in DEFAULT_ITEMS:
            if not db.get(Item, item_data["id"]):
                db.add(Item(**item_data))
                inserted += 1

        db.commit()
        print(f"Catalog migration completed. Inserted {inserted} new items.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
