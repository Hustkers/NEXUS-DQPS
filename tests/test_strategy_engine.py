"""Comprehensive test suite for the AI Ad Campaign Strategy Engine.

Validates:
- Strategy generation produces between 20 and 25 strategies
- Strategies are genuinely distinct across platforms, formats, funnel stages, bidding strategies, and audiences
- Strategy evaluation computes mathematically sound CTR, CPC, CVR, CPA, Revenue, and ROAS
- Ranking orders strategies strictly by composite overall score
- Exactly 3 recommendations are selected when >= 3 valid strategies exist
- Explanations are data-driven and contain specific comparative metrics
- Edge cases: missing campaign information, negative/zero budgets
- Insufficient/absent historical data fallback to transparent baseline model estimates
- Multi-strategy comparison engine functionality
- FastAPI endpoints for campaign creation, listing, strategy retrieval, and comparison
"""
import pytest
from fastapi.testclient import TestClient

from decide.strategy_engine import (
    CampaignConfig,
    CampaignStrategy,
    ScoringWeights,
    STRATEGIC_ARCHETYPES,
    generate_strategies,
    evaluate_strategy,
    rank_and_evaluate_all,
    compare_strategies,
)
from execute.mock_ads_api import app


@pytest.fixture
def sample_config():
    return CampaignConfig(
        campaign_id="cmp-test-01",
        campaign_name="Nike Pegasus 40 Marathon Blitz",
        product_service="Nike Pegasus 40 Running Shoes",
        target_audience="Marathon runners, daily fitness enthusiasts, urban commuters",
        target_location="Pan-India Metros (Mumbai, Delhi, Bengaluru, Chennai)",
        industry_category="Athletic Footwear & Apparel",
        total_budget=50000.0,
        campaign_duration=30,
        objective="CONVERSIONS",
        preferred_platforms=["meta", "google", "amazon", "tiktok"],
        product_price=4500.0,
        historical_data={
            "past_roas": 3.4,
            "past_ctr": 0.024,
            "past_cpc": 16.50
        },
        constraints={"target_roas": 3.20}
    )


@pytest.fixture
def client():
    return TestClient(app)


# 1. Strategy Generation Tests
def test_strategy_generation_produces_20_to_25_strategies(sample_config):
    strategies = generate_strategies(sample_config)
    assert 20 <= len(strategies) <= 25, f"Expected 20-25 strategies, got {len(strategies)}"
    assert len(strategies) == len(STRATEGIC_ARCHETYPES)


def test_strategies_are_genuinely_distinct(sample_config):
    strategies = generate_strategies(sample_config)

    # 1. Unique IDs
    ids = [s.strategy_id for s in strategies]
    assert len(ids) == len(set(ids)), "Strategy IDs must be unique"

    # 2. Distinct strategy names
    names = [s.strategy_name for s in strategies]
    assert len(names) == len(set(names)), "Strategy names must be distinct"

    # 3. Platform diversity (must cover multiple preferred platforms)
    platforms = {s.platform for s in strategies}
    assert len(platforms) >= 3, f"Expected at least 3 distinct platforms, got {platforms}"

    # 4. Funnel stage diversity (TOFU, MOFU, BOFU, RETENTION)
    funnel_stages = {s.funnel_stage for s in strategies}
    assert len(funnel_stages) >= 3, f"Expected multiple funnel stages, got {funnel_stages}"

    # 5. Ad format diversity
    formats = {s.ad_format for s in strategies}
    assert len(formats) >= 5, f"Expected diverse ad formats, got {len(formats)}"

    # 6. Bidding strategy diversity
    bidding = {s.bidding_strategy for s in strategies}
    assert len(bidding) >= 4, f"Expected diverse bidding strategies, got {len(bidding)}"

    # 7. Creative angles diversity
    angles = {s.creative_angle for s in strategies}
    assert len(angles) >= 10, f"Expected diverse creative angles, got {len(angles)}"


