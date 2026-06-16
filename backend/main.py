import json
import logging
import asyncio
import uuid
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import paho.mqtt.client as mqtt

from config import settings

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vending-backend")

app = FastAPI(
    title="Vending Machine Webhook & MQTT Service",
    description="Backend service connecting Vending Machine mechanical simulator with user Frontend in real time.",
)

# Enable CORS for the separate frontend project
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            f"WebSocket client connected. Active: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(
            f"WebSocket client disconnected. Active: {len(self.active_connections)}"
        )

    async def broadcast(self, message: dict):
        logger.info(f"Broadcasting to WS: {message}")
        # Iterate over copy to prevent mutation issues during disconnects
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending WS message: {e}")
                self.disconnect(connection)


manager = ConnectionManager()

# MQTT Client setup (version 2 callback format)
mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)


def on_connect(client, userdata, flags, rc, properties):
    if rc == 0:
        logger.info("Successfully connected to Mosquitto Broker!")
        # Subscribe to status topic to listen for updates from the vending machine simulator
        client.subscribe(settings.MQTT_STATUS_TOPIC)
        logger.info(f"Subscribed to status topic: {settings.MQTT_STATUS_TOPIC}")
    else:
        logger.error(f"Failed to connect to MQTT Broker, return code: {rc}")


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        logger.info(f"Received MQTT message on '{msg.topic}': {payload}")

        # Schedule the WS broadcast inside the main running asyncio loop
        loop = app.state.loop
        if loop and loop.is_running():
            asyncio.run_coroutine_threadsafe(manager.broadcast(payload), loop)
        else:
            logger.warning("Event loop is not running. Cannot broadcast.")
    except Exception as e:
        logger.error(f"Error in MQTT on_message: {e}")


mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message


@app.on_event("startup")
async def startup_event():
    # Save the reference of the running event loop for MQTT thread callback
    app.state.loop = asyncio.get_running_loop()
    try:
        logger.info(
            f"Connecting to MQTT Broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}..."
        )
        mqtt_client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
        mqtt_client.loop_start()
        logger.info("Started background thread for MQTT client loop")
    except Exception as e:
        logger.error(f"Failed to connect to MQTT Broker: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down MQTT connection...")
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    logger.info("MQTT client disconnected successfully")


# Pydantic Schemas
class DispenseRequest(BaseModel):
    product_id: str
    product_name: str


class WebhookPayload(BaseModel):
    order_id: str
    status: str  # "delivered", "error", etc.
    details: str


# HTTP Endpoints
@app.get("/api/health")
def health_check():
    return {"status": "ok", "mqtt_connected": mqtt_client.is_connected()}


@app.get("/api/kiosk/credentials")
def get_kiosk_credentials():
    """
    Exposes the kiosk credentials (VITE_KIOSK_EMAIL and VITE_KIOSK_PASSWORD)
    read from the Balena system environment.
    """
    email = settings.KIOSK_EMAIL
    password = settings.KIOSK_PASSWORD
    print("email: ", email)
    print("password: ", password)
    if not email or not password:
        logger.error(
            "Kiosk credentials (VITE_KIOSK_EMAIL/VITE_KIOSK_PASSWORD) are not set in environment."
        )
        raise HTTPException(
            status_code=500,
            detail="Kiosk credentials are not configured on this device.",
        )

    return {"email": email, "password": password}


@app.post("/api/dispense")
async def dispense_product(req: DispenseRequest):
    order_id = str(uuid.uuid4())

    # Message format sent to vending machine mechanical parts
    payload = {
        "order_id": order_id,
        "product_id": req.product_id,
        "product_name": req.product_name,
        "command": "dispense",
    }

    try:
        # Publish the command to MQTT
        result = mqtt_client.publish(
            settings.MQTT_DISPENSE_TOPIC, json.dumps(payload), qos=1
        )
        # Wait for publish confirmation
        result.wait_for_publish(timeout=2.0)
        logger.info(f"Published order {order_id} to '{settings.MQTT_DISPENSE_TOPIC}'")
    except Exception as e:
        logger.error(f"Error publishing dispense to MQTT: {e}")
        # Still return requested, but note that it was logged (in a production setup this would raise HTTP 500)
        raise HTTPException(status_code=500, detail=f"MQTT publish failed: {str(e)}")

    # Send immediate notification via WebSockets that the request was registered
    ws_notification = {
        "order_id": order_id,
        "status": "requested",
        "message": f"Orden creada. Enviando instrucción a la expendedora...",
    }
    await manager.broadcast(ws_notification)

    return {
        "order_id": order_id,
        "status": "requested",
        "message": f"Instrucción enviada para {req.product_name}",
    }


@app.post("/api/webhook")
async def vending_machine_webhook(payload: WebhookPayload):
    """
    Webhook endpoint called by the physical machine to notify final transaction status.
    This simulates a hardware drop sensor or mechanical status reporter.
    """
    logger.info(f"Webhook triggered by vending machine: {payload}")

    # Broadcast to frontend via WebSockets
    ws_notification = {
        "order_id": payload.order_id,
        "status": payload.status,
        "message": f"Confirmación mecánica (Webhook): {payload.details}",
    }
    await manager.broadcast(ws_notification)

    return {"status": "accepted", "order_id": payload.order_id}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive text to keep connection alive, although frontend doesn't need to send messages
            data = await websocket.receive_text()
            logger.info(f"WS Client message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
