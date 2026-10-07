"""FastAPI application for NEXUS-DQPS Autonomous Decision Engine."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from diagnose.router import router as anomalies_router
from execute.router import router as directives_router
from agents.mcp_server import mcp_router
from agents.router import ai_router

app = FastAPI(
    title="NEXUS-DQPS Decision Engine API",
    description="Autonomous D2C Advertising Intelligence & Decision Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(anomalies_router)
app.include_router(directives_router)
app.include_router(mcp_router)
app.include_router(ai_router)


@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "service": "NEXUS-DQPS"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
