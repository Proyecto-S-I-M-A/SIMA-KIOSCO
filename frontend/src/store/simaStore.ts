import { create } from 'zustand';

export type ViewState = 'AUTH' | 'RECETAS' | 'DESPACHO';

interface SimaState {
  view: ViewState;
  cedula: string | null;
  wsMessage: string | null;
  wsStatus: string | null;
  
  // Acciones
  setView: (view: ViewState) => void;
  login: (cedula: string) => void;
  logout: () => void;
  setWsUpdate: (status: string, message: string) => void;
}

export const useSimaStore = create<SimaState>((set) => ({
  view: 'AUTH',
  cedula: null,
  wsMessage: null,
  wsStatus: null,
  
  setView: (view) => set({ view }),
  
  login: (cedula) => set({ cedula, view: 'RECETAS' }),
  
  logout: () => set({ 
    cedula: null, 
    view: 'AUTH', 
    wsMessage: null, 
    wsStatus: null 
  }),
  
  setWsUpdate: (status, message) => set({ wsStatus: status, wsMessage: message }),
}));
