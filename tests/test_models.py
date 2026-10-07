import pytest
from ingest.models.meta import MetaAdInsights, MetaAction, MetaActionValue
from ingest.models.google import GoogleAdsRow, GoogleCampaign, GoogleSegments, GoogleMetrics
from ingest.models.amazon import AmazonSponsoredProductsRow
from ingest.models.shopify import ShopifyOrder, ShopifyLineItem, ShopifyInventoryLevel


def test_meta_insights_parsing():
    raw_payload = {
        "ad_id": "2385141029384",
        "campaign_id": "120381029384",
        "campaign_name": "Meta-AirForce1-Prospecting",
        "spend": "450.75",
        "impressions": "35000",
        "clicks": "1200",
        "cpc": "0.38",
        "cpm": "12.88",
        "frequency": "1.34",
        "date_start": "2026-10-01",
        "date_stop": "2026-10-01",
        "actions": [
            {"action_type": "link_click", "value": "1200"},
            {"action_type": "omni_purchase", "value": "24"}
        ],
        "action_values": [
            {"action_type": "omni_purchase", "value": "2160.00"}
        ]
    }
    model = MetaAdInsights.model_validate(raw_payload)
    assert model.spend == 450.75
    assert model.impressions == 35000
    assert model.purchase_conversions == 24
    assert model.purchase_revenue == 2160.00


def test_google_ads_row_parsing():
    raw_payload = {
        "campaign": {
            "id": "9876543210",
            "name": "Google-Shopping-AirMax270",
            "advertisingChannelType": "SHOPPING"
        },
        "segments": {
            "date": "2026-10-01"
        },
        "metrics": {
            "impressions": "42000",
            "clicks": "1800",
            "costMicros": "650000000",  # $650.00
            "conversions": "32.0",
            "conversionsValue": "3840.00",
            "averageCpc": "361111"
        }
    }
    model = GoogleAdsRow.model_validate(raw_payload)
    assert model.campaign.name == "Google-Shopping-AirMax270"
    assert model.spend == 650.0
    assert model.metrics.conversions == 32.0
    assert model.metrics.conversions_value == 3840.0
    assert model.date == "2026-10-01"


def test_amazon_sponsored_products_parsing():
    raw_payload = {
        "campaignId": "amzn-camp-101",
        "campaignName": "Amazon-SP-ZoomFly",
        "adGroupId": "ag-202",
        "asin": "B08N5WRWNW",
        "sku": "880848-005",
        "date": "2026-10-01",
        "impressions": 15000,
        "clicks": 450,
        "cost": 315.00,
        "attributedSales14d": 1420.00,
        "attributedUnitsOrdered14d": 10,
        "currency": "USD"
    }
    model = AmazonSponsoredProductsRow.model_validate(raw_payload)
    assert model.campaign_name == "Amazon-SP-ZoomFly"
    assert model.cost == 315.00
    assert model.attributed_sales_14d == 1420.00
    assert model.attributed_units_ordered_14d == 10
    assert model.roas == 4.51


def test_shopify_order_and_inventory_parsing():
    order_payload = {
        "id": "5928192019",
        "order_number": "1042",
        "created_at": "2026-10-01T14:32:00Z",
        "line_items": [
            {
                "variant_id": "4019283109",
                "sku": "315122-001",
                "price": "90.00",
                "quantity": 2,
                "total_discount": "10.00"
            }
        ],
        "total_price": "170.00",
        "subtotal_price": "170.00"
    }
    order = ShopifyOrder.model_validate(order_payload)
    assert order.order_number == "1042"
    assert order.order_date == "2026-10-01"
    assert len(order.line_items) == 1
    assert order.line_items[0].gross_line_total == 170.00

    inv_payload = {
        "inventory_item_id": "8192019283",
        "location_id": "7102938102",
        "available": "420",
        "sku": "315122-001",
        "unit_cogs": "38.50"
    }
    inv = ShopifyInventoryLevel.model_validate(inv_payload)
    assert inv.available == 420
    assert inv.unit_cogs == 38.50
