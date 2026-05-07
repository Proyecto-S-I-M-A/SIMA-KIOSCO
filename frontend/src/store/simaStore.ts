import { create } from 'zustand';

export type ViewState = 'AUTH' | 'RECETAS' | 'DESPACHO';

interface SimaState {
  view: ViewState;
  cedula: string | null;
  token: string | null;
  wsMessage: string | null;
  wsStatus: string | null;
  
  // Acciones
  setView: (view: ViewState) => void;
  login: (cedula: string, token: string) => void;
  logout: () => void;
  setWsUpdate: (status: string, message: string) => void;
}

export const useSimaStore = create<SimaState>((set) => ({
  view: 'AUTH',
  cedula: null,
  token: null,
  wsMessage: null,
  wsStatus: null,
  
  setView: (view) => set({ view }),
  
  login: (cedula, token) => set({ cedula, token, view: 'RECETAS' }),
  
  logout: () => set({ 
    cedula: null, 
    token: null, 
    view: 'AUTH', 
    wsMessage: null, 
    wsStatus: null 
  }),
  
  setWsUpdate: (status, message) => set({ wsStatus: status, wsMessage: message }),
}));
