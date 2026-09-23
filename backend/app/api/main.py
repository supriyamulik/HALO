from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.controller import router as auth_router
from app.research.controller import router as research_router
from app.audit.controller import router as audit_router
from app.generation.controller import router as drafts_router
from app.auth.repository import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="HALO Legal Research API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Permissive CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api/v1 (and aliases)
app.include_router(auth_router, prefix="/api/v1")
app.include_router(auth_router)
app.include_router(research_router, prefix="/api/v1")
app.include_router(research_router)
app.include_router(audit_router, prefix="/api/v1")
app.include_router(audit_router)
app.include_router(drafts_router, prefix="/api/v1")
app.include_router(drafts_router)


@app.get("/api/v1/health", tags=["system"])
@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok"}
