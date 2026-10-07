from decide.optimizer import recommend
from diagnose.anomaly import detect_anomalies
from simulator.generator import build_world


def test_simulator_produces_rows_and_events():
    world = build_world(days=30)
    assert len(world["metrics"]) > 0
    assert world["metrics"]["spend"].gt(0).all()
    assert len(world["events"]) >= 1


def test_anomaly_scoring_runs():
    world = build_world(days=30)
    scored = detect_anomalies(world["metrics"])
    assert "anomaly" in scored.columns


def test_optimizer_recommends():
    world = build_world(days=30)
    recs = recommend(world["metrics"])
    assert {"campaign", "recommended_daily_spend", "expected_daily_margin"} <= set(recs.columns)
