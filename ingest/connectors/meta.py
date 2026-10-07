"""Meta (Facebook & Instagram) Marketing API Connector."""
from __future__ import annotations

import os
import requests
import pandas as pd
from typing import Any, Dict, List, Optional


class MetaAdsConnector:
    """Extracts campaign telemetry from Meta Marketing Graph API (v21.0+)."""

    def __init__(
        self,
        access_token: Optional[str] = None,
        ad_account_id: Optional[str] = None,
        api_version: str = "v21.0",
    ):
        self.access_token = (access_token or os.getenv("META_ACCESS_TOKEN", "")).strip()
        account_id = (ad_account_id or os.getenv("META_AD_ACCOUNT_ID", "")).strip()
        if account_id and not account_id.startswith("act_"):
            account_id = f"act_{account_id}"
        self.ad_account_id = account_id
        self.api_version = api_version

    @property
    def is_configured(self) -> bool:
        return bool(
            self.access_token
            and len(self.access_token) > 20
            and self.ad_account_id
            and self.ad_account_id != "act_"
        )

    @property
    def base_url(self) -> str:
        return f"https://graph.facebook.com/{self.api_version}"

    def test_connection(self) -> Dict[str, Any]:
        """Verify token and account permissions."""
        if not self.is_configured:
            return {"ok": False, "error": "Meta Marketing API credentials missing in .env"}
        try:
            url = f"{self.base_url}/{self.ad_account_id}"
            params = {
                "access_token": self.access_token,
                "fields": "id,name,currency,account_status",
            }
            res = requests.get(url, params=params, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return {
                    "ok": True,
                    "account_id": data.get("id"),
                    "account_name": data.get("name"),
                    "currency": data.get("currency"),
                }
            return {"ok": False, "status_code": res.status_code, "error": res.json().get("error", {}).get("message")}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    def fetch_insights(self, days: int = 30) -> pd.DataFrame:
        """Fetch daily campaign-level spend, impressions, CPM, and purchase conversions."""
        if not self.is_configured:
            return pd.DataFrame()

        from datetime import datetime, timedelta
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

        url = f"{self.base_url}/{self.ad_account_id}/insights"
        params = {
            "access_token": self.access_token,
            "level": "campaign",
            "time_increment": 1,
            "time_range": f'{{"since":"{start_date}","until":"{end_date}"}}',
            "fields": "date_start,campaign_id,campaign_name,spend,impressions,cpm,clicks,actions,action_values",
            "limit": 500,
        }

        records: List[Dict[str, Any]] = []

        try:
            while url:
                res = requests.get(url, params=params if "?" not in url else None, timeout=20)
                res.raise_for_status()
                data = res.json()
                items = data.get("data", [])

                for item in items:
                    # Parse purchase actions
                    conversions = 0
                    for action in item.get("actions", []):
                        if action.get("action_type") in ("purchase", "omni_purchase"):
                            conversions += int(float(action.get("value", 0)))

                    revenue = 0.0
                    for av in item.get("action_values", []):
                        if av.get("action_type") in ("purchase", "omni_purchase"):
                            revenue += float(av.get("value", 0.0))

                    spend = float(item.get("spend") or 0.0)
                    impressions = int(item.get("impressions") or 0)
                    cpm = float(item.get("cpm") or (spend / impressions * 1000 if impressions > 0 else 0.0))
                    campaign_name = item.get("campaign_name", "meta-ad")

                    records.append({
                        "date": item.get("date_start"),
                        "platform": "meta",
                        "campaign": campaign_name,
                        "spend": round(spend, 2),
                        "cpm": round(cpm, 2),
                        "impressions": impressions,
                        "conversions": conversions,
                        "revenue": round(revenue, 2),
                    })

                # Follow Graph API paging
                url = data.get("paging", {}).get("next")
                params = {}

        except Exception as e:
            print(f"[MetaAdsConnector] Error fetching insights: {e}")

        return pd.DataFrame(records)
