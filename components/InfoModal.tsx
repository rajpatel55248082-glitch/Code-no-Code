import React from 'react';
import { X, FileText, Code, Shield } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight/90 backdrop-blur-lg p-4">
      <div className="bg-[#0A0E1A] border border-gold/20 w-full max-w-2xl max-h-[85vh] rounded-[24px] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-glass">
          <h2 className="text-sm font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2 font-heading">
            <Shield className="text-gold w-4 h-4" /> System Specs
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 space-y-10 text-white/60 leading-relaxed font-light font-sans scrollbar-thin">
          
          <section>
            <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <span className="w-1 h-1 bg-gold"></span> Architecture
            </h3>
            <p className="text-sm">
              SmartEMI is engineered as a high-precision wealth management tool. Utilizing 
              Gemini AI models for real-time financial advisory and Glassmorphism design principles 
              for a distraction-free interface.
            </p>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <Code className="w-3 h-3" /> Deployment
            </h3>
            <div className="bg-[#151b2e] p-6 rounded-lg border border-white/5 font-mono text-[10px] shadow-inner text-white/50">
              <p className="mb-2 text-gold/50"># Clone Repository</p>
              <p className="text-white/80 mb-6 pl-4">git clone https://github.com/user/smart-emi-luxury.git</p>
              
              <p className="mb-2 text-gold/50"># Install Dependencies</p>
              <p className="text-white/80 mb-6 pl-4">npm install</p>

              <p className="mb-2 text-gold/50"># Environment</p>
              <p className="text-white/80 pl-4">API_KEY=your_gemini_key</p>
            </div>
          </section>

          <section>
             <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <span className="w-1 h-1 bg-gold"></span> Stack
            </h3>
            <ul className="grid grid-cols-2 gap-4 text-xs tracking-wide">
              <li className="border-l border-white/10 pl-3">React 18 Engine</li>
              <li className="border-l border-white/10 pl-3">TypeScript Strict</li>
              <li className="border-l border-white/10 pl-3">Tailwind Utility</li>
              <li className="border-l border-white/10 pl-3">Gemini Neural Net</li>
            </ul>
          </section>
        </div>
        
        <div className="p-4 bg-glass border-t border-white/5 text-center">
            <p className="text-[9px] text-white/20 uppercase tracking-[0.4em]">Restricted Access // Private Build</p>
        </div>
      </div>
    </div>
  );
};