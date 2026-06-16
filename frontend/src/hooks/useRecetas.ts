import { useState, useEffect } from "react";
import { useSimaStore } from "../store/simaStore";

export interface Inventario {
  id: string;
  nombre_medicamento: string;
  marca: string;
  precio: string;
  cantidad: number;
  resetado: boolean;
  createdAt: string;
  updatedAt: string;
  id_maquina: string;
  MaquinaId: string | null;
  codigo: string;
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
  codigo: string;
  inventario: Inventario;

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
  dosis: Dosis[];
}

export function useRecetas() {
  const { cedula, kioskToken } = useSimaStore();
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("cedula", cedula);
    const fetchRecetas = async () => {
      try {
        const response = await fetch(
          `https://sima-web.onrender.com/api/v1/recetas/dosis/cliente/${cedula}`,
          {
            headers: {
              'Authorization': `Bearer ${kioskToken}`,
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Error al obtener las recetas del servidor");
        }

        const data = await response.json();

        setRecetas(data.recetas || data);
      } catch (err: any) {
        const msg = err.message || "";
        if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network error") || msg.toLowerCase().includes("fetch")) {
          setError("No hay sistema");
        } else {
          setError(msg || "No hay sistema");
        }
      } finally {
        setLoading(false);
      }
    };
    if (cedula && kioskToken) {
      fetchRecetas();
    } else if (cedula && !kioskToken) {
      setLoading(true);
    }
  }, [cedula, kioskToken]);

  return { recetas, loading, error };
}
