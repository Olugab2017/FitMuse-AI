/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, DragEvent, ChangeEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Info, HelpCircle, Check, X, Sparkles, User, UserCheck } from 'lucide-react';

interface SelfieUploadProps {
  onAnalyze: (selfieUrl: string, preferences: string) => void;
  onBack?: () => void;
}

// Pre-defined high quality modeling presets for quick sandbox testing
const PRESET_MODELS = [
  {
    id: 'model-f-1',
    name: 'Atelier Female Preset',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    gender: 'female',
    desc: 'Light complexion, neutral hair, high contrast cheeklines.'
  },
  {
    id: 'model-m-1',
    name: 'Streetwear Male Preset',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    gender: 'male',
    desc: 'Warm undertone, cropped hair, athletic jawline definition.'
  },
  {
    id: 'model-n-1',
    name: 'Androgynous Avant Preset',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop',
    gender: 'unisex',
    desc: 'Fair complexion, medium textured drapes.'
  }
];

export default function SelfieUpload({ onAnalyze, onBack }: SelfieUploadProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('model-f-1');
  const [customFileUrl, setCustomFileUrl] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('');
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomFileUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomFileUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCustomImage = (e: MouseEvent) => {
    e.stopPropagation();
    setCustomFileUrl(null);
  };

  const handleSubmit = () => {
    const finalUrl = customFileUrl || PRESET_MODELS.find(m => m.id === selectedPresetId)?.image || PRESET_MODELS[0].image;
    onAnalyze(finalUrl, preferences || 'Sleek luxury outerwear, clean box structures, monochrome dark items.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-white z-10 relative" id="selfie-upload-module">
      {onBack && (
        <button
          onClick={onBack}
          type="button"
          className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center mb-6 font-mono gap-1 cursor-pointer"
          id="selfie-back-btn"
        >
          ← Log Out & Exit
        </button>
      )}
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xxs font-mono rounded-full uppercase tracking-widest inline-block mb-3 animate-pulse">
          Personal styling profile
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-display">
          Define Your Style Profile
        </h2>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mt-2 font-light">
          Upload a clear portrait or select a style model below to view personalized clothing items paired with your visual aesthetic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm uppercase tracking-wider text-neutral-300 font-mono flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                Select Portrait
              </h3>
              <button
                onClick={() => setIsGuidanceOpen(true)}
                type="button"
                className="text-xs text-neutral-400 hover:text-purple-400 transition-colors flex items-center gap-1 font-mono cursor-pointer"
                id="guidance-modal-trigger"
              >
                <HelpCircle className="w-4 h-4" />
                Drape Guidelines
              </button>
            </div>

            {/* Custom file Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('selfie-file-input')?.click()}
              className={`relative border border-dashed rounded-2xl h-80 flex flex-col justify-center items-center transition-all cursor-pointer overflow-hidden ${
                customFileUrl ? 'border-purple-400/50 bg-black/50' : 
                isDragOver ? 'border-purple-400 bg-purple-400/5' : 'border-white/10 bg-white/2 hover:bg-white/5'
              }`}
              id="selfie-dropzone"
            >
              <input
                type="file"
                id="selfie-file-input"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {customFileUrl ? (
                <>
                  <img
                    src={customFileUrl}
                    alt="Uploaded user portrait"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-95 contrast-101"
                  />
                  <div className="absolute inset-x-8 top-1/4 bottom-1/4 border border-purple-500/10 rounded-lg pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-4">
                    <div className="flex justify-between items-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15">
                      <span className="text-xxs font-mono text-purple-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Photo Selected
                      </span>
                      <button
                        onClick={clearCustomImage}
                        type="button"
                        className="text-xxs font-mono text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        Clear Image
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-neutral-200">Drag & drop image here</p>
                    <p className="text-xs text-neutral-500 font-mono mt-1">or click to choose standard file</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[10px] text-neutral-400 font-mono">
                    <Info className="w-3.5 h-3.5 text-purple-400" />
                    Optimal for neutral, clear frontal lighting
                  </div>
                </div>
              )}
            </div>

            {/* Quick-test Presets block */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-xs uppercase font-mono text-neutral-400 tracking-widest mb-3">Or choose a style template:</p>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_MODELS.map((p) => {
                  const isSelected = !customFileUrl && selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCustomFileUrl(null);
                        setSelectedPresetId(p.id);
                      }}
                      type="button"
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border text-left transition-all cursor-pointer flex flex-col justify-end p-2.5 ${
                        isSelected 
                          ? 'border-purple-500 ring-1 ring-purple-500/20 scale-102 shadow-lg shadow-black/80' 
                          : 'border-white/15 opacity-60 hover:opacity-90 hover:scale-101'
                      }`}
                    >
                      <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold tracking-tight text-white leading-tight truncate">{p.name}</p>
                          {isSelected && <UserCheck className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1" />}
                        </div>
                        <p className="text-[8px] text-neutral-400 truncate leading-none mt-0.5">{p.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences Inputs & Submission */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-neutral-300 font-mono flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Style Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xxs font-mono text-neutral-500 uppercase tracking-wider mb-2">Aesthetic Notes (Optional)</label>
                  <textarea
                    rows={4}
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. Loose tailoring, monochrome colors, cozy knit accents, neutral tones..."
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-purple-500 text-white transition-colors placeholder:text-neutral-600 resize-none font-sans leading-relaxed font-light"
                    id="style-preferences-textarea"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-light">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span>Engine adapts tone, style pairing, and layout colors</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-light">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span>Curates items mapped to standard product lines</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              type="button"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 font-display transition-all duration-300 active:scale-98 shadow-[0_4px_25px_rgba(168,85,247,0.25)] mt-8 cursor-pointer"
              id="analyze-style-btn"
            >
              Analyze My Style
              <Sparkles className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Guidance Modal */}
      <AnimatePresence>
        {isGuidanceOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            id="guidance-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-panel border border-white/15 w-full max-w-lg rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setIsGuidanceOpen(false)}
                  type="button"
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 mb-5">
                <HelpCircle className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold font-display">Portrait Style Guidelines</h3>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-neutral-300">
                <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Lighting Recommendations
                  </h4>
                  <p className="text-xs text-neutral-400 font-light">
                    Use clear indoor lighting or direct workspace ambient. Avoid high shadow contrast or dark filters for realistic rendering.
                  </p>
                </div>

                <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Pose & Perspective Alignment
                  </h4>
                  <p className="text-xs text-neutral-400 font-light">
                    Hold portrait framing. Frontal view or slight 3/4 face profile. Capture necklines clearly to enable seamless collar matching.
                  </p>
                </div>

                <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Acceptable Formats
                  </h4>
                  <p className="text-xs text-neutral-400 font-light">
                    Accepts standard PNG, JPG, or WEBP high-quality files. Neutrally coloured background settings offer optimal pairing aesthetics.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGuidanceOpen(false)}
                type="button"
                className="w-full mt-6 py-3 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Acknowledge guidelines
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
