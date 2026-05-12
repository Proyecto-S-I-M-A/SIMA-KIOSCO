import { useState } from 'react';
import { useSimaStore } from '../store/simaStore';
import { Scanner } from '@yudiel/react-qr-scanner';
import { usePatientScanner } from '../hooks/usePatientScanner';
// Se quito el react, ya que no es necesario en esta version de react
export default function Auth() {
  const [method, setMethod] = useState<'HOME' | 'SCAN' | 'MANUAL'>('HOME');
  const [cedulaInput, setCedulaInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useSimaStore((state) => state.login);

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
      handleValidCedula(isNorma);
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
    <div className="flex flex-col items-center justify-center h-screen bg-background-default p-8">
      <h1 className="text-5xl font-bold text-primary-dark mb-12 text-center">
        S.I.M.A.<br />
        <span className="text-2xl font-normal text-text-secondary">Sistema Inteligente de Medicación Asistida</span>
      </h1>

      {method === 'HOME' && (
        <div className="flex flex-col gap-6 w-full max-w-md">
          <button
            onClick={() => setMethod('SCAN')}
            className="bg-primary-main text-white text-2xl py-8 px-6 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Escanear QR de Cédula
          </button>
          <button
            onClick={() => setMethod('MANUAL')}
            className="bg-secondary-main text-white text-2xl py-8 px-6 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            Ingresar Manualmente
          </button>
        </div>
      )}

      {method === 'SCAN' && (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl mb-8 border-4 border-primary-main">
            <Scanner onScan={handleScan} />
          </div>
          {error && <p className="text-error-main text-xl font-bold mb-6 text-center">{error}</p>}
          <button
            onClick={() => { setMethod('HOME'); setError(''); }}
            className="bg-gray-300 text-gray-800 text-2xl py-6 w-full rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            Volver
          </button>
        </div>
      )}

      {method === 'MANUAL' && (
        <div className="flex flex-col items-center w-full max-w-md">
          <input
            type="text"
            value={cedulaInput}
            onChange={(e) => setCedulaInput(e.target.value)}
            placeholder="Ej: 8-123-4567"
            className="w-full text-center text-4xl py-6 px-4 rounded-2xl border-4 border-primary-light focus:border-primary-main outline-none mb-6 shadow-inner"
          />
          {error && <p className="text-error-main text-xl font-bold mb-6 text-center">{error}</p>}
          <button
            onClick={() => handleValidCedula(cedulaInput)}
            className="bg-primary-main text-white text-2xl py-6 w-full rounded-2xl shadow-lg active:scale-95 transition-transform mb-4"
          >
            Continuar
          </button>
          <button
            onClick={() => { setMethod('HOME'); setError(''); }}
            className="bg-gray-300 text-gray-800 text-2xl py-6 w-full rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
}
