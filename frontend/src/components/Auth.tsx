import { useState } from 'react';
import { useSimaStore } from '../store/simaStore';
import { Scanner } from '@yudiel/react-qr-scanner';
// Se quito el react, ya que no es necesario en esta version de react
export default function Auth() {
  const [method, setMethod] = useState<'HOME' | 'SCAN' | 'MANUAL'>('HOME');
  const [cedulaInput, setCedulaInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useSimaStore((state) => state.login);

  const formatCedula = /^\d{1,2}-\d{3,4}-\d{3,4}$/;

  const handleValidCedula = async (cedula: string) => {
    if (!formatCedula.test(cedula)) {
      setError('Formato de cédula inválido. Ej: 8-123-4567');
      return;
    }

    setError('');
    setLoading(true);

    // Simula retraso de red para obtener Token real
    await new Promise(resolve => setTimeout(resolve, 1500));
    const simulatedToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImNhNDRkYjVkLWUzNmEtNGRkMC04ODliLTU0NGRlZjQ0MTY4YiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3VzdHF3aWhrbXN1bWdyY2ludHhsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyMDBjN2QxZC04MTRlLTQ5NmItOTcwMS02ZDQxMTMxNjEzNTMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4MTMwNjIyLCJpYXQiOjE3NzgxMjcwMjIsImVtYWlsIjoicnViZW5AZWplbXBsby5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoicnViZW5AZWplbXBsby5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiIyMDBjN2QxZC04MTRlLTQ5NmItOTcwMS02ZDQxMTMxNjEzNTMifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3ODEyNzAyMn1dLCJzZXNzaW9uX2lkIjoiMTJiNzk0ZDktMWM2OC00ODMzLWIyNWYtZWNlMTk2ZmU2MWMyIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.qQU_V0N-SlkK_rAdH5J6N9xhy8Aahm-nwy8cWfDQgvi6PCIpttqV4VLr_B_oTekM6h7ZWZGnq9PBMFQFDZHsVg';

    setLoading(false);
    login(cedula, simulatedToken);
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0 && result[0].rawValue) {
      handleValidCedula(result[0].rawValue);
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
