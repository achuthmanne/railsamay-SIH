from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from contextlib import asynccontextmanager

# Import our custom AI Engine
from backend.core.engine import engine

# Import Database and Routers
from backend.core.database import Database
from backend.api import auth

# Modern FastAPI Lifespan for Production DB Connection Pooling
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    Database.connect_db()
    yield
    # Shutdown: Close MongoDB
    Database.close_db()

app = FastAPI(
    title="Rail Samay API",
    description="Advanced Dynamic ETA Forecasting Engine for Indian Railways",
    version="1.0.0",
    lifespan=lifespan
)

# Advanced CORS setup for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {"status": "Rail Samay Engine is Running!"}

@app.get("/api/train/{train_no}")
async def get_train(train_no: str):
    """Returns the parsed route data for a specific train."""
    data = engine.get_train(train_no)
    if not data:
        return {"error": "Train not found in dataset"}
    return {"train_no": train_no, "route": data}

class DelaySimulationRequest(BaseModel):
    train_no: str
    station_code: str
    delay_minutes: int

@app.post("/api/simulate/delay")
async def simulate_delay(req: DelaySimulationRequest):
    """Simulates a delay for a train at a specific station and cascades ETAs downstream."""
    updated_route = engine.simulate_delay(req.train_no, req.station_code, req.delay_minutes)
    if "error" in updated_route:
        return updated_route
    return {"message": f"Successfully cascaded +{req.delay_minutes}min delay downstream", "route": updated_route}

class ResourceScanRequest(BaseModel):
    station_code: str
    train_no: str
    new_arrival: str
    new_departure: str
    active_trains: list[str]

@app.post("/api/simulate/station-scan")
async def station_resource_scan(req: ResourceScanRequest):
    """
    MASTER SCENARIO 5 Endpoint.
    Scans all platforms and resources at a station to find conflicts based on math overlap.
    """
    report = engine.scan_station_resources(
        req.station_code,
        req.train_no,
        req.new_arrival,
        req.new_departure,
        req.active_trains
    )
    return report

@app.websocket("/ws/live-tracking")
async def websocket_endpoint(websocket: WebSocket):
    """
    Advanced WebSocket endpoint for real-time bi-directional telemetry
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except Exception as e:
        print(f"Connection closed: {e}")
