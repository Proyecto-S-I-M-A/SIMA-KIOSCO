import { create } from 'zustand';
import ApiClient from '@/api/ApiClient';

export type ViewState = 'AUTH' | 'RECETAS' | 'DESPACHO';

interface SimaState {
  view: ViewState;
  cedula: string | null;
  wsMessage: string | null;
  wsStatus: string | null;
  kioskToken: string | null;

  // Acciones
  setView: (view: ViewState) => void;
  login: (cedula: string) => void;
  logout: () => void;
  setWsUpdate: (status: string, message: string) => void;
  fetchKioskToken: () => Promise<void>;
}

export const useSimaStore = create<SimaState>((set) => ({
  view: 'AUTH',
  cedula: null,
  wsMessage: null,
  wsStatus: null,
  kioskToken: ApiClient.getAccessToken(),

  setView: (view) => set({ view }),

  login: (cedula) => set({ cedula, view: 'RECETAS' }),

  logout: () => set({
    cedula: null,
    view: 'AUTH',
    wsMessage: null,
    wsStatus: null
  }),

  setWsUpdate: (status, message) => set({ wsStatus: status, wsMessage: message }),

  fetchKioskToken: async () => {
    try {
      console.log("Obteniendo credenciales del kiosko desde el backend local...");
      const configResponse = await fetch("http://localhost:8000/api/kiosk/credentials");

      if (!configResponse.ok) {
        console.error("Fallo al obtener las credenciales del kiosko desde el backend local:", configResponse.status);
        return;
      }

      const { email, password } = await configResponse.json();

      if (!email || !password) {
        console.error("No se encontraron credenciales válidas en la respuesta del backend local.");
        return;
      }

      console.log("Autenticando kiosko en la API central...");
      const response = await fetch("https://sima-web.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token || data.token || data.session?.access_token;
        const refresh = data.refresh_token || data.session?.refresh_token || "";
        console.log("Token obtenido de la API central:", token);
        console.log("Refresh token obtenido de la API central:", refresh);
        if (token) {
          set({ kioskToken: token });
          ApiClient.saveSessionAuth(token, refresh);
          console.log("Kiosko autenticado con éxito en la API central.");
        }
      } else {
        console.error("Fallo la autenticación en la API central con estado:", response.status);
      }
    } catch (e) {
      console.error("Error al autenticar el kiosko:", e);
    }
  }
}));
