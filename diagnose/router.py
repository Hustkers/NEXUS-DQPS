"""FastAPI router for diagnostic anomaly inspection endpoints."""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Query

from diagnose.anomaly import AnomalyEvent, global_dispatcher

router = APIRouter(prefix="/api/v1/anomalies", tags=["diagnostics"])


@router.get("/active", response_model=List[AnomalyEvent])
def get_active_anomalies(
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, WARNING, INFO"),
    limit: int = Query(50, ge=1, le=200),
) -> List[AnomalyEvent]:
    """Retrieve currently active anomalies sorted by timestamp descending."""
    events = global_dispatcher.get_active_anomalies(limit=limit)
    if severity:
        sev_upper = severity.upper()
        events = [e for e in events if e.severity == sev_upper]
    return events


@router.get("/history", response_model=List[AnomalyEvent])
def get_anomaly_history(
    campaign: Optional[str] = Query(None, description="Filter by campaign identifier"),
    limit: int = Query(100, ge=1, le=500),
) -> List[AnomalyEvent]:
    """Retrieve historical anomaly events."""
    events = global_dispatcher.get_active_anomalies(limit=limit)
    if campaign:
        events = [e for e in events if campaign.lower() in e.campaign.lower()]
    return events
