
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useSimaStore } from '../store/simaStore';
import { useRecetas } from '../hooks/useRecetas';
import { useVendingWebSocket } from '../hooks/useVendingWebSocket';
import { useTranslation } from '../i18n/translations';
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
  Stethoscope,
  Building2,
  ArrowRight,
  Pill,
  X,
  Loader2,
  Terminal,
  AlertTriangle,
  Inbox,
  ShoppingBasket,
  Syringe,
  HelpCircle,
  Globe
} from 'lucide-react';
/* import type { Medication } from '../components/constants';
import { MEDICATIONS } from '../components/constants'; */

/* import type { Receta } from '../hooks/useRecetas'; */
/* type Step = 'identify' | 'select' | 'pay' | 'dispense'; */

export default function Recetas() {
  const { t, language, setLanguage } = useTranslation();
  const { recetas, loading, error } = useRecetas();
  //Relevantes

  const { cedula, logout } = useSimaStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const currentStepNumber = view === 'selection' ? 2 : (!isDrawerOpen ? 3 : 4);

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
      const response = await fetch(`http://${window.location.hostname}:8000/api/dispense`, {
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
    `ws://${window.location.hostname}:8000/ws`,
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
    <div className="min-h-screen flex flex-col justify-between bg-stitch-background text-stitch-on-surface font-atkinson relative select-none">

      {/* Header */}
      <header className="bg-stitch-surface-container-highest border-b border-stitch-outline-variant shadow-sm flex justify-between items-center w-full px-4 sm:px-8 md:px-16 h-20 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <img
            alt="S.I.M.A FLORENCE Logo"
            className="h-10 md:h-12 w-auto object-contain"
            src="/logo.png"
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-hanken font-bold text-stitch-primary">S.I.M.A FLORENCE</h1>
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="pressed-state text-stitch-on-surface-variant flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-stitch-surface-variant font-bold text-sm sm:text-base cursor-pointer hover:text-red-500 transition-colors"
        >
          {t('logoutAction')}
        </button>
      </header>

      {/* Unified Progress Bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 w-full shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Step 1: Identificar */}
          <div className="flex items-center gap-3 text-primary">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
            <span className="font-bold text-sm">{t('identifyStep')}</span>
          </div>
          <div className="flex-1 min-w-[20px] h-0.5 bg-primary mx-4" />

          {/* Step 2: Seleccionar */}
          <div className={`flex items-center gap-3 ${currentStepNumber >= 2 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStepNumber >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
            <span className="font-bold text-sm">{t('selectStep')}</span>
          </div>
          <div className={`flex-1 min-w-[20px] h-0.5 mx-4 ${currentStepNumber >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />

          {/* Step 3: Confirmar Pedido */}
          <div className={`flex items-center gap-3 ${currentStepNumber >= 3 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStepNumber >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>3</div>
            <span className="font-bold text-sm">{t('confirmStep')}</span>
          </div>
          <div className={`flex-1 min-w-[20px] h-0.5 mx-4 ${currentStepNumber >= 4 ? 'bg-primary' : 'bg-slate-200'}`} />

          {/* Step 4: Dispensar */}
          <div className={`flex items-center gap-3 ${currentStepNumber >= 4 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStepNumber >= 4 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>4</div>
            <span className="font-bold text-sm">{t('dispenseStep')}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 shrink-0">
        <button
          onClick={() => {
            if (view === 'selection') {
              setShowLogoutModal(true);
            } else if (isDrawerOpen) {
              setIsDrawerOpen(false);
            } else {
              setView('selection');
            }
          }}
          className="flex items-center gap-2 text-stitch-primary hover:text-stitch-primary/85 transition-all font-bold text-base sm:text-lg cursor-pointer active:scale-95 bg-white border border-stitch-outline-variant/30 rounded-xl px-4 py-2 hover:bg-stitch-surface-container-high shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>{t('backAction')}</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 z-10">
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
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">{t('medicalPrescriptions')}</h1>
                  <p className="text-slate-500 font-medium">{t('selectMedsDesc')}</p>
                </div>
              </div>

              {/* Patient Header (Full Width) */}
              <div className="bg-stitch-surface-container-lowest border border-stitch-outline-variant p-6 sm:p-8 md:p-10 rounded-[32px] shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-stitch-secondary-container flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Paciente portrait"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN0U9QIPbyY9zIpIe1qGSSsZQ9008h3tvx12ljYQOCMAinUfA8OhXDeD9_uX0okU-DTQjw9uVg3rT9M-SAYZHRChFJ-Ge9v1bmBnqFhoCeoJDysyQcfiK42U-Gkftbwyu89rzIIc18Y1WKGwld8umkK6Wgqh6vSnv0deMb7s5121hdg4SuFQEQJufegXwqHYjiPqXAXfPyfnJ4N7Qv3wckj-odNVeH7xfrKWXZ41Bp-O8GLSplccdyXPeXbKcSUW9yYiuTCbnJ2Kc"
                    />
                  </div>
                  <div>
                    <p className="text-stitch-secondary font-bold text-sm uppercase tracking-wider mb-1">{t('patientConfirmed')}</p>
                    <h2 className="font-hanken font-extrabold text-2xl sm:text-3xl md:text-4xl text-stitch-on-surface">Alejandro Ramírez Solís</h2>
                    <p className="text-stitch-on-surface-variant text-sm sm:text-base md:text-lg">Cédula ID: {cedula} • DOB: 14/05/1958</p>
                  </div>
                </div>
              </div>

              {/* RECETAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recetas.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-white rounded-2xl p-6 border-2 transition-all flex flex-col gap-4 relative group shadow-sm ${selectedIds.includes(r.id) ? 'border-primary ring-4 ring-blue-50' : 'border-transparent hover:border-slate-200'}`}
                  >
                    {selectedIds.includes(r.id) ? (
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('selectedStatus')}
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {t('activeStatus')}
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${selectedIds.includes(r.id) ? 'bg-primary text-white' : 'bg-slate-100 text-primary'}`}>
                        <Pill className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl leading-tight">{t('prescriptionLabel')}</h3>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Stethoscope className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-semibold truncate">{r.doctor_remitente}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-semibold truncate">{r.hospital_remitente}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Código</span>
                        <span className="font-mono font-bold text-primary text-sm truncate">{r.id}</span>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Fecha</span>
                        <span className="font-bold text-sm">{formatearFecha(r.fecha)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSelection(r.id)}
                      className={`mt-4 w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${selectedIds.includes(r.id)
                        ? 'bg-slate-900 text-white hover:bg-black'
                        : 'bg-primary text-white hover:bg-primary-container shadow-md shadow-blue-200'}`}
                    >
                      {selectedIds.includes(r.id) ? (
                        <>
                          <MinusCircle className="w-5 h-5" />
                          {t('removeSelection')}
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-5 h-5" />
                          {t('selectAction')}
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
              className="space-y-6 md:space-y-8"
            >
              {/* Bento Grid */}
              <div className="grid grid-cols-12 gap-6 md:gap-8 w-full items-stretch">
                {/* Left Column: Medication Summary */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                  <div className="bg-stitch-surface-container-lowest border border-stitch-outline-variant p-6 sm:p-8 rounded-[32px] shadow-sm flex-grow">
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                      <h3 className="text-xl sm:text-2xl font-hanken font-bold text-stitch-primary flex items-center gap-3">
                        <Pill className="text-stitch-primary w-6 h-6 sm:w-8 sm:h-8" />
                        {t('orderSummaryTitle')}
                      </h3>
                      <span className="bg-stitch-tertiary-fixed text-stitch-on-tertiary-fixed-variant px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm">
                        {selectedMedicines.flatMap(m => m.dosis).length} {t('itemsCount')}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {selectedMedicines.map((med) =>
                        med.dosis.map((d, index) => {
                          const isInsulin = d.inventario.nombre_medicamento.toLowerCase().includes('insulina');
                          return (
                            <div
                              key={`${med.id}-${index}`}
                              className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-stitch-surface-container-low rounded-2xl border border-transparent hover:border-stitch-primary/30 transition-all"
                            >
                              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm flex-shrink-0 text-stitch-primary">
                                {isInsulin ? <Syringe size={24} className="sm:w-[28px] sm:h-[28px]" /> : <Pill size={24} className="sm:w-[28px] sm:h-[28px]" />}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                  <h4 className="font-hanken font-bold text-lg sm:text-xl text-stitch-on-surface truncate pr-2">
                                    {d.inventario.nombre_medicamento}
                                  </h4>
                                  <span className="font-bold text-stitch-primary text-sm sm:text-base whitespace-nowrap">
                                    x {d.cantidad} {d.cantidad === 1 ? t('boxUnit') : t('boxUnitPlural')}
                                  </span>
                                </div>
                                <p className="text-stitch-on-surface-variant text-xs sm:text-sm mt-1 leading-relaxed">
                                  {t('dosageLabel')}{d.instrucciones || t('dosageDefault')}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="text-[10px] sm:text-xs bg-stitch-secondary-container text-stitch-on-secondary-container px-3 py-1 rounded-full font-bold">
                                    {t('prescriptionLabel')}: #{med.id.substring(0, 8).toUpperCase()}
                                  </span>
                                  <span className="text-[10px] sm:text-xs bg-stitch-surface-container-high text-stitch-on-surface-variant px-3 py-1 rounded-full font-bold">
                                    Dr. {med.doctor_remitente}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual Guide & Action */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                  {/* Important Warning Card */}
                  <div className="bg-stitch-error-container border border-stitch-error p-6 md:p-8 rounded-[32px] flex items-start gap-4">
                    <AlertTriangle className="text-stitch-error w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-base sm:text-lg font-hanken font-bold text-stitch-on-error-container mb-1">{t('importantWarningTitle')}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-stitch-on-error-container leading-relaxed">
                        {t('importantWarningDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Collection Tray Visual */}
                  <div className="bg-stitch-secondary-container border border-stitch-outline-variant p-6 sm:p-8 rounded-[32px] flex-grow flex flex-col items-center justify-center text-center">
                    <div className="mb-4 sm:mb-6 relative">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full flex items-center justify-center shadow-lg text-stitch-primary">
                        <Inbox size={60} className="sm:w-[80px] sm:h-[80px]" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-stitch-primary text-white p-2 sm:p-3 rounded-full shadow-md">
                        <ArrowRight size={20} className="rotate-90 sm:w-[24px] sm:h-[24px]" />
                      </div>
                    </div>
                    <p className="font-hanken font-bold text-lg sm:text-xl text-stitch-on-secondary-container">{t('trayCollectionTitle')}</p>
                    <p className="text-xs sm:text-sm text-stitch-on-secondary-container mt-2 opacity-80 max-w-xs">
                      {t('trayCollectionDesc')}
                    </p>
                  </div>

                  {/* Main Action Button */}
                  <button
                    onClick={HandleMedicamentos}
                    className="pressed-state w-full bg-stitch-primary text-white h-24 rounded-[32px] shadow-xl flex items-center justify-center gap-6 transition-all hover:brightness-110 cursor-pointer group"
                  >
                    <ShoppingBasket size={32} className="sm:w-[36px] sm:h-[36px]" />
                    <span className="font-hanken font-extrabold text-xl sm:text-2xl tracking-wider uppercase">{t('dispenseNowAction')}</span>
                  </button>
                </div>
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
              <div className="flex items-center justify-between border-b border-stitch-outline-variant pb-6 flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stitch-on-surface tracking-tight font-hanken">{t('deliveryProgressTitle')}</h1>
                  <p className="text-stitch-secondary font-medium text-sm mt-1">{t('deliveryProgressDesc')}</p>
                </div>
                {/* WebSocket Status Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-stitch-surface-container-low border border-stitch-outline-variant rounded-full text-xs font-bold text-stitch-on-surface-variant">
                  <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span>{wsConnected ? t('connectedBackend') : t('disconnectedBackend')}</span>
                </div>
              </div>

              {/* Grid: Stepper on Left, Event Terminal Log on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
                {/* Left Side: Stepper and Current Item details */}
                <div className="md:col-span-6 bg-stitch-surface-container-lowest rounded-3xl border border-stitch-outline-variant p-6 sm:p-8 shadow-md flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Current Item Details */}
                    <div className="flex items-center gap-4 bg-stitch-surface-container-low p-5 rounded-2xl border border-stitch-outline-variant/30">
                      <div className="w-12 h-12 bg-stitch-primary-container/10 rounded-xl flex items-center justify-center text-stitch-primary shrink-0">
                        {currentStep === 'delivered' ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : currentStep === 'error' ? (
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        ) : (
                          <Loader2 className="w-6 h-6 animate-spin text-stitch-primary" />
                        )}
                      </div>
                      <div className="grow min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stitch-secondary block">
                          {t('dispensingProgress')} {currentQueueIndex + 1} {t('ofPreposition')} {dispenseQueue.length}
                        </span>
                        <h4 className="text-base font-bold text-stitch-on-surface leading-tight truncate">{dispensingItemName}</h4>
                        <p className="text-xs font-mono text-stitch-secondary mt-0.5 truncate">ID: {activeOrderId}</p>
                      </div>
                    </div>

                    {/* Progress Stepper */}
                    <div className="space-y-4 pt-2">
                      {[
                        {
                          id: 'step-requested',
                          title: t('stepRequestedTitle'),
                          desc: t('stepRequestedDesc'),
                        },
                        {
                          id: 'step-processing',
                          title: t('stepProcessingTitle'),
                          desc: t('stepProcessingDesc'),
                        },
                        {
                          id: 'step-dispensing',
                          title: t('stepDispensingTitle'),
                          desc: t('stepDispensingDesc'),
                        },
                        {
                          id: 'step-delivered',
                          title: t('stepDeliveredTitle'),
                          desc: t('stepDeliveredDesc'),
                        },
                      ].map((s, idx) => {
                        const stepCode = s.id;
                        const isActive = currentStep === stepCode.replace('step-', '');
                        const isCompleted = completedSteps.includes(stepCode);
                        const isFailed = failedSteps.includes(stepCode);

                        let circleClass = 'bg-stitch-surface-container-low text-stitch-outline';
                        let icon = <span className="text-sm font-bold">{idx + 1}</span>;

                        if (isCompleted) {
                          circleClass = 'bg-emerald-500 text-white';
                          icon = <CheckCircle2 className="w-4 h-4" />;
                        } else if (isFailed) {
                          circleClass = 'bg-red-500 text-white';
                          icon = <X className="w-4 h-4" />;
                        } else if (isActive) {
                          circleClass = 'bg-stitch-primary text-white ring-4 ring-stitch-primary/20 animate-pulse';
                          icon = <Loader2 className="w-4 h-4 animate-spin" />;
                        }

                        return (
                          <div key={s.id} className="flex flex-col">
                            <div className="flex items-start gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${circleClass}`}>
                                {icon}
                              </div>
                              <div>
                                <h5 className={`font-bold text-sm ${isActive ? 'text-stitch-primary font-hanken font-bold' : isFailed ? 'text-red-500 font-hanken font-bold' : isCompleted ? 'text-stitch-on-surface font-hanken font-bold' : 'text-stitch-outline font-hanken font-bold'}`}>{s.title}</h5>
                                <p className="text-xs text-stitch-secondary leading-normal">{s.desc}</p>
                              </div>
                            </div>
                            {idx < 3 && (
                              <div className="w-0.5 h-6 bg-stitch-outline-variant/50 ml-4 my-1" />
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
                        <span>{t('eventTerminalTitle')}</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto font-mono text-xs space-y-2 text-slate-300">
                      {logs.map((log, index) => (
                        <div key={index} className={`leading-relaxed ${log.type === 'mqtt' ? 'text-cyan-400' :
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
                  <div className="bg-stitch-surface-container-lowest rounded-3xl border border-stitch-outline-variant p-6 shadow-sm">
                    {currentStep === 'delivered' || currentStep === 'error' ? (
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setIsDrawerOpen(false);
                            setSelectedIds([]);
                            setView('selection');
                          }}
                          className="w-full py-4 bg-stitch-secondary hover:bg-stitch-on-secondary-container text-white rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer"
                        >
                          {t('collectMoreAction')}
                        </button>
                        <button
                          onClick={logout}
                          className="w-full py-4 bg-stitch-primary hover:brightness-110 text-white rounded-2xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer"
                        >
                          {t('finishExitAction')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 text-stitch-outline py-3 text-sm font-bold">
                        <ShieldCheck className="w-5 h-5 text-stitch-primary animate-pulse" />
                        <span>{t('waitForProcessDesc')}</span>
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
        <div className="bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-40 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-6 sm:gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400 tracking-widest font-black">{t('selectedPrescriptionsCount')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-primary">{selectedIds.length}</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-400">{selectedIds.length === 1 ? t('prescriptionUnit') : t('prescriptionsUnitPlural')}</span>
                </div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-slate-100" />
            </div>

            <div className="flex items-center w-full sm:w-auto gap-4">
              <button
                onClick={() => setView('summary')}
                disabled={selectedIds.length === 0}
                className="w-full sm:w-auto px-8 sm:px-12 h-16 sm:h-20 bg-primary text-white text-xl sm:text-2xl font-black rounded-2xl shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              >
                {t('continueAction')}
                <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Stitch Footer */}
      <footer
        className="w-full bg-stitch-surface-container border-t border-stitch-outline-variant py-4 px-4 sm:px-8 md:px-16 flex flex-row flex-wrap gap-3 items-center justify-between z-50 min-h-20 h-auto shrink-0"
      >
        <button className="text-stitch-secondary px-3 py-2 sm:px-6 sm:py-3 flex items-center gap-2 hover:bg-stitch-secondary-container rounded-xl transition-all active:scale-95 cursor-pointer text-sm sm:text-lg font-bold">
          <HelpCircle size={18} className="sm:w-[24px] sm:h-[24px]" />
          <span>{t('help')}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setLanguage('es')}
            className={`rounded-xl px-3 py-2 sm:px-6 sm:py-3 flex items-center gap-2 transition-all active:scale-95 cursor-pointer font-bold text-xs sm:text-base ${language === 'es' ? 'bg-stitch-primary-container text-white' : 'text-stitch-secondary hover:bg-stitch-secondary-container'}`}
          >
            <Globe size={14} className="sm:w-[20px] sm:h-[20px]" />
            <span>Español</span>
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`rounded-xl px-3 py-2 sm:px-6 sm:py-3 flex items-center gap-2 transition-all active:scale-95 cursor-pointer font-bold text-xs sm:text-base ${language === 'en' ? 'bg-stitch-primary-container text-white' : 'text-stitch-secondary hover:bg-stitch-secondary-container'}`}
          >
            <Globe size={14} className="sm:w-[20px] sm:h-[20px]" />
            <span>English</span>
          </button>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-stitch-outline-variant p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-hanken font-bold text-stitch-on-surface">
                  {t('logoutConfirmTitle')}
                </h3>
                <p className="text-stitch-on-surface-variant text-base leading-relaxed">
                  {t('logoutConfirmDesc')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="pressed-state w-full py-4 bg-stitch-surface-container-high hover:bg-stitch-surface-variant text-stitch-on-surface font-bold rounded-2xl cursor-pointer text-center"
                >
                  {t('logoutConfirmNo')}
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                  className="pressed-state w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl cursor-pointer text-center shadow-lg shadow-red-100"
                >
                  {t('logoutConfirmYes')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}