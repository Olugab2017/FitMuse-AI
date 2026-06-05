/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';

interface AIAnalysisProps {
  selfieUrl: string;
  preferences: string;
  onComplete: () => void;
}

const ROTATING_INSIGHTS = [
  'Aligning apparel pairings with your color tones...',
  'Sourcing clothing silhouettes with elegant drape...',
  'Organizing minimalist options by preference weight...',
  'Styling bespoke coordinates tailored for your profile...',
  'Arranging neutral highlights and fine layers...',
  'Refining your personal wardrobe feed...'
];

export default function AIAnalysis({ selfieUrl, onComplete }: AIAnalysisProps) {
  const [progress, setProgress] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);

  // Rotate styling insights
  useEffect(() => {
    const insightTimer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % ROTATING_INSIGHTS.length);
    }, 1800);
    return () => clearInterval(insightTimer);
  }, []);

  // Increment loading progress smoothly
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            onComplete();
          }, 805);
          return 100;
        }
        return next;
      });
    }, 45); // Takes about 4.5 seconds to complete

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  // Checklist items based on progress requirements
  const checklist = [
    { label: 'Body type analysis', checked: progress >= 15 },
    { label: 'Skin tone detection', checked: progress >= 38 },
    { label: 'Style preferences', checked: progress >= 58 },
    { label: 'Color compatibility', checked: progress >= 78 },
    { label: 'Fit recommendations', checked: progress >= 95 }
  ];

  // SVG circle calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full max-w-md mx-auto px-6 py-6 text-center text-white font-sans z-10 relative" id="ai-scanning-module">
      <div className="text-center mb-6">
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono rounded-full uppercase tracking-widest inline-block mb-3 animate-pulse">
          Digital Grid Analysis
        </span>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white mb-2">
          Analyzing Your Style
        </h2>
        <p className="text-neutral-400 text-xs max-w-xs mx-auto font-light leading-relaxed">
          Our AI is analyzing your photo to create your perfect style profile.
        </p>
      </div>

      {/* Dynamic Radial Scan Progress Section */}
      <div className="relative flex justify-center items-center my-6">
        {/* Background glow behind radial meter */}
        <div className="absolute w-36 h-36 bg-gradient-to-tr from-purple-500/15 to-fuchsia-500/15 rounded-full blur-2xl animate-pulse" />
        
        {/* Underlay portrait preview inside circle */}
        <div className="absolute w-28 h-28 rounded-full overflow-hidden border border-white/5 z-0 bg-neutral-950">
          <img 
            src={selfieUrl} 
            alt="Profile Thumbnail" 
            className="w-full h-full object-cover filter brightness-75 contrast-101 scale-102"
          />
          <div className="absolute inset-0 bg-purple-940/30 mix-blend-overlay" />
        </div>

        {/* SVG Radial Meter */}
        <svg className="w-36 h-36 transform -rotate-90 z-10 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]">
          <circle 
            cx="72" 
            cy="72" 
            r={radius} 
            className="text-white/5" 
            strokeWidth="5" 
            stroke="currentColor" 
            fill="transparent" 
          />
          <circle 
            cx="72" 
            cy="72" 
            r={radius} 
            className="text-purple-400" 
            strokeWidth="5.5" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
          />
        </svg>

        {/* Center Text label of percentage */}
        <div className="absolute z-20 flex flex-col justify-center items-center bg-black/70 backdrop-blur-md w-14 h-14 rounded-full border border-white/10 shadow-lg">
          <span className="text-sm font-bold tracking-tight font-display text-white">{progress}%</span>
        </div>
      </div>

      {/* Checklist items list */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 text-left max-w-sm mx-auto mb-6 space-y-3">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs font-mono">
            <span className={`transition-colors duration-350 ${item.checked ? 'text-purple-200' : 'text-neutral-500 font-light'}`}>
              {item.label}
            </span>
            <div className="flex items-center gap-1.5">
              {item.checked ? (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </motion.div>
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/5 bg-white/2 flex items-center justify-center" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom status helper */}
      <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
        This will only take a few seconds...
      </p>

      {/* Rotator insight subtext */}
      <div className="h-6 mt-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={insightIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            className="text-[10px] font-medium text-purple-300 font-sans tracking-tight flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-purple-450 shrink-0" />
            {ROTATING_INSIGHTS[insightIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
