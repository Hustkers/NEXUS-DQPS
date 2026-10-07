"""Google Ads API Connector using GAQL and OAuth2."""
from __future__ import annotations

import os
import requests
import pandas as pd
from typing import Any, Dict, List, Optional


class GoogleAdsConnector:
    """Connects to Google Ads API (v18+) to extract campaign metrics and conversion revenue."""

    def __init__(
        self,
        developer_token: Optional[str] = None,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        refresh_token: Optional[str] = None,
        customer_id: Optional[str] = None,
        login_customer_id: Optional[str] = None,
    ):
        self.developer_token = (developer_token or os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", "")).strip()
        self.client_id = (client_id or os.getenv("GOOGLE_ADS_CLIENT_ID", "")).strip()
        self.client_secret = (client_secret or os.getenv("GOOGLE_ADS_CLIENT_SECRET", "")).strip()
        self.refresh_token = (refresh_token or os.getenv("GOOGLE_ADS_REFRESH_TOKEN", "")).strip()
        self.customer_id = (customer_id or os.getenv("GOOGLE_ADS_CUSTOMER_ID", "")).strip().replace("-", "")
        self.login_customer_id = (login_customer_id or os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "")).strip().replace("-", "")

    @property
    def is_configured(self) -> bool:
        return bool(
            self.developer_token
            and self.client_id
            and self.client_secret
            and self.refresh_token
            and self.customer_id
        )

    def _get_access_token(self) -> Optional[str]:
        """Exchange permanent OAuth2 refresh token for temporary access token."""
        try:
            url = "https://oauth2.googleapis.com/token"
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": self.refresh_token,
                "grant_type": "refresh_token",
            }
            res = requests.post(url, data=data, timeout=10)
            if res.status_code == 200:
                return res.json().get("access_token")
            print(f"[GoogleAdsConnector] Failed to refresh token: {res.text}")
        except Exception as e:
            print(f"[GoogleAdsConnector] OAuth error: {e}")
        return None

    def test_connection(self) -> Dict[str, Any]:
        """Verify Developer Token and OAuth credentials."""
        if not self.is_configured:
            return {"ok": False, "error": "Google Ads API credentials missing in .env"}
        token = self._get_access_token()
        if not token:
            return {"ok": False, "error": "Failed to exchange Google OAuth2 refresh token"}
        return {"ok": True, "customer_id": self.customer_id, "token_acquired": True}

    def fetch_campaign_metrics(self, days: int = 30) -> pd.DataFrame:
        """Execute GAQL query over Google Ads SearchStream endpoint."""
        if not self.is_configured:
            return pd.DataFrame()

        access_token = self._get_access_token()
        if not access_token:
            return pd.DataFrame()

        url = f"https://googleads.googleapis.com/v18/customers/{self.customer_id}/googleAds:searchStream"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "developer-token": self.developer_token,
            "Content-Type": "application/json",
        }
        if self.login_customer_id:
            headers["login-customer-id"] = self.login_customer_id

        gaql_query = f"""
        SELECT
            segments.date,
            campaign.name,
            campaign.id,
            metrics.cost_micros,
            metrics.impressions,
            metrics.conversions,
            metrics.conversions_value,
            metrics.average_cpm
        FROM campaign
        WHERE segments.date DURING LAST_{days}_DAYS
        """

        records: List[Dict[str, Any]] = []

        try:
            res = requests.post(url, headers=headers, json={"query": gaql_query}, timeout=25)
            res.raise_for_status()
            batches = res.json()

            for batch in batches:
                for row in batch.get("results", []):
                    metrics = row.get("metrics", {})
                    campaign = row.get("campaign", {})
                    segments = row.get("segments", {})

                    spend = float(metrics.get("costMicros", 0)) / 1_000_000.0
                    impressions = int(metrics.get("impressions", 0))
                    cpm = float(metrics.get("averageCpm", 0)) / 1_000_000.0 if "averageCpm" in metrics else (spend / impressions * 1000 if impressions > 0 else 0.0)
                    conversions = int(float(metrics.get("conversions", 0)))
                    revenue = float(metrics.get("conversionsValue", 0.0))

                    records.append({
                        "date": segments.get("date"),
                        "platform": "google",
                        "campaign": campaign.get("name", "google-ad"),
                        "spend": round(spend, 2),
                        "cpm": round(cpm, 2),
                        "impressions": impressions,
                        "conversions": conversions,
                        "revenue": round(revenue, 2),
                    })
        except Exception as e:
            print(f"[GoogleAdsConnector] Error querying Google Ads: {e}")

        return pd.DataFrame(records)
