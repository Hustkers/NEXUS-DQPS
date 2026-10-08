#!/usr/bin/env python3
"""CLI utility to import ad & eCommerce CSV reports into NEXUS-DQPS."""
import argparse
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ingest.csv_importer import CSVImporter
from ingest.load import load
from scripts.export_engine_state import generate_state


def main():
    parser = argparse.ArgumentParser(description="Import Meta, Google, Amazon & Shopify CSV reports into NEXUS-DQPS")
    parser.add_argument("--dir", type=str, default="data/imports", help="Directory containing CSV files (default: data/imports)")
    parser.add_argument("--demo", action="store_true", help="Run with the included sample CSV exports")
    parser.add_argument("--no-export", action="store_true", help="Skip updating web console state JSON")
    args = parser.parse_args()

    print("\n========================================================")
    print("NEXUS-DQPS: CSV Ingestion & Reconciliation Pipeline")
    print("========================================================\n")

    imports_path = Path(args.dir)
    importer = CSVImporter(imports_dir=str(imports_path))

    if args.demo:
        print(" Loading included sample export files from data/imports/...")
        sample_files = [
            str(imports_path / "sample_meta_export.csv"),
            str(imports_path / "sample_google_export.csv"),
            str(imports_path / "sample_amazon_export.csv"),
        ]
        df = importer.import_all(custom_files=sample_files)
    else:
        csv_files = list(imports_path.glob("*.csv"))
        user_files = [f for f in csv_files if not f.name.startswith("sample_")]
        if not user_files:
            print(f"️  No user CSV files found in '{args.dir}'.")
            print(" Drop your Meta, Google, Amazon, or Shopify CSV files into 'data/imports/', or run:")
            print("python scripts/import_csv.py --demo\n")
            return
        print(f" Found {len(user_files)} CSV file(s) in {args.dir}:")
        for f in user_files:
            print(f"• {f.name}")
        df = importer.import_all(custom_files=[str(f) for f in user_files])

    if df.empty:
        print(" Ingestion yielded no rows. Check CSV headers and contents.\n")
        return

    # Print summary of ingested data
    print("\n Ingestion Summary:")
    print("┌──────────────┬──────────┬──────────────┬──────────────┬──────────────┐")
    print("│ Platform     │ Rows     │ Total Spend  │ Total Rev.   │ Avg. ROAS    │")
    print("├──────────────┼──────────┼──────────────┼──────────────┼──────────────┤")
    for p, g in df.groupby("platform"):
        spend = g["spend"].sum()
        rev = g["revenue"].sum()
        roas = rev / max(spend, 1e-6)
        print(f"│ {p.capitalize():<12} │ {len(g):<8} │ ${spend:>10,.2f} │ ${rev:>10,.2f} │ {roas:>10.2f}x │")
    print("└──────────────┴──────────┴──────────────┴──────────────┴──────────────┘\n")

    # Save to metrics.csv & DuckDB
    metrics_csv = Path("data/metrics.csv")
    df.to_csv(metrics_csv, index=False)
    load("data/dqps.duckdb", df, events=[])
    print(f" Successfully wrote {len(df)} reconciled rows to {metrics_csv} and data/dqps.duckdb")

    if not args.no_export:
        print(" Refreshing web decision console (web/src/data/nexus-engine-state.json)...")
        try:
            generate_state()
            print(" Console updated! Open http://localhost:3000/dashboard/overview")
        except Exception as ex:
            print(f"️ Export state note: {ex}")

    print("\n========================================================\n")


if __name__ == "__main__":
    main()
