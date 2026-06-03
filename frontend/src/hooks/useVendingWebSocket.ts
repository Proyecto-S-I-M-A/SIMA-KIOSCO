import { useEffect, useState, useRef } from 'react';

export interface VendingMessage {
    order_id?: string;
    status: string;
    message?: string;
    details?: string;
}

export const useVendingWebSocket = (url: string, onMessage?: (data: VendingMessage) => void) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const onMessageRef = useRef(onMessage);

    // Keep callback ref fresh to avoid stale closures in the event loop
    useEffect(() => {
        onMessageRef.current = onMessage;
    });

    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectTimer: any = null;

        const connect = () => {
            console.log("Connecting to WebSocket:", url);
            socket = new WebSocket(url);

            socket.onopen = () => {
                setIsConnected(true);
                console.log("WebSocket connected.");
            };

            socket.onclose = () => {
                setIsConnected(false);
                console.warn("WebSocket disconnected. Retrying in 3s...");
                reconnectTimer = setTimeout(connect, 3000);
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                socket?.close();
            };

            socket.onmessage = (event) => {
                try {
                    const data: VendingMessage = JSON.parse(event.data);
                    if (onMessageRef.current) {
                        onMessageRef.current(data);
                    }
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e);
                }
            };
        };

        connect();

        return () => {
            if (socket) {
                socket.close();
            }
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }
        };
    }, [url]);

    return { isConnected };
};