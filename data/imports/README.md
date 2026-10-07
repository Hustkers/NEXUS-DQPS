# NEXUS-DQPS — CSV Imports Directory

Drop your ad platform reports and product catalog exports into this directory:

### Supported File Types:
* `meta*.csv` — Meta Ads Manager table exports (Campaign, Spend, Impressions, CPM, Purchases, Value)
* `google*.csv` — Google Ads Report Editor exports (Campaign, Cost, Impressions, Conversions, Conv. value)
* `amazon*.csv` — Amazon Sponsored Products exports (Campaign, Spend, Impressions, 14d Sales, 14d Orders)
* `shopify*.csv` or `product*.csv` — Shopify product exports (SKU, Price, Inventory, Cost per item)

### Running the Importer:
```bash
# Import your dropped files:
python scripts/import_csv.py

# Or test with the pre-packaged sample files:
python scripts/import_csv.py --demo
```
