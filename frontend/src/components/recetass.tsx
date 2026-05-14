import { useSimaStore } from '../store/simaStore';
import CardRecetas from './cardRecetas';
import { useRecetas } from '../hooks/useRecetas';
import {
  ArrowLeft,
  HelpCircle,
  Languages,
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  Video,
  Stethoscope,
  Building2,
  QrCode,
  ArrowRight,
  Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
type Step = 'identify' | 'select' | 'pay' | 'dispense';
export default function Recetss() {
  const { cedula, setView } = useSimaStore();
  const { recetas, loading, error } = useRecetas();

  const logout = useSimaStore(state => state.logout);
  const [currentStep, setCurrentStep] = useState<Step>('select');
  // Inicia sin selección
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [view, setSection] = useState<'selection' | 'summary'>('selection');


  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };


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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {/*   <Header /> */}

      {/* Progress Bar for Selection View */}
      {view === 'selection' && (
        <div className="bg-white border-b border-slate-100 px-6 py-4">

          <div className="max-w-7xl mx-auto flex items-center justify-between">

            <div className="flex items-center gap-3 text-primary">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
              <span className="font-bold text-sm">Identificar</span>
            </div>
            <div className="flex-1 h-0.5 bg-primary mx-4" />
            <div className="flex items-center gap-3 text-primary">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
              <span className="font-bold text-sm">Seleccionar</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm">3</div>
              <span className="font-bold text-sm">Pagar</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-4" />
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm">4</div>
              <span className="font-bold text-sm">Dispensar</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 flex items-center justify-center bg-white shadow-sm border border-slate-200 rounded-full text-primary hover:bg-slate-50 transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight">Prescripciones Médicas</h1>
                  <p className="text-slate-500 font-medium">Seleccione los medicamentos que desea retirar hoy.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {recetas.map((med) => (
                  <div
                    key={med.id}
                    className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col gap-4 relative group shadow-sm ${selectedIds.includes(med.id) ? 'border-primary ring-4 ring-blue-50' : 'border-transparent hover:border-slate-200'
                      }`}
                  >
                    {selectedIds.includes(med.id) ? (
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
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${selectedIds.includes(med.id) ? 'bg-primary text-white' : 'bg-slate-100 text-primary'
                        }`}>
                        <Pill className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl leading-tight">{med.codigo}</h3>
                        <p className="text-slate-500 text-sm mt-1">{med.correo}</p>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">{med.doctor_remitente}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">{med.hospital_remitente}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Código</span>
                        <span className="font-mono font-bold text-primary text-sm">{med.codigo}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Fecha</span>
                        <span className="font-bold text-sm">{med.fecha}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSelection(med.id)}
                      className={`mt-4 w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedIds.includes(med.id)
                        ? 'bg-slate-900 text-white hover:bg-black'
                        : 'bg-primary text-white hover:bg-primary-container shadow-md shadow-blue-200'
                        }`}
                    >
                      {selectedIds.includes(med.id) ? (
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
                ))}

                {/* Empty State / Help Card */}
                <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
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
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button
                onClick={() => setSection('selection')}
                className="flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver a la selección</span>
              </button>

              <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold tracking-tight">Resumen del Pedido</h1>
                    <span className="bg-primary text-white px-5 py-1.5 rounded-full font-bold text-sm">{selectedIds.length} Items</span>
                  </div>

                  {/* {selectedMedicines.map((med) => (
                    <motion.div
                      layout
                      key={med.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex gap-6"
                    >
                      <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold text-primary">{med.name}</h3>
                            <p className="text-slate-500 font-medium">{med.dose}</p>
                          </div>
                          <span className="text-2xl font-bold text-primary">${med.price.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-slate-50">
                          <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Doctor(a)</p>
                            <p className="font-bold text-slate-800">{med.doctor}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Hospital</p>
                            <p className="font-bold text-slate-800">{med.hospital}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">RUC Profesional</p>
                            <p className="font-bold text-slate-800">{med.ruc || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Contacto</p>
                            <p className="font-bold text-slate-800">{med.contact || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
 */}
                  {/* Teleconsulta box */}
                  <div className="bg-secondary-container rounded-2xl p-8 border-l-8 border-primary flex items-start gap-6">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary shrink-0">
                      <Stethoscope className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800">¿Necesita una receta nueva?</h4>
                      <p className="text-slate-600 mt-1 max-w-lg">
                        Si su medicamento requiere validación adicional o ha expirado, puede solicitar una teleconsulta inmediata.
                      </p>
                      <button className="mt-6 bg-primary text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 hover:bg-primary-container transition-all shadow-lg shadow-blue-100">
                        <span>Solicitar Receta Médica</span>
                        <Video className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 rounded-3xl bg-white border border-slate-200 p-8 shadow-xl sticky top-32">
                  <h2 className="text-2xl font-bold mb-8">Detalle de Pago</h2>

                  {/*  <div className="space-y-5 mb-8">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Impuestos (IVA 12%)</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Tarifa de Dispensación</span>
                      <span>${dispensingFee.toFixed(2)}</span>
                    </div>
                    <div className="pt-5 border-t-2 border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-lg">Total a Pagar</span>
                      <span className="text-3xl font-black text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div> */}

                  <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Método de Pago Seleccionado</p>
                    <div className="flex items-center gap-3 text-slate-800 font-bold">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <span>Visa terminada en •••• 4242</span>
                    </div>
                  </div>

                  <button className="w-full bg-primary-container text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
                    CONFIRMAR PEDIDO
                    <Lock className="w-6 h-6" />
                  </button>

                  <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Transacción Encriptada de Grado Clínico</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Summary Bar for Selection View */}
      {
        view === 'selection' && (
          <footer className="bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] sticky bottom-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-400 tracking-widest font-black">Artículos Seleccionados</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-primary">{selectedIds.length}</span>
                    <span className="text-xl font-bold text-slate-400">Receta{selectedIds.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="h-12 w-px bg-slate-100" />
                {/* <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400 tracking-widest font-black">Total a Pagar Estimado</span>
                <span className="text-2xl font-black text-slate-800">${subtotal > 0 ? (subtotal + (subtotal * 0.12) + 0.50).toFixed(2) : '0.00'}</span>
              </div> */}
              </div>

              <div className="flex items-center gap-4">
                <button className="px-8 h-16 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => setSection('summary')}
                  disabled={selectedIds.length === 0}
                  className="px-12 h-20 bg-primary text-white text-2xl font-black rounded-2xl shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Continuar al Pago
                  <ArrowRight className="w-8 h-8" />
                </button>
              </div>
            </div>
          </footer>
        )
      }

      {/* Corporate Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 opacity-80">
            © 2024 MEDVEND HEALTHCARE SYSTEMS. clinical grade security.
          </span>
          <div className="flex gap-8">
            {['Emergency Support', 'Privacy Policy', 'Terms of Service'].map(link => (
              <a key={link} href="#" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-primary transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div >

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


{/* <div className="flex flex-col h-screen bg-background-default p-8">
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
    </div> */}