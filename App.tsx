
import React, { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';
import { ResultsView } from './components/ResultsView';
import { Ledger } from './components/Ledger';
import { InfoModal } from './components/InfoModal';
import { AIChat } from './components/AIChat';
import { CalculationResult, EMILog, LoanType } from './types';
import { calculateEMI } from './utils/math';
import { Info, Hexagon } from 'lucide-react';

const App: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [ledger, setLedger] = useState<EMILog[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Load ledger from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('luxury_ledger');
    if (saved) {
      try {
        setLedger(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse ledger", e);
      }
    }
  }, []);

  const handleCalculate = (
    principal: number, 
    rate: number, 
    tenureYears: number,
    loanType: LoanType = LoanType.STANDARD,
    eduParams: { courseDuration: number; withMoratorium: boolean; withCSIS: boolean } = { courseDuration: 0, withMoratorium: false, withCSIS: false }
  ) => {
    const result = calculateEMI(principal, rate, tenureYears, loanType, eduParams);
    setCurrentResult(result);

    const newLog: EMILog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      principal,
      rate,
      tenureYears,
      emi: result.emi,
      totalInterest: result.totalInterest
    };

    const updatedLedger = [newLog, ...ledger].slice(0, 10); // Keep last 10
    setLedger(updatedLedger);
    localStorage.setItem('luxury_ledger', JSON.stringify(updatedLedger));
  };

  const loadFromLedger = (log: EMILog) => {
    // Legacy support for logs without loanType, defaulting to standard
    const result = calculateEMI(log.principal, log.rate, log.tenureYears, LoanType.STANDARD);
    setCurrentResult(result);
  };

  return (
    <div className="min-h-screen font-sans bg-luxury-gradient selection:bg-gold selection:text-midnight flex flex-col relative overflow-x-hidden text-ivory">
      
      {/* Subtle Noise Texture for Physical Feel */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-8 md:px-12 z-10 animate-fade-in-up">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="p-0.5 rounded-lg bg-gradient-to-br from-gold to-transparent">
            <div className="p-2.5 rounded-[6px] bg-midnight">
               <Hexagon className="text-gold w-5 h-5 fill-gold/10" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-[0.2em] uppercase text-white">
              Smart<span className="text-gold">EMI</span>
            </h1>
            <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase hidden sm:block">Wealth Architecture</p>
          </div>
        </div>
        <button 
          onClick={() => setIsInfoOpen(true)}
          className="text-white/40 hover:text-gold transition-all duration-300 p-3 hover:bg-white/5 rounded-full border border-transparent hover:border-gold/20"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 md:px-8 py-4 z-10 flex flex-col gap-10 max-w-7xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Input Panel (Glass Layer) */}
          <section className="lg:col-span-5 bg-glass backdrop-blur-xl border border-glass-border p-8 md:p-12 rounded-[24px] shadow-luxury relative overflow-hidden animate-fade-in-up [animation-delay:100ms] hover:border-gold/40 transition-colors duration-500">
             {/* Subtle internal glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/5 rounded-full blur-[50px]"></div>
            <Calculator onCalculate={handleCalculate} />
          </section>

          {/* Right: Visuals Dashboard */}
          <section className="lg:col-span-7 animate-fade-in-up [animation-delay:300ms]">
            {currentResult ? (
              <ResultsView result={currentResult} />
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center border border-dashed border-gold/10 rounded-[24px] p-12 bg-glass/30 backdrop-blur-sm transition-all duration-500 hover:border-gold/30 group">
                <div className="p-6 rounded-full bg-midnight border border-gold/10 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-luxury-glow">
                    <Hexagon className="w-10 h-10 text-gold/30 group-hover:text-gold transition-colors duration-500" strokeWidth={1} />
                </div>
                <p className="text-lg font-heading font-light tracking-[0.2em] uppercase text-white/40 group-hover:text-white/80 transition-colors">Initialize Portfolio</p>
              </div>
            )}
          </section>
        </div>

        {/* Bottom: Ledger */}
        {ledger.length > 0 && (
          <section className="mb-12 animate-fade-in-up [animation-delay:500ms] border-t border-white/5 pt-8">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase font-heading flex items-center gap-3">
                <span className="w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_#D4AF37]"></span>
                Portfolio Ledger
              </h3>
            </div>
            <Ledger history={ledger} onLoad={loadFromLedger} />
          </section>
        )}
      </main>

      {/* Info Modal */}
      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}

      {/* AI Chat */}
      <AIChat currentResult={currentResult} />
    </div>
  );
};

export default App;
