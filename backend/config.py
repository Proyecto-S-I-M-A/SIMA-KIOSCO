import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    MQTT_BROKER: str = os.getenv("MQTT_BROKER", "localhost")
    MQTT_PORT: int = int(os.getenv("MQTT_PORT", "1883"))
    MQTT_DISPENSE_TOPIC: str = os.getenv(
        "MQTT_DISPENSE_TOPIC", "vending/machine/dispense"
    )
    MQTT_STATUS_TOPIC: str = os.getenv("MQTT_STATUS_TOPIC", "vending/machine/status")
    WEBHOOK_URL: str = os.getenv("WEBHOOK_URL", "http://localhost:8000/api/webhook")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    KIOSK_EMAIL: str = os.getenv("KIOSKO_EMAIL")
    KIOSK_PASSWORD: str = os.getenv("KIOSKO_PASSWORD")


settings = Settings()
