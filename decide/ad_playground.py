"""Ad Playground: Candidate Ad Configuration Generator and Profit Maximization Recommendation Engine.

Evaluates ~10 candidate advertising campaign configurations for a product,
simulates expected unit economics using historical response saturation curves (scipy),
and ranks candidates strictly by expected net profit:
    Expected Net Profit = (Expected Revenue * Gross Margin %) - Expected Ad Spend
"""
from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from simulator.generator import NIKE_PRODUCTS


def response_curve(spend: np.ndarray, revenue: np.ndarray) -> tuple[float, float]:
    """Fit a robust power-law response curve revenue = k * spend^b."""
    valid = (spend > 0) & (revenue > 0)
    if np.sum(valid) >= 3:
        try:
            log_s = np.log(spend[valid])
            log_r = np.log(revenue[valid])
            b, log_k = np.polyfit(log_s, log_r, deg=1)
            b = float(np.clip(b, 0.4, 0.95))
            k = float(np.exp(log_k))
            return k, b
        except Exception:
            pass
    return 100.0, 0.75


@dataclass
class CandidateConfig:
    rank: int
    config_id: str
    title: str
    platform: str
    objective: str
    audience_segment: str
    bidding_strategy: str
    daily_budget: float
    duration_days: int
    expected_spend: float
    predicted_impressions: int
    predicted_clicks: int
    predicted_cpc: float
    predicted_cpm: float
    predicted_conversions: int
    predicted_cvr: float
    predicted_revenue: float
    predicted_gross_margin: float
    predicted_net_profit: float
    predicted_roas: float
    confidence_score: float
    is_recommended: bool
    stockout_risk: bool
    explanation: str
    key_drivers: List[str]


@dataclass
class PlaygroundAnalysisResult:
    sku: str
    product_name: str
    category: str
    price: float
    gross_margin_pct: float
    inventory: int
    photo_url: str
    total_budget_constraint: float
    duration_days: int
    candidates: List[CandidateConfig]
    baseline_historical_roas: float
    baseline_historical_daily_spend: float
    best_config_id: str
    profit_lift_over_baseline: float
    data_quality_warning: Optional[str] = None