# 2. Mathematical Consistency & Evaluation Calculations
def test_evaluation_metrics_are_mathematically_sound(sample_config):
    strategies = generate_strategies(sample_config)
    ranked, top_3 = rank_and_evaluate_all(strategies, sample_config)

    for s in ranked:
        ev = s.evaluation
        assert ev is not None
        assert ev.expected_ctr > 0.0, "Expected CTR must be positive"
        assert ev.expected_cpc > 0.0, "Expected CPC must be positive"
        assert ev.expected_conversion_rate > 0.0, "Conversion rate must be positive"
        assert ev.expected_conversions >= 1, "Expected conversions must be at least 1"
        assert ev.expected_cpa > 0.0, "Expected CPA must be positive"
        assert ev.expected_revenue > 0.0, "Expected revenue must be positive"
        assert ev.expected_roas > 0.0, "Expected ROAS must be positive"

        # Mathematical relationships:
        # CPA = budget / conversions
        expected_cpa_calc = round(s.budget_allocation / ev.expected_conversions, 2)
        assert abs(ev.expected_cpa - expected_cpa_calc) <= 0.05

        # ROAS = revenue / budget
        expected_roas_calc = round(ev.expected_revenue / s.budget_allocation, 2)
        assert abs(ev.expected_roas - expected_roas_calc) <= 0.05

        # Scores bounded
        assert 0 <= ev.risk_score <= 100, "Risk score must be in [0, 100]"
        assert 0.0 <= ev.confidence_score <= 1.0, "Confidence score must be in [0.0, 1.0]"
        assert 0.0 <= ev.overall_score <= 100.0, "Overall score must be in [0, 100]"


# 3. Ranking Tests & Top 3 Selection
def test_ranking_orders_strictly_by_overall_score(sample_config):
    strategies = generate_strategies(sample_config)
    ranked, top_3 = rank_and_evaluate_all(strategies, sample_config)

    scores = [s.evaluation.overall_score for s in ranked]
    assert scores == sorted(scores, reverse=True), "Ranked strategies must be sorted descending by overall_score"

    for idx, s in enumerate(ranked, start=1):
        assert s.evaluation.rank == idx


def test_exactly_3_recommendations_selected_when_sufficient_strategies(sample_config):
    strategies = generate_strategies(sample_config)
    ranked, top_3 = rank_and_evaluate_all(strategies, sample_config)

    assert len(top_3) == 3, f"Expected exactly 3 recommendations, got {len(top_3)}"
    assert all(s.evaluation.status == "SELECTED" for s in top_3)
    assert all(s.evaluation.status == "NOT SELECTED" for s in ranked[3:])

    # The top 3 returned must match the first 3 in ranked
    for i in range(3):
        assert top_3[i].strategy_id == ranked[i].strategy_id


def test_data_driven_explanations_generated(sample_config):
    strategies = generate_strategies(sample_config)
    ranked, top_3 = rank_and_evaluate_all(strategies, sample_config)

    # Selected strategies have rich reasons referencing ROAS, CPA, risk, platform
    for s in top_3:
        reasons = s.evaluation.selection_reasons
        assert len(reasons) >= 3
        combined = " ".join(reasons)
        assert "ROAS" in combined
        assert "score" in combined.lower()

    # Rejected strategies have explicit rejection reasons
    for s in ranked[3:]:
        rejection_reasons = s.evaluation.rejection_reasons
        assert len(rejection_reasons) >= 1
        assert s.evaluation.status == "NOT SELECTED"


# 4. Strategy Comparison Tests
def test_strategy_comparison(sample_config):
    strategies = generate_strategies(sample_config)
    ranked, top_3 = rank_and_evaluate_all(strategies, sample_config)

    ids_to_compare = [ranked[0].strategy_id, ranked[1].strategy_id, ranked[-1].strategy_id]
    comparison = compare_strategies(ids_to_compare, ranked)

    assert comparison["compared_count"] == 3
    assert len(comparison["strategies"]) == 3
    assert "highlights" in comparison
    assert "highest_roas" in comparison["highlights"]
    assert "lowest_cpa" in comparison["highlights"]


# 5. Missing / Invalid Campaign Information Edge Cases
def test_missing_campaign_name_raises():
    with pytest.raises(ValueError, match="campaign_name"):
        cfg = CampaignConfig(
            campaign_id="cmp-err",
            campaign_name="",
            product_service="Shoes",
            target_audience="All",
            target_location="India",
            industry_category="Retail",
            total_budget=10000,
            campaign_duration=14
        )
        cfg.validate()


