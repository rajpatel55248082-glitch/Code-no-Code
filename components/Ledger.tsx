import React from 'react';
import { EMILog } from '../types';
import { History } from 'lucide-react';

interface LedgerProps {
  history: EMILog[];
  onLoad: (log: EMILog) => void;
}

export const Ledger: React.FC<LedgerProps> = ({ history, onLoad }) => {
  return (
    <div className="w-full overflow-x-auto pb-8 pt-2 no-scrollbar px-2">
      <div className="flex gap-5">
        {history.map((log, index) => (
          <div 
            key={log.id} 
            className="flex-shrink-0 min-w-[240px] bg-glass border border-glass-border hover:border-gold/40 rounded-xl p-6 cursor-pointer transition-all duration-300 group shadow-lg hover:-translate-y-1 hover:shadow-luxury-glow animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
            onClick={() => onLoad(log)}
          >
            <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase border border-white/10 px-2 py-1 rounded">{log.date}</span>
                <History className="w-3 h-3 text-gold/50 group-hover:text-gold transition-colors" />
            </div>
            
            <div className="space-y-1 mb-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Loan Amount</p>
                <p className="text-sm font-medium text-white tracking-wide">₹{log.principal.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Monthly</p>
                    <p className="text-gold font-heading font-bold text-lg">₹{Math.round(log.emi).toLocaleString('en-IN')}</p>
                </div>
                <span className="text-[10px] text-white/40">{log.tenureYears}y</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};