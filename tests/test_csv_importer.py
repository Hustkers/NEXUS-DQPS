import pytest
from pathlib import Path
import pandas as pd
from ingest.csv_importer import CSVImporter


def test_csv_importer_parses_sample_files():
    importer = CSVImporter(imports_dir="data/imports")
    
    # 1. Test Shopify Catalog loader
    catalog = importer.load_shopify_catalog(Path("data/imports/sample_shopify_products.csv"))
    assert not catalog.empty
    assert "sku" in catalog.columns
    assert "inventory" in catalog.columns
    assert "margin_pct" in catalog.columns

    # 2. Test Meta CSV Parser
    meta_df = importer.parse_meta_csv(Path("data/imports/sample_meta_export.csv"))
    assert not meta_df.empty
    assert (meta_df["platform"] == "meta").all()
    assert meta_df["spend"].sum() > 0
    assert meta_df["revenue"].sum() > 0

    # 3. Test Google CSV Parser
    google_df = importer.parse_google_csv(Path("data/imports/sample_google_export.csv"))
    assert not google_df.empty
    assert (google_df["platform"] == "google").all()
    assert google_df["spend"].sum() > 0

    # 4. Test Amazon CSV Parser
    amazon_df = importer.parse_amazon_csv(Path("data/imports/sample_amazon_export.csv"))
    assert not amazon_df.empty
    assert (amazon_df["platform"] == "amazon").all()
    assert amazon_df["spend"].sum() > 0

    # 5. Test Unified Import & Reconciliation
    sample_files = [
        "data/imports/sample_meta_export.csv",
        "data/imports/sample_google_export.csv",
        "data/imports/sample_amazon_export.csv",
    ]
    reconciled = importer.import_all(custom_files=sample_files)
    assert len(reconciled) == 45
    assert set(reconciled["platform"].unique()) == {"meta", "google", "amazon"}
    assert {"spend", "revenue", "margin", "inventory", "price"} <= set(reconciled.columns)