def test_missing_product_service_raises():
    with pytest.raises(ValueError, match="product_service"):
        cfg = CampaignConfig(
            campaign_id="cmp-err",
            campaign_name="Launch",
            product_service="",
            target_audience="All",
            target_location="India",
            industry_category="Retail",
            total_budget=10000,
            campaign_duration=14
        )
        cfg.validate()


def test_zero_budget_raises():
    with pytest.raises(ValueError, match="total_budget"):
        cfg = CampaignConfig(
            campaign_id="cmp-err",
            campaign_name="Launch",
            product_service="Shoes",
            target_audience="All",
            target_location="India",
            industry_category="Retail",
            total_budget=0,
            campaign_duration=14
        )
        cfg.validate()


def test_insufficient_historical_data_graceful_fallback(sample_config):
    # Empty historical data
    sample_config.historical_data = {}
    strategies = generate_strategies(sample_config)
    ranked, top_3 = rank_and_evaluate_all(strategies, sample_config)

    assert len(ranked) == 24
    for s in ranked:
        assert s.evaluation.model_metadata["is_model_estimate"] is True
        assert "Benchmark Prior" in s.evaluation.model_metadata["model_basis"]
        assert s.evaluation.model_metadata["historical_calibrated"] is False


# 6. Configurable Scoring Logic
def test_configurable_scoring_weights(sample_config):
    custom_weights = ScoringWeights(
        roas_weight=0.70,
        cpa_efficiency_weight=0.10,
        conversion_volume_weight=0.05,
        audience_fit_weight=0.05,
        confidence_weight=0.05,
        risk_penalty_weight=0.05
    )
    custom_weights.validate()

    strategies = generate_strategies(sample_config)
    ranked, top_3 = rank_and_evaluate_all(strategies, sample_config, custom_weights)
    assert len(ranked) == 24
    assert len(top_3) == 3


# 7. FastAPI Endpoints Testing
def test_fastapi_campaign_lifecycle(client):
    payload = {
        "campaign_name": "Nike Air Zoom Rival Test",
        "product_service": "Nike Air Zoom Rival Fly 3",
        "target_audience": "Competitive runners, track athletes",
        "target_location": "National Metros",
        "industry_category": "Footwear",
        "total_budget": 45000.0,
        "campaign_duration": 21,
        "objective": "CONVERSIONS",
        "preferred_platforms": ["meta", "google", "amazon", "tiktok"],
        "product_price": 5495.0
    }

    # 1. POST create & evaluate
    res = client.post("/strategy/campaign", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "success"
    campaign_id = data["campaign_id"]
    assert data["total_strategies"] >= 20
    assert len(data["top_3_recommendations"]) == 3
    assert len(data["all_strategies"]) == data["total_strategies"]

    # 2. GET list campaigns
    list_res = client.get("/strategy/campaigns")
    assert list_res.status_code == 200
    assert any(c["campaign_id"] == campaign_id for c in list_res.json())

    # 3. GET campaign details
    detail_res = client.get(f"/strategy/campaign/{campaign_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["config"]["campaign_name"] == payload["campaign_name"]

    # 4. GET all strategies
    strats_res = client.get(f"/strategy/campaign/{campaign_id}/strategies")
    assert strats_res.status_code == 200
    assert len(strats_res.json()) >= 20

    # 5. GET Top 3 recommendations
    rec_res = client.get(f"/strategy/campaign/{campaign_id}/recommendations")
    assert rec_res.status_code == 200
    assert len(rec_res.json()) == 3

    # 6. GET individual strategy
    first_strat_id = strats_res.json()[0]["strategy_id"]
    single_res = client.get(f"/strategy/campaign/{campaign_id}/strategies/{first_strat_id}")
    assert single_res.status_code == 200
    assert single_res.json()["strategy_id"] == first_strat_id

    # 7. POST compare strategies
    compare_payload = {"strategy_ids": [strats_res.json()[0]["strategy_id"], strats_res.json()[1]["strategy_id"]]}
    cmp_res = client.post(f"/strategy/campaign/{campaign_id}/compare", json=compare_payload)
    assert cmp_res.status_code == 200
    assert cmp_res.json()["count"] == 2


def test_fastapi_nonexistent_campaign_returns_404(client):
    res = client.get("/strategy/campaign/cmp-nonexistent-1234")
    assert res.status_code == 404
