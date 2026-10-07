"""FastAPI router for Execution Directives & Approvals."""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from agents.orchestrator import global_orchestrator
from execute.gateway import ExecutionDirective, ExecutionReceipt

router = APIRouter(prefix="/api/v1/directives", tags=["execution"])


class ApprovalRequest(BaseModel):
    authorization_token: str = "MANUAL_WEB_SIGN_OFF"
    voice_verified: bool = False


@router.get("", response_model=List[ExecutionDirective])
def get_pending_directives():
    """Retrieve all pending directives awaiting authorization."""
    return list(global_orchestrator.pending_directives.values())


@router.post("/{directive_id}/approve", response_model=ExecutionReceipt)
def approve_directive(directive_id: str, payload: Optional[ApprovalRequest] = None):
    """Approve and execute a pending budget directive."""
    token = payload.authorization_token if payload else "MANUAL_WEB_SIGN_OFF"
    try:
        receipt = global_orchestrator.approve_directive(directive_id, authorization_token=token)
        return receipt
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Directive {directive_id} not found.")
