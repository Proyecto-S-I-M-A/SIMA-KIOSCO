from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from simulador import dispensar_medicamento

app = FastAPI(title="S.I.M.A. Backend", description="Backend para Kiosco de Medicación")

# Permitir CORS para el frontend en React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Cliente conectado por WebSocket")
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("command") == "DISPENSE":
                async def ws_send(msg):
                    await websocket.send_json(msg)
                
                # Ejecutar el simulador enviando la función callback
                await dispensar_medicamento(ws_send)
                
    except WebSocketDisconnect:
        print("Cliente desconectado")
    except Exception as e:
        print(f"Error en WebSocket: {e}")
