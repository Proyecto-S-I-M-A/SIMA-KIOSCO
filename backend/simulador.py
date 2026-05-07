import asyncio

async def dispensar_medicamento(ws_send):
    """
    Simula los pasos mecánicos del robot.
    Llama a `ws_send` con las actualizaciones de estado.
    """
    steps = [
        "Iniciando dispensación...",
        "Buscando medicamento en el inventario...",
        "Moviendo brazo robótico...",
        "Extrayendo caja...",
        "Llevando a bandeja de entrega...",
        "Medicamento entregado"
    ]
    
    for step in steps:
        await ws_send({"status": "dispensing", "message": step})
        await asyncio.sleep(2)  # Delay artificial para simular movimiento mecánico
