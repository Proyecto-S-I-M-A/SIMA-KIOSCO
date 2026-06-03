import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

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


export default function cardRecetas() {
    return (
        <Card variant="outlined">
            <CardContent>
                <div className="border-b-2 border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-text-primary">Receta de Dr(a). </h3>
                    <p className="text-xl text-text-secondary">Código: | Fecha: </p>
                    <p className="text-lg text-text-secondary">Hospital: | Teléfono: </p>
                  </div>
            </CardContent>
        </Card>
    );
}
