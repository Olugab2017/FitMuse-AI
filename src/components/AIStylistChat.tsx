/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ChatMessage } from '../types';
import { Sparkles, Send, User, Bot, HelpCircle, Eye, ShoppingCart, RefreshCw, Check } from 'lucide-react';

interface AIStylistChatProps {
  products: Product[];
  onTryOn: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onOpenProduct: (product: Product) => void;
}

const SAMPLE_STARTER_QUERIES = [
  'What should I wear for an elite streetwear gallery opening?',
  'Does the Asymmetric Trench Coat match drop-crotch joggers?',
  'How can I layer minimalist items for neutral-warm undertones?',
  'Can you select a tactical active-luxury combination?'
];

export default function AIStylistChat({
  products,
  onTryOn,
  onAddToCart,
  onOpenProduct
}: AIStylistChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: "Hello and welcome. I am your FitMuse styling advisor. Tell me your styling goals or aesthetic preferences, and I'll find the perfect minimalist clothing combinations tailored for you.\n\nAsk me anything! For example: *'What should I wear for a gallery opening?'* or *'How can I layer the Obsidian Trench Coat?'*.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const containerEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isPending) return;

    const userMessage: ChatMessage = {
      id: `usr-msg-${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsPending(true);

    try {
      const response = await fetch('/api/style/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, text: m.text }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-msg-${Date.now()}`,
            role: 'model',
            text: data.text,
            suggestedProductIds: data.suggestedProductIds,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback message
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'model',
          text: "I encountered a minor lacing connection error, but I highly recommend lacing the Obsidian Oversized Bomber [prod-1] styled with cargo trousers.",
          suggestedProductIds: ['prod-1'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleQuickAdd = (e: MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product, product.sizes[0], product.colors[0]);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  // Helper to safely render Markdown or text, cleaning custom code snippets
  const renderMessageText = (text: string) => {
    // Simply replace our bracketed product tags so they don't look weird inline,
    // (e.g. [prod-1] to their neat human counterparts, or we keep them highlighted)
    return text.split('\n').map((line, lIdx) => {
      let refinedLine = line;
      // Regex replace [prod-x] with a styled inline span
      const matches = refinedLine.match(/\[prod-\d+\]/g);
      if (matches) {
        matches.forEach(m => {
          const prodId = m.replace('[', '').replace(']', '');
          const matchProduct = products.find(p => p.id === prodId);
          if (matchProduct) {
            refinedLine = refinedLine.replace(m, `**${matchProduct.name}**`);
          }
        });
      }

      return (
        <p key={lIdx} className="mb-2 last:mb-0 leading-relaxed font-sans text-xs md:text-sm">
          {refinedLine.startsWith('*') && refinedLine.endsWith('*') ? (
            <em className="text-amber-300 font-medium">{refinedLine.replace(/\*/g, '')}</em>
          ) : refinedLine.startsWith('**') ? (
            <strong className="text-white font-semibold">{refinedLine.replace(/\*\*/g, '')}</strong>
          ) : (
            refinedLine
          )}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-white z-10 relative flex flex-col h-[650px] justify-between" id="ai-stylist-chat-module">
      <div className="text-center mb-4 shrink-0">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono rounded-full uppercase tracking-widest inline-block mb-2">
          Personal Advisor
        </span>
        <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center justify-center gap-1.5">
          <Sparkles className="w-5.5 h-5.5 text-amber-400 animate-pulse" />
          Styling Advisor
        </h2>
      </div>

      {/* Main chat log channel drapes */}
      <div className="glass-panel border border-white/10 rounded-2xl flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        
        {/* Chat log body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Chat bubble avatar icon styling */}
                  <div className={`p-2 rounded-xl shrink-0 border ${
                    isUser ? 'bg-amber-400 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-amber-400'
                  }`}>
                    {isUser ? <User className="w-4 h-4 shrink-0" /> : <Bot className="w-4 h-4 shrink-0" />}
                  </div>

                  <div className="space-y-3">
                    {/* Chat Text Bubble */}
                    <div className={`p-4 rounded-3xl text-left border ${
                      isUser
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-100 rounded-tr-sm'
                        : 'bg-black/40 border-white/5 text-neutral-300 rounded-tl-sm'
                    }`}>
                      {renderMessageText(m.text)}
                      <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest mt-1 text-right">
                        {m.timestamp}
                      </span>
                    </div>

                    {/* Associated product preview cards */}
                    {!isUser && m.suggestedProductIds && m.suggestedProductIds.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pr-4 text-left">
                        {m.suggestedProductIds
                          .map(id => products.find(p => p.id === id))
                          .filter(Boolean)
                          .map((p) => {
                            const prod = p as Product;
                            return (
                              <div
                                key={prod.id}
                                onClick={() => onOpenProduct(prod)}
                                className="p-3 bg-white/2 border border-white/5 hover:border-amber-400/40 rounded-xl flex gap-3 cursor-pointer items-center group transition-all"
                              >
                                <div className="w-12 h-12 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-white/10">
                                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover scale-102 group-hover:scale-104 transition-transform" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wide leading-none">{prod.brand}</span>
                                  <h4 className="text-xs font-semibold text-white truncate font-display leading-tight">{prod.name}</h4>
                                  <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-amber-400">
                                    <span>${prod.price}</span>
                                    <span className="text-emerald-400">{prod.alignment.fitMatch}% Matches</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5 justify-center">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onTryOn(prod); }}
                                    type="button"
                                    className="p-1.5 bg-white/5 hover:bg-amber-400 hover:text-black rounded-lg transition-all text-neutral-400 hover:scale-105 cursor-pointer border border-white/5"
                                    title="Try this item"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => handleQuickAdd(e, prod)}
                                    type="button"
                                    className={`p-1.5 rounded-lg transition-all border shrink-0 hover:scale-105 cursor-pointer ${
                                      addedProductId === prod.id 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'bg-white hover:bg-neutral-200 text-black border-white'
                                    }`}
                                    title="Add to bag"
                                  >
                                    {addedProductId === prod.id ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isPending && (
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 animate-pulse pl-4">
                <RefreshCw className="w-4.5 h-4.5 text-amber-400 animate-spin" />
                <span>Preparing fabric recommendations...</span>
              </div>
            )}
          </AnimatePresence>
          <div ref={containerEndRef} />
        </div>

        {/* Query suggest choices panel */}
        {messages.length <= 1 && (
          <div className="p-4 bg-white/2 border-t border-white/5 shrink-0 select-none">
            <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block mb-2 leading-none">Suggested styling prompts:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_STARTER_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(q)}
                  type="button"
                  className="px-3 py-1.5 bg-white/3 hover:bg-white/5 border border-white/10 rounded-xl text-xxs font-mono text-neutral-300 transition-all text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input channel footer frame */}
        <div className="p-4 border-t border-white/5 bg-black/50 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendQuery(inputValue); }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about materials, colors, outerwear pairings..."
              className="flex-grow bg-white/5 border border-white/10 px-4.5 py-3 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors placeholder:text-neutral-600 font-sans"
              id="stylist-input-field"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isPending}
              className="py-3 px-5 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-40"
              id="submit-chat-query-btn"
            >
              <Send className="w-4 h-4 shrink-0" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
