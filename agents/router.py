"""FastAPI router for Google Cloud Vertex AI reasoning and LLM endpoints."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.cloud_client import GoogleCloudClient
from agents.rca import get_cloud_client

ai_router = APIRouter(prefix="/api/v1/ai", tags=["Google Cloud Vertex AI"])


class GenerateContentRequest(BaseModel):
    prompt: str = Field(..., description="Prompt sent to Vertex AI Gemini model")
    system_instruction: Optional[str] = Field(None, description="Optional system instruction / persona")
    response_schema: Optional[Dict[str, Any]] = Field(None, description="Optional JSON schema for structured output")


class GenerateContentResponse(BaseModel):
    content: str
    model: str
    provider: str
    auth_method: str
    project_id: Optional[str] = None
    location: Optional[str] = None


class RcaRequest(BaseModel):
    campaign_name: str
    sku_id: str
    primary_root_cause: str
    confidence: float
    total_margin_loss: float
    observed_margin: float
    counterfactual_baseline_margin: float
    shapley_attributions: Dict[str, float] = Field(default_factory=dict)
    dollar_impacts: Dict[str, float] = Field(default_factory=dict)


@ai_router.get("/status")
def get_vertex_ai_status() -> Dict[str, Any]:
    """Retrieve live Google Cloud Vertex AI connection telemetry and ADC status."""
    client = get_cloud_client()
    return client.get_status()


@ai_router.post("/generate", response_model=GenerateContentResponse)
def generate_vertex_ai_content(req: GenerateContentRequest) -> GenerateContentResponse:
    """Generate content or structured JSON reasoning using Google Cloud Vertex AI."""
    client = get_cloud_client()
    try:
        content = client.generate_content(
            prompt=req.prompt,
            system_instruction=req.system_instruction,
            response_schema=req.response_schema,
        )
        status = client.get_status()
        return GenerateContentResponse(
            content=content,
            model=status.get("last_used_model") or status.get("model_name", "gemini-3.8-flash"),
            provider=status.get("last_used_provider") or status.get("provider", "Google Cloud Vertex AI"),
            auth_method=status.get("auth_method", "APPLICATION_DEFAULT_CREDENTIALS"),
            project_id=status.get("project_id"),
            location=status.get("location"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vertex AI generation failed: {str(e)}")


@ai_router.post("/rca")
def generate_rca_explanation(req: RcaRequest) -> Dict[str, Any]:
    """Synthesize counterfactual causal attribution into natural language executive briefing."""
    from diagnose.attribution import CausalAttributionResult
    from agents.rca import synthesize_causal_explanation

    attribution = CausalAttributionResult(
        primary_root_cause=req.primary_root_cause,
        confidence=req.confidence,
        total_margin_loss=req.total_margin_loss,
        observed_margin=req.observed_margin,
        counterfactual_baseline_margin=req.counterfactual_baseline_margin,
        shapley_attributions=req.shapley_attributions,
        dollar_impacts=req.dollar_impacts,
        explanation="",
        inference_latency_ms=12.5,
    )

    return synthesize_causal_explanation(
        attribution=attribution,
        campaign_name=req.campaign_name,
        sku_id=req.sku_id,
    )


class CoachRequest(BaseModel):
    message: str = Field(..., description="User query or message sent to AI Coach")
    history: Optional[list[dict[str, str]]] = Field(default_factory=list, description="Conversation history")


class CoachResponse(BaseModel):
    reply: str
    tool_calls: list[dict[str, Any]] = Field(default_factory=list)
    model: str
    provider: str
    graph: Optional[dict[str, Any]] = None


CoachRequest.model_rebuild()
CoachResponse.model_rebuild()


@ai_router.post("/coach", response_model=CoachResponse)
def coach_chat(req: CoachRequest) -> CoachResponse:
    """Execute AI Coach conversation turn with function calling grounded in DATASET.md."""
    from agents.coach import coach_service
    res = coach_service.chat_turn(user_message=req.message, history=req.history)
    return CoachResponse(
        reply=res.get("reply", ""),
        tool_calls=res.get("tool_calls", []),
        model=res.get("model", "gemini-3.8-flash"),
        provider=res.get("provider", "Google Cloud Vertex AI"),
        graph=res.get("graph"),
    )

