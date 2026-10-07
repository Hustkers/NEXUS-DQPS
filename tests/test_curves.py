"""Unit tests for Section 5: Media Response Modeling (Adstock & Hill Saturation)."""

import numpy as np
import pytest
from decide.curves import (
    MediaResponseModelRegistry,
    calculate_inflection_point,
    geometric_adstock,
    get_spend_regime,
    hill_saturation,
    marginal_roas,
    sample_saturation_curve,
)


def test_hill_mathematical_boundary_conditions():
    beta = 5000.0
    eta = 1.8
    K = 1000.0

    # 1. f(0) == 0
    assert hill_saturation(0.0, beta, eta, K) == 0.0

    # 2. Monotonic increase: f'(x) >= 0 across positive domain
    spends = np.linspace(1.0, 5000.0, 100)
    revs = hill_saturation(spends, beta, eta, K)
    diffs = np.diff(revs)
    assert np.all(diffs >= 0)

    # 3. Asymptotic convergence to beta as x -> inf
    assert abs(hill_saturation(1_000_000.0, beta, eta, K) - beta) < 1.0


def test_analytical_marginal_roas_derivative():
    beta = 4500.0
    eta = 1.75
    K = 850.0

    # Compare analytical marginal ROAS against finite-difference numerical derivative
    test_spends = [200.0, 500.0, 850.0, 1500.0, 2500.0]
    eps = 1e-4

    for s in test_spends:
        analytical_m = marginal_roas(s, beta, eta, K)
        numerical_m = (hill_saturation(s + eps, beta, eta, K) - hill_saturation(s - eps, beta, eta, K)) / (2 * eps)
        assert abs(analytical_m - numerical_m) < 1e-2


def test_geometric_adstock_carryover():
    # Spends with single impulse on day 0
    spends = [100.0, 0.0, 0.0, 0.0]
    alpha = 0.5
    adstocked = geometric_adstock(spends, alpha=alpha)

    assert adstocked[0] == 100.0
    assert adstocked[1] == 50.0
    assert adstocked[2] == 25.0
    assert adstocked[3] == 12.5


def test_inflection_point_and_regimes():
    beta = 4000.0
    eta = 2.0
    K = 1000.0

    # Inflection point for eta=2: K * ((2 - 1) / (2 + 1))^(1/2) = 1000 * (1/3)^0.5 ~ 577.35
    inflection = calculate_inflection_point(eta, K)
    assert inflection is not None
    assert abs(inflection - 577.35) < 1.0

    # Spend below inflection -> UNDERFUNDED
    assert get_spend_regime(200.0, beta, eta, K) == "UNDERFUNDED"
    # Spend at high saturation -> DIMINISHING
    assert get_spend_regime(4000.0, beta, eta, K) == "DIMINISHING"


def test_saturation_curve_sampling():
    samples = sample_saturation_curve(beta=4500.0, eta=1.75, K=850.0, points=50)
    assert len(samples) == 50
    assert samples[0].spend == 0.0
    assert samples[0].expected_revenue == 0.0
    assert samples[-1].spend > 2000.0
    assert samples[-1].expected_revenue > 3000.0


def test_response_model_fitting_and_mape():
    registry = MediaResponseModelRegistry()

    # Generate synthetic observations with known Hill ground truth + noise
    rng = np.random.default_rng(42)
    s_hist = rng.uniform(100.0, 2500.0, 60)
    r_ground = hill_saturation(s_hist, beta=4800.0, eta=1.6, K=900.0)
    r_hist = r_ground * rng.normal(1.0, 0.05, 60)

    fitted = registry.fit_curve(s_hist, r_hist, channel="meta")

    assert fitted.channel == "meta"
    assert fitted.beta > 2000.0
    assert fitted.eta > 0.5
    assert fitted.K > 100.0
    assert fitted.mape < 0.15  # MAPE < 15%
