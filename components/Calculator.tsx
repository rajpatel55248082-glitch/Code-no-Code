
import React, { useState, useEffect } from 'react';
import { LoanType } from '../types';
import { GraduationCap, Info, Check } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (
    p: number, 
    r: number, 
    t: number, 
    type: LoanType, 
    eduParams: { courseDuration: number; withMoratorium: boolean; withCSIS: boolean }
  ) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [loanType, setLoanType] = useState<LoanType>(LoanType.STANDARD);
  
  // Standard Inputs
  const [amount, setAmount] = useState<number | ''>(100000);
  const [rate, setRate] = useState<number | ''>(7.5);
  const [tenure, setTenure] = useState<number | ''>(10);
  
  // Education Inputs
  const [courseDuration, setCourseDuration] = useState<number | ''>(4);
  const [withMoratorium, setWithMoratorium] = useState<boolean>(true);
  const [withCSIS, setWithCSIS] = useState<boolean>(false);

  const [errors, setErrors] = useState({
    amount: '',
    rate: '',
    tenure: '',
    courseDuration: ''
  });

  const validate = () => {
    let isValid = true;
    const newErrors = { amount: '', rate: '', tenure: '', courseDuration: '' };

    if (!amount || amount <= 0) {
      newErrors.amount = "Required";
      isValid = false;
    }
    
    if (rate === '' || rate < 0) {
      newErrors.rate = "Invalid";
      isValid = false;
    }

    if (!tenure || tenure <= 0) {
      newErrors.tenure = "Invalid";
      isValid = false;
    } else if (tenure > 30) {
      newErrors.tenure = "Max 30y";
      isValid = false;
    }

    if (loanType === LoanType.EDUCATION) {
        if (!courseDuration || courseDuration <= 0) {
            newErrors.courseDuration = "Required";
            isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate() && amount && rate && tenure) {
      onCalculate(
        Number(amount), 
        Number(rate), 
        Number(tenure), 
        loanType,
        {
            courseDuration: Number(courseDuration),
            withMoratorium,
            withCSIS
        }
      );
    }
  };

  // Auto-calculate on mount or change
  useEffect(() => {
    // Debounce slightly to prevent rapid firing during typing
    const timer = setTimeout(() => {
        handleSubmit();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanType, withMoratorium, withCSIS]);

  return (
    <div className="w-full relative z-10">
      
      {/* Header & Toggle */}
      <div className="mb-8">
        <h2 className="text-3xl font-heading font-medium text-white tracking-tight mb-6">
          Loan Details
        </h2>
        
        {/* Luxury Segmented Control */}
        <div className="bg-white/5 p-1.5 rounded-xl flex relative border border-white/10 w-full max-w-sm">
            <button
                onClick={() => setLoanType(LoanType.STANDARD)}
                className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-[0.2em] rounded-lg transition-all duration-300 ${
                    loanType === LoanType.STANDARD 
                    ? 'bg-gold text-midnight shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : 'text-white/40 hover:text-white'
                }`}
            >
                Standard
            </button>
            <button
                onClick={() => setLoanType(LoanType.EDUCATION)}
                className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-[0.2em] rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    loanType === LoanType.EDUCATION 
                    ? 'bg-gold text-midnight shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : 'text-white/40 hover:text-white'
                }`}
            >
                <GraduationCap className="w-3 h-3" />
                Student
            </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Common Inputs */}
        <div className="space-y-8">
            <div className="group relative">
                <div className="flex justify-between items-baseline mb-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase transition-colors duration-300">
                        Principal (₹)
                    </label>
                    {errors.amount && <span className="text-red-400 text-[10px] uppercase tracking-wider">{errors.amount}</span>}
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-white/10 text-4xl font-light py-2 text-ivory focus:outline-none focus:border-gold transition-all duration-500 placeholder-white/5 font-heading"
                    placeholder="0"
                />
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="group relative">
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase transition-colors duration-300">
                            Rate (%)
                        </label>
                        {errors.rate && <span className="text-red-400 text-[10px] uppercase tracking-wider">{errors.rate}</span>}
                    </div>
                    <input
                        type="number"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full bg-transparent border-b border-white/10 text-3xl font-light py-2 text-ivory focus:outline-none focus:border-gold transition-all duration-500 placeholder-white/5 font-heading"
                        placeholder="0.0"
                    />
                </div>
                <div className="group relative">
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase transition-colors duration-300">
                            Tenure (Yrs)
                        </label>
                        {errors.tenure && <span className="text-red-400 text-[10px] uppercase tracking-wider">{errors.tenure}</span>}
                    </div>
                    <input
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full bg-transparent border-b border-white/10 text-3xl font-light py-2 text-ivory focus:outline-none focus:border-gold transition-all duration-500 placeholder-white/5 font-heading"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>

        {/* Education Specific Inputs */}
        {loanType === LoanType.EDUCATION && (
            <div className="mt-8 p-6 bg-glass border border-gold/30 rounded-2xl relative overflow-hidden animate-fade-in-up">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold/20"></div>
                <h3 className="text-xs font-bold text-gold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Student Success Module
                </h3>

                <div className="space-y-6">
                    {/* Course Duration */}
                    <div>
                         <div className="flex justify-between items-baseline mb-2">
                            <label className="text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">
                                Course Duration (Yrs)
                            </label>
                            {errors.courseDuration && <span className="text-red-400 text-[10px] uppercase tracking-wider">{errors.courseDuration}</span>}
                        </div>
                        <input
                            type="number"
                            value={courseDuration}
                            onChange={(e) => setCourseDuration(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-lg px-4 py-2 text-ivory focus:outline-none focus:border-gold transition-all font-heading"
                            placeholder="4"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${withMoratorium ? 'bg-gold border-gold' : 'border-white/30 group-hover:border-gold'}`}>
                                {withMoratorium && <Check className="w-3 h-3 text-midnight stroke-[3]" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={withMoratorium} onChange={(e) => setWithMoratorium(e.target.checked)} />
                            <span className="text-xs text-white/80 font-light">Apply Moratorium (Study + 6mo)</span>
                        </label>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${withCSIS ? 'bg-gold border-gold' : 'border-white/30 group-hover:border-gold'}`}>
                                    {withCSIS && <Check className="w-3 h-3 text-midnight stroke-[3]" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={withCSIS} onChange={(e) => setWithCSIS(e.target.checked)} />
                                <span className="text-xs text-white/80 font-light">EWS / CSIS Scheme Subsidy</span>
                            </label>
                            <div className="group/info relative">
                                <Info className="w-4 h-4 text-white/30 hover:text-gold cursor-help" />
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-midnight border border-gold/20 p-3 rounded-lg text-[10px] text-white/70 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                    Govt pays interest during the study period for eligible students (Income &lt; 4.5L).
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          className="w-full mt-8 bg-gold-gradient text-midnight font-bold py-5 px-6 rounded-xl shadow-luxury-glow hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 uppercase tracking-[0.2em] font-heading relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">Execute Calculation</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer-slide z-0"></div>
        </button>
      </form>
    </div>
  );
};
