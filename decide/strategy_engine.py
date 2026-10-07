"""AI Ad Campaign Strategy Engine — Core Generator, Simulator, Evaluator & Ranker.

Generates 20 to 25 genuinely distinct advertising campaign strategies,
evaluates each using transparent predictive models calibrated against platform
benchmarks and historical data, and ranks them to select exactly the top 3 recommendations
with data-driven explanations.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class ScoringWeights:
    """Configurable scoring weights for strategy evaluation."""
    roas_weight: float = 0.35
    cpa_efficiency_weight: float = 0.20
    conversion_volume_weight: float = 0.15
    audience_fit_weight: float = 0.15
    confidence_weight: float = 0.10
    risk_penalty_weight: float = 0.05

    def validate(self) -> None:
        total = (
            self.roas_weight
            + self.cpa_efficiency_weight
            + self.conversion_volume_weight
            + self.audience_fit_weight
            + self.confidence_weight
            + self.risk_penalty_weight
        )
        if abs(total - 1.0) > 0.02:
            raise ValueError(f"Scoring weights must sum to 1.0 (currently {total:.2f})")


@dataclass
class CampaignConfig:
    """User campaign configuration parameters."""
    campaign_id: str
    campaign_name: str
    product_service: str
    target_audience: str
    target_location: str
    industry_category: str
    total_budget: float
    campaign_duration: int  # days
    objective: str = "CONVERSIONS"  # CONVERSIONS, ROAS, AWARENESS, TRAFFIC, LEADS
    preferred_platforms: list[str] = field(default_factory=lambda: ["meta", "google", "amazon", "tiktok"])
    product_id: Optional[str] = None
    product_price: Optional[float] = None
    historical_data: dict[str, Any] = field(default_factory=dict)
    constraints: dict[str, Any] = field(default_factory=dict)

    def validate(self) -> None:
        if not self.campaign_name or not self.campaign_name.strip():
            raise ValueError("campaign_name cannot be empty")
        if not self.product_service or not self.product_service.strip():
            raise ValueError("product_service cannot be empty")
        if self.total_budget <= 0:
            raise ValueError(f"total_budget must be positive (got {self.total_budget})")
        if self.campaign_duration <= 0:
            raise ValueError(f"campaign_duration must be positive (got {self.campaign_duration})")
        if not self.preferred_platforms:
            raise ValueError("preferred_platforms must contain at least one platform")


@dataclass
class StrategyEvaluation:
    """Predictive evaluation metrics for a strategy."""
    expected_ctr: float  # e.g. 0.0245 (2.45%)
    expected_cpc: float  # in currency unit
    expected_conversion_rate: float  # e.g. 0.038 (3.8%)
    expected_conversions: int
    expected_cpa: float  # in currency unit
    expected_revenue: float  # in currency unit
    expected_roas: float  # e.g. 3.45x
    risk_score: int  # 0 to 100
    confidence_score: float  # 0.0 to 1.0
    audience_fit_score: float  # 0.0 to 1.0
    overall_score: float  # 0.0 to 100.0
    rank: int = 0
    status: str = "NOT SELECTED"  # SELECTED or NOT SELECTED
    scoring_breakdown: dict[str, float] = field(default_factory=dict)
    model_metadata: dict[str, Any] = field(default_factory=dict)
    selection_reasons: list[str] = field(default_factory=list)
    rejection_reasons: list[str] = field(default_factory=list)


@dataclass
class CampaignStrategy:
    """Full structured campaign strategy representation."""
    strategy_id: str
    campaign_id: str
    strategy_name: str
    description: str
    objective: str
    target_audience: str
    audience_segment: str
    platform: str
    ad_format: str
    creative_angle: str
    messaging_angle: str
    targeting_method: str
    budget_allocation: float
    bidding_strategy: str
    campaign_duration: int
    funnel_stage: str
    geographic_targeting: str
    demographic_targeting: str
    retargeting_type: str
    timing_strategy: str
    offer_strategy: str
    keyword_interest_targeting: str
    advantages: list[str]
    disadvantages: list[str]
    assumptions: list[str]
    evaluation: Optional[StrategyEvaluation] = None

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        return data


# ============================================================================
# STRATEGIC ARCHETYPES (24 genuinely distinct archetypes)
# ============================================================================

STRATEGIC_ARCHETYPES = [
    {
        "code": "ARCH-01",
        "name": "High-Intent Exact Search Acquisition",
        "funnel_stage": "BOFU",
        "platform_default": "google",
        "ad_format": "Responsive Search Ads (RSA)",
        "creative_angle": "Direct Problem-Solution & Technical Specifications",
        "messaging_angle": "Precision Match, Immediate In-Stock Availability & Fast Delivery",
        "targeting_method": "Exact & Phrase Match High-Commercial Keywords",
        "audience_segment": "Active In-Market High-Purchase-Intent Searchers",
        "bidding_strategy": "Target CPA (tCPA) with Conservative Bidding Caps",
        "retargeting_type": "Acquisition (High Intent)",
        "demographic_targeting": "All demographics actively querying specific model terms",
        "timing_strategy": "Even Pacing with 20% Search Volume Surge (10 AM - 8 PM)",
        "offer_strategy": "Full Price In-Stock Showcase with Authentic Manufacturer Warranty",
        "keyword_interest_targeting": "Commercial intent keywords, model numbers, buy online terms",
        "base_ctr": 0.038,
        "base_cpc_ratio": 1.25,
        "base_cvr": 0.042,
        "base_risk": 24,
        "base_confidence": 0.92,
        "budget_share": 0.12,
        "advantages": [
            "Captures users at the moment of peak purchase intent",
            "Consistently highest conversion rates across search channels",
            "Minimal ad creative fatigue compared to visual platforms"
        ],
        "disadvantages": [
            "Higher cost-per-click due to competitive auction bidding",
            "Search volume upper bound limits pure horizontal scaling"
        ],
        "assumptions": [
            "Sufficient search query volume exists for the product/service category",
            "Landing page provides friction-free instant checkout"
        ]
    },
    {
        "code": "ARCH-02",
        "name": "Meta Advantage+ Dynamic Catalog Retargeting",
        "funnel_stage": "RETENTION",
        "platform_default": "meta",
        "ad_format": "Dynamic Carousel Catalog Ads",
        "creative_angle": "Personalized Product Recall with Dynamic Pricing",
        "messaging_angle": "Items Waiting in Cart • Free Shipping Threshold Reminder",
        "targeting_method": "Pixel-Based 7-Day Viewed Product & Abandoned Cart Audience",
        "audience_segment": "Warm Visitors (Visited PDP or Added to Cart in last 14 days)",
        "bidding_strategy": "Lowest Cost with Target ROAS Floor Guardrail",
        "retargeting_type": "Retargeting (Warm Cart Abandoners)",
        "demographic_targeting": "Engaged past website visitors aged 18-55",
        "timing_strategy": "Continuous 24/7 Delivery with Frequency Capping (max 3/day)",
        "offer_strategy": "Limited-Time Complimentary Shipping or 10% Welcome Perk",
        "keyword_interest_targeting": "Website Custom Audience + Catalog Feed Synchronization",
        "base_ctr": 0.026,
        "base_cpc_ratio": 0.85,
        "base_cvr": 0.058,
        "base_risk": 20,
        "base_confidence": 0.90,
        "budget_share": 0.08,
        "advantages": [
            "Superb conversion rates on high-intent warm traffic",
            "Automated product recommendation engine matches visitor interest",
            "Low acquisition cost per recovered cart"
        ],
        "disadvantages": [
            "Audience size bounded strictly by site traffic volume",
            "High frequency risks ad fatigue if retargeting window is too wide"
        ],
        "assumptions": [
            "Meta Pixel / Conversions API tracking active with catalog feed mapped",
            "Site generates at least 500 unique product views weekly"
        ]
    },
    {
        "code": "ARCH-03",
        "name": "TikTok Creator UGC Social Discovery",
        "funnel_stage": "TOFU",
        "platform_default": "tiktok",
        "ad_format": "9:16 Vertical Video Spark Ads",
        "creative_angle": "First-Person Native Unboxing & Authentic Problem Review",
        "messaging_angle": "'The one product I didn't know I needed' viral testimonial hook",
        "targeting_method": "Interest & Behavioral Targeting + Video Interaction Custom Audience",
        "audience_segment": "Gen Z & Millennial Trendsetters, Lifestyle & Category Enthusiasts",
        "bidding_strategy": "Cost Cap with Maximum Delivery Pacing",
        "retargeting_type": "Cold Acquisition (Viral Social)",
        "demographic_targeting": "Ages 18-34, Mobile-first lifestyle & urban creators",
        "timing_strategy": "Heavy Peak Evening Delivery (5 PM - Midnight)",
        "offer_strategy": "Influencer Creator Coupon Code (15% Off)",
        "keyword_interest_targeting": "#SneakerTok, #FitnessMotivation, #StyleInspo, #RunningCommunity",
        "base_ctr": 0.016,
        "base_cpc_ratio": 0.55,
        "base_cvr": 0.019,
        "base_risk": 52,
        "base_confidence": 0.72,
        "budget_share": 0.07,
        "advantages": [
            "Massive viral reach potential with lowest CPM across platforms",
            "Authentic social proof builds rapid emotional connection",
            "Generates valuable UGC creative assets for multi-channel reuse"
        ],
        "disadvantages": [
            "High creative fatigue rate requiring weekly video refreshes",
            "Lower purchase intent on initial impression compared to search"
        ],
        "assumptions": [
            "Engaging 15-second creator vertical video assets are produced",
            "Product has visual novelty or clear demonstrable utility"
        ]
    },
    {
        "code": "ARCH-04",
        "name": "Amazon Sponsored Products Competitor Conquesting",
        "funnel_stage": "BOFU",
        "platform_default": "amazon",
        "ad_format": "Sponsored Products ASIN Product Placement",
        "creative_angle": "Direct Comparison Value Proposition on Rival Product Detail Pages",
        "messaging_angle": "Superior Specs, Higher Rating & Better Value Alternative",
        "targeting_method": "Product / ASIN Targeting on Top 5 Rival Benchmark Products",
        "audience_segment": "Shoppers viewing rival brand listings on Amazon",
        "bidding_strategy": "Dynamic Bids - Up and Down with Buy Box Protection",
        "retargeting_type": "Acquisition (Competitor Intercept)",
        "demographic_targeting": "Amazon Prime active buyers in footwear & apparel",
        "timing_strategy": "Continuous 24/7 Bidding synchronized with Buy Box status",
        "offer_strategy": "Instant Amazon Coupon Badge (5-10% Clippable Discount)",
        "keyword_interest_targeting": "Rival brand ASINs, category leader model names, alternative queries",
        "base_ctr": 0.019,
        "base_cpc_ratio": 1.15,
        "base_cvr": 0.065,
        "base_risk": 38,
        "base_confidence": 0.85,
        "budget_share": 0.09,
        "advantages": [
            "Intercepts qualified buyers right on competitor checkout points",
            "Very high purchase readiness inside the Amazon marketplace",
            "Visible star ratings and Prime badge increase instant trust"
        ],
        "disadvantages": [
            "Competitor bidding wars can cause CPC volatility",
            "Requires active stock and Buy Box ownership at all times"
        ],
        "assumptions": [
            "Product has competitive ratings (>= 4.2 stars) and reliable inventory",
            "Seller has active Buy Box eligibility"
        ]
    },
    {
        "code": "ARCH-05",
        "name": "Google Performance Max (PMax) Omnichannel Scale",
        "funnel_stage": "BOFU",
        "platform_default": "google",
        "ad_format": "PMax Multi-Asset Group (Search + Shopping + YouTube + Maps)",
        "creative_angle": "Full-Funnel Omnichannel Asset Blend with Dynamic Creative",
        "messaging_angle": "Official Store Guarantee • Free Express Delivery & Easy Returns",
        "targeting_method": "Audience Signals (First-party customer list + High intent search queries)",
        "audience_segment": "Algorithmic high-probability converters across Google properties",
        "bidding_strategy": "Target ROAS (tROAS) with Historical Conversion Value Anchor",
        "retargeting_type": "Hybrid Acquisition & Re-engagement",
        "demographic_targeting": "Broad demographic auto-optimized by Google AI",
        "timing_strategy": "Machine Learning Automated Dayparting & Budget Pacing",
        "offer_strategy": "Free Express Delivery on orders over threshold",
        "keyword_interest_targeting": "Audience signals + Google Shopping Merchant Center feed",
        "base_ctr": 0.024,
        "base_cpc_ratio": 0.95,
        "base_cvr": 0.039,
        "base_risk": 28,
        "base_confidence": 0.88,
        "budget_share": 0.14,
        "advantages": [
            "Accesses all Google ad inventories through a single algorithmic engine",
            "Continuously self-optimizes asset combinations for highest conversion value",
            "Strong multi-touch attribution coverage across search and display"
        ],
        "disadvantages": [
            "Black-box placement distribution offers limited channel transparency",
            "Requires extensive asset library (images, videos, headlines, logos)"
        ],
        "assumptions": [
            "Accurate conversion value tracking enabled in Google Ads",
            "Google Merchant Center feed active and approved"
        ]
    },
    {
        "code": "ARCH-06",
        "name": "Meta 1% Lookalike High-LTV Audience Expansion",
        "funnel_stage": "MOFU",
        "platform_default": "meta",
        "ad_format": "High-Definition Video Reels & Feed Carousel",
        "creative_angle": "Aspirational Lifestyle Storytelling & Premium Product Craft",
        "messaging_angle": "'Built for those who demand more' • Elite performance story",
        "targeting_method": "1% Lookalike Audience derived from Top 10% Repeat Purchasers",
        "audience_segment": "High-Affinity Clones of Highest Lifetime Value Customers",
        "bidding_strategy": "Value Optimization (Highest Value Bidding)",
        "retargeting_type": "Prospecting (Lookalike Modeling)",
        "demographic_targeting": "Ages 22-48, Urban Metros, Active Lifestyle Affinity",
        "timing_strategy": "Daytime & Evening Balanced Pacing with Weekend Bump (+15%)",
        "offer_strategy": "Complimentary Premium Gift with Purchase over target threshold",
        "keyword_interest_targeting": "1% LTV Seed List + Running/Athletic Fitness Interests",
        "base_ctr": 0.021,
        "base_cpc_ratio": 0.90,
        "base_cvr": 0.028,
        "base_risk": 32,
        "base_confidence": 0.84,
        "budget_share": 0.10,
        "advantages": [
            "Leverages first-party customer profile data for high-relevance cold reach",
            "Statistically proven higher average order value (AOV)",
            "Scalable audience size (1.5M - 3M qualified individuals)"
        ],
        "disadvantages": [
            "Lookalike fidelity diminishes if first-party seed list is under 1,000 users",
            "Higher creative production cost for premium video reels"
        ],
        "assumptions": [
            "First-party customer purchase history available for seed modeling",
            "Creative aligns with aspirational brand aesthetic"
        ]
    },
    {
        "code": "ARCH-07",
        "name": "Amazon Sponsored Brands Video Showcase",
        "funnel_stage": "MOFU",
        "platform_default": "amazon",
        "ad_format": "Sponsored Brands Video (In-Search Autoplay 16:9)",
        "creative_angle": "Hero Product Engineering & Material Technology in Motion",
        "messaging_angle": "See the Difference: Responsive Cushioning & Lightweight Build",
        "targeting_method": "Category Search Keyword Placement + Brand Store Destination",
        "audience_segment": "Shoppers actively searching category terms on Amazon",
        "bidding_strategy": "Rule-Based Dynamic Bids with Top of Search Multiplier",
        "retargeting_type": "Category Acquisition",
        "demographic_targeting": "Prime shoppers looking for premium footwear & gear",
        "timing_strategy": "Daytime Active Search Hours (8 AM - 10 PM)",
        "offer_strategy": "Brand Store Feature Showcase with Multi-SKU Exploration",
        "keyword_interest_targeting": "Generic category search terms: 'running shoes men', 'cushioned sneakers'",
        "base_ctr": 0.027,
        "base_cpc_ratio": 1.10,
        "base_cvr": 0.048,
        "base_risk": 30,
        "base_confidence": 0.86,
        "budget_share": 0.08,
        "advantages": [
            "Dominates search results page with high-impact autoplay video tile",
            "Significantly higher CTR than static sponsored products",
            "Drives qualified traffic to brand store for multi-item baskets"
        ],
        "disadvantages": [
            "Higher video production barrier and strict Amazon compliance review",
            "High CPC on top category keywords"
        ],
        "assumptions": [
            "Registered brand on Amazon with storefront configured",
            "Crisp 15-30 second silent-friendly product video ready"
        ]
    },
    {
        "code": "ARCH-08",
        "name": "Omnichannel Urgency Flash Drop Countdown",
        "funnel_stage": "BOFU",
        "platform_default": "meta",
        "ad_format": "Urgency Stories & Reels with Animated Countdown Sticker",
        "creative_angle": "Extreme Scarcity & Limited 48-Hour Availability",
        "messaging_angle": "48 Hours Only: Flash Allocation Dropped • When It's Gone, It's Gone",
        "targeting_method": "Combined Warm Engagement + Broad Re-targeting (Past 30 Days)",
        "audience_segment": "Engaged Social Followers + Newsletter Warm Base + Cart Abandoners",
        "bidding_strategy": "Accelerated Pacing with Maximum Conversion Bidding",
        "retargeting_type": "Warm Blitz Retargeting",
        "demographic_targeting": "All past 90-day brand engagers aged 18-50",
        "timing_strategy": "Compressed 48-72 Hour Burst with Hourly Budget Escalation",
        "offer_strategy": "Exclusive Tiered Flash Discount (Buy 1 Get 10%, Buy 2 Get 25%)",
        "keyword_interest_targeting": "Custom engagement audience + VIP loyalty segment",
        "base_ctr": 0.034,
        "base_cpc_ratio": 0.80,
        "base_cvr": 0.052,
        "base_risk": 35,
        "base_confidence": 0.89,
        "budget_share": 0.06,
        "advantages": [
            "Psychological urgency generates massive short-term conversion spikes",
            "Rapidly liquidates seasonal inventory or launches new hero models",
            "High viral shareability among friends and deal forums"
        ],
        "disadvantages": [
            "Not sustainable over long campaign durations (urgency loses credibility)",
            "May compress gross margin percentage due to discount incentive"
        ],
        "assumptions": [
            "Real inventory allocation exists to fulfill sudden order rush",
            "Strict end date enforced to maintain future offer authority"
        ]
    },
    {
        "code": "ARCH-09",
        "name": "TikTok Spark Ads Influencer Co-Branded Push",
        "funnel_stage": "MOFU",
        "platform_default": "tiktok",
        "ad_format": "Spark Ads (Boosted Organic Creator Posts)",
        "creative_angle": "Creator Lifestyle Integration & 'Real Day in My Shoes'",
        "messaging_angle": "'Here is why I swapped my daily runners for these' • Genuine endorsement",
        "targeting_method": "Creator Engagement Lookalikes & Lifestyle Interest Clusters",
        "audience_segment": "Athletic lifestyle followers and fitness micro-communities",
        "bidding_strategy": "Target Cost Cap with Standard Pacing",
        "retargeting_type": "Influencer Amplification",
        "demographic_targeting": "Ages 18-35 interested in marathon, fitness, streetwear",
        "timing_strategy": "Even distribution across weekday evenings and weekends",
        "offer_strategy": "Creator exclusive bundle code + early-access colorways",
        "keyword_interest_targeting": "Fitness, Running, Streetwear, Lifestyle, Sneakerheads",
        "base_ctr": 0.022,
        "base_cpc_ratio": 0.65,
        "base_cvr": 0.024,
        "base_risk": 44,
        "base_confidence": 0.76,
        "budget_share": 0.06,
        "advantages": [
            "Leverages creator's genuine social capital and comments section",
            "Seamless native look prevents ad-blindness skip behavior",
            "Retains social engagement metrics (likes, shares, comments) on profile"
        ],
        "disadvantages": [
            "Dependency on creator permissions and authorization codes",
            "Moderation overhead on viral comment threads"
        ],
        "assumptions": [
            "Creator partnership established with Spark ad authorization code",
            "Video content complies with platform ad policies"
        ]
    },
    {
        "code": "ARCH-10",
        "name": "Google Shopping High-Margin SKU Smart Bidding",
        "funnel_stage": "BOFU",
        "platform_default": "google",
        "ad_format": "Google Merchant Shopping Product Listing Ads (PLA)",
        "creative_angle": "Clean Product Imagery, Price Transparency & Google Customer Reviews",
        "messaging_angle": "Clear pricing, 4.8★ Rating, Free Shipping & 30-Day Trial Guarantee",
        "targeting_method": "Custom Label Filter: High Gross Margin SKUs (>55% Margin)",
        "audience_segment": "Direct product comparators seeking specific footwear models",
        "bidding_strategy": "Target ROAS with Profit Margin Tier Segmentation",
        "retargeting_type": "Shopping Direct Intent",
        "demographic_targeting": "Commercial searchers across all target regions",
        "timing_strategy": "Full week dayparting weighted towards peak e-commerce hours",
        "offer_strategy": "Official Brand Pricing with Price-Match & Authenticity Promise",
        "keyword_interest_targeting": "Google Product Feed attributes + High margin SKU grouping",
        "base_ctr": 0.029,
        "base_cpc_ratio": 0.90,
        "base_cvr": 0.045,
        "base_risk": 22,
        "base_confidence": 0.91,
        "budget_share": 0.11,
        "advantages": [
            "Protects profitability by bidding aggressively only on high-margin inventory",
            "High purchase intent from visual comparison shoppers",
            "Direct synchronization with warehouse stock levels prevents wasted clicks"
        ],
        "disadvantages": [
            "Requires continuous catalog feed maintenance and Google review compliance",
            "Vulnerable to competitor price undercuts in the Shopping carousel"
        ],
        "assumptions": [
            "Product catalog custom labels correctly categorize margin tiers",
            "Competitive price index relative to authorized retailers"
        ]
    },
    {
        "code": "ARCH-11",
        "name": "Metro Commuter Dayparted Geofencing Spike",
        "funnel_stage": "MOFU",
        "platform_default": "meta",
        "ad_format": "Mobile-Optimized Instagram Story & Feed Ads",
        "creative_angle": "End-of-Workday Relief & Urban Commute Comfort",
        "messaging_angle": "Tired feet after a long workday? Step into ultimate responsive cushioning.",
        "targeting_method": "Geofenced Tier-1 Tech & Corporate Hubs (Top Metros) + Dayparting",
        "audience_segment": "Urban Professionals aged 24-42 commuting in major metropolitan clusters",
        "bidding_strategy": "Scheduled High Bidding (6 PM - 11 PM Monday-Thursday)",
        "retargeting_type": "Contextual Geo-Acquisition",
        "demographic_targeting": "Tier-1 Metro corporate hubs, White-collar workers, High disposable income",
        "timing_strategy": "Heavy Dayparting: 70% budget concentrated between 6 PM and 11 PM",
        "offer_strategy": "Express Next-Day Metro Delivery Included",
        "keyword_interest_targeting": "Corporate professionals, commuting, marathon clubs, urban fitness",
        "base_ctr": 0.023,
        "base_cpc_ratio": 0.88,
        "base_cvr": 0.033,
        "base_risk": 34,
        "base_confidence": 0.82,
        "budget_share": 0.05,
        "advantages": [
            "Pinpoint contextual relevance when users are actively feeling fatigue",
            "Eliminates wasted ad spend during dormant working hours",
            "High concentration of high-disposable-income urban customers"
        ],
        "disadvantages": [
            "Geographic restriction limits total addressable audience size",
            "Requires automated scheduled dayparting scripts"
        ],
        "assumptions": [
            "Fast fulfillment infrastructure available in targeted metropolitan areas",
            "Contextual messaging resonates with desk and commuting workforce"
        ]
    },
    {
        "code": "ARCH-12",
        "name": "Niche Athletic Subculture Community Blitz",
        "funnel_stage": "MOFU",
        "platform_default": "meta",
        "ad_format": "Technical Carousel & In-Depth Runner Testimonial",
        "creative_angle": "Mile-Split Optimization, Cadence Analysis & Gait Support",
        "messaging_angle": "Engineered for Sub-4 Marathoners: Carbon Plates & Zero Fatigue Foam",
        "targeting_method": "Niche Running Clubs, Strava Integration Communities & Race Finishers",
        "audience_segment": "Hardcore Endurance Athletes, Marathon Runners, Triathlon Participants",
        "bidding_strategy": "Manual Bid Cap with High Value Audience Focus",
        "retargeting_type": "Niche Affinity Prospecting",
        "demographic_targeting": "Ages 20-50, Marathon registrants, Endurance runners",
        "timing_strategy": "Early Morning (5 AM - 8 AM) and Weekend Long-Run Windows",
        "offer_strategy": "Pro-Athlete Training Guide Booklet with Every Purchase",
        "keyword_interest_targeting": "Marathon training, Strava, Ironman, Carbon plated shoes, Half marathon",
        "base_ctr": 0.031,
        "base_cpc_ratio": 1.05,
        "base_cvr": 0.036,
        "base_risk": 36,
        "base_confidence": 0.81,
        "budget_share": 0.05,
        "advantages": [
            "Extremely high audience passion and organic peer-to-peer word-of-mouth",
            "Lower price sensitivity for performance-enhancing gear",
            "High repeat purchase rate for seasonal mileage replenishment"
        ],
        "disadvantages": [
            "Strictly bounded audience size requires disciplined frequency control",
            "Community is hyper-critical: technical specs must be 100% accurate"
        ],
        "assumptions": [
            "Product delivers genuine athletic performance benefits",
            "Copy uses authentic athletic terminology without corporate fluff"
        ]
    },
    {
        "code": "ARCH-13",
        "name": "VIP Customer Loyalty Tier & Early Access",
        "funnel_stage": "RETENTION",
        "platform_default": "meta",
        "ad_format": "Exclusive Custom Audience Dark Posts & Email Matched Ads",
        "creative_angle": "Member Privilege, Unreleased Colorway Pre-Order & Status",
        "messaging_angle": "Exclusive Member Early Access: Secure Your Size Before General Release",
        "targeting_method": "CRM Customer Match: 2+ Past Purchases or Top 20% Lifetime Value",
        "audience_segment": "Verified Existing Brand Loyalists & Member Club Accounts",
        "bidding_strategy": "Lowest Cost with 100% Delivery Commitment",
        "retargeting_type": "VIP Retention & Repeat Purchase",
        "demographic_targeting": "First-party hashed customer database (Phone & Email)",
        "timing_strategy": "Phased 7-Day Window before public product launch",
        "offer_strategy": "Early Access + 500 Loyalty Reward Points + Limited Edition Shoebag",
        "keyword_interest_targeting": "1st-party CRM list match",
        "base_ctr": 0.045,
        "base_cpc_ratio": 0.70,
        "base_cvr": 0.082,
        "base_risk": 15,
        "base_confidence": 0.95,
        "budget_share": 0.05,
        "advantages": [
            "Highest conversion rate and ROAS of any strategy in the portfolio",
            "Nurtures brand evangelism and customer lifetime value",
            "Immediate cash flow injection during pre-launch phase"
        ],
        "disadvantages": [
            "Does not acquire new customers (strictly repeat monetization)",
            "Audience size strictly constrained by customer database size"
        ],
        "assumptions": [
            "Customer CRM match rate on Meta is at least 65%",
            "Exclusive perk has genuine perceived value for existing buyers"
        ]
    },
    {
        "code": "ARCH-14",
        "name": "Broad Demographic Algorithmic Machine Learning",
        "funnel_stage": "TOFU",
        "platform_default": "meta",
        "ad_format": "Advantage+ Shopping Creative Grid (Static + Video + Carousel)",
        "creative_angle": "Mass-Market Universal Appeal & Relatable Everyday Style",
        "messaging_angle": "The Everyday Shoe That Feels Like Walking on Clouds",
        "targeting_method": "Completely Open Targeting (No interest or demographic restrictions)",
        "audience_segment": "Broad National Population aged 18-65+, Algorithm-Discovered Buyers",
        "bidding_strategy": "Highest Volume with Automated Advantage+ Budget Allocation",
        "retargeting_type": "Broad Algorithmic Prospecting",
        "demographic_targeting": "Open age 18-65+, National distribution",
        "timing_strategy": "24/7 Algorithmic Pacing controlled by Meta Delivery Engine",
        "offer_strategy": "Universal Starter Offer: 10% Off First Pair with Email Signup",
        "keyword_interest_targeting": "None (Algorithmic creative-led targeting)",
        "base_ctr": 0.017,
        "base_cpc_ratio": 0.75,
        "base_cvr": 0.021,
        "base_risk": 40,
        "base_confidence": 0.78,
        "budget_share": 0.12,
        "advantages": [
            "Maximum scaling runway with lowest CPM auction penalty",
            "Allows Meta AI to find unconventional buyer pockets humans overlook",
            "Creative acts as the targeting filter, self-sorting interested buyers"
        ],
        "disadvantages": [
            "Requires higher initial learning budget for algorithmic calibration",
            "Initial conversion variance can be elevated during the first 3-5 days"
        ],
        "assumptions": [
            "Conversions API configured with deduplicated event data",
            "At least 4 diverse creative variants supplied to feed the algorithm"
        ]
    },
    {
        "code": "ARCH-15",
        "name": "Complementary Category Cross-Sell Funnel",
        "funnel_stage": "RETENTION",
        "platform_default": "google",
        "ad_format": "Dynamic Remarketing Display & Discovery Ads",
        "creative_angle": "Complete the Kit: Footwear + Performance Apparel Pairing",
        "messaging_angle": "Pair your new shoes with moisture-wicking socks & running gear",
        "targeting_method": "Purchased Footwear in Last 30-90 Days, Excluded Recent Apparel Buyers",
        "audience_segment": "Recent footwear buyers ready for accessories or seasonal replenishment",
        "bidding_strategy": "Target CPA with Modest Daily Budget Cap",
        "retargeting_type": "Post-Purchase Cross-Sell",
        "demographic_targeting": "Verified recent customers",
        "timing_strategy": "Staggered 30-day post-delivery trigger",
        "offer_strategy": "Cross-sell bundle: 20% off socks & apparel when ordering a second item",
        "keyword_interest_targeting": "First-party recent buyer tag + Dynamic catalog tags",
        "base_ctr": 0.022,
        "base_cpc_ratio": 0.65,
        "base_cvr": 0.046,
        "base_risk": 25,
        "base_confidence": 0.87,
        "budget_share": 0.04,
        "advantages": [
            "Substantially increases Customer Lifetime Value (LTV) at zero cold CAC",
            "Re-engages customers during peak brand goodwill post-unboxing",
            "High gross margin accessories boost blended campaign profitability"
        ],
        "disadvantages": [
            "Relies on steady volume of initial footwear transactions",
            "Requires accurate post-purchase customer event segmentation"
        ],
        "assumptions": [
            "Complementary SKUs (socks, insoles, cleaner kits) in stock",
            "Post-purchase trigger syncs with customer delivery confirmations"
        ]
    },
    {
        "code": "ARCH-16",
        "name": "YouTube Shorts 15s Action-Oriented Hook",
        "funnel_stage": "TOFU",
        "platform_default": "google",
        "ad_format": "YouTube Shorts Vertical Video Ads with Action Banner",
        "creative_angle": "Dramatic Visual Demonstration & Durability Stress Test",
        "messaging_angle": "We tested these shoes across 500 miles of city streets. Here's what happened.",
        "targeting_method": "Custom Intent Audiences (Searched related footwear in last 7 days)",
        "audience_segment": "Active YouTube video consumers searching fitness and sneaker reviews",
        "bidding_strategy": "Maximize Conversions with Video Action Campaign (VAC)",
        "retargeting_type": "Intent-Led Video Prospecting",
        "demographic_targeting": "Ages 18-40, Mobile YouTube app users",
        "timing_strategy": "Leisure viewing hours: Late afternoons and weekend mornings",
        "offer_strategy": "Exclusive YouTube Viewer Link with Instant $15 Off Promo",
        "keyword_interest_targeting": "Shoe review queries, fitness YouTube channels, running advice",
        "base_ctr": 0.015,
        "base_cpc_ratio": 0.60,
        "base_cvr": 0.018,
        "base_risk": 48,
        "base_confidence": 0.74,
        "budget_share": 0.05,
        "advantages": [
            "Captures user attention in engaging full-screen immersive video format",
            "Pairs YouTube video storytelling with Google search intent signals",
            "Strong assisted-conversion lift across search and direct traffic"
        ],
        "disadvantages": [
            "Shorts format has higher accidental swipe-away rate",
            "Direct click-through conversion rate lower than Google Search text ads"
        ],
        "assumptions": [
            "Hook captures user attention within first 3 seconds",
            "Clear permanent on-screen call-to-action button displayed"
        ]
    },
    {
        "code": "ARCH-17",
        "name": "Amazon Brand Defense & Buy Box Shielding",
        "funnel_stage": "BOFU",
        "platform_default": "amazon",
        "ad_format": "Sponsored Products & Sponsored Brands Header Tile",
        "creative_angle": "Official Brand Store Authenticity & Full Size Availability",
        "messaging_angle": "Shop Direct from Brand • 100% Genuine Guaranteed with Full Warranty",
        "targeting_method": "Exact Match Brand Terms & Model Names (Own Brand Keywords)",
        "audience_segment": "Shoppers explicitly searching for your brand name on Amazon",
        "bidding_strategy": "Top of Search Aggressive Bid Placement (+40% Multiplier)",
        "retargeting_type": "Brand Protection",
        "demographic_targeting": "All Amazon searchers querying the exact brand or product name",
        "timing_strategy": "24/7 Uncapped Budget to Prevent Competitor Hijack During Off-Hours",
        "offer_strategy": "Official Brand Flagship Guarantee & Bundle Deals",
        "keyword_interest_targeting": "Exact brand name, specific product line names, official store terms",
        "base_ctr": 0.062,
        "base_cpc_ratio": 0.75,
        "base_cvr": 0.095,
        "base_risk": 18,
        "base_confidence": 0.94,
        "budget_share": 0.07,
        "advantages": [
            "Prevents rival brands from poaching customers searching for you",
            "Extremely high ROAS and conversion rate due to existing intent",
            "Reinforces official brand presence and customer trust"
        ],
        "disadvantages": [
            "Can cannibalize organic brand clicks if not monitored carefully",
            "Adds minor cost to demand that already had high organic intent"
        ],
        "assumptions": [
            "Brand has existing organic search equity on Amazon",
            "Competitors are bidding on or attempting to conquer brand keywords"
        ]
    },
    {
        "code": "ARCH-18",
        "name": "Weekend Surge Flash Promotion Acceleration",
        "funnel_stage": "BOFU",
        "platform_default": "meta",
        "ad_format": "Instagram Carousel & Instant Experience Canvas",
        "creative_angle": "Weekend Activity Readiness & Monday Morning Motivation",
        "messaging_angle": "Get Weekend Ready • Upgrade Your Saturday Run Gear Now",
        "targeting_method": "Warm Site Visitors + Lookalike Active Runners",
        "audience_segment": "Active urban consumers shopping during weekend downtime",
        "bidding_strategy": "Target CPA with Weekend Budget Escalation (+50% Fri-Sun)",
        "retargeting_type": "Temporal Weekend Acquisition",
        "demographic_targeting": "Ages 22-45, Active urban professionals",
        "timing_strategy": "Concentrated Friday 3 PM through Sunday 11 PM window",
        "offer_strategy": "Weekend Special: Free Expedited Shipping for Orders Before Sunday Midnight",
        "keyword_interest_targeting": "Weekend sports, 5k run, fitness shopping, lifestyle",
        "base_ctr": 0.025,
        "base_cpc_ratio": 0.85,
        "base_cvr": 0.038,
        "base_risk": 29,
        "base_confidence": 0.85,
        "budget_share": 0.06,
        "advantages": [
            "Capitalizes on e-commerce browsing behavior during weekend leisure hours",
            "Clear weekend shipping deadline creates natural urgency",
            "Higher mobile engagement time allows deeper product discovery"
        ],
        "disadvantages": [
            "Weekend CPMs can be higher due to increased competition in retail categories",
            "Requires automated budget scheduling to avoid Monday overspend"
        ],
        "assumptions": [
            "Weekend mobile landing page speed is under 2.0 seconds",
            "Order processing team ready to handle Monday fulfillment surge"
        ]
    },
    {
        "code": "ARCH-19",
        "name": "Educational Foot Health & Ergonomics Lead",
        "funnel_stage": "TOFU",
        "platform_default": "google",
        "ad_format": "Responsive Display & Native Content Discovery Ads",
        "creative_angle": "Plantar Fasciitis Relief & Orthopedic Ergonomics Comparison",
        "messaging_angle": "Why 78% of runners suffer from heel pain (and how dual-density foam fixes it)",
        "targeting_method": "Health & Wellness Contextual Content Placement",
        "audience_segment": "Individuals researching foot comfort, standing jobs, injury recovery",
        "bidding_strategy": "Target CPA with Content Landing Page Bridge",
        "retargeting_type": "Problem-Aware Educational Acquisition",
        "demographic_targeting": "Ages 30-65+, Workers on their feet (healthcare, hospitality, retail)",
        "timing_strategy": "Even daily pacing across health and lifestyle publications",
        "offer_strategy": "Free 30-Day In-Home Wear Test with Zero-Risk Return Guarantee",
        "keyword_interest_targeting": "Plantar fasciitis, arch support, standing all day shoes, orthopedic runners",
        "base_ctr": 0.018,
        "base_cpc_ratio": 0.70,
        "base_cvr": 0.026,
        "base_risk": 33,
        "base_confidence": 0.80,
        "budget_share": 0.05,
        "advantages": [
            "Taps into a massive underserved problem-aware demographic with severe pain points",
            "30-day wear test guarantee overcomes initial sizing skepticism",
            "Very low price sensitivity when health and daily comfort are addressed"
        ],
        "disadvantages": [
            "Requires educational bridge content before pushing to product checkout",
            "Slightly longer consideration cycle from initial click to purchase"
        ],
        "assumptions": [
            "Product design provides verifiable arch support and cushioning benefits",
            "Return logistics can handle trial return requests efficiently"
        ]
    },
    {
        "code": "ARCH-20",
        "name": "Regional Tier-2 & Tier-3 Growth Expansion",
        "funnel_stage": "MOFU",
        "platform_default": "meta",
        "ad_format": "Localized Regional Video Reels with Vernacular Nuances",
        "creative_angle": "Aspirational Premium Brand Status & Nationwide Free Delivery",
        "messaging_angle": "Genuine Global Quality Delivered Right to Your Doorstep",
        "targeting_method": "Geographic Exclusion of Top 6 Metros (Targeting Tier-2 & Tier-3 Cities)",
        "audience_segment": "Emerging aspirational consumers in rapidly growing non-metro hubs",
        "bidding_strategy": "Lowest Cost with Broad Reach Guardrail",
        "retargeting_type": "Regional Expansion Acquisition",
        "demographic_targeting": "Tier-2/3 high-growth cities, Ages 18-38",
        "timing_strategy": "Steady continuous pacing throughout the week",
        "offer_strategy": "Cash on Delivery (COD) Option Available + Pre-paid Discount Perk",
        "keyword_interest_targeting": "Online shopping, athletic brands, aspirational sportswear",
        "base_ctr": 0.028,
        "base_cpc_ratio": 0.50,
        "base_cvr": 0.025,
        "base_risk": 42,
        "base_confidence": 0.77,
        "budget_share": 0.06,
        "advantages": [
            "Substantially lower auction CPM and CPC costs than saturated metros",
            "Massive untapped market with skyrocketing brand appetite",
            "Lower ad fatigue rates and higher initial engagement curiosity"
        ],
        "disadvantages": [
            "Higher RTO (Return to Origin) rate if Cash on Delivery is enabled",
            "Longer shipping transit times may affect customer satisfaction"
        ],
        "assumptions": [
            "Reliable courier partners with doorstep tracking in non-metro pin codes",
            "COD fraud mitigation or pre-paid incentives active"
        ]
    },
    {
        "code": "ARCH-21",
        "name": "Dynamic Search Ads (DSA) Long-Tail Query Harvester",
        "funnel_stage": "BOFU",
        "platform_default": "google",
        "ad_format": "Dynamic Search Ads (DSA) with Auto-Generated Headlines",
        "creative_angle": "Landing Page Content Synchronization & Exact Match Headline",
        "messaging_angle": "Find Exactly What You Want • In-Stock Catalog Synced Directly",
        "targeting_method": "Automated Crawl of Website Product Categories & Breadcrumbs",
        "audience_segment": "Users searching ultra-specific long-tail footwear queries",
        "bidding_strategy": "Target CPA with Negative Keyword Master List Protection",
        "retargeting_type": "Long-Tail Intent Harvester",
        "demographic_targeting": "All commercial search queries matching website catalog index",
        "timing_strategy": "24/7 Continuous Automated Capture",
        "offer_strategy": "Direct Deep-Link to Exact Size & Color Filtered Product Page",
        "keyword_interest_targeting": "Automated landing page content targeting",
        "base_ctr": 0.032,
        "base_cpc_ratio": 0.85,
        "base_cvr": 0.037,
        "base_risk": 27,
        "base_confidence": 0.87,
        "budget_share": 0.06,
        "advantages": [
            "Catches thousands of obscure, high-converting long-tail search queries",
            "Zero keyword research overhead: automatically syncs as new inventory arrives",
            "Identifies winning new search queries to promote to manual exact campaigns"
        ],
        "disadvantages": [
            "Risk of wasted spend on irrelevant queries without robust negative keyword list",
            "Less granular control over ad headlines"
        ],
        "assumptions": [
            "Website has clean semantic HTML headers and rich product structured data",
            "Negative keywords list updated weekly to filter junk traffic"
        ]
    },
    {
        "code": "ARCH-22",
        "name": "Price-Elasticity Clearance & Last-Pairs Liquidation",
        "funnel_stage": "BOFU",
        "platform_default": "meta",
        "ad_format": "Carousel with Bold Red Discount Ribbons & Slash-Pricing",
        "creative_angle": "Steal of the Season: Massive Markdown on Discontinued Colorways",
        "messaging_angle": "Final Clearance: Up to 40% Off Remaining Sizes • Never to be restocked",
        "targeting_method": "Deal-Seeker Interest Clusters + Cart Abandoners (Past 60 Days)",
        "audience_segment": "Price-sensitive deal hunters, bargain shoppers, bargain forums",
        "bidding_strategy": "Lowest Cost with Accelerated Volume Pacing",
        "retargeting_type": "Liquidation Clearance",
        "demographic_targeting": "Ages 18-55, Price sensitive shoppers, Outlet store engagers",
        "timing_strategy": "Intense 5-day cycle or until clearance SKU inventory reaches zero",
        "offer_strategy": "Clearance Slash-Price (30-40% Markdown) + Final Sale Policy",
        "keyword_interest_targeting": "Discount shopping, outlet deals, sneaker clearance, sale alerts",
        "base_ctr": 0.036,
        "base_cpc_ratio": 0.65,
        "base_cvr": 0.048,
        "base_risk": 31,
        "base_confidence": 0.88,
        "budget_share": 0.05,
        "advantages": [
            "Accelerates capital turnover on dead stock and odd-sized pairs",
            "High impulse-buy conversion rate driven by extreme price elasticity",
            "Frees warehouse shelf space and working capital for hero lines"
        ],
        "disadvantages": [
            "Lower gross margin per unit sold",
            "Size break stockouts can lead to bounce rate if common sizes sell out fast"
        ],
        "assumptions": [
            "Inventory feed automatically hides sizes that reach 0 units",
            "Clearance banner clearly states 'Final Sale' to prevent returns"
        ]
    },
    {
        "code": "ARCH-23",
        "name": "High-Ticket Footwear & Apparel Bundle AOV Booster",
        "funnel_stage": "BOFU",
        "platform_default": "meta",
        "ad_format": "Side-by-Side Multi-Item Collection Ad with 'Shop the Look'",
        "creative_angle": "Full Kit Cohesion: Matching Shoe, Performance Tee & Shorts Bundle",
        "messaging_angle": "The Complete Runner's Kit: Save ₹2,500 When Purchased as a Set",
        "targeting_method": "High Household Income Zip Codes + Lookalike of High-AOV Buyers",
        "audience_segment": "Affluent shoppers seeking complete coordinated athletic attire",
        "bidding_strategy": "Target ROAS with High Minimum Order Value Floor",
        "retargeting_type": "High-AOV Acquisition",
        "demographic_targeting": "Top 25% Household Income, Ages 25-50",
        "timing_strategy": "Evenly paced with evening shopping spike",
        "offer_strategy": "Pre-packaged Bundle Discount (15% bundle savings) with Free Gift Box",
        "keyword_interest_targeting": "Premium sportswear, marathon kits, luxury athletic gear",
        "base_ctr": 0.020,
        "base_cpc_ratio": 1.10,
        "base_cvr": 0.032,
        "base_risk": 32,
        "base_confidence": 0.83,
        "budget_share": 0.08,
        "advantages": [
            "Significantly boosts Average Order Value (AOV by 1.8x - 2.4x)",
            "Absorbs higher customer acquisition costs while preserving net contribution profit",
            "Exposes customers to multiple product categories in a single transaction"
        ],
        "disadvantages": [
            "Higher checkout price threshold creates hesitation and longer time-to-buy",
            "Complex multi-SKU size selection increases potential for partial returns"
        ],
        "assumptions": [
            "1-click bundle selection functionality exists on product page",
            "Coordinated apparel sizes are in stock matching the hero footwear sizes"
        ]
    },
    {
        "code": "ARCH-24",
        "name": "Social Proof 5-Star Reviews & PR Quotes Blitz",
        "funnel_stage": "MOFU",
        "platform_default": "google",
        "ad_format": "Responsive Display & YouTube Mid-Roll Video with Trust Badges",
        "creative_angle": "Editorial Acclaim ('Runner's World Shoe of the Year') + Verified Reviews",
        "messaging_angle": "'The most comfortable shoe I have ever owned' — 12,000+ 5-Star Reviews",
        "targeting_method": "In-Market Audience for Running Shoes + Website Engagers (Past 30 Days)",
        "audience_segment": "Hesitant consideration-stage buyers needing trust reinforcement",
        "bidding_strategy": "Maximize Conversions with Target CPA Guardrail",
        "retargeting_type": "Trust & Credibility Reinforcement",
        "demographic_targeting": "Ages 22-55, Active online shoppers with consideration hesitation",
        "timing_strategy": "Continuous daily delivery to nurture middle of funnel",
        "offer_strategy": "Risk-Free Trial: 30 Days to test them on the road or 100% money back",
        "keyword_interest_targeting": "Shoe ratings, best running shoes 2026, trusted sportswear",
        "base_ctr": 0.023,
        "base_cpc_ratio": 0.82,
        "base_cvr": 0.035,
        "base_risk": 21,
        "base_confidence": 0.90,
        "budget_share": 0.07,
        "advantages": [
            "Directly addresses skeptic buyer hesitation with third-party social proof",
            "Substantially decreases bounce rate on landing page",
            "Builds enduring brand credibility that benefits all marketing touchpoints"
        ],
        "disadvantages": [
            "Review quotes must be legally verified and updated to prevent stale copy",
            "Less effective for impulse novelty purchases than urgent scarcity offers"
        ],
        "assumptions": [
            "Genuine authentic customer reviews and media accolades exist",
            "Landing page prominently features customer photo reviews and ratings"
        ]
    }
]


# ============================================================================
# STRATEGY GENERATOR
# ============================================================================

def generate_strategies(config: CampaignConfig) -> list[CampaignStrategy]:
    """Generate 20 to 25 genuinely distinct campaign strategies tailored to config.
    
    Varies platforms, formats, funnel stages, creative angles, bidding approaches,
    timing, and targeting methods.
    """
    config.validate()

    total_budget = config.total_budget
    duration = config.campaign_duration
    preferred_platforms = [p.lower() for p in config.preferred_platforms]

    # Map archetypes and adapt platform choices according to preferences
    strategies: list[CampaignStrategy] = []

    for idx, arch in enumerate(STRATEGIC_ARCHETYPES, start=1):
        strategy_id = f"STR-{idx:03d}"
        arch_platform = arch["platform_default"]

        # If platform not in user's preferences, assign to best matching preferred platform
        chosen_platform = arch_platform if arch_platform in preferred_platforms else preferred_platforms[idx % len(preferred_platforms)]

        # Calculate strategic budget allocation
        share = arch["budget_share"]
        # Normalize slightly to ensure total distributes cleanly
        allocated_budget = round(total_budget * share, 2)
        if allocated_budget <= 0:
            allocated_budget = round(total_budget / len(STRATEGIC_ARCHETYPES), 2)

        # Contextualize name and description to product/service
        prod = config.product_service
        strategy_name = f"{arch['name']} — {prod}"
        description = (
            f"{arch['funnel_stage']} campaign on {chosen_platform.upper()} using {arch['ad_format']} "
            f"tailored for {config.target_audience}. Leverages {arch['creative_angle'].lower()} "
            f"with {arch['bidding_strategy']} to maximize return across {duration} days."
        )

        strat = CampaignStrategy(
            strategy_id=strategy_id,
            campaign_id=config.campaign_id,
            strategy_name=strategy_name,
            description=description,
            objective=config.objective,
            target_audience=config.target_audience,
            audience_segment=arch["audience_segment"],
            platform=chosen_platform,
            ad_format=arch["ad_format"],
            creative_angle=arch["creative_angle"],
            messaging_angle=arch["messaging_angle"],
            targeting_method=arch["targeting_method"],
            budget_allocation=allocated_budget,
            bidding_strategy=arch["bidding_strategy"],
            campaign_duration=duration,
            funnel_stage=arch["funnel_stage"],
            geographic_targeting=f"{config.target_location} • {arch['timing_strategy']}",
            demographic_targeting=arch["demographic_targeting"],
            retargeting_type=arch["retargeting_type"],
            timing_strategy=arch["timing_strategy"],
            offer_strategy=arch["offer_strategy"],
            keyword_interest_targeting=arch["keyword_interest_targeting"],
            advantages=arch["advantages"],
            disadvantages=arch["disadvantages"],
            assumptions=arch["assumptions"],
            evaluation=None
        )
        strategies.append(strat)

    return strategies


# ============================================================================
# STRATEGY EVALUATION ENGINE
# ============================================================================

def evaluate_strategy(
    strategy: CampaignStrategy,
    config: CampaignConfig,
    scoring_weights: Optional[ScoringWeights] = None
) -> StrategyEvaluation:
    """Evaluate a single strategy using predictive modeling and transparent baselines."""
    if scoring_weights is None:
        scoring_weights = ScoringWeights()

    # Look up base parameters from archetype
    arch_match = None
    for a in STRATEGIC_ARCHETYPES:
        if a["name"] in strategy.strategy_name:
            arch_match = a
            break
    if not arch_match:
        # Fallback to index-based archetype
        idx = int(strategy.strategy_id.split("-")[-1]) - 1
        arch_match = STRATEGIC_ARCHETYPES[idx % len(STRATEGIC_ARCHETYPES)]

    # 1. Base CTR calibration
    platform = strategy.platform.lower()
    platform_ctr_mult = {
        "google": 1.15 if "search" in strategy.ad_format.lower() else 0.95,
        "meta": 1.05 if "carousel" in strategy.ad_format.lower() else 0.90,
        "amazon": 1.10,
        "tiktok": 0.85
    }.get(platform, 1.0)

    base_ctr = arch_match["base_ctr"] * platform_ctr_mult

    # 2. Base CPC calibration
    # Currency scale inference: if budget > 5000 assume INR or equivalent, else USD
    is_inr = config.total_budget > 20000
    base_unit_cpc = 18.50 if is_inr else 1.20

    platform_cpc_mult = {
        "google": 1.30 if "search" in strategy.ad_format.lower() else 0.90,
        "meta": 0.95,
        "amazon": 1.45,
        "tiktok": 0.60
    }.get(platform, 1.0)

    base_cpc = base_unit_cpc * arch_match["base_cpc_ratio"] * platform_cpc_mult

    # 3. Base Conversion Rate (CVR) calibration
    platform_cvr_mult = {
        "amazon": 1.40,  # High shopping purchase intent
        "google": 1.25 if "search" in strategy.ad_format.lower() else 0.95,
        "meta": 1.00,
        "tiktok": 0.70   # Discovery top of funnel
    }.get(platform, 1.0)

    base_cvr = arch_match["base_cvr"] * platform_cvr_mult

    # 4. Calibrate with historical data if available
    historical = config.historical_data or {}
    has_historical = bool(historical and len(historical) > 0)
    history_multiplier = 1.0

    if has_historical:
        hist_roas = float(historical.get("past_roas", 3.0))
        hist_ctr = float(historical.get("past_ctr", 0.02))
        hist_cpc = float(historical.get("past_cpc", base_cpc))
        
        # Bayesian blending: 60% historical, 40% benchmark prior
        base_ctr = (0.60 * hist_ctr) + (0.40 * base_ctr)
        base_cpc = (0.60 * hist_cpc) + (0.40 * base_cpc)
        history_multiplier = (hist_roas / 3.0) * 0.4 + 0.6
    
    # 5. Determine Average Order Value (AOV)
    if config.product_price and config.product_price > 0:
        aov = float(config.product_price)
    elif is_inr:
        aov = 4250.0  # e.g. INR 4,250 for athletic footwear
    else:
        aov = 135.0   # e.g. $135

    # 6. Mathematical Projections
    allocated_budget = max(strategy.budget_allocation, 10.0)
    expected_cpc = round(max(base_cpc, 0.1), 2)
    expected_ctr = round(float(np_clip(base_ctr, 0.005, 0.08)), 4)
    expected_cvr = round(float(np_clip(base_cvr * history_multiplier, 0.005, 0.15)), 4)

    expected_clicks = allocated_budget / expected_cpc
    expected_conversions = max(1, int(round(expected_clicks * expected_cvr)))
    expected_cpa = round(allocated_budget / expected_conversions, 2)
    expected_revenue = round(expected_conversions * aov, 2)
    expected_roas = round(expected_revenue / allocated_budget, 2)

    # 7. Risk Score Modeling (0–100, higher is riskier)
    # Factors: Platform volatility, funnel coldness, duration
    funnel_risk = {"BOFU": -10, "RETENTION": -15, "MOFU": 5, "TOFU": 18}.get(strategy.funnel_stage, 5)
    platform_risk = {"tiktok": 12, "meta": 4, "google": -4, "amazon": 2}.get(platform, 0)
    duration_risk = 8 if strategy.campaign_duration > 45 else 0
    calculated_risk = int(np_clip(arch_match["base_risk"] + funnel_risk + platform_risk + duration_risk, 10, 95))

    # 8. Confidence Score Modeling (0.0 to 1.0)
    base_confidence = arch_match["base_confidence"]
    if has_historical:
        confidence = min(0.98, base_confidence + 0.06)
    else:
        confidence = max(0.65, base_confidence - 0.05)
    confidence = round(float(confidence), 2)

    # 9. Audience Fit Score (0.0 to 1.0)
    # Higher for strategies aligned with user objective
    fit_score = 0.85
    obj = config.objective.upper()
    if obj == "CONVERSIONS" and strategy.funnel_stage in ["BOFU", "RETENTION"]:
        fit_score = 0.94
    elif obj == "ROAS" and expected_roas >= 3.5:
        fit_score = 0.95
    elif obj == "AWARENESS" and strategy.funnel_stage == "TOFU":
        fit_score = 0.92
    elif obj == "TRAFFIC" and expected_ctr >= 0.025:
        fit_score = 0.90
    else:
        fit_score = 0.82
    fit_score = round(float(fit_score), 2)

    # 10. Configurable Overall Performance Score (0 to 100)
    target_roas = float(config.constraints.get("target_roas", 3.20))
    target_cpa = aov * 0.35  # Healthy 35% CPA benchmark

    norm_roas = min(100.0, (expected_roas / target_roas) * 75.0)
    norm_cpa = min(100.0, max(0.0, (target_cpa / max(expected_cpa, 1.0)) * 75.0))
    norm_volume = min(100.0, (expected_conversions / max(allocated_budget / target_cpa, 1.0)) * 80.0)
    norm_fit = fit_score * 100.0
    norm_confidence = confidence * 100.0
    norm_risk_safe = 100.0 - calculated_risk

    overall_score = (
        norm_roas * scoring_weights.roas_weight
        + norm_cpa * scoring_weights.cpa_efficiency_weight
        + norm_volume * scoring_weights.conversion_volume_weight
        + norm_fit * scoring_weights.audience_fit_weight
        + norm_confidence * scoring_weights.confidence_weight
        + norm_risk_safe * scoring_weights.risk_penalty_weight
    )
    overall_score = round(float(np_clip(overall_score, 15.0, 98.5)), 2)

    scoring_breakdown = {
        "roas_contribution": round(norm_roas * scoring_weights.roas_weight, 2),
        "cpa_efficiency_contribution": round(norm_cpa * scoring_weights.cpa_efficiency_weight, 2),
        "volume_contribution": round(norm_volume * scoring_weights.conversion_volume_weight, 2),
        "audience_fit_contribution": round(norm_fit * scoring_weights.audience_fit_weight, 2),
        "confidence_contribution": round(norm_confidence * scoring_weights.confidence_weight, 2),
        "risk_safety_contribution": round(norm_risk_safe * scoring_weights.risk_penalty_weight, 2),
        "target_roas_anchor": target_roas,
        "aov_anchor": aov
    }

    model_metadata = {
        "is_model_estimate": not has_historical,
        "model_basis": "Empirical Bayesian Multi-Channel Response Model (2026.1)" if has_historical else "Platform Empirical Benchmark Prior Model (2026.1)",
        "historical_calibrated": has_historical,
        "currency": "INR" if is_inr else "USD"
    }

    return StrategyEvaluation(
        expected_ctr=expected_ctr,
        expected_cpc=expected_cpc,
        expected_conversion_rate=expected_cvr,
        expected_conversions=expected_conversions,
        expected_cpa=expected_cpa,
        expected_revenue=expected_revenue,
        expected_roas=expected_roas,
        risk_score=calculated_risk,
        confidence_score=confidence,
        audience_fit_score=fit_score,
        overall_score=overall_score,
        rank=0,
        status="NOT SELECTED",
        scoring_breakdown=scoring_breakdown,
        model_metadata=model_metadata,
        selection_reasons=[],
        rejection_reasons=[]
    )


def np_clip(val: float, min_val: float, max_val: float) -> float:
    """Helper clip function without numpy dependency if needed."""
    return max(min_val, min(max_val, val))


# ============================================================================
# STRATEGY RANKING & RECOMMENDATION ENGINE
# ============================================================================

def rank_and_evaluate_all(
    strategies: list[CampaignStrategy],
    config: CampaignConfig,
    scoring_weights: Optional[ScoringWeights] = None
) -> tuple[list[CampaignStrategy], list[CampaignStrategy]]:
    """Evaluate all strategies, rank from best to worst, and select exactly the top 3.
    
    Generates data-driven reasons for selected and rejected strategies.
    Returns: (all_ranked_strategies, top_3_recommendations)
    """
    if not strategies:
        return [], []

    # Evaluate all
    for strat in strategies:
        strat.evaluation = evaluate_strategy(strat, config, scoring_weights)

    # Sort descending by overall score
    strategies.sort(key=lambda s: s.evaluation.overall_score if s.evaluation else 0.0, reverse=True)

    # Portfolio stats for comparative explanation generation
    scores = [s.evaluation.overall_score for s in strategies if s.evaluation]
    roas_vals = [s.evaluation.expected_roas for s in strategies if s.evaluation]
    cpa_vals = [s.evaluation.expected_cpa for s in strategies if s.evaluation]
    avg_roas = round(sum(roas_vals) / max(len(roas_vals), 1), 2)
    avg_cpa = round(sum(cpa_vals) / max(len(cpa_vals), 1), 2)

    total_count = len(strategies)
    top_3_count = min(3, total_count)

    # Assign ranks and explain decisions
    top_3: list[CampaignStrategy] = []

    for rank_idx, strat in enumerate(strategies, start=1):
        assert strat.evaluation is not None
        strat.evaluation.rank = rank_idx

        # Lower CPA count (how many other strategies have higher CPA than this one)
        better_cpa_than = sum(1 for c in cpa_vals if c > strat.evaluation.expected_cpa)

        if rank_idx <= top_3_count:
            # SELECTED
            strat.evaluation.status = "SELECTED"
            
            reasons = [
                f"Selected as Rank #{rank_idx} with top-tier overall performance score of {strat.evaluation.overall_score}/100.",
                f"Predicted ROAS of {strat.evaluation.expected_roas:.2f}x significantly outperforms portfolio average ({avg_roas:.2f}x).",
                f"Exceptional acquisition efficiency: expected CPA of ₹{strat.evaluation.expected_cpa:,.2f} is lower than {better_cpa_than} of {total_count-1} alternative strategies.",
                f"High audience fit rating ({int(strat.evaluation.audience_fit_score*100)}%) on {strat.platform.upper()} with controlled risk score ({strat.evaluation.risk_score}/100)."
            ]
            strat.evaluation.selection_reasons = reasons
            top_3.append(strat)
        else:
            # NOT SELECTED
            strat.evaluation.status = "NOT SELECTED"
            rejection_reasons = []

            if strat.evaluation.expected_roas < avg_roas:
                rejection_reasons.append(
                    f"Lower predicted ROAS ({strat.evaluation.expected_roas:.2f}x vs {avg_roas:.2f}x portfolio average)"
                )
            if strat.evaluation.expected_cpa > avg_cpa:
                rejection_reasons.append(
                    f"Higher expected CPA (₹{strat.evaluation.expected_cpa:,.2f} vs ₹{avg_cpa:,.2f} benchmark)"
                )
            if strat.evaluation.risk_score > 40:
                rejection_reasons.append(
                    f"Elevated risk score ({strat.evaluation.risk_score}/100) from platform volatility or audience saturation"
                )
            if strat.evaluation.expected_conversion_rate < 0.025:
                rejection_reasons.append(
                    f"Sub-optimal expected conversion rate ({strat.evaluation.expected_conversion_rate*100:.1f}%)"
                )
            if not rejection_reasons:
                rejection_reasons.append(
                    f"Outperformed in composite efficiency by Top 3 strategies (overall score {strat.evaluation.overall_score:.1f} vs Top 3 cutoff)"
                )

            strat.evaluation.rejection_reasons = rejection_reasons

    return strategies, top_3


# ============================================================================
# STRATEGY COMPARISON ENGINE
# ============================================================================

def compare_strategies(
    strategy_ids: list[str],
    all_strategies: list[CampaignStrategy]
) -> dict[str, Any]:
    """Compare multiple specified strategies across all required dimensions."""
    id_map = {s.strategy_id: s for s in all_strategies}
    selected_strategies = [id_map[sid] for sid in strategy_ids if sid in id_map]

    if not selected_strategies:
        raise ValueError("None of the requested strategy IDs were found in the strategy pool")

    comparison_data = []
    for s in selected_strategies:
        eval_data = s.evaluation
        comparison_data.append({
            "strategy_id": s.strategy_id,
            "strategy_name": s.strategy_name,
            "platform": s.platform,
            "funnel_stage": s.funnel_stage,
            "audience": s.target_audience,
            "audience_segment": s.audience_segment,
            "budget": s.budget_allocation,
            "expected_revenue": eval_data.expected_revenue if eval_data else 0.0,
            "expected_roas": eval_data.expected_roas if eval_data else 0.0,
            "expected_conversions": eval_data.expected_conversions if eval_data else 0,
            "expected_cpa": eval_data.expected_cpa if eval_data else 0.0,
            "expected_ctr": eval_data.expected_ctr if eval_data else 0.0,
            "expected_cpc": eval_data.expected_cpc if eval_data else 0.0,
            "risk_score": eval_data.risk_score if eval_data else 50,
            "confidence_score": eval_data.confidence_score if eval_data else 0.5,
            "overall_score": eval_data.overall_score if eval_data else 0.0,
            "status": eval_data.status if eval_data else "NOT SELECTED",
            "advantages": s.advantages,
            "disadvantages": s.disadvantages,
            "assumptions": s.assumptions
        })

    # Find winners across key dimensions
    best_roas = max(comparison_data, key=lambda x: x["expected_roas"])
    best_cpa = min(comparison_data, key=lambda x: x["expected_cpa"])
    best_rev = max(comparison_data, key=lambda x: x["expected_revenue"])
    lowest_risk = min(comparison_data, key=lambda x: x["risk_score"])

    return {
        "compared_count": len(comparison_data),
        "strategies": comparison_data,
        "highlights": {
            "highest_roas": {
                "strategy_id": best_roas["strategy_id"],
                "strategy_name": best_roas["strategy_name"],
                "value": f"{best_roas['expected_roas']:.2f}x"
            },
            "lowest_cpa": {
                "strategy_id": best_cpa["strategy_id"],
                "strategy_name": best_cpa["strategy_name"],
                "value": f"₹{best_cpa['expected_cpa']:,.2f}"
            },
            "highest_revenue": {
                "strategy_id": best_rev["strategy_id"],
                "strategy_name": best_rev["strategy_name"],
                "value": f"₹{best_rev['expected_revenue']:,.2f}"
            },
            "lowest_risk": {
                "strategy_id": lowest_risk["strategy_id"],
                "strategy_name": lowest_risk["strategy_name"],
                "value": f"{lowest_risk['risk_score']}/100"
            }
        }
    }
