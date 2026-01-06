import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, TrendingDown, BookOpen } from 'lucide-react';
import { CalculationResult, ChatMessage, Sender } from '../types';
import { createChatSession, explainEMIResults, compareTenure } from '../services/geminiService';
import { calculateEMI } from '../utils/math';
import { GenerateContentResponse } from '@google/genai';

interface AIChatProps {
  currentResult: CalculationResult | null;
}

export const AIChat: React.FC<AIChatProps> = ({ currentResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatSessionRef = useRef(createChatSession());

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        sender: Sender.AI,
        text: "Welcome. I am your specialized financial concierge. How may I assist with your wealth planning?"
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let prompt = input;
      if (currentResult) {
        const context = `[Context: Loan Amount: ₹${currentResult.principal.toLocaleString('en-IN')}, Interest Rate: ${currentResult.rate}%, Tenure: ${currentResult.tenureYears} years]`;
        prompt = `${context} ${input}`;
      }

      const result = await chatSessionRef.current.sendMessageStream({ message: prompt });
      
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, sender: Sender.AI, text: '', isStreaming: true }]);

      let fullText = '';
      for await (const chunk of result) {
         const c = chunk as GenerateContentResponse;
         const text = c.text;
         if (text) {
           fullText += text;
           setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
         }
      }
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: Sender.AI, text: "I apologize, but I am currently unable to process your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!currentResult) return;
    setIsOpen(true);
    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: Sender.USER, text: "Analyze structure." }]);
    
    const explanation = await explainEMIResults(currentResult);
    
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: Sender.AI,
      text: explanation
    }]);
    setIsLoading(false);
  };

  const handleCompare = async () => {
    if (!currentResult || currentResult.tenureYears <= 5) return;
    setIsOpen(true);
    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: Sender.USER, text: "Compare with -5y tenure." }]);

    const shorterResult = calculateEMI(currentResult.principal, currentResult.rate, currentResult.tenureYears - 5);
    const comparison = await compareTenure(currentResult, shorterResult);

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: Sender.AI,
      text: comparison
    }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-midnight border border-gold/40 rounded-full flex items-center justify-center shadow-luxury-glow hover:scale-105 hover:bg-gold/10 transition-all duration-300 z-50 ${isOpen ? 'hidden' : 'flex'} animate-fade-in-up [animation-delay:1s]`}
      >
        <Sparkles className="text-gold w-6 h-6 animate-pulse-slow" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-midnight border border-glass-border rounded-[24px] shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-2xl animate-slide-up origin-bottom-right">
          
          {/* Header */}
          <div className="bg-glass p-5 border-b border-glass-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                <Sparkles className="w-3 h-3 text-gold" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gold tracking-[0.2em] font-heading uppercase">Concierge</h3>
                <p className="text-[9px] text-white/30 uppercase tracking-widest">Secure Connection</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-transparent to-black/40">
            {messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div 
                  className={`max-w-[85%] p-4 rounded-xl text-xs leading-relaxed shadow-lg backdrop-blur-sm border ${
                    msg.sender === Sender.USER 
                    ? 'bg-gold/90 text-midnight rounded-br-none border-gold font-medium' 
                    : 'bg-glass border-glass-border text-white/80 rounded-bl-none'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-1.5 bg-gold rounded-full animate-pulse ml-1"/>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Actions */}
          {currentResult && !isLoading && (
            <div className="px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar animate-fade-in">
              <button 
                onClick={handleExplain}
                className="flex items-center gap-1 bg-white/5 border border-gold/20 hover:bg-gold/10 text-gold text-[9px] uppercase font-bold tracking-widest px-3 py-2 rounded-lg whitespace-nowrap transition-all"
              >
                <BookOpen className="w-3 h-3" /> Report
              </button>
              {currentResult.tenureYears > 5 && (
                <button 
                    onClick={handleCompare}
                    className="flex items-center gap-1 bg-white/5 border border-gold/20 hover:bg-gold/10 text-gold text-[9px] uppercase font-bold tracking-widest px-3 py-2 rounded-lg whitespace-nowrap transition-all"
                >
                    <TrendingDown className="w-3 h-3" /> Optimize
                </button>
              )}
            </div>
          )}

          {/* Input */}
          <div className="p-5 bg-glass border-t border-glass-border">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Inquire..."
                className="w-full bg-[#151b2e] text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-gold/30 text-xs border border-white/5 shadow-inner placeholder-white/20 transition-all duration-300"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gold/10 rounded-md text-gold hover:bg-gold hover:text-midnight transition-all disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};