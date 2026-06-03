import time
import json
import logging
import requests
import paho.mqtt.client as mqtt

from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vending-simulator")


class VendingSimulator:
    def __init__(self):
        self.client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc, properties):
        if rc == 0:
            logger.info("Simulator connected to Mosquitto Broker!")
            # Subscribe to the topic where backend sends dispense commands
            client.subscribe(settings.MQTT_DISPENSE_TOPIC)
            logger.info(f"Subscribed to topic: {settings.MQTT_DISPENSE_TOPIC}")
        else:
            logger.error(f"Failed to connect, return code: {rc}")

    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            logger.info(f"Received dispense instruction: {payload}")

            command = payload.get("command")
            order_id = payload.get("order_id")
            product_name = payload.get("product_name", "Producto")

            if command == "dispense" and order_id:
                self.simulate_mechanical_dispense(order_id, product_name)
        except Exception as e:
            logger.error(f"Error processing command message: {e}")

    def publish_status(self, order_id: str, status: str, message: str):
        payload = {"order_id": order_id, "status": status, "message": message}
        self.client.publish(settings.MQTT_STATUS_TOPIC, json.dumps(payload), qos=1)
        logger.info(f"Published status to MQTT: {payload}")

    def trigger_webhook(self, order_id: str, status: str, details: str):
        payload = {"order_id": order_id, "status": status, "details": details}
        url = settings.WEBHOOK_URL
        try:
            logger.info(f"Triggering webhook at {url} with: {payload}")
            response = requests.post(url, json=payload, timeout=5)
            if response.status_code == 200:
                logger.info("Webhook delivered successfully!")
            else:
                logger.error(
                    f"Webhook failed with status code {response.status_code}: {response.text}"
                )
        except Exception as e:
            logger.error(f"Error triggering webhook: {e}")

    def simulate_mechanical_dispense(self, order_id: str, product_name: str):
        logger.info(
            f"--- Starting dispensing simulation for order {order_id} ({product_name}) ---"
        )

        # Step 1: Dispensing starts
        time.sleep(1.0)
        self.publish_status(
            order_id=order_id,
            status="dispensing",
            message=f"Preparando motor mecánico para {product_name}...",
        )

        # Step 2: Mechanical motor movement
        time.sleep(2.0)
        self.publish_status(
            order_id=order_id,
            status="dispensing",
            message=f"Girando espiral del compartimiento de {product_name}...",
        )

        # Step 3: Product sliding
        time.sleep(2.0)
        self.publish_status(
            order_id=order_id,
            status="dispensing",
            message="El producto está cayendo a la bandeja de entrega...",
        )

        # Step 4: Drop sensor triggers, report via webhook
        time.sleep(1.5)
        logger.info("Sensor de caída activado en bandeja de entrega.")
        self.trigger_webhook(
            order_id=order_id,
            status="delivered",
            details=f"Entrega mecánica confirmada para '{product_name}'. ¡Disfrute su producto!",
        )

        logger.info(f"--- Dispensing simulation finished for order {order_id} ---")

    def run(self):
        try:
            logger.info(
                f"Connecting to MQTT Broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}..."
            )
            self.client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
            logger.info("Starting simulator loop. Press Ctrl+C to exit.")
            self.client.loop_forever()
        except KeyboardInterrupt:
            logger.info("Simulator stopped.")
        except Exception as e:
            logger.error(f"Simulator error: {e}")


if __name__ == "__main__":
    simulator = VendingSimulator()
    simulator.run()
