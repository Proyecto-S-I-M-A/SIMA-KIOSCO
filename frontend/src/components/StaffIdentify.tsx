import { ArrowLeft, Lock, CreditCard, Hash, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface StaffIdentifyProps {
  onBack: () => void;
}

export default function StaffIdentify({ onBack }: StaffIdentifyProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-background-med relative">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="self-start md:absolute md:top-8 md:left-8 mb-6 md:mb-0 flex items-center gap-2 text-secondary-pharma font-semibold hover:text-secondary-dark transition-colors"
      >
        <ArrowLeft size={20} />
        Regresar al Inicio
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full px-2"
      >
        <div className="mb-6 md:mb-10 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-secondary-light/10 text-secondary-pharma rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Activity className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Acceso de Personal</h2>
            <p className="text-sm md:text-base text-text-secondary">Área restringida. Verifique sus credenciales institucionales.</p>
        </div>
        
        <div className="card-med p-6 md:p-8 bg-white border-t-4 border-t-secondary-pharma">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 p-3 md:p-4 bg-secondary-light/5 rounded-lg border border-secondary-light/20">
                <Lock className="w-5 h-5 text-secondary-pharma shrink-0" />
                <p className="text-xs md:text-sm text-secondary-dark font-medium leading-relaxed">
                    Acceso de Nivel 1 requerido para operaciones de inventario y mantenimiento.
                </p>
            </div>
            
            <div className="flex flex-col gap-4">
                <button className="w-full flex items-center justify-between p-4 md:p-5 bg-white border border-divider-med rounded-med hover:border-secondary-pharma group transition-all text-left">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-gray-50 rounded-lg group-hover:bg-secondary-light/10 text-secondary-pharma transition-colors">
                            <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-sm md:text-base text-text-primary">Tarjeta Institucional</p>
                            <p className="text-[10px] md:text-xs text-text-secondary">Escaneo NFC / Código QR</p>
                        </div>
                    </div>
                    <span className="text-secondary-pharma md:opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm md:text-base">Entrar &rarr;</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 md:p-5 bg-white border border-divider-med rounded-med hover:border-secondary-pharma group transition-all text-left">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-gray-50 rounded-lg group-hover:bg-secondary-light/10 text-secondary-pharma transition-colors">
                            <Hash className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-sm md:text-base text-text-primary">Código de Seguridad</p>
                            <p className="text-[10px] md:text-xs text-text-secondary">PIN personal de 6 dígitos</p>
                        </div>
                    </div>
                    <span className="text-secondary-pharma md:opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm md:text-base">Entrar &rarr;</span>
                </button>
            </div>

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-divider-med">
                <div className="flex justify-between items-center text-[10px] md:text-xs font-semibold text-text-secondary opacity-60">
                    <span>Terminal ID: 884-X</span>
                    <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success-med" />
                        Sistema Seguro
                    </span>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
