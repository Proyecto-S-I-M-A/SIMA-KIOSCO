import { useEffect, useRef } from 'react';
import { useSimaStore } from './store/simaStore';
import Auth from './components/Auth';
import Recetas from './components/Recetas';

function Despacho() {
  const { wsStatus, wsMessage, setWsUpdate, logout } = useSimaStore();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Conectar al WebSocket del backend
    const ws = new WebSocket('ws://localhost:8000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Conectado al robot');
      // Enviar comando para iniciar la dispensación física
      ws.send(JSON.stringify({ command: 'DISPENSE' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setWsUpdate(data.status, data.message);

        // Si el estado es "Medicamento entregado", se finaliza el flujo
        if (data.message === "Medicamento entregado") {
          setTimeout(() => {
            logout(); // Se limpia el token y toda la sesión
          }, 4000);
        }
      } catch (e) {
        console.error("Error al leer mensaje WS", e);
      }
    };

    ws.onerror = (error) => {
      console.error('Error WebSocket:', error);
      setWsUpdate('error', 'Error de conexión con el robot S.I.M.A.');
    };

    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
    };
  }, [setWsUpdate, logout]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background-default p-8 text-center">
      <div className="w-64 h-64 mb-12 relative flex items-center justify-center">
        {wsStatus === 'error' ? (
          <div className="w-full h-full rounded-full bg-error-light bg-opacity-20 flex items-center justify-center">
            <span className="text-8xl text-error-main">⚠️</span>
          </div>
        ) : wsMessage === "Medicamento entregado" ? (
          <div className="w-full h-full rounded-full bg-success-light bg-opacity-20 flex items-center justify-center animate-pulse">
            <span className="text-8xl text-success-main">✅</span>
          </div>
        ) : (
          <div className="w-full h-full border-[16px] border-primary-light border-t-primary-main rounded-full animate-spin"></div>
        )}
      </div>

      <h2 className="text-6xl font-bold text-primary-dark mb-8">
        {wsStatus === 'error' ? 'Problema Técnico' : 'Procesando Despacho'}
      </h2>
      <p className="text-5xl text-secondary-main font-bold animate-pulse">
        {wsMessage || 'Estableciendo conexión con hardware...'}
      </p>

      {wsStatus === 'error' && (
        <button
          onClick={logout}
          className="mt-16 bg-primary-main text-white text-3xl py-8 px-16 rounded-2xl shadow-xl active:scale-95 transition-transform"
        >
          Volver al Inicio
        </button>
      )}
    </div>
  );
}

function App() {
  const view = useSimaStore(state => state.view);

  return (
    <div className="w-full h-full min-h-screen bg-stitch-background font-sans selection:bg-transparent overflow-y-auto md:touch-none">
      {view === 'AUTH' && <Auth />}
      {view === 'RECETAS' && <Recetas />}
      {view === 'DESPACHO' && <Despacho />}
    </div>
  );
}

export default App;
