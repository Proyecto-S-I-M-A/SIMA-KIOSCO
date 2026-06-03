import sys
import requests


def main():
    if len(sys.argv) < 2:
        print("Uso: python complete_order.py <order_id> [status] [details]")
        print("Ejemplo: python complete_order.py a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
        sys.exit(1)

    order_id = sys.argv[1]
    status = sys.argv[2] if len(sys.argv) > 2 else "delivered"
    details = (
        sys.argv[3] if len(sys.argv) > 3 else "Entrega manual simulada exitosamente."
    )

    url = "http://localhost:8000/api/webhook"
    payload = {"order_id": order_id, "status": status, "details": details}

    print(f"Enviando solicitud POST a {url}...")
    print("Payload:", payload)

    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"\nRespuesta del servidor (Status {response.status_code}):")
        try:
            print(response.json())
        except Exception:
            print(response.text)
    except Exception as e:
        print(f"\nError al conectar con el backend: {e}")


if __name__ == "__main__":
    main()
