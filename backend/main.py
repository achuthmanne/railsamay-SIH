from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI(
    title="Rail Samay API",
    description="Advanced Dynamic ETA Forecasting Engine for Indian Railways",
    version="1.0.0"
)

# Advanced CORS setup for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "Rail Samay Engine is Running 🟢"}

@app.websocket("/ws/live-tracking")
async def websocket_endpoint(websocket: WebSocket):
    """
    Advanced WebSocket endpoint for real-time bi-directional telemetry
    """
    await websocket.accept()
    try:
        while True:
            # Placeholder for pushing live ETA updates to Frontend
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except Exception as e:
        print(f"Connection closed: {e}")
