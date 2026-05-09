import { useEffect, useState } from 'react';
import { useSimaStore } from '../store/simaStore';
import CardRecetas from './cardRecetas';


export interface Inventario {
  id: string;
  nombre_medicamento: string;
  marca: string;
  precio: string; // Nota: en tu JSON viene como string ("1.23")
  cantidad: number;
  resetado: boolean;
  createdAt: string;
  updatedAt: string;
  id_maquina: string;
  MaquinaId: string | null;
}
export interface Dosis {
  id: string;
  id_receta: string;
  id_medicamento: string;
  cantidad: number;
  instrucciones: string;
  createdAt: string;
  updatedAt: string;
  RecetumId: string | null;
  inventario: Inventario; // Anidamos la interfaz de inventario aquí
}

export interface Receta {
  id: string;
  doctor_remitente: string;
  ruc_doctor_remitente: string;
  hospital_remitente: string;
  telefono_hospital: string;
  correo: string;
  codigo: number;
  fecha: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
  id_cliente: string;
  ClienteId: string | null;
  dosis: Dosis[]; // Un arreglo de la interfaz Dosis
}

export default function Recetas() {
  const { cedula, token, setView } = useSimaStore();
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const logout = useSimaStore(state => state.logout);

  useEffect(() => {
    const fetchRecetas = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v0/recetas/dosis/cliente/${cedula}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener las recetas del servidor');
        }

        const data = await response.json();
        setRecetas(data.recetas || data);
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    if (cedula && token) {
      fetchRecetas();
    }
  }, [cedula, token]);

  const handleDespachar = () => {
    setView('DESPACHO');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-default">
        <div className="w-20 h-20 border-8 border-primary-light border-t-primary-main rounded-full animate-spin"></div>
        <h2 className="mt-8 text-3xl text-primary-main font-bold">Buscando recetas...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-default p-8 text-center">
        <h2 className="text-4xl text-error-main font-bold mb-6">Error</h2>
        <p className="text-2xl text-text-secondary mb-12">{error}</p>
        <button
          onClick={logout}
          className="bg-gray-300 text-gray-800 text-2xl py-6 px-12 rounded-2xl shadow-md active:scale-95 transition-transform"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-default p-8">
      <header className="flex justify-between items-center mb-8 border-b-4 border-gray-200 pb-4">
        <h1 className="text-4xl font-bold text-primary-dark">Recetas Disponibles</h1>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-text-secondary">Cédula: {cedula}</span>
          <button
            onClick={logout}
            className="bg-error-main text-white text-xl py-4 px-6 rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 overflow-hidden">
        {recetas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <h2 className="text-3xl text-text-secondary">No hay recetas pendientes para esta cédula.</h2>
          </div>
        ) : (
          <div className="flex-2 overflow-y-auto pr-4" style={{ touchAction: 'pan-y' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recetas.map((r, i) => (
                <div key={r.id || i} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 flex flex-col gap-6">

                  <CardRecetas recipe={r} />
                </div>

              ))}
            </div>
          </div>
        )}
      </main>

      {recetas.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleDespachar}
            className="bg-success-main text-white text-4xl font-bold py-8 px-16 w-full rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            Ordenar y Despachar Todo
          </button>
        </div>
      )}
    </div>
  );
}
{/* <div key={r.id || i} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 flex flex-col gap-6">
                  <div className="border-b-2 border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-text-primary">Receta de Dr(a). {r.doctor_remitente}</h3>
                    <p className="text-xl text-text-secondary">Código: {r.codigo} | Fecha: {new Date(r.createdAt || r.fecha).toLocaleDateString()}</p>
                    <p className="text-lg text-text-secondary">Hospital: {r.hospital_remitente} | Teléfono: {r.telefono_hospital}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {r.dosis && r.dosis.map((d, j) => (
                      <div key={d.id || j} className="bg-background-default p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-2xl font-bold text-primary-main mb-2">
                          {d.inventario?.nombre_medicamento || 'Medicamento desconocido'}
                        </h4>
                        <p className="text-xl text-text-secondary mb-1">
                          Instrucciones: <span className="font-bold text-text-primary">{d.instrucciones}</span>
                        </p>
                        <p className="text-xl text-text-secondary">
                          Cantidad a despachar: <span className="font-bold text-text-primary">{d.cantidad}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div> */}