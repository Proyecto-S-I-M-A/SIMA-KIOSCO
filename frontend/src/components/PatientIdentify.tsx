import { useState } from 'react';
import { ArrowLeft, Scan, Keyboard, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface PatientIdentifyProps {
    onBack: () => void;
    onScan: (result: any) => void;
    onManualSubmit: (cedula: string) => void;
    error: string;
    cedulaInput: string;
    setCedulaInput: (val: string) => void;
}

export default function PatientIdentify({
    onBack,
    onScan,
    onManualSubmit,
    error,
    cedulaInput,
    setCedulaInput
}: PatientIdentifyProps) {
    const [method, setMethod] = useState<'scan' | 'id' | null>(null);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-med relative">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBack}
                className="self-start md:absolute md:top-8 md:left-8 mb-6 md:mb-0 flex items-center gap-2 text-primary-med font-semibold hover:text-primary-dark transition-colors"
            >
                <ArrowLeft size={20} />
                Regresar al Inicio
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-primary-light/10 text-primary-med rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Identificación de Paciente</h2>
                    <p className="text-text-secondary">Verifique su identidad utilizando uno de los siguientes métodos.</p>
                </div>

                <div className="card-med p-8 bg-white border-t-4 border-t-primary-med">
                    {!method ? (
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => { setMethod('scan'); setCedulaInput(''); }}
                                className="w-full flex items-center gap-6 p-6 border-2 border-divider-med rounded-med hover:border-primary-med hover:bg-primary-light/5 transition-all text-left group"
                            >
                                <div className="p-4 bg-gray-50 rounded-lg group-hover:bg-primary-light/10 text-primary-med">
                                    <Scan size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Escanear qr de la cedula </h3>
                                    <p className="text-sm text-text-secondary">Utilice el lector NFC para una identificación rápida.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { setMethod('id'); setCedulaInput(''); }}
                                className="w-full flex items-center gap-6 p-6 border-2 border-divider-med rounded-med hover:border-primary-med hover:bg-primary-light/5 transition-all text-left group"
                            >
                                <div className="p-4 bg-gray-50 rounded-lg group-hover:bg-primary-light/10 text-primary-med">
                                    <Keyboard size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Entrada Manual</h3>
                                    <p className="text-sm text-text-secondary">Ingrese su código de identificación de 8 dígitos.</p>
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
                                        <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Número de Historial / ID</label>
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
                                        className="w-full button-med py-4 bg-primary-med text-white text-lg hover:bg-primary-dark"
                                    >
                                        Validar Identidad
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => setMethod(null)}
                                className="mt-8 text-primary-med font-semibold hover:underline"
                            >
                                Usar otro método
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
