import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import {
    CheckCircle2,
    PlusCircle,
    MinusCircle,
    Stethoscope,
    Building2,
    QrCode,
    Pill
} from 'lucide-react';
const CardRecetas = ({ recipe }) => {
    // Simulación de estados: 'pendiente', 'listo', 'expirado'
    //Confirmar los estatus de las recetas con el doctor
    const statusStyles = {
        retirada: "bg-green-100 text-green-700 border-green-200",
        pendiente: "bg-amber-100 text-amber-700 border-amber-200",
        expirado: "bg-red-100 text-red-700 border-red-200"
    };
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleConsultarReceta = () => {

        console.log(recipe.dosis);
    };
    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    return (
        <div
            key={recipe.id}
            className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col gap-4 relative group shadow-sm ${selectedIds.includes(recipe.id) ? 'border-primary ring-4 ring-blue-50' : 'border-transparent hover:border-slate-200'
                }`}
        >
            {selectedIds.includes(recipe.id) ? (
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Seleccionado
                </div>
            ) : (
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Activo
                </div>
            )}

            <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${selectedIds.includes(recipe.id) ? 'bg-primary text-white' : 'bg-slate-100 text-primary'
                    }`}>
                    <Pill className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-xl leading-tight">{recipe.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{recipe.dose}</p>
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{recipe.doctor_remitente}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{recipe.hospital_remitente}</span>
                </div>
            </div>

            <div className="flex justify-between items-end mt-2">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Código</span>
                    <span className="font-mono font-bold text-primary text-sm">{recipe.codigo}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Fecha</span>
                    <span className="font-bold text-sm">{recipe.fecha}</span>
                </div>
            </div>

            <button
                onClick={() => toggleSelection(recipe.id)}
                className={`mt-4 w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedIds.includes(recipe.id)
                    ? 'bg-slate-900 text-white hover:bg-black'
                    : 'bg-primary text-white hover:bg-primary-container shadow-md shadow-blue-200'
                    }`}
            >
                {selectedIds.includes(recipe.id) ? (
                    <>
                        <MinusCircle className="w-5 h-5" />
                        Quitar Selección
                    </>
                ) : (
                    <>
                        <PlusCircle className="w-5 h-5" />
                        Seleccionar
                    </>
                )}
            </button>
        </div>



    );
};

export default CardRecetas;

/*  <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-100 shadow-xl active:scale-95 transition-transform overflow-hidden select-none"> */
{/* Indicador de Estado Superior */ }
{/*             <div className={`px-6 py-2 flex items-center gap-2 border-b font-bold text-lg ${statusStyles[recipe.estado]}`}>
                {recipe.estado === 'retirada' && <CheckCircle2 size={24} />}
                {recipe.estado === 'pendiente' && <AlertCircle size={24} />}
                <span className="uppercase tracking-wide">
                    {recipe.estado === 'retirada' ? 'Retirada' : 'Validación Pendiente'}
                </span>
            </div>

            <div className="p-6"> */}
{/* Cabecera: Medicamento y Dosis */ }
{/*              <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 leading-tight">
                            {recipe.medicationName}
                        </h3>
                        <p className="text-xl text-indigo-600 font-semibold italic">
                            {recipe.activeIngredient}
                        </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                        <Pill size={32} className="text-slate-400" />
                    </div>
                </div>
 */}
{/* Detalles de la Receta */ }
{/*                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-slate-600">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm uppercase font-bold text-slate-400 leading-none mb-1">Hospital</p>
                            <p className="text-lg font-medium">{recipe.hospital_remitente}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-600">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm uppercase font-bold text-slate-400 leading-none mb-1">Doctor</p>
                            <p className="text-lg font-medium">{recipe.doctor_remitente}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-600">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm uppercase font-bold text-slate-400 leading-none mb-1">Emitida el</p>
                            <p className="text-lg font-medium">{recipe.fecha}</p>
                        </div>
                    </div>

                </div> */}

{/* Botón de Acción Principal (Regla de Oro: Botón Gigante para Táctil) */ }
{/*                 <button className="w-full bg-indigo-600 text-white py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 active:bg-indigo-700 transition-colors" onClick={handleConsultarReceta}>
                    <span className="text-2xl font-bold">Ver Detalles</span>
                    <ChevronRight size={28} />
                </button>
            </div>
        </div> */}



{/* Empty State / Help Card */ }
{/*  <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <QrCode className="w-16 h-16 text-slate-200" />
                        </div>
                        <h4 className="font-bold text-slate-700 text-lg">¿Falta alguna prescripción?</h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-[200px]">
                            Si no encuentra su receta, escanee el código QR directamente.
                        </p>
                        <button className="mt-8 px-8 py-3 bg-white text-primary border border-primary rounded-full font-bold hover:bg-primary hover:text-white transition-all">
                            Escanear Código QR
                        </button>
                    </div> */}