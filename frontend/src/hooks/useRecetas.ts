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
  const { cedula } = useSimaStore();
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = import.meta.env.VITE_TOKEN_KIOSKO;
  useEffect(() => {
    console.log("cedula", cedula);
    const fetchRecetas = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/recetas/dosis/cliente/${cedula}`,
          {
            headers: {
              /* 'Authorization': `Bearer ${token}`, */
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
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    };
    if (cedula /*  && token */) {
      fetchRecetas();
    }
  }, [cedula /* ,token */]);

  return { recetas, loading, error };
}
