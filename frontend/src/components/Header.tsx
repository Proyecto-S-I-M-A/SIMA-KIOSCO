import { ShieldCheck, HelpCircle, Languages } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [view] = useState<'selection' | 'summary'>('selection');

    return (
        <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="text-xl md:text-2xl font-black text-primary tracking-tight">S.I.M.A</div>
                    {view === 'selection' && (
                        <div className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 bg-blue-50 rounded-xl text-primary border border-blue-100">
                            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 fill-primary text-white shrink-0" />
                            <span className="text-xs md:text-sm font-semibold hidden sm:inline">Usuario Verificado</span>
                        </div>
                    )}
                </div>

                {view === 'summary' && (
                    <nav className="hidden md:flex gap-8 items-center">
                        {['Identify', 'Select', 'Pay', 'Dispense'].map((s) => (
                            <span
                                key={s}
                                className={`text-sm font-bold tracking-tight transition-colors ${s === 'Pay' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-400'
                                    }`}
                            >
                                {s}
                            </span>
                        ))}
                    </nav>
                )}

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-primary">
                        <HelpCircle className="w-6 h-6" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-primary">
                        <Languages className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    )
}