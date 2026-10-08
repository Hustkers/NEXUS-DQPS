"""FastAPI router for deterministic and mathematical optimization endpoints."""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from decide.curves import (
    MediaResponseModelRegistry,
    global_response_registry,
    sample_saturation_curve,
    marginal_roas,
    calculate_inflection_point,
    get_spend_regime,
)
from decide.optimizer import (
    EnterpriseBudgetOptimizer,
    OptimizationResult,
    recommend_from_duckdb,
)
from decide.bandits import (
    CombinatorialBanditWithKnapsacks,
    ShadowPriceState,
    BanditArm,
)

optimizer_router = APIRouter(prefix="/api/v1/optimize", tags=["optimization"])


class CurveSampleRequest(BaseModel):
    channel: str = Field("meta", description="Channel name: meta, google, amazon, shopify")
    max_spend: float = Field(50000.0, description="Maximum spend coordinate to sample (in INR)")
    points: int = Field(50, ge=10, le=200, description="Number of curve points")


class OptimizeDuckDBRequest(BaseModel):
    total_budget: Optional[float] = Field(None, description="Optional total budget ceiling in INR")
    roas_floor: float = Field(1.80, ge=1.0, description="Blended portfolio ROAS floor")
    db_path: str = Field("data/dqps.duckdb", description="Path to DuckDB database")


@optimizer_router.get("/curves/parameters")
def get_channel_parameters(channel: Optional[str] = Query(None, description="Filter by channel")):
    """Retrieve calibrated Hill saturation & adstock parameters."""
    if channel:
        p = global_response_registry.get_parameters(channel)
        return {channel.lower(): p.model_dump()}
    
    # Return all 4 channels
    res = {}
    for ch in ["meta", "google", "amazon", "shopify"]:
        res[ch] = global_response_registry.get_parameters(ch).model_dump()
    return res


@optimizer_router.post("/curves/calibrate")
def calibrate_curves_from_duckdb(db_path: str = Query("data/dqps.duckdb")):
    """Calibrate Hill saturation parameters directly against DuckDB unified_commerce_ledger."""
    try:
        fitted = global_response_registry.fit_from_duckdb(db_path=db_path)
        return {
            "status": "CALIBRATED",
            "channels": {ch: p.model_dump() for ch, p in fitted.items()},
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calibration failed: {str(e)}")


@optimizer_router.post("/curves/sample")
def sample_channel_curve(req: CurveSampleRequest):
    """Sample discrete spend-to-revenue curve points with marginal ROAS and regime classification."""
    p = global_response_registry.get_parameters(req.channel)
    samples = sample_saturation_curve(
        beta=p.beta,
        eta=p.eta,
        K=p.K,
        max_spend=req.max_spend,
        points=req.points,
    )
    inflection = calculate_inflection_point(p.eta, p.K)
    return {
        "channel": req.channel.lower(),
        "parameters": p.model_dump(),
        "inflection_spend": inflection,
        "samples": [s.model_dump() for s in samples],
    }


@optimizer_router.post("/reallocate", response_model=Dict[str, Any])
def run_duckdb_reallocation(req: Optional[OptimizeDuckDBRequest] = None):
    """Solve constrained SLSQP convex budget reallocation over DuckDB lakehouse records."""
    db_path = req.db_path if req else "data/dqps.duckdb"
    total_budget = req.total_budget if req else None
    roas_floor = req.roas_floor if req else 1.80

    try:
        opt_res, summary_df = recommend_from_duckdb(
            db_path=db_path,
            total_budget=total_budget,
            roas_floor=roas_floor,
        )
        return {
            "solver_status": opt_res.solver_status,
            "convergence_time_ms": opt_res.convergence_time_ms,
            "current_net_contribution_margin": opt_res.current_net_contribution_margin,
            "expected_net_contribution_margin": opt_res.expected_net_contribution_margin,
            "margin_lift": opt_res.margin_lift,
            "portfolio_blended_roas": opt_res.portfolio_blended_roas,
            "total_budget_allocated": opt_res.total_budget_allocated,
            "throttled_stockouts": opt_res.throttled_stockouts,
            "campaign_reallocations": summary_df.to_dict(orient="records"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
