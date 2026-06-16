
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useSimaStore } from '../store/simaStore';
import { useRecetas } from '../hooks/useRecetas';
import { useVendingWebSocket } from '../hooks/useVendingWebSocket';
import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  Video,
  Stethoscope,
  Building2,
  ArrowRight,
  Pill,
  X,
  Loader2,
  Terminal,
  AlertTriangle
} from 'lucide-react';
/* import type { Medication } from '../components/constants';
import { MEDICATIONS } from '../components/constants'; */
import Header from '../components/Header';
/* import type { Receta } from '../hooks/useRecetas'; */
/* type Step = 'identify' | 'select' | 'pay' | 'dispense'; */

export default function Recetas() {

  const { recetas, loading, error } = useRecetas();
  //Relevantes

  const logout = useSimaStore(state => state.logout);
  /* const [medicamentosBase, setMedicamentosBase] = useState<Medication[]>(MEDICATIONS);
  const [pastillitas, setPastillitas] = useState<Receta[]>(recetas); */


  // Inicia sin selección
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [view, setView] = useState<'selection' | 'summary'>('selection');

  const selectedMedicines = recetas.filter(m => selectedIds.includes(m.id));
  /* const subtotal = selectedMedicines.reduce((acc, curr) => acc + curr.price, 0);
  const taxes = subtotal * 0.12; */
  /*   const total = subtotal + taxes + dispensingFee; */

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    ;
  };

  const formatearFecha = (fecha: string) => {
    return format(parseISO(fecha), "dd 'de' MMMM 'de' yyyy", { locale: es });
  }

  // State variables for WebSocket and Dispensing logic
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dispenseQueue, setDispenseQueue] = useState<{ id: string; name: string }[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [dispensingItemName, setDispensingItemName] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ time: string; text: string; type: string }[]>([]);
  const [currentStep, setCurrentStep] = useState<'requested' | 'processing' | 'dispensing' | 'delivered' | 'error' | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [failedSteps, setFailedSteps] = useState<string[]>([]);

  // Refs for tracking mutable states in async websocket callbacks
  const activeOrderIdRef = useRef<string | null>(null);
  const queueRef = useRef<{ id: string; name: string }[]>([]);
  const queueIndexRef = useRef<number>(0);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Append a console log entry
  const appendLog = (text: string, type: string = "system") => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { time: timeStr, text, type }]);
  };

  // Start dispensing a specific item in the queue
  const startDispensingItem = async (index: number) => {
    if (index >= queueRef.current.length) return;

    queueIndexRef.current = index;
    setCurrentQueueIndex(index);

    const item = queueRef.current[index];
    setDispensingItemName(item.name);
    setActiveOrderId("Creando orden...");
    activeOrderIdRef.current = "creating";

    // Reset stepper state
    setCurrentStep("requested");
    setCompletedSteps([]);
    setFailedSteps([]);
    setLogs([]); // Clear logs for the new item

    appendLog(`[SYS] Solicitando dispensado de: <strong>${item.name}</strong>...`, "system");

    try {
      const response = await fetch("http://localhost:8000/api/dispense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: item.id,
          product_name: item.name
        })
      });

      if (!response.ok) {
        throw new Error(`Código HTTP ${response.status}`);
      }

      const data = await response.json();
      const orderId = data.order_id;
      console.log("Número de orden del pedido (Order ID):", orderId);
      setActiveOrderId(orderId);
      activeOrderIdRef.current = orderId;
      appendLog(`[SYS] Backend aceptó la orden. MQTT publicado.`, "system");

    } catch (err: any) {
      console.error("Fetch error:", err);
      appendLog(`[ERROR] Fallo al iniciar orden: ${err.message}`, "error");
      setCurrentStep("error");
      setFailedSteps(["step-requested"]);
    }
  };

  // Handle WebSocket updates
  const handleRealTimeStatus = (data: any) => {
    // Verify if it's the current order we are tracking
    if (data.order_id !== activeOrderIdRef.current) {
      return;
    }

    const status = data.status;
    const message = data.message || "";

    switch (status) {
      case "requested":
        appendLog(`[MQTT] backend -> broker: Solicitud de dispensado publicada.`, "mqtt");
        setCurrentStep("processing");
        setCompletedSteps(["step-requested"]);
        break;

      case "dispensing":
        appendLog(`[MQTT] máquina -> backend: ${message}`, "mqtt");
        setCurrentStep("dispensing");
        setCompletedSteps(["step-requested", "step-processing"]);
        break;

      case "delivered":
        appendLog(`[WEBHOOK] máquina -> backend: ${message}`, "webhook");
        setCurrentStep("delivered");
        setCompletedSteps(["step-requested", "step-processing", "step-dispensing", "step-delivered"]);
        appendLog(`[SYS] ¡Dispensado con éxito! Que disfrute su producto.`, "success");

        // Schedule next queue item if any
        const nextIndex = queueIndexRef.current + 1;
        if (nextIndex < queueRef.current.length) {
          appendLog(`[SYS] Preparando para dispensar el siguiente medicamento en 3 segundos...`, "system");
          setTimeout(() => {
            startDispensingItem(nextIndex);
          }, 3000);
        } else {
          appendLog(`[SYS] Todos los medicamentos han sido entregados con éxito.`, "success");
        }
        break;

      case "error":
        appendLog(`[ERROR] Fallo del simulador: ${message}`, "error");
        setCurrentStep("error");
        setFailedSteps(["step-dispensing", "step-delivered"]);
        break;

      default:
        appendLog(`[INFO] Actualización: ${message}`, "system");
        break;
    }
  };

  // Ref to always hold the latest handleRealTimeStatus handler
  const handleRealTimeStatusRef = useRef(handleRealTimeStatus);
  useEffect(() => {
    handleRealTimeStatusRef.current = handleRealTimeStatus;
  });

  // Connect to WebSocket Server using custom hook
  const { isConnected: wsConnected } = useVendingWebSocket(
    "ws://localhost:8000/ws",
    (data) => {
      handleRealTimeStatusRef.current(data);
    }
  );

  const HandleMedicamentos = () => {
    if (!wsConnected) {
      alert("Error: No hay conexión con el servidor backend. Asegúrate de iniciar main.py.");
      return;
    }

    const items = selectedMedicines.flatMap(receta =>
      receta.dosis.map(d => ({
        id: d.inventario.codigo || d.inventario.id,
        name: d.inventario.nombre_medicamento
      }))
    );

    if (items.length === 0) {
      alert("Por favor, seleccione al menos una receta.");
      return;
    }

    console.log("Medicamentos seleccionados para dispensar:", items);
    queueRef.current = items;
    setDispenseQueue(items);
    setIsDrawerOpen(true);
    startDispensingItem(0);
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Step 1: Identificar */}
          <div className="flex items-center gap-1.5 md:gap-3 text-primary">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-sm">1</div>
            <span className="font-bold text-xs md:text-sm hidden sm:inline">Identificar</span>
          </div>
          <div className="flex-1 h-0.5 bg-primary mx-1 sm:mx-4" />

          {/* Step 2: Seleccionar */}
          <div className="flex items-center gap-1.5 md:gap-3 text-primary">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-sm">2</div>
            <span className="font-bold text-xs md:text-sm hidden sm:inline">Seleccionar</span>
          </div>
          <div className={`flex-1 h-0.5 mx-1 sm:mx-4 ${view !== 'selection' ? 'bg-primary' : 'bg-slate-200'}`} />

          {/* Step 3: Confirmar Pedido */}
          <div className={`flex items-center gap-1.5 md:gap-3 ${view !== 'selection' ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${view !== 'selection' ? 'bg-primary text-white' : 'bg-slate-200'}`}>3</div>
            <span className="font-bold text-xs md:text-sm hidden sm:inline">Confirmar Pedido</span>
          </div>
          <div className={`flex-1 h-0.5 mx-1 sm:mx-4 ${isDrawerOpen ? 'bg-primary' : 'bg-slate-200'}`} />

          {/* Step 4: Dispensar */}
          <div className={`flex items-center gap-1.5 md:gap-3 ${isDrawerOpen ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${isDrawerOpen ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse' : 'bg-slate-200'}`}>4</div>
            <span className="font-bold text-xs md:text-sm hidden sm:inline">Dispensar</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="grow overflow-y-auto max-w-7xl mx-auto w-full px-4 py-6 md:px-6 md:py-10">
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
              {/* RECETAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recetas.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col gap-4 relative group shadow-sm ${selectedIds.includes(r.id) ? 'border-primary ring-4 ring-blue-50' : 'border-transparent hover:border-slate-200'
                      }`}
                  >
                    {selectedIds.includes(r.id) ? (
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
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${selectedIds.includes(r.id) ? 'bg-primary text-white' : 'bg-slate-100 text-primary'
                        }`}>
                        <Pill className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl leading-tight">Receta</h3>
                        {/*    <p className="text-slate-500 text-sm mt-1">{r.dose}</p> */}
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">{r.doctor_remitente}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">{r.hospital_remitente}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Código</span>
                        <span className="font-mono font-bold text-primary text-sm">{r.id}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Fecha</span>
                        <span className="font-bold text-sm">{formatearFecha(r.fecha)}</span>

                      </div>
                    </div>

                    <button
                      onClick={() => toggleSelection(r.id)}
                      className={`mt-4 w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedIds.includes(r.id)
                        ? 'bg-slate-900 text-white hover:bg-black'
                        : 'bg-primary text-white hover:bg-primary-container shadow-md shadow-blue-200'
                        }`}
                    >
                      {selectedIds.includes(r.id) ? (
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


              </div>
            </motion.div>
          ) : !isDrawerOpen ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button
                onClick={() => setView('selection')}
                className="flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver a la selección</span>
              </button>

              <div className="max-w-4xl mx-auto space-y-6 pb-28">
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-extrabold tracking-tight">Resumen del Pedido</h1>
                  <span className="bg-primary text-white px-5 py-1.5 rounded-full font-bold text-sm">{selectedIds.length} Items</span>
                </div>
                {/* console.log("selectedIds", recetas.map((r, i) => r.dosis.map(d => d.inventario.nombre_medicamento))) */}
                {selectedMedicines.map((med) => (
                  <motion.div
                    layout
                    key={med.id}
                  >
                    {med.dosis.map((d, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="w-full sm:w-32 h-24 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                          <Pill className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                        </div>
                        <div className="grow space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl sm:text-2xl font-bold text-primary">{d.inventario.nombre_medicamento}</h3>
                              <p className="text-sm sm:text-base text-slate-500 font-medium">{d.instrucciones}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 pt-4 border-t border-slate-50">
                            <div>
                              <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest">Doctor(a)</p>
                              <p className="text-sm md:text-base font-bold text-slate-800">{med.doctor_remitente}</p>
                            </div>
                            <div>
                              <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest">Hospital</p>
                              <p className="text-sm md:text-base font-bold text-slate-800">{med.hospital_remitente}</p>
                            </div>
                            <div>
                              <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest">RUC Profesional</p>
                              <p className="text-sm md:text-base font-bold text-slate-800">{med.ruc_doctor_remitente || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest">Contacto</p>
                              <p className="text-sm md:text-base font-bold text-slate-800">{med.telefono_hospital || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dispensing-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Progreso de Entrega</h1>
                  <p className="text-slate-500 font-medium mt-1">Por favor, espere mientras se entregan sus medicamentos.</p>
                </div>
                {/* WebSocket Status Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-700">
                  <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span>{wsConnected ? 'Conectado a Backend' : 'Desconectado'}</span>
                </div>
              </div>

              {/* Grid: Stepper on Left, Event Terminal Log on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
                {/* Left Side: Stepper and Current Item details */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 md:p-8 shadow-md flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Current Item Details */}
                    <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        {currentStep === 'delivered' ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : currentStep === 'error' ? (
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        ) : (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        )}
                      </div>
                      <div className="grow min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Dispensando {currentQueueIndex + 1} de {dispenseQueue.length}
                        </span>
                        <h4 className="text-base font-bold text-slate-800 leading-tight truncate">{dispensingItemName}</h4>
                        <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">ID: {activeOrderId}</p>
                      </div>
                    </div>

                    {/* Progress Stepper */}
                    <div className="space-y-4 pt-2">
                      {[
                        {
                          id: 'step-requested',
                          title: 'Solicitud Registrada',
                          desc: 'Enviada por HTTP POST al servidor',
                        },
                        {
                          id: 'step-processing',
                          title: 'Comando MQTT Publicado',
                          desc: 'Enviando orden a la expendedora',
                        },
                        {
                          id: 'step-dispensing',
                          title: 'Dispensado Mecánico',
                          desc: 'Girando motor de la bandeja física',
                        },
                        {
                          id: 'step-delivered',
                          title: 'Producto Entregado',
                          desc: 'Confirmado por Webhook de caída',
                        },
                      ].map((s, idx) => {
                        const stepCode = s.id;
                        const isActive = currentStep === stepCode.replace('step-', '');
                        const isCompleted = completedSteps.includes(stepCode);
                        const isFailed = failedSteps.includes(stepCode);

                        let circleClass = 'bg-slate-100 text-slate-400';
                        let icon = <span className="text-sm font-bold">{idx + 1}</span>;

                        if (isCompleted) {
                          circleClass = 'bg-emerald-500 text-white';
                          icon = <CheckCircle2 className="w-4 h-4" />;
                        } else if (isFailed) {
                          circleClass = 'bg-red-500 text-white';
                          icon = <X className="w-4 h-4" />;
                        } else if (isActive) {
                          circleClass = 'bg-primary text-white ring-4 ring-primary/20 animate-pulse';
                          icon = <Loader2 className="w-4 h-4 animate-spin" />;
                        }

                        return (
                          <div key={s.id} className="flex flex-col">
                            <div className="flex items-start gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${circleClass}`}>
                                {icon}
                              </div>
                              <div>
                                <h5 className={`font-bold text-sm ${isActive ? 'text-primary' : isFailed ? 'text-red-500' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{s.title}</h5>
                                <p className="text-xs text-slate-500 leading-normal">{s.desc}</p>
                              </div>
                            </div>
                            {idx < 3 && (
                              <div className="w-0.5 h-6 bg-slate-200 ml-4 my-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Log Console and Actions */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                  {/* Log Console */}
                  <div className="border border-slate-800 bg-slate-950 rounded-3xl overflow-hidden shadow-inner flex flex-col grow h-64 sm:h-72">
                    <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-mono">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>Terminal de Eventos</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto font-mono text-xs space-y-2 text-slate-300">
                      {logs.map((log, index) => (
                        <div key={index} className={`leading-relaxed ${
                          log.type === 'mqtt' ? 'text-cyan-400' :
                          log.type === 'webhook' ? 'text-fuchsia-400' :
                          log.type === 'success' ? 'text-emerald-400' :
                          log.type === 'error' ? 'text-red-400' :
                          'text-slate-300'
                        }`}>
                          <span className="text-slate-500 mr-2">[{log.time}]</span>
                          <span dangerouslySetInnerHTML={{ __html: log.text }} />
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    {currentStep === 'delivered' || currentStep === 'error' ? (
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setIsDrawerOpen(false);
                            setSelectedIds([]);
                            setView('selection');
                          }}
                          className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center"
                        >
                          Retirar Más
                        </button>
                        <button
                          onClick={logout}
                          className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center"
                        >
                          Finalizar y Salir
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 text-slate-400 py-3 text-sm font-bold">
                        <ShieldCheck className="w-5 h-5 text-primary animate-pulse" />
                        <span>Espere a que finalice el proceso</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Summary Bar for Selection View */}
      {view === 'selection' && (
        <footer className="bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-40 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-6 sm:gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400 tracking-widest font-black">Recetas Seleccionadas</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-primary">{selectedIds.length}</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-400">Receta{selectedIds.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-slate-100" />
            </div>

            <div className="flex items-center w-full sm:w-auto gap-4">
              <button
                onClick={() => setView('summary')}
                disabled={selectedIds.length === 0}
                className="w-full sm:w-auto px-8 sm:px-12 h-16 sm:h-20 bg-primary text-white text-xl sm:text-2xl font-black rounded-2xl shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:hover:scale-100"
              >
                Continuar
                <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Footer / Summary Bar for Summary View */}
      {view === 'summary' && !isDrawerOpen && (
        <footer className="bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-40 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-6 sm:gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400 tracking-widest font-black">Recetas Seleccionadas</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-primary">{selectedIds.length}</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-400">Receta{selectedIds.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-slate-100" />
            </div>

            <div className="flex items-center w-full sm:w-auto gap-4">
              <button
                onClick={() => { HandleMedicamentos(); }}
                className="w-full sm:w-auto px-8 sm:px-12 h-16 sm:h-20 bg-primary text-white text-xl sm:text-2xl font-black rounded-2xl shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                Confirmar Pedido
                <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Corporate Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 shrink-0">
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

    </div>
  );
}


{/* Empty State / Help Card */ }
{/* <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
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


{/* Teleconsulta box */ }
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