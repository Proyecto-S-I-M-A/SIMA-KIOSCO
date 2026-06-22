import { QrCode, IdCard, HelpCircle, Globe, Info, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/translations';

interface LoginProps {
  onSelectRole: (role: 'patient' | 'staff', method?: 'scan' | 'id' | null) => void;
}

export default function ComponentLogin({ onSelectRole }: LoginProps) {
  const { t, language, setLanguage } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col justify-between bg-stitch-background text-stitch-on-surface font-atkinson relative select-none">
      {/* Background Atmospheric Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-stitch-primary-container blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-stitch-secondary-container blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      {/* TopAppBar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stitch-surface-container-lowest border-b border-stitch-outline-variant shadow-sm top-0 z-50 w-full"
      >
        <div className="flex justify-between items-center w-full px-4 sm:px-8 md:px-16 h-20">
          <div className="flex items-center gap-3 md:gap-4">
            <img
              alt="S.I.M.A FLORENCE Logo"
              className="h-10 md:h-12 w-auto object-contain"
              src="/logo.png"
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-hanken font-bold text-stitch-primary">S.I.M.A FLORENCE</h1>
          </div>
        </div>
      </motion.header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center px-4 sm:px-8 md:px-16 py-8 md:py-12 z-10 w-full max-w-5xl mx-auto">
        <div className="my-auto w-full flex flex-col items-center space-y-8 sm:space-y-12 md:space-y-16">
          {/* Welcome Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 max-w-3xl"
          >
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-hanken font-extrabold text-stitch-primary tracking-tight leading-tight">
              {t('welcomeTitle')}
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-stitch-secondary font-normal leading-relaxed">
              {t('welcomeDesc')}
            </p>
          </motion.div>

          {/* Options Bento Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-4xl"
          >
            {/* Option 1: Escanear QR */}
            <button
              onClick={() => onSelectRole('patient', 'scan')}
              className="bg-stitch-surface-container-lowest border border-stitch-outline-variant rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col items-start gap-4 sm:gap-6 text-left action-card-shadow active-press transition-all hover:bg-stitch-surface-container-low group cursor-pointer min-h-[200px] sm:min-h-[260px] md:min-h-[300px]"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-stitch-secondary-container flex items-center justify-center text-stitch-primary group-hover:scale-110 transition-transform">
                <QrCode size={28} className="sm:w-[36px] sm:h-[36px] md:w-[44px] md:h-[44px]" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-hanken font-bold text-stitch-on-surface">{t('scanQR')}</h3>
                <p className="text-sm sm:text-base md:text-lg text-stitch-on-surface-variant leading-relaxed">
                  {t('scanQRDesc')}
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-stitch-primary font-bold text-sm sm:text-lg md:text-xl">
                <span>{t('scanNow')}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px]" />
              </div>
            </button>

            {/* Option 2: Escribir Cédula */}
            <button
              onClick={() => onSelectRole('patient', 'id')}
              className="bg-stitch-surface-container-lowest border border-stitch-outline-variant rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col items-start gap-4 sm:gap-6 text-left action-card-shadow active-press transition-all hover:bg-stitch-surface-container-low group cursor-pointer min-h-[200px] sm:min-h-[260px] md:min-h-[300px]"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-stitch-tertiary-fixed flex items-center justify-center text-stitch-on-tertiary-fixed group-hover:scale-110 transition-transform">
                <IdCard size={28} className="sm:w-[36px] sm:h-[36px] md:w-[44px] md:h-[44px]" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-hanken font-bold text-stitch-on-surface">{t('typeID')}</h3>
                <p className="text-sm sm:text-base md:text-lg text-stitch-on-surface-variant leading-relaxed">
                  {t('typeIDDesc')}
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-stitch-primary font-bold text-sm sm:text-lg md:text-xl">
                <span>{t('enterNumber')}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px]" />
              </div>
            </button>
          </motion.div>

          {/* Help Visual/Illustration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="w-full flex justify-center pt-2"
          >
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-stitch-surface-container-low rounded-full px-5 sm:px-8 border border-stitch-outline-variant/30 text-center max-w-lg md:max-w-none">
              <Info size={18} className="text-stitch-outline flex-shrink-0 sm:w-[20px] sm:h-[20px]" />
              <p className="text-xs sm:text-sm md:text-base text-stitch-on-surface-variant font-medium">
                {t('touchHelp')}
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* BottomNavBar */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-stitch-surface-container border-t border-stitch-outline-variant py-4 px-4 sm:px-8 md:px-16 flex flex-row flex-wrap gap-3 items-center justify-between z-50 min-h-20 h-auto"
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
      </motion.nav>
    </div>
  );
}
