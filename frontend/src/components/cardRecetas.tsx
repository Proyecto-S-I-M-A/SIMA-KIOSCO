
import { Pill, Calendar, User, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const CardRecetas = ({ recipe }) => {
    // Simulación de estados: 'pending', 'ready', 'expired'
    const statusStyles = {
        ready: "bg-green-100 text-green-700 border-green-200",
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        expired: "bg-red-100 text-red-700 border-red-200"
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-100 shadow-xl active:scale-95 transition-transform overflow-hidden select-none">
            {/* Indicador de Estado Superior */}
            <div className={`px-6 py-2 flex items-center gap-2 border-b font-bold text-lg ${statusStyles[recipe.status]}`}>
                {recipe.status === 'ready' && <CheckCircle2 size={24} />}
                {recipe.status === 'pending' && <AlertCircle size={24} />}
                <span className="uppercase tracking-wide">
                    {recipe.status === 'ready' ? 'Lista para retirar' : 'Validación Pendiente'}
                </span>
            </div>

            <div className="p-6">
                {/* Cabecera: Medicamento y Dosis */}
                <div className="flex justify-between items-start mb-4">
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

                {/* Detalles de la Receta */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-slate-600">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm uppercase font-bold text-slate-400 leading-none mb-1">Emitida el</p>
                            <p className="text-lg font-medium">{recipe.date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-600">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm uppercase font-bold text-slate-400 leading-none mb-1">Doctor</p>
                            <p className="text-lg font-medium">{recipe.doctorName}</p>
                        </div>
                    </div>
                </div>

                {/* Botón de Acción Principal (Regla de Oro: Botón Gigante para Táctil) */}
                <button className="w-full bg-indigo-600 text-white py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 active:bg-indigo-700 transition-colors">
                    <span className="text-2xl font-bold">Ver Detalles</span>
                    <ChevronRight size={28} />
                </button>
            </div>
        </div>
    );
};

export default CardRecetas;