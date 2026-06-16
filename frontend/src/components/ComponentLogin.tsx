
import { User, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onSelectRole: (role: 'patient' | 'staff') => void;
}

export default function ComponentLogin({ onSelectRole }: LoginProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-background-med">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center mb-8 md:mb-16"
      >
        <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
          <div className="p-2 bg-primary-med rounded-lg text-white">
            <Shield className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-primary-dark tracking-tight">S.I.M.A</h1>
        </div>
        <h2 className="text-xl md:text-3xl font-bold text-text-primary mb-2 md:mb-4 px-2">Bienvenido a la Unidad de Dispensación</h2>
        <p className="text-sm md:text-lg text-text-secondary max-w-2xl mx-auto px-4">
          Por favor, seleccione su tipo de acceso para gestionar sus servicios médicos de forma segura.
        </p>
      </motion.header>

      <main className="w-full max-w-md mx-auto px-4">
        {/* Patient Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => onSelectRole('patient')}
            className="group w-full card-med p-6 md:p-8 hover:border-primary-med transition-all duration-300 text-center flex flex-col"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-light/10 text-primary-med rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-primary-med group-hover:text-white transition-colors">
              <User className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2 md:mb-3">Acceso Paciente</h3>
            <p className="text-sm md:text-base text-text-secondary mb-6 md:mb-8 leading-relaxed">
              Inicie sesión para retirar medicamentos recetados o consultar su historial de servicios disponibles.
            </p>
            <div className="mt-auto">
              <span className="button-med inline-flex items-center justify-center w-full py-3 md:py-4 bg-primary-med text-white text-base md:text-lg hover:bg-primary-dark">
                Iniciar como Paciente
              </span>
            </div>
          </button>
        </motion.div>
      </main>

      <footer className="mt-8 md:mt-16 text-xs md:text-sm text-text-secondary flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success-med animate-pulse" />
        Sistema Médico En Línea • Terminal ID: MV-2026-X
      </footer>
    </div>
  );
}
