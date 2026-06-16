import { useState } from 'react';
import { useSimaStore } from '../store/simaStore';
import { usePatientScanner } from '../hooks/usePatientScanner';
import { AnimatePresence, motion } from 'motion/react';
import ComponentLogin from './ComponentLogin';
import PatientIdentify from './PatientIdentify';
import StaffIdentify from './StaffIdentify';

export default function Auth() {
  const [screen, setScreen] = useState<'login' | 'patient_identify' | 'staff_identify'>('login');
  const [cedulaInput, setCedulaInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useSimaStore((state) => state.login);

  const goToLogin = () => {
    setScreen('login');
    setError('');
    setCedulaInput('');
  };

  const handleValidCedula = async (cedula: string) => {
    if (!cedula) {
      setError('Formato de cédula inválido. Ej: 8-123-4567');
      return;
    }

    setError('');
    setLoading(true);

    setLoading(false);
    login(cedula);
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0 && result[0].rawValue) {
      const isNorma = usePatientScanner(result[0].rawValue);
      if (isNorma) {
        handleValidCedula(isNorma);
      } else {
        setError('Formato de código QR no válido');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-default">
        <div className="w-20 h-20 border-8 border-primary-light border-t-primary-main rounded-full animate-spin"></div>
        <h2 className="mt-8 text-3xl text-primary-main font-bold">Autenticando...</h2>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <AnimatePresence mode="wait">
        {screen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ComponentLogin
              onSelectRole={(role) =>
                setScreen(role === 'patient' ? 'patient_identify' : 'staff_identify')
              }
            />
          </motion.div>
        )}

        {screen === 'patient_identify' && (
          <motion.div
            key="patient"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PatientIdentify
              onBack={goToLogin}
              onScan={handleScan}
              onManualSubmit={handleValidCedula}
              error={error}
              cedulaInput={cedulaInput}
              setCedulaInput={setCedulaInput}
            />
          </motion.div>
        )}

        {screen === 'staff_identify' && (
          <motion.div
            key="staff"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StaffIdentify onBack={goToLogin} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
