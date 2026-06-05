/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { StyleProfile } from '../types';
import { Sparkles, Calendar, Heart, ShieldAlert, ArrowRight, User } from 'lucide-react';

interface StyleProfileScreenProps {
  profile: StyleProfile;
  userName: string;
  onContinue: () => void;
  onBack?: () => void;
}

export default function StyleProfileScreen({ profile, userName, onContinue, onBack }: StyleProfileScreenProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 text-white font-sans z-10 relative" id="style-profile-result-module">
      {onBack && (
        <button
          onClick={onBack}
          type="button"
          className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center mb-6 font-mono gap-1 cursor-pointer"
          id="profile-result-back-btn"
        >
          ← Change Portrait & Adjust Preferences
        </button>
      )}
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xxs font-mono rounded-full uppercase tracking-widest inline-block mb-3 animate-pulse">
          Style Profile Ready
        </span>
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white">
          Your Style Identity
        </h2>
        <p className="text-neutral-400 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
          We have matched your preferences with minimalist design coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Digital Identity Card */}
        <div className="md:col-span-5">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative h-full flex flex-col justify-between overflow-hidden">
            {/* Ambient purple/rose glow background */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />

            <div>
              <div className="flex justify-between items-center mb-6 z-10 relative">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-light">FITMUSE MEMBER</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>

              {/* Avatar picture */}
              <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-white/10 mb-6 group">
                {profile.selfieUrl ? (
                  <img
                    src={profile.selfieUrl}
                    alt={userName}
                    className="w-full h-full object-cover filter brightness-95"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-neutral-400">
                    <User className="w-12 h-12" />
                  </div>
                )}
                {/* Visual mesh lines mapping back */}


              </div>

              <div className="text-center z-10 relative">
                <h3 className="text-lg font-bold font-display tracking-tight text-white">{userName}</h3>
                <p className="text-xxs font-mono text-neutral-400 mt-1 uppercase tracking-wider font-light">MEMBER PROFILE</p>
              </div>
            </div>

            <div className="mt-8 border-t border-white/5 pt-4 z-10 relative space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono">FIT STYLE</span>
                <span className="text-neutral-300 font-sans font-light">Relaxed Tailored</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono">COLOR PALETTE</span>
                <span className="text-neutral-300 font-sans font-light">Earthly & Charcoal</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-mono">RECOMMENDED</span>
                <span className="text-neutral-300 font-mono">{profile.styleType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI style tags and recommendation analysis */}
        <div className="md:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block mb-1">Aesthetic Archetype</span>
                <h3 className="text-2xl font-bold font-display tracking-tight text-white">{profile.styleType}</h3>
                
                {/* Custom tags list */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.aestheticTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white/5 text-[10px] font-mono tracking-wider text-neutral-300 border border-white/10 rounded-full flex items-center gap-1 hover:border-purple-500/30 transition-all cursor-default"
                    >
                      <Sparkles className="w-3 h-3 text-purple-450" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block mb-1.5">Fit & Silhouette Directives</span>
                <p className="text-neutral-300 text-sm leading-relaxed font-sans font-light">
                  {profile.fitRecommendations}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block mb-2.5">Curated Accent Colors</span>
                <div className="flex items-center gap-3">
                  {profile.preferredColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-10 h-10 rounded-full border border-white/20 shadow-inner flex items-center justify-center relative cursor-pointer group select-none"
                        style={{ backgroundColor: color }}
                        title={`Accent hex: ${color}`}
                      >
                        <div className="absolute inset-0 rounded-full border border-black/30 hover:scale-105 transition-all" />
                      </div>
                      <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-tight">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onContinue}
              type="button"
              className="w-full mt-8 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 font-display transition-all duration-300 active:scale-98 cursor-pointer shadow-[0_4px_25px_rgba(168,85,247,0.25)] hover:opacity-95"
              id="goto-feed-btn"
            >
              Enter Personalized Boutique
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