class AdPlaygroundEngine:
    """Core recommendation and simulation engine for Ad Playground."""

    def __init__(self, metrics_df: Optional[pd.DataFrame] = None):
        if metrics_df is not None:
            self.df = metrics_df.copy()
        else:
            metrics_path = Path("data/metrics.csv")
            if metrics_path.exists():
                self.df = pd.read_csv(metrics_path, parse_dates=["date"])
            else:
                self.df = pd.DataFrame()

    def get_available_products(self) -> List[Dict[str, Any]]:
        """List all available products with metadata and inventory status."""
        products = []
        for sku, meta in NIKE_PRODUCTS.items():
            # Check historical metrics
            has_history = False
            hist_spend = 0.0
            hist_roas = 0.0
            inv = 450
            if not self.df.empty and "sku" in self.df.columns:
                sub = self.df[self.df["sku"] == sku]
                if not sub.empty:
                    has_history = True
                    hist_spend = float(sub["spend"].sum())
                    tot_rev = float(sub["revenue"].sum())
                    hist_roas = round(tot_rev / max(hist_spend, 1e-6), 2)
                    if "inventory" in sub.columns:
                        inv = int(sub.sort_values("date")["inventory"].iloc[-1])

            price = float(meta.get("price", 120.0))
            products.append({
                "sku": sku,
                "name": meta.get("name", sku),
                "category": meta.get("category", "Sportswear"),
                "price": price,
                "rating": meta.get("rating", 4.5),
                "reviews": meta.get("reviews", 50),
                "photoUrl": meta.get("image", ""),
                "inventory": inv,
                "hasHistoricalData": has_history,
                "historicalRoas": hist_roas,
                "grossMarginPct": 62.0,
            })
        return products

    def generate_recommendations(
        self,
        sku: str,
        total_budget: float = 5000.0,
        duration_days: int = 14,
        target_roas_floor: float = 1.8,
        platform_filter: Optional[List[str]] = None,
        strategy_focus: str = "MAX_PROFIT",  # MAX_PROFIT, BALANCED, SCALE_VOLUME
    ) -> PlaygroundAnalysisResult:
        """Generate approximately 10 distinct campaign configurations and rank by predicted profit."""
        # 1. Retrieve product metadata
        meta = NIKE_PRODUCTS.get(sku, {})
        product_name = meta.get("name", f"Product {sku}")
        category = meta.get("category", "Footwear")
        price = float(meta.get("price", 120.0))
        photo_url = meta.get("image", "")

        # 2. Extract product historical records
        hist_df = pd.DataFrame()
        data_warning: Optional[str] = None
        if not self.df.empty and "sku" in self.df.columns:
            hist_df = self.df[self.df["sku"] == sku].copy()

        inventory = 450
        gross_margin_pct = 0.62  # Nike direct DTC benchmark ~62%
        hist_roas = 2.85
        hist_daily_spend = 1200.0

        if not hist_df.empty:
            if "inventory" in hist_df.columns:
                inventory = int(hist_df.sort_values("date")["inventory"].iloc[-1])
            if "margin" in hist_df.columns and "revenue" in hist_df.columns:
                tot_rev = hist_df["revenue"].sum()
                tot_margin = hist_df["margin"].sum()
                if tot_rev > 0:
                    gross_margin_pct = round(float(tot_margin / tot_rev), 4)
            tot_spend = hist_df["spend"].sum()
            tot_rev = hist_df["revenue"].sum()
            if tot_spend > 0:
                hist_roas = round(float(tot_rev / tot_spend), 2)
                hist_daily_spend = float(hist_df.groupby("date")["spend"].sum().mean())
            if len(hist_df) < 14:
                data_warning = f"Limited historical observation window ({len(hist_df)} days). Baseline priors applied."
        else:
            data_warning = "No historical ad records found for this specific SKU. Cross-portfolio footwear benchmarks applied."

        # Calibrate base daily budget for the test horizon
        daily_budget_ref = max(50.0, total_budget / max(duration_days, 1))

        # 3. Fit platform-specific response curves from history or calibrated priors
        curves: Dict[str, tuple[float, float]] = {}
        platform_cpm_base: Dict[str, float] = {
            "meta": 9.5,
            "google": 14.0,
            "amazon": 11.2,
            "tiktok": 6.8,
        }
        platform_cvr_base: Dict[str, float] = {
            "meta": 0.028,
            "google": 0.038,
            "amazon": 0.045,
            "tiktok": 0.020,
        }

        for p in ["meta", "google", "amazon", "tiktok"]:
            if not hist_df.empty and "platform" in hist_df.columns:
                p_sub = hist_df[hist_df["platform"] == p]
                if len(p_sub) >= 5 and p_sub["spend"].sum() > 0:
                    k, b = response_curve(p_sub["spend"].values, p_sub["revenue"].values)
                    curves[p] = (k, b)
                    if "cpm" in p_sub.columns and p_sub["cpm"].mean() > 0:
                        platform_cpm_base[p] = float(p_sub["cpm"].mean())
                    if "conversions" in p_sub.columns and p_sub["impressions"].sum() > 0:
                        platform_cvr_base[p] = float(p_sub["conversions"].sum() / max(p_sub["impressions"].sum(), 1))
                    continue

            # Robust empirical fallback anchored to product price and typical channel yields
            b_prior = 0.78
            k_prior = (price * 15.0) / (daily_budget_ref ** b_prior)
            curves[p] = (k_prior, b_prior)

        # 4. Generate ~10 distinct candidate configurations representing realistic, supported strategies
        archetypes = [
            {
                "config_id": "cfg-meta-retarget",
                "title": "Meta Advantage+ High-Intent Retargeting",
                "platform": "meta",
                "objective": "Purchase / Bottom-Funnel",
                "audience_segment": "Website Cart Abandoners & 30d Product Viewers",
                "bidding_strategy": "Target ROAS (3.2x Floor)",
                "budget_weight": 0.95,
                "cvr_mult": 1.45,
                "cpm_mult": 1.25,
                "ctr_mult": 1.35,
                "yield_mult": 1.15,
                "confidence": 0.91,
                "desc": "Focuses spend on bottom-funnel shoppers with demonstrated high purchase intent."
            },
            {
                "config_id": "cfg-meta-lookalike",
                "title": "Meta Lookalike (1-2% High-Value Buyers)",
                "platform": "meta",
                "objective": "Purchase / Conversion",
                "audience_segment": "1% LAL of Top 10% Lifetime Value Footwear Customers",
                "bidding_strategy": "Highest Volume / Lowest Cost",
                "budget_weight": 1.20,
                "cvr_mult": 1.15,
                "cpm_mult": 1.05,
                "ctr_mult": 1.10,
                "yield_mult": 1.08,
                "confidence": 0.88,
                "desc": "Scales acquisition against lookalike clusters resembling high-margin footwear collectors."
            },
            {
                "config_id": "cfg-google-pmax",
                "title": "Google Performance Max (Omnichannel Search+Shopping)",
                "platform": "google",
                "objective": "Conversion Value Maximization",
                "audience_segment": "In-Market Athletic Footwear & Custom Search Intent",
                "bidding_strategy": "Target ROAS (3.0x Floor)",
                "budget_weight": 1.35,
                "cvr_mult": 1.30,
                "cpm_mult": 1.15,
                "ctr_mult": 1.20,
                "yield_mult": 1.12,
                "confidence": 0.89,
                "desc": "Leverages Google Smart Bidding across Shopping, Search, YouTube, and Maps."
            },
            {
                "config_id": "cfg-google-brand-sku",
                "title": "Google Search Exact SKU & Brand Match",
                "platform": "google",
                "objective": "Purchase / High Intent",
                "audience_segment": "Exact Search Queries (e.g., 'Nike Air Max 270 Buy')",
                "bidding_strategy": "Target CPA ($35 Ceiling)",
                "budget_weight": 0.80,
                "cvr_mult": 1.55,
                "cpm_mult": 1.40,
                "ctr_mult": 1.50,
                "yield_mult": 1.20,
                "confidence": 0.93,
                "desc": "Defends high-margin branded search traffic with precise keyword intent."
            },
            {
                "config_id": "cfg-amazon-exact",
                "title": "Amazon Sponsored Products Exact Keyword Match",
                "platform": "amazon",
                "objective": "Marketplace Purchase",
                "audience_segment": "High-Converting Sneaker Search Terms & Competitor ASINs",
                "bidding_strategy": "Target ACoS / Target ROAS (3.4x)",
                "budget_weight": 1.10,
                "cvr_mult": 1.40,
                "cpm_mult": 1.20,
                "ctr_mult": 1.25,
                "yield_mult": 1.14,
                "confidence": 0.90,
                "desc": "Converts ready-to-buy Amazon Prime members directly on product listings."
            },
            {
                "config_id": "cfg-amazon-category",
                "title": "Amazon Sponsored Brands Category Conquesting",
                "platform": "amazon",
                "objective": "Brand Consideration & Share of Shelf",
                "audience_segment": "Running / Lifestyle Category Top Sellers",
                "bidding_strategy": "Dynamic Bids - Up & Down",
                "budget_weight": 1.25,
                "cvr_mult": 1.05,
                "cpm_mult": 1.10,
                "ctr_mult": 1.05,
                "yield_mult": 1.02,
                "confidence": 0.84,
                "desc": "Positions product banner atop category search results to capture competitor defectors."
            },
            {
                "config_id": "cfg-tiktok-spark",
                "title": "TikTok Spark Ads (Creator Sneaker UGC)",
                "platform": "tiktok",
                "objective": "Traffic & Fast Checkout",
                "audience_segment": "Sneakerhead Community & Viral Fit Trends (Ages 18-34)",
                "bidding_strategy": "Lowest Cost / Max Delivery",
                "budget_weight": 0.90,
                "cvr_mult": 0.88,
                "cpm_mult": 0.75,
                "ctr_mult": 1.40,
                "yield_mult": 0.98,
                "confidence": 0.82,
                "desc": "Boosts organic TikTok influencer unboxings and styling clips into native in-feed shopping."
            },
            {
                "config_id": "cfg-tiktok-interest",
                "title": "TikTok Shop In-Feed Conversion Campaign",
                "platform": "tiktok",
                "objective": "Complete Payment",
                "audience_segment": "Fitness Enthusiasts & Streetwear Aesthetic",
                "bidding_strategy": "Target Cost / CPA",
                "budget_weight": 1.00,
                "cvr_mult": 0.92,
                "cpm_mult": 0.80,
                "ctr_mult": 1.20,
                "yield_mult": 0.96,
                "confidence": 0.80,
                "desc": "Direct video ad with embedded 1-tap checkout badge driving instant cart conversions."
            },
            {
                "config_id": "cfg-meta-advantage-broad",
                "title": "Meta Advantage+ Broad Audience Exploration",
                "platform": "meta",
                "objective": "Store Purchases",
                "audience_segment": "Unrestricted Demographics (AI Conversion Signal Optimization)",
                "bidding_strategy": "Lowest Cost with Bid Cap",
                "budget_weight": 1.45,
                "cvr_mult": 1.00,
                "cpm_mult": 0.90,
                "ctr_mult": 1.00,
                "yield_mult": 1.03,
                "confidence": 0.86,
                "desc": "Gives Meta algorithm maximum creative freedom to locate incremental buyers across Instagram & Facebook."
            },
            {
                "config_id": "cfg-google-shopping-standard",
                "title": "Google Standard Shopping High-Priority Defense",
                "platform": "google",
                "objective": "Sales & Inventory Clearance",
                "audience_segment": "Shopping Feed Queries (Specific Model & Colorways)",
                "bidding_strategy": "Maximize Clicks with CPC Limit",
                "budget_weight": 0.70,
                "cvr_mult": 1.20,
                "cpm_mult": 0.95,
                "ctr_mult": 1.15,
                "yield_mult": 1.07,
                "confidence": 0.87,
                "desc": "Granular product feed bid controls ensuring low-cost clicks on exact shoe variants."
            }
        ]

        # Filter platforms if requested
        if platform_filter:
            allowed = set(p.lower() for p in platform_filter)
            archetypes = [a for a in archetypes if a["platform"] in allowed]

        candidates: List[CandidateConfig] = []

        # 5. Simulate each candidate
        for arch in archetypes:
            platform = arch["platform"]
            k, b = curves[platform]

            # Adjust budget according to archetype and strategy focus
            strategy_multiplier = 1.0
            if strategy_focus == "SCALE_VOLUME":
                strategy_multiplier = 1.25
            elif strategy_focus == "BALANCED":
                strategy_multiplier = 1.05

            cand_daily_budget = round(daily_budget_ref * arch["budget_weight"] * strategy_multiplier, 2)
            cand_spend = round(cand_daily_budget * duration_days, 2)

            # Daily base revenue from saturation curve
            daily_rev_base = k * (cand_daily_budget ** b)
            # Apply archetype yield multiplier
            daily_rev = daily_rev_base * arch["yield_mult"]
            cand_revenue = round(daily_rev * duration_days, 2)

            # Financial outcomes
            cand_gross_margin = round(cand_revenue * gross_margin_pct, 2)
            cand_net_profit = round(cand_gross_margin - cand_spend, 2)
            cand_roas = round(cand_revenue / max(cand_spend, 1.0), 2)

            # Volume estimations
            cand_cpm = round(platform_cpm_base[platform] * arch["cpm_mult"], 2)
            cand_impressions = int(max(1, (cand_spend / max(cand_cpm, 0.5)) * 1000))
            
            base_ctr = 0.022
            cand_ctr = base_ctr * arch["ctr_mult"]
            cand_clicks = int(max(1, cand_impressions * cand_ctr))
            cand_cpc = round(cand_spend / max(cand_clicks, 1), 2)

            base_cvr = platform_cvr_base[platform] * arch["cvr_mult"]
            cand_conversions = int(round(cand_revenue / max(price, 1.0)))
            cand_conversions = max(1, cand_conversions)
            cand_cvr = round((cand_conversions / max(cand_clicks, 1)) * 100, 2)

            # Stockout constraints check
            stockout_risk = False
            if inventory <= 0:
                stockout_risk = True
                cand_net_profit = round(-cand_spend, 2)
                cand_roas = 0.0
            elif cand_conversions > inventory:
                stockout_risk = True
                realizable_units = inventory
                realizable_rev = realizable_units * price
                cand_revenue = round(realizable_rev, 2)
                cand_gross_margin = round(cand_revenue * gross_margin_pct, 2)
                cand_net_profit = round(cand_gross_margin - cand_spend, 2)
                cand_roas = round(cand_revenue / max(cand_spend, 1.0), 2)

            # Key drivers and explainability
            key_drivers = []
            if arch["cvr_mult"] > 1.2:
                key_drivers.append(f"Elevated conversion rate (+{(arch['cvr_mult']-1)*100:.0f}% vs channel baseline)")
            if arch["cpm_mult"] < 0.95:
                key_drivers.append(f"Favorable auction CPM (-{(1-arch['cpm_mult'])*100:.0f}% delivery discount)")
            if cand_roas >= target_roas_floor:
                key_drivers.append(f"Comfortably beats break-even target ({cand_roas:.2f}x vs {target_roas_floor:.1f}x floor)")
            if b > 0.8:
                key_drivers.append(f"Low diminishing returns curvature (b={b:.2f}), strong headroom to absorb budget")
            if stockout_risk:
                key_drivers.append(f"WARNING: Volume demand ({cand_conversions} pairs) challenges warehouse stock ({inventory} units)")

            explanation = (
                f"{arch['desc']} Anticipates ${cand_net_profit:,.0f} net profit ({cand_roas:.2f}x ROAS) "
                f"at ${cand_daily_budget:.0f}/day spend over {duration_days} days."
            )
            if stockout_risk and inventory == 0:
                explanation = f"CRITICAL STOCKOUT: Zero warehouse stock remaining. Spend will deplete margin without fulfilling orders."

            confidence = round(float(arch["confidence"] * (0.95 if not hist_df.empty else 0.70)), 2)

            candidates.append(
                CandidateConfig(
                    rank=0,  # assigned after sorting
                    config_id=arch["config_id"],
                    title=arch["title"],
                    platform=platform,
                    objective=arch["objective"],
                    audience_segment=arch["audience_segment"],
                    bidding_strategy=arch["bidding_strategy"],
                    daily_budget=cand_daily_budget,
                    duration_days=duration_days,
                    expected_spend=cand_spend,
                    predicted_impressions=cand_impressions,
                    predicted_clicks=cand_clicks,
                    predicted_cpc=cand_cpc,
                    predicted_cpm=cand_cpm,
                    predicted_conversions=cand_conversions,
                    predicted_cvr=cand_cvr,
                    predicted_revenue=cand_revenue,
                    predicted_gross_margin=cand_gross_margin,
                    predicted_net_profit=cand_net_profit,
                    predicted_roas=cand_roas,
                    confidence_score=confidence,
                    is_recommended=False,
                    stockout_risk=stockout_risk,
                    explanation=explanation,
                    key_drivers=key_drivers,
                )
            )

        # 6. Rank candidates strictly by predicted_net_profit descending
        candidates.sort(key=lambda x: x.predicted_net_profit, reverse=True)

        # Assign ranks and mark #1 as recommended
        for idx, c in enumerate(candidates):
            c.rank = idx + 1
            if idx == 0:
                c.is_recommended = True

        best_id = candidates[0].config_id if candidates else ""
        baseline_profit = (hist_daily_spend * duration_days * hist_roas * gross_margin_pct) - (hist_daily_spend * duration_days)
        best_profit = candidates[0].predicted_net_profit if candidates else 0.0
        profit_lift = round(best_profit - baseline_profit, 2)

        return PlaygroundAnalysisResult(
            sku=sku,
            product_name=product_name,
            category=category,
            price=price,
            gross_margin_pct=round(gross_margin_pct * 100, 2),
            inventory=inventory,
            photo_url=photo_url,
            total_budget_constraint=round(total_budget, 2),
            duration_days=duration_days,
            candidates=candidates,
            baseline_historical_roas=hist_roas,
            baseline_historical_daily_spend=round(hist_daily_spend, 2),
            best_config_id=best_id,
            profit_lift_over_baseline=profit_lift,
            data_quality_warning=data_warning,
        )


# Singleton instance for quick imports
default_playground_engine = AdPlaygroundEngine()
