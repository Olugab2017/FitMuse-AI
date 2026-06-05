/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { UserProfile, SavedLook, Product } from '../types';
import { Sparkles, Calendar, Box, Bell, Shield, ArrowRight, Eye, Clipboard, Star } from 'lucide-react';

interface UserProfileScreenProps {
  profile: UserProfile;
  savedLooks: SavedLook[];
  onOpenProduct: (product: Product) => void;
  onNavigateToTab: (tab: string) => void;
  onReanalyzeStyle?: () => void;
  onSignOut?: () => void;
}

export default function UserProfileScreen({
  profile,
  savedLooks,
  onOpenProduct,
  onNavigateToTab,
  onReanalyzeStyle,
  onSignOut
}: UserProfileScreenProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 font-sans text-white z-10 relative" id="user-profile-module">
      
      {/* User Header Profile Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative mb-8">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-5 z-10">
          <div className="w-20 h-20 rounded-full border-2 border-amber-400 overflow-hidden shrink-0 shadow-lg">
            {profile.styleProfile?.selfieUrl ? (
              <img src={profile.styleProfile.selfieUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-900 border-2 border-white/5 flex items-center justify-center text-white font-display font-bold">P</div>
            )}
          </div>

          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl font-bold font-display tracking-tight text-white">{profile.name}</h2>
            <p className="text-xs text-neutral-400 font-mono italic">{profile.email}</p>
            
            {profile.styleProfile && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 justify-center md:justify-start">
                <span className="px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/20 text-[10px] font-mono text-amber-400 rounded-full">
                  {profile.styleProfile.styleType}
                </span>
                {profile.styleProfile.aestheticTags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-white/3 border border-white/5 text-[10px] font-mono text-neutral-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 z-10 flex flex-wrap gap-2.5 text-xs font-mono justify-center md:justify-end">
          <button
            onClick={() => onNavigateToTab('tryon')}
            type="button"
            className="py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-black border border-transparent rounded-xl transition-all cursor-pointer font-semibold shadow-md shadow-amber-400/5 hover:scale-101"
          >
            Interactive Fitting Room
          </button>
          
          {onReanalyzeStyle && (
            <button
              onClick={onReanalyzeStyle}
              type="button"
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer text-neutral-300 hover:text-white"
            >
              Configure Style Identity
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              type="button"
              className="py-2.5 px-4 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-400 rounded-xl transition-all cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: saved looks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider font-display border-b border-white/5 pb-2 mb-2 text-amber-400 flex justify-between items-center">
              <span>Saved Look Combinations ({savedLooks.length})</span>
              <span className="text-xxs font-mono text-neutral-500 uppercase tracking-widest leading-none">Saved Looks</span>
            </h3>

            {savedLooks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl space-y-2">
                <p className="text-neutral-400 text-xs font-mono">No combinations saved yet</p>
                <button
                  onClick={() => onNavigateToTab('tryon')}
                  type="button"
                  className="text-xxs font-mono text-amber-300 hover:text-amber-400 cursor-pointer underline"
                >
                  Create try-on mix now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedLooks.map((look) => (
                  <div key={look.id} className="p-4 bg-white/2 border border-white/5 hover:border-amber-400/30 rounded-2xl flex flex-col justify-between transition-all group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/10 bg-neutral-900 shrink-0 relative">
                        <img src={look.resultImageUrl} alt={look.name} className="w-full h-full object-cover" />
                        {look.uploadedGarmentUrl && (
                          <div className="absolute bottom-1 right-1 w-6 h-6 rounded border border-emerald-500 overflow-hidden">
                            <img src={look.uploadedGarmentUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="text-left space-y-1 minister-width">
                        <span className="text-[8px] font-mono text-neutral-500 uppercase">{look.date}</span>
                        <h4 className="text-sm font-bold font-display text-white line-clamp-1">{look.name}</h4>
                        <p className="text-[10px] text-neutral-400 line-clamp-2">{look.products.map(p => p.name).join(', ')}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex gap-2 justify-end">
                      {look.products.map((p, idx) => (
                        <button
                          key={`${p.id}-${idx}`}
                          onClick={() => onOpenProduct(p)}
                          type="button"
                          className="px-2 py-1 bg-white/5 md:bg-white/3 hover:bg-amber-400 hover:text-black border border-white/5 rounded-md text-[9px] font-mono text-neutral-300 transition-colors uppercase cursor-pointer"
                        >
                          Shop {p.category === 'footwear' ? 'Sole' : p.category === 'tops' ? 'Base' : 'Shell'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Order History & stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider font-display border-b border-white/5 pb-2 mb-2 text-amber-400">
              Order History
            </h3>

            {profile.orderHistory.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs font-mono">
                No orders placed yet
              </div>
            ) : (
              <div className="space-y-4">
                {profile.orderHistory.map((order) => (
                  <div key={order.id} className="p-3 bg-white/2 border border-white/5 rounded-xl text-left space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-amber-400">{order.id}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">{order.status}</span>
                    </div>

                    <ul className="space-y-1 list-none p-0 m-0">
                      {order.items.map((it, i) => (
                        <li key={i} className="text-xxs text-neutral-400 flex justify-between">
                          <span>{it.productName} (x{it.quantity})</span>
                          <span className="font-mono text-neutral-300">${it.price * it.quantity}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-white/5 pt-1.5 flex justify-between items-center text-xs">
                      <span className="text-neutral-500 uppercase font-mono text-[9px]">Order Total</span>
                      <span className="font-mono font-bold text-white">${order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
