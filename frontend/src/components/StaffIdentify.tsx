import { ArrowLeft, Lock, CreditCard, Hash, Activity, Globe, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/translations';

interface StaffIdentifyProps {
  onBack: () => void;
}

export default function StaffIdentify({ onBack }: StaffIdentifyProps) {
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full my-auto"
        >
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-secondary-light/10 text-secondary-pharma rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity size={32} />
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">{t('staffAccessTitle')}</h2>
            <p className="text-text-secondary">{t('staffAccessDesc')}</p>
          </div>

          <div className="card-med p-8 bg-white border-t-4 border-t-secondary-pharma rounded-[24px] sm:rounded-[32px] action-card-shadow">
            <div className="flex items-center gap-4 mb-8 p-4 bg-secondary-light/5 rounded-lg border border-secondary-light/20">
              <Lock size={20} className="text-secondary-pharma" />
              <p className="text-sm text-secondary-dark font-medium leading-relaxed">
                {t('staffAccessWarning')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button className="w-full flex items-center justify-between p-5 bg-white border border-divider-med rounded-[16px] hover:border-secondary-pharma group transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-secondary-light/10 text-secondary-pharma transition-colors">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{t('staffCardLabel')}</p>
                    <p className="text-xs text-text-secondary">{t('staffCardDesc')}</p>
                  </div>
                </div>
                <span className="text-secondary-pharma opacity-0 group-hover:opacity-100 transition-opacity font-bold">{t('enterLabel')} &rarr;</span>
              </button>

              <button className="w-full flex items-center justify-between p-5 bg-white border border-divider-med rounded-[16px] hover:border-secondary-pharma group transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-secondary-light/10 text-secondary-pharma transition-colors">
                    <Hash size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{t('staffPinLabel')}</p>
                    <p className="text-xs text-text-secondary">{t('staffPinDesc')}</p>
                  </div>
                </div>
                <span className="text-secondary-pharma opacity-0 group-hover:opacity-100 transition-opacity font-bold">{t('enterLabel')} &rarr;</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-divider-med">
              <div className="flex justify-between items-center text-xs font-semibold text-text-secondary opacity-60">
                <span>Terminal ID: 884-X</span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success-med" />
                  {t('secureSystem')}
                </span>
              </div>
            </div>
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
