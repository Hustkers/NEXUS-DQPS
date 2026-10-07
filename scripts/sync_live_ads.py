#!/usr/bin/env python3
"""CLI utility to sync live ad accounts (Shopify, Meta, Google, Amazon) into NEXUS-DQPS."""
import argparse
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ingest.connectors.reconcile import LiveReconciliationEngine
from ingest.load import load
from scripts.export_engine_state import generate_state


def main():
    parser = argparse.ArgumentParser(description="Sync live Google, Meta, Amazon & Shopify data into NEXUS-DQPS")
    parser.add_argument("--check-only", action="store_true", help="Audit .env credentials without downloading data")
    parser.add_argument("--days", type=int, default=30, help="Lookback window in days (default: 30)")
    parser.add_argument("--export", action="store_true", default=True, help="Update web console state JSON after sync")
    args = parser.parse_args()

    print("\n========================================================")
    print("  NEXUS-DQPS: Live Multi-Channel Pipeline Sync")
    print("========================================================\n")

    engine = LiveReconciliationEngine()
    status = engine.check_channel_status()

    # Pretty print status table
    print("┌──────────────┬──────────────────┬──────────────────────────────────────────┐")
    print("│ Platform     │ Configured (.env)│ Connection Status                        │")
    print("├──────────────┼──────────────────┼──────────────────────────────────────────┤")
    for platform, info in status.items():
        conf_str = "  [YES] " if info["configured"] else "  [NO]  "
        test_info = info["test"]
        if info["configured"]:
            stat_msg = "SUCCESS (Verified)" if test_info.get("ok") else f"FAILED: {test_info.get('error', 'Auth Error')[:30]}"
        else:
            stat_msg = test_info.get("message", "Pending keys")[:40]
        print(f"│ {platform.capitalize():<12} │ {conf_str:<16} │ {stat_msg:<40} │")
    print("└──────────────┴──────────────────┴──────────────────────────────────────────┘\n")

    if args.check_only:
        print("Audit complete (--check-only passed). Exiting.\n")
        return

    # Check if at least one platform is active
    any_active = any(s["configured"] for s in status.values())
    if not any_active:
        print("⚠️  No live platforms are configured in your `.env` file yet.")
        print("👉 Edit `/Users/jaygopal/NEXUS-DQPS/.env` and paste your tokens, then re-run:")
        print("   python scripts/sync_live_ads.py\n")
        return

    print(f"🔄 Pulling and reconciling live performance (lookback = {args.days} days)...")
    df = engine.pull_and_reconcile(days=args.days)

    if df.empty:
        print("❌ Reconciled dataset was empty. Check credentials or campaign activity.\n")
        return

    # Save to CSV & DuckDB
    metrics_path = Path("data/metrics.csv")
    df.to_csv(metrics_path, index=False)
    load("data/dqps.duckdb", df, events=[])
    print(f"✅ Successfully written {len(df)} reconciled rows to {metrics_path} and data/dqps.duckdb")

    if args.export:
        print("🚀 Refreshing web console state (web/src/data/nexus-engine-state.json)...")
        try:
            generate_state()
            print("✨ Console updated! Open http://localhost:3000/dashboard/overview")
        except Exception as ex:
            print(f"⚠️  Export state completed with note: {ex}")

    print("\n========================================================\n")


if __name__ == "__main__":
    main()
