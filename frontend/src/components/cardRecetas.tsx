import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { Receta } from './Recetas';

export default function cardRecetas({ data }: { data: Receta }) {
    return (
        <Card variant="outlined">
            <CardContent>
                <div className="border-b-2 border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-text-primary">Receta de Dr(a). {data.doctor_remitente}</h3>
                    <p className="text-xl text-text-secondary">Código: {data.codigo} | Fecha: {new Date(data.createdAt || data.fecha).toLocaleDateString()}</p>
                    <p className="text-lg text-text-secondary">Hospital: {data.hospital_remitente} | Teléfono: {data.telefono_hospital}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.dosis && data.dosis.map((d, j) => (
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
            </CardContent>
        </Card>
    );
}