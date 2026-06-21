import { ArrowLeft, Scan, Keyboard, UserCheck, Globe, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useTranslation } from '../i18n/translations';

interface PatientIdentifyProps {
    onBack: () => void;
    onScan: (result: any) => void;
    onManualSubmit: (cedula: string) => void;
    error: string;
    cedulaInput: string;
    setCedulaInput: (val: string) => void;
    method: 'scan' | 'id' | null;
    setMethod: (method: 'scan' | 'id' | null) => void;
}

export default function PatientIdentify({
    onBack,
    onScan,
    onManualSubmit,
    error,
    cedulaInput,
    setCedulaInput,
    method,
    setMethod
}: PatientIdentifyProps) {
    const { t, language, setLanguage } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col justify-between bg-stitch-background text-stitch-on-surface font-atkinson relative select-none">
            {/* Background Atmospheric Elements */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-stitch-primary-container blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
                <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-stitch-secondary-container blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
            </div>

            {/* Header */}
            <header className="bg-stitch-surface-container-highest border-b border-stitch-outline-variant shadow-sm top-0 z-50 w-full shrink-0">
                <div className="flex justify-between items-center w-full px-4 sm:px-8 md:px-16 h-20">
                    <div className="flex items-center gap-3">
                        <img 
                            alt="S.I.M.A FLORENCE Logo" 
                            className="h-10 md:h-12 w-auto object-contain" 
                            src="/logo.png"
                        />
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-hanken font-bold text-stitch-primary">S.I.M.A FLORENCE</h1>
                    </div>
                </div>
            </header>

            {/* Unified Progress Bar */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 w-full shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
                    {/* Step 1: Identificar */}
                    <div className="flex items-center gap-3 text-primary">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                        <span className="font-bold text-sm">{t('identifyStep')}</span>
                    </div>
                    <div className="flex-1 min-w-[20px] h-0.5 bg-slate-200 mx-4" />

                    {/* Step 2: Seleccionar */}
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm">2</div>
                        <span className="font-bold text-sm">{t('selectStep')}</span>
                    </div>
                    <div className="flex-1 min-w-[20px] h-0.5 bg-slate-200 mx-4" />

                    {/* Step 3: Confirmar Pedido */}
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm">3</div>
                        <span className="font-bold text-sm">{t('confirmStep')}</span>
                    </div>
                    <div className="flex-1 min-w-[20px] h-0.5 bg-slate-200 mx-4" />

                    {/* Step 4: Dispensar */}
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm">4</div>
                        <span className="font-bold text-sm">{t('dispenseStep')}</span>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 md:px-16 pt-6 shrink-0">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-stitch-primary hover:text-stitch-primary/85 transition-all font-bold text-base sm:text-lg cursor-pointer active:scale-95 bg-stitch-surface-container-low border border-stitch-outline-variant/30 rounded-xl px-4 py-2 hover:bg-stitch-surface-container-high shadow-sm"
                >
                    <ArrowLeft size={20} />
                    <span>{t('backAction')}</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center px-4 sm:px-8 md:px-16 py-8 md:py-12 z-10 w-full max-w-5xl mx-auto justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl w-full my-auto"
                >
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-primary-light/10 text-primary-med rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-text-primary mb-2">{t('patientIdentifyTitle')}</h2>
                        <p className="text-text-secondary">{t('patientIdentifyDesc')}</p>
                    </div>

                    <div className="card-med p-8 bg-white border-t-4 border-t-primary-med rounded-[24px] sm:rounded-[32px] action-card-shadow">
                        {!method ? (
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => { setMethod('scan'); setCedulaInput(''); }}
                                    className="w-full flex items-center gap-6 p-6 border-2 border-divider-med rounded-[16px] hover:border-primary-med hover:bg-primary-light/5 transition-all text-left group"
                                >
                                    <div className="p-4 bg-gray-50 rounded-lg group-hover:bg-primary-light/10 text-primary-med">
                                        <Scan size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{t('scanQRMethod')}</h3>
                                        <p className="text-sm text-text-secondary">{t('scanQRMethodDesc')}</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setMethod('id'); setCedulaInput(''); }}
                                    className="w-full flex items-center gap-6 p-6 border-2 border-divider-med rounded-[16px] hover:border-primary-med hover:bg-primary-light/5 transition-all text-left group"
                                >
                                    <div className="p-4 bg-gray-50 rounded-lg group-hover:bg-primary-light/10 text-primary-med">
                                        <Keyboard size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{t('manualEntryMethod')}</h3>
                                        <p className="text-sm text-text-secondary">{t('manualEntryMethodDesc')}</p>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center"
                            >
                                {method === 'scan' ? (
                                    <div className="flex flex-col items-center w-full">
                                        <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl mb-8 border-4 border-primary-main">
                                            <Scanner onScan={onScan} />
                                        </div>
                                        {error && <p className="text-error-main text-xl font-bold mb-6 text-center">{error}</p>}
                                    </div>
                                ) : (
                                    <div className="w-full space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">{t('historyNumberLabel')}</label>
                                            <input
                                                type="text"
                                                value={cedulaInput}
                                                onChange={(e) => setCedulaInput(e.target.value)}
                                                placeholder="Ej: 8-123-4567"
                                                className="w-full p-4 bg-background-med border-2 border-divider-med rounded-med focus:outline-none focus:border-primary-med text-2xl font-mono text-center tracking-widest"
                                            />
                                        </div>
                                        {error && <p className="text-error-main text-xl font-bold mb-6 text-center">{error}</p>}
                                        <button
                                            onClick={() => onManualSubmit(cedulaInput)}
                                            className="w-full button-med py-4 bg-primary-med text-white text-lg hover:bg-primary-dark rounded-[16px]"
                                        >
                                            {t('validateIdentity')}
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => setMethod(null)}
                                    className="mt-8 text-primary-med font-semibold hover:underline"
                                >
                                    {t('useAnotherMethod')}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-stitch-surface-container border-t border-stitch-outline-variant py-4 px-4 sm:px-8 md:px-16 flex flex-row flex-wrap gap-3 items-center justify-between z-50 min-h-20 h-auto shrink-0">
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
        </div>
    );
}
