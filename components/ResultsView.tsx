
import React, { useEffect, useState } from 'react';
import { CalculationResult, LoanType } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Sparkles, TrendingUp, CreditCard, GraduationCap, Banknote } from 'lucide-react';
import { generateSmartAnalysis } from '../services/geminiService';

interface ResultsViewProps {
  result: CalculationResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [displayEMI, setDisplayEMI] = useState(0);

  const data = [
    { name: 'Principal', value: result.principal },
    { name: 'Interest', value: result.totalInterest },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  useEffect(() => {
    let start = 0;
    const end = result.emi;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayEMI(start + (end - start) * ease);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [result.emi]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setAnalysis("");
      const text = await generateSmartAnalysis(result);
      setAnalysis(text);
      setLoading(false);
    };
    if (result) fetchAnalysis();
  }, [result]);

  return (
    <div className="h-full flex flex-col gap-8">
      
      {/* 1. HERO CARD */}
      <div key={result.emi} className="relative bg-glass backdrop-blur-xl border border-glass-border rounded-[24px] p-10 md:p-12 shadow-luxury overflow-hidden group animate-fade-in-up transition-colors duration-500 hover:border-gold/30">
        <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[150%] bg-gradient-to-r from-gold/5 to-transparent rotate-45 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <div className="flex items-center gap-2 mb-4 animate-fade-in [animation-delay:200ms]">
                    <div className="w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_#D4AF37]"></div>
                    <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] font-heading">
                        {result.loanType === LoanType.EDUCATION ? 'Monthly Repayment' : 'Monthly Obligation'}
                    </p>
                </div>
                <h2 className="text-5xl lg:text-7xl font-bold font-heading text-gold drop-shadow-md tracking-tight tabular-nums">
                {formatCurrency(displayEMI)}
                </h2>
            </div>
            <div className="flex gap-2">
                {result.loanType === LoanType.EDUCATION ? (
                    <GraduationCap className="text-white/20 w-16 h-16 stroke-[0.5]" />
                ) : (
                    <CreditCard className="text-white/20 w-16 h-16 stroke-[0.5]" />
                )}
            </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-8 relative z-10 opacity-0 animate-fade-in [animation-delay:400ms] fill-mode-forwards">
             <div>
                 <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] mb-2">Total Interest</p>
                 <p className="text-xl font-light text-white font-sans">{formatCurrency(result.totalInterest)}</p>
             </div>
             <div className="text-right md:text-left">
                 <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] mb-2">Total Payable</p>
                 <p className="text-xl font-light text-white font-sans">{formatCurrency(result.totalPayment)}</p>
             </div>
        </div>
      </div>

      {/* 1.5. EDUCATION SPECIFIC: TAX BENEFIT CARD */}
      {result.loanType === LoanType.EDUCATION && result.taxSavings && result.taxSavings > 0 && (
         <div className="bg-gradient-to-r from-gold/10 to-glass border border-gold/40 rounded-[24px] p-6 flex justify-between items-center shadow-lg animate-fade-in-up [animation-delay:150ms]">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-4 h-4 text-gold" />
                    <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Govt. Subsidy & Tax Benefit</span>
                </div>
                <p className="text-white/60 text-xs max-w-sm">
                    Est. Annual Tax Savings via Section 80E (assuming 20% slab).
                    {result.moratoriumInterest === 0 && <span className="text-teal ml-1 block mt-1">✓ CSIS Subsidy Applied (Zero Moratorium Interest)</span>}
                </p>
            </div>
            <div className="text-right">
                <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] mb-1">Yearly Savings</p>
                <p className="text-2xl font-heading font-bold text-white">~{formatCurrency(result.taxSavings)}</p>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 2. PIE CHART */}
          <div className="bg-glass backdrop-blur-md border border-glass-border rounded-[24px] p-8 flex flex-col items-center justify-center min-h-[320px] shadow-luxury animate-fade-in-up [animation-delay:200ms]">
            <h3 className="text-[10px] text-white/50 font-bold uppercase tracking-[0.3em] mb-8 font-heading w-full text-center border-b border-white/5 pb-4">Capital Structure</h3>
            <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <defs>
                        <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e293b" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#334155" stopOpacity={1}/>
                        </linearGradient>
                        <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#8C7324" stopOpacity={1}/>
                        </linearGradient>
                    </defs>
                    <Pie
                        data={data}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="rgba(10, 14, 26, 0.5)"
                        strokeWidth={2}
                        cornerRadius={2}
                        animationBegin={200}
                        animationDuration={1500}
                    >
                        <Cell key="cell-principal" fill="url(#gradPrincipal)" />
                        <Cell key="cell-interest" fill="url(#gradInterest)" />
                    </Pie>
                    <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#F9F9F9', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'Inter' }}
                        cursor={false}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-8 mt-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm bg-slate-600"></div>
                    <span className="text-[10px] uppercase tracking-wider text-white/60">Principal</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm bg-gold shadow-[0_0_5px_#D4AF37]"></div>
                    <span className="text-[10px] uppercase tracking-wider text-gold">Interest</span>
                </div>
            </div>
          </div>

          {/* 3. BAR CHART */}
          <div className="bg-glass backdrop-blur-md border border-glass-border rounded-[24px] p-8 min-h-[320px] flex flex-col shadow-luxury animate-fade-in-up [animation-delay:400ms]">
             <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                 <h3 className="text-[10px] text-white/50 font-bold uppercase tracking-[0.3em] font-heading">Yearly Breakdown</h3>
                 <TrendingUp className="w-4 h-4 text-gold animate-pulse-slow" />
             </div>
             <div className="flex-grow w-full h-full min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.yearlyBreakdown} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2}>
                        <defs>
                            <linearGradient id="barSlate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#334155" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#1e293b" stopOpacity={0.5}/>
                            </linearGradient>
                            <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.9}/>
                                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis 
                            dataKey="year" 
                            stroke="rgba(255,255,255,0.1)" 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            stroke="rgba(255,255,255,0.1)" 
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} 
                            tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                            tickLine={false}
                            axisLine={false}
                        />
                        <RechartsTooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                            contentStyle={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(212, 175, 55, 0.2)', color: '#F9F9F9', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                            formatter={(value: number) => [formatCurrency(value), ""]}
                            labelStyle={{ color: '#888', marginBottom: '5px', fontSize: '10px', textTransform: 'uppercase' }}
                        />
                        <Bar dataKey="principalPaid" name="Principal" stackId="a" fill="url(#barSlate)" radius={[0, 0, 6, 6]} animationDuration={1500} />
                        <Bar dataKey="interestPaid" name="Interest" stackId="a" fill="url(#barGold)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>

      {/* 4. AI INSIGHTS */}
      <div className="bg-glass border-l-2 border-gold p-8 rounded-r-2xl relative animate-fade-in-up [animation-delay:600ms] shadow-luxury">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-4 h-4 text-gold animate-pulse" />
          <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] font-heading">
            {result.loanType === LoanType.EDUCATION ? 'Success Probability Analysis' : 'Intelligence Report'}
          </h3>
        </div>
        
        {loading ? (
          <div className="space-y-3 opacity-50">
            <div className="h-1 bg-white/10 rounded w-2/3 animate-pulse"></div>
            <div className="h-1 bg-white/10 rounded w-full animate-pulse [animation-delay:150ms]"></div>
            <div className="h-1 bg-white/10 rounded w-5/6 animate-pulse [animation-delay:300ms]"></div>
          </div>
        ) : (
          <div className="text-sm text-white/70 leading-relaxed font-light font-sans">
             {analysis.split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="mb-3 last:mb-0">{paragraph}</p>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
