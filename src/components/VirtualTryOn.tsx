/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, StyleProfile } from '../types';
import { Sparkles, Eye, Scissors, Upload, Heart, ShoppingCart, Sliders, X, Check, RefreshCw } from 'lucide-react';

interface ModelOption {
  id: string;
  name: string;
  image: string;
  gender: string;
}

const MODEL_PRESETS: ModelOption[] = [
  {
    id: 'model-f-1',
    name: 'Atelier Female Preset',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    gender: 'Female model'
  },
  {
    id: 'model-m-1',
    name: 'Streetwear Male Preset',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    gender: 'Male model'
  },
  {
    id: 'model-n-1',
    name: 'Androgynous Avant Preset',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop',
    gender: 'Unisex model'
  }
];

interface VirtualTryOnProps {
  products: Product[];
  profile: StyleProfile;
  equippedProduct?: Product | null;
  onClearEquippedProduct?: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onSaveLook: (name: string, products: Product[], resultImg: string, uploadedGarment?: string) => void;
}

export default function VirtualTryOn({
  products,
  profile,
  equippedProduct,
  onClearEquippedProduct,
  onAddToCart,
  onSaveLook
}: VirtualTryOnProps) {
  // Try on configurations state tracking
  const [activeTops, setActiveTops] = useState<Product | null>(products.find(p => p.id === 'prod-4') || null);
  const [activeBottoms, setActiveBottoms] = useState<Product | null>(products.find(p => p.id === 'prod-3') || null);
  const [activeOuter, setActiveOuter] = useState<Product | null>(products.find(p => p.id === 'prod-1') || null);
  const [activeFootwear, setActiveFootwear] = useState<Product | null>(products.find(p => p.id === 'prod-5') || null);

  // Active target being tried on via VTON
  const [activeFittingProduct, setActiveFittingProduct] = useState<Product | null>(() => {
    return products.find(p => p.id === 'prod-1') || products.find(p => p.id === 'prod-4') || null;
  });

  // Model persona state tracking
  const [selectedModel, setSelectedModel] = useState<string>(profile.selfieUrl || MODEL_PRESETS[0].image);

  // Custom garment upload states
  const [isCustomUploadOpen, setIsCustomUploadOpen] = useState(false);
  const [customGarmentName, setCustomGarmentName] = useState('');
  const [customGarmentImage, setCustomGarmentImage] = useState<string | null>(null);
  const [isCustomGarmentEquipped, setIsCustomGarmentEquipped] = useState(false);

  // Core synthesis processing state
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [hasSynthesized, setHasSynthesized] = useState(true);
  const [visualDescription, setVisualDescription] = useState(
    'A contemporary high-street modeling silhouette featuring the Obsidian Oversized Bomber over raw combed loopback coordinates tailored to suit your styling preferences.'
  );
  const [synthesizedImageUrl, setSynthesizedImageUrl] = useState<string | null>(null);

  // Before / After slider separation index
  const [compareSplitPercent, setCompareSplitPercent] = useState(50);
  const [saveLookName, setSaveLookName] = useState('Obsidian Avant-Garde Drapes');
  const [didSave, setDidSave] = useState(false);

  // Catalog selectors drawer trackers
  const [activeCategoryDrawer, setActiveCategoryDrawer] = useState<'tops' | 'bottoms' | 'outerwear' | 'footwear' | null>(null);

  // Handle custom weaponized clothes uploading
  const handleCustomFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomGarmentImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEquipCustomGarment = () => {
    if (!customGarmentImage) return;
    setIsCustomGarmentEquipped(true);
    setIsCustomUploadOpen(false);
    triggerSynthesis();
  };

  // Pre-synthesize default styling on component mount or model change
  useEffect(() => {
    triggerSynthesis();
  }, [selectedModel]);

  // Handle outside incoming equipped tryon pieces
  useEffect(() => {
    if (equippedProduct) {
      if (equippedProduct.category === 'outerwear') setActiveOuter(equippedProduct);
      if (equippedProduct.category === 'tops') setActiveTops(equippedProduct);
      if (equippedProduct.category === 'bottoms') setActiveBottoms(equippedProduct);
      if (equippedProduct.category === 'footwear') setActiveFootwear(equippedProduct);
      
      setActiveFittingProduct(equippedProduct);
      setIsCustomGarmentEquipped(false);
      
      // Trigger synthesis directly passing the target item
      triggerSynthesis(undefined, equippedProduct);
      
      if (onClearEquippedProduct) {
        onClearEquippedProduct();
      }
    }
  }, [equippedProduct]);

  // Re-run synthesis scanner
  const triggerSynthesis = async (overrideModel?: string, overrideGarment?: Product | null) => {
    setIsSynthesizing(true);
    setDidSave(false);

    const activeList = [
      activeOuter?.id,
      activeTops?.id,
      activeBottoms?.id,
      activeFootwear?.id
    ].filter(Boolean) as string[];

    const finalModel = overrideModel || selectedModel;
    const finalGarment = overrideGarment !== undefined ? overrideGarment : activeFittingProduct;

    try {
      const response = await fetch('/api/style/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: activeList,
          selfieUrl: finalModel,
          customGarmentUrl: isCustomGarmentEquipped ? customGarmentImage : undefined,
          garmentId: finalGarment?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        setVisualDescription(data.visualNarrative);
        if (data.synthesizedImageUrl) {
          setSynthesizedImageUrl(data.synthesizedImageUrl);
        } else {
          setSynthesizedImageUrl(null);
        }
      }
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setTimeout(() => {
        setIsSynthesizing(false);
        setHasSynthesized(true);
      }, 2500); // Visual lock effects
    }
  };

  // Add all active lacing items to shopping cart
  const handleAddBundleToCart = () => {
    const itemsToBag = [activeOuter, activeTops, activeBottoms, activeFootwear].filter(Boolean) as Product[];
    itemsToBag.forEach(p => {
      onAddToCart(p, p.sizes[0], p.colors[0]);
    });
  };

  const handleSaveCombo = () => {
    const activeList = [activeOuter, activeTops, activeBottoms, activeFootwear].filter(Boolean) as Product[];
    const resultImageUrl = synthesizedImageUrl || activeOuter?.image || profile.selfieUrl || '';
    onSaveLook(
      saveLookName || 'Bespoke AI Drape Series',
      activeList,
      resultImageUrl,
      isCustomGarmentEquipped && customGarmentImage ? customGarmentImage : undefined
    );
    setDidSave(true);
    setTimeout(() => setDidSave(false), 2500);
  };

  const handleSelectDrawerItem = (product: Product) => {
    if (product.category === 'outerwear') setActiveOuter(product);
    if (product.category === 'tops') setActiveTops(product);
    if (product.category === 'bottoms') setActiveBottoms(product);
    if (product.category === 'footwear') setActiveFootwear(product);
    setActiveFittingProduct(product);
    setIsCustomGarmentEquipped(false);
    setActiveCategoryDrawer(null);
    triggerSynthesis(undefined, product);
  };

  const primaryGarment = isCustomGarmentEquipped && customGarmentImage 
    ? customGarmentImage 
    : (activeFittingProduct?.image || activeOuter?.image || activeTops?.image || activeBottoms?.image || '');

  const primaryGarmentName = isCustomGarmentEquipped 
    ? (customGarmentName || 'Uploaded Custom Piece') 
    : (activeFittingProduct?.name || activeOuter?.name || activeTops?.name || activeBottoms?.name || 'No Layer Fitted');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 font-sans text-white z-10 relative" id="immersive-tryon-module">
      <div className="text-center mb-6">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xxs font-mono rounded-full uppercase tracking-widest inline-block mb-2">
          Virtual Try-On
        </span>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white mb-1">
          Interactive Fitting Room
        </h2>
        <p className="text-neutral-400 text-xs max-w-md mx-auto">
          Mix standard catalog pieces, layer custom garments, and view tailored style compositions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. LEFT WORKSPACE: Layer selectors and Custom Closet uploads */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider font-display border-b border-white/5 pb-2 mb-2 flex justify-between items-center text-amber-400">
                <span>Fitting Room Layout</span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest lowercase">Layers</span>
              </h3>

              {/* Model / Mannequin Selection Row */}
              <div className="space-y-1.5 pb-3.5 border-b border-white/5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Mannequin Model</span>
                <div className="grid grid-cols-4 gap-2">
                  {MODEL_PRESETS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.image);
                        triggerSynthesis(m.image);
                      }}
                      type="button"
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border transition-all cursor-pointer bg-neutral-900 group ${
                        selectedModel === m.image ? 'border-amber-400 ring-2 ring-amber-400/35 font-semibold' : 'border-white/10 opacity-75 hover:opacity-100'
                      }`}
                      title={m.name}
                    >
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover animate-fade-in" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 py-0.5 text-center">
                        <p className="text-[7.5px] font-mono text-white/95 truncate px-1 uppercase">{m.id.includes('-f') ? 'Female' : m.id.includes('-m') ? 'Male' : 'Unisex'}</p>
                      </div>
                    </button>
                  ))}

                  {/* Manual user uploaded selfie model callback selection */}
                  <div
                    onClick={() => document.getElementById('fitting-room-manual-selfie')?.click()}
                    className={`relative aspect-[3/4] rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all bg-white/2 hover:bg-white/5 ${
                      selectedModel !== MODEL_PRESETS[0].image &&
                      selectedModel !== MODEL_PRESETS[1].image &&
                      selectedModel !== MODEL_PRESETS[2].image
                        ? 'border-amber-400 text-amber-400 ring-2 ring-amber-400/30'
                        : 'border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="file"
                      id="fitting-room-manual-selfie"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              const customUrl = event.target.result as string;
                              setSelectedModel(customUrl);
                              triggerSynthesis(customUrl);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 mb-1 text-amber-400/85 shrink-0" />
                    <span className="text-[7.5px] font-mono text-center leading-none uppercase font-medium">My Photo</span>
                  </div>
                </div>
              </div>

              {/* Layer 1: Outerwear selector */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                    {activeOuter ? (
                      <img src={activeOuter.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-500 uppercase">Shell</div>
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider">01. OUTER COAT / SHELL</span>
                    <p className="text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-xs">{activeOuter ? activeOuter.name : 'Drape empty'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeOuter && (
                    <button
                      onClick={() => {
                        setActiveFittingProduct(activeOuter);
                        setIsCustomGarmentEquipped(false);
                        triggerSynthesis(undefined, activeOuter);
                      }}
                      type="button"
                      className={`text-[9px] font-mono px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        activeFittingProduct?.id === activeOuter.id && !isCustomGarmentEquipped
                          ? 'bg-amber-400 text-black font-semibold shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {activeFittingProduct?.id === activeOuter.id && !isCustomGarmentEquipped && (
                        <Check className="w-2.5 h-2.5 shrink-0" />
                      )}
                      <span>{activeFittingProduct?.id === activeOuter.id && !isCustomGarmentEquipped ? 'Active Fitting' : 'Try On'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveCategoryDrawer('outerwear')}
                    type="button"
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Swap
                  </button>
                  {activeOuter && (
                    <button
                      onClick={() => { 
                        setActiveOuter(null); 
                        if (activeFittingProduct?.id === activeOuter.id) {
                          const nextFit = activeTops || activeBottoms || activeFootwear || null;
                          setActiveFittingProduct(nextFit);
                          triggerSynthesis(undefined, nextFit);
                        } else {
                          triggerSynthesis();
                        }
                      }}
                      type="button"
                      className="text-neutral-500 hover:text-red-400 text-md cursor-pointer px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Layer 2: Tops selector */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                    {activeTops ? (
                      <img src={activeTops.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-500 uppercase text-center font-mono leading-none">Top Layer</div>
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider">02. PRIMARY INNER SHIRT</span>
                    <p className="text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-xs">{activeTops ? activeTops.name : 'Drape empty'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTops && (
                    <button
                      onClick={() => {
                        setActiveFittingProduct(activeTops);
                        setIsCustomGarmentEquipped(false);
                        triggerSynthesis(undefined, activeTops);
                      }}
                      type="button"
                      className={`text-[9px] font-mono px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        activeFittingProduct?.id === activeTops.id && !isCustomGarmentEquipped
                          ? 'bg-amber-400 text-black font-semibold shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {activeFittingProduct?.id === activeTops.id && !isCustomGarmentEquipped && (
                        <Check className="w-2.5 h-2.5 shrink-0" />
                      )}
                      <span>{activeFittingProduct?.id === activeTops.id && !isCustomGarmentEquipped ? 'Active Fitting' : 'Try On'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveCategoryDrawer('tops')}
                    type="button"
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Swap
                  </button>
                  {activeTops && (
                    <button
                      onClick={() => { 
                        setActiveTops(null); 
                        if (activeFittingProduct?.id === activeTops.id) {
                          const nextFit = activeOuter || activeBottoms || activeFootwear || null;
                          setActiveFittingProduct(nextFit);
                          triggerSynthesis(undefined, nextFit);
                        } else {
                          triggerSynthesis();
                        }
                      }}
                      type="button"
                      className="text-neutral-500 hover:text-red-400 text-md cursor-pointer px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Layer 3: Bottom pants selector */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                    {activeBottoms ? (
                      <img src={activeBottoms.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-500 uppercase font-mono text-center leading-none">Bottom</div>
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider">03. TROUSER STRUCTURE</span>
                    <p className="text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-xs">{activeBottoms ? activeBottoms.name : 'Drape empty'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeBottoms && (
                    <button
                      onClick={() => {
                        setActiveFittingProduct(activeBottoms);
                        setIsCustomGarmentEquipped(false);
                        triggerSynthesis(undefined, activeBottoms);
                      }}
                      type="button"
                      className={`text-[9px] font-mono px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        activeFittingProduct?.id === activeBottoms.id && !isCustomGarmentEquipped
                          ? 'bg-amber-400 text-black font-semibold shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {activeFittingProduct?.id === activeBottoms.id && !isCustomGarmentEquipped && (
                        <Check className="w-2.5 h-2.5 shrink-0" />
                      )}
                      <span>{activeFittingProduct?.id === activeBottoms.id && !isCustomGarmentEquipped ? 'Active Fitting' : 'Try On'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveCategoryDrawer('bottoms')}
                    type="button"
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Swap
                  </button>
                  {activeBottoms && (
                    <button
                      onClick={() => { 
                        setActiveBottoms(null); 
                        if (activeFittingProduct?.id === activeBottoms.id) {
                          const nextFit = activeOuter || activeTops || activeFootwear || null;
                          setActiveFittingProduct(nextFit);
                          triggerSynthesis(undefined, nextFit);
                        } else {
                          triggerSynthesis();
                        }
                      }}
                      type="button"
                      className="text-neutral-500 hover:text-red-400 text-md cursor-pointer px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Layer 4: Footwear selector */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                    {activeFootwear ? (
                      <img src={activeFootwear.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-500 uppercase text-center font-mono leading-none">Sole</div>
                    )}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider">04. ANCHOR FOOTWEAR</span>
                    <p className="text-xs font-semibold text-white truncate max-w-[130px] sm:max-w-xs">{activeFootwear ? activeFootwear.name : 'Drape empty'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeFootwear && (
                    <button
                      onClick={() => {
                        setActiveFittingProduct(activeFootwear);
                        setIsCustomGarmentEquipped(false);
                        triggerSynthesis(undefined, activeFootwear);
                      }}
                      type="button"
                      className={`text-[9px] font-mono px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                        activeFittingProduct?.id === activeFootwear.id && !isCustomGarmentEquipped
                          ? 'bg-amber-400 text-black font-semibold shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {activeFittingProduct?.id === activeFootwear.id && !isCustomGarmentEquipped && (
                        <Check className="w-2.5 h-2.5 shrink-0" />
                      )}
                      <span>{activeFittingProduct?.id === activeFootwear.id && !isCustomGarmentEquipped ? 'Active Fitting' : 'Try On'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveCategoryDrawer('footwear')}
                    type="button"
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Swap
                  </button>
                  {activeFootwear && (
                    <button
                      onClick={() => { 
                        setActiveFootwear(null); 
                        if (activeFittingProduct?.id === activeFootwear.id) {
                          const nextFit = activeOuter || activeTops || activeBottoms || null;
                          setActiveFittingProduct(nextFit);
                          triggerSynthesis(undefined, nextFit);
                        } else {
                          triggerSynthesis();
                        }
                      }}
                      type="button"
                      className="text-neutral-500 hover:text-red-400 text-md cursor-pointer px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Uploaded Clothing Try-on Trigger */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-3">Custom Closet Upload</p>
                {isCustomGarmentEquipped && customGarmentImage ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-500/30">
                        <img src={customGarmentImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-mono font-medium truncate max-w-[120px]">{customGarmentName || 'Uploaded Garment'}</span>
                    </div>
                    <button
                      onClick={() => { setIsCustomGarmentEquipped(false); triggerSynthesis(); }}
                      type="button"
                      className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Unequip
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCustomUploadOpen(true)}
                    type="button"
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-mono tracking-tight transition-all cursor-pointer"
                    id="trigger-custom-clothing-upload"
                  >
                    <Upload className="w-4 h-4 text-amber-400 animate-bounce" />
                    Upload Personal Clothes
                  </button>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button
                onClick={triggerSynthesis}
                disabled={isSynthesizing}
                type="button"
                className="w-full py-4.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-sm rounded-xl flex items-center justify-center gap-2 font-display transition-all duration-300 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4.5 h-4.5 shrink-0 ${isSynthesizing ? 'animate-spin' : ''}`} />
                {isSynthesizing ? 'Preparing styling drapes...' : 'Update combination view'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN CENTER AREA: Immersive Interactive Try-On split slider view */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden flex-1 flex flex-col justify-between items-center min-h-[460px]">
            
            {/* VTON Model + Garment Synthesis Recipe Indicator */}
            <div className="w-full max-w-md bg-white/3 border border-white/5 rounded-xl p-3 mb-4 flex items-center justify-around gap-2 text-xs">
              <div className="flex items-center gap-2 max-w-[45%]">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-400 shrink-0 bg-neutral-950">
                  <img src={selectedModel} alt="Model" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-neutral-400 leading-none">VTON MODEL</p>
                  <p className="text-[11px] font-semibold text-white/95 truncate mt-1">
                    {selectedModel === profile.selfieUrl ? "My Photo Portrait" : MODEL_PRESETS.find(m => m.image === selectedModel)?.name || "Loaded Persona"}
                  </p>
                </div>
              </div>

              <div className="text-amber-400 font-bold font-mono text-sm animate-pulse shrink-0">
                +
              </div>

              <div className="flex items-center gap-2 max-w-[45%]">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400 shrink-0 bg-neutral-900 flex items-center justify-center">
                  {primaryGarment ? (
                    <img src={primaryGarment} alt="Garment" className="w-full h-full object-cover animate-fade-in" />
                  ) : (
                    <span className="text-[8px] font-mono text-neutral-500">None</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-neutral-400 leading-none font-medium">PRIMARY FITTING</p>
                  <p className="text-[11px] font-semibold text-white/95 truncate mt-1 max-w-[130px]" title={primaryGarmentName}>{primaryGarmentName}</p>
                </div>
              </div>
            </div>

            {/* Interactive Before & After sliders framing the body preset */}
            <div className="relative w-full max-w-md aspect-[3/4] bg-neutral-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex-1 flex items-center justify-center group select-none">
              
              {/* Lasers visual loading effect */}
              {isSynthesizing && (
                <div className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-center items-center backdrop-blur-sm pointer-events-none">
                  <div className="absolute left-0 right-0 h-[2px] bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-scan" />
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-amber-400 animate-spin mx-auto text-amber-400" />
                    <div>
                      <p className="text-sm font-semibold font-display tracking-tight text-white mb-1">Assembling Layer Layout</p>
                      <p className="text-[10px] text-neutral-400 font-mono">Draping shoulder, chest, and waist seams gracefully under VTON neural model...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic composite rendering of products fitted */}
              {/* Left Side: Before portrait, Right Side: After projection */}
              <div className="absolute inset-0 z-0">
                {/* original selfie avatar */}
                <img
                  src={selectedModel}
                  alt="Original Canvas"
                  className="absolute inset-0 w-full h-full object-cover filter brightness-85 select-none"
                />
              </div>

              {/* Separator / Slider composite */}
              <div
                className="absolute inset-y-0 right-0 z-10 overflow-hidden"
                style={{ left: `${compareSplitPercent}%` }}
              >
                {/* Composite layer containing jacket, tshirt, bottoms fitting */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{ width: '100%', left: `-${compareSplitPercent}%` }}
                >
                  {/* High quality synthesized styling compound image */}
                  <img
                    src={synthesizedImageUrl ? synthesizedImageUrl : (activeOuter ? activeOuter.image : (activeTops ? activeTops.image : selectedModel))}
                    alt="Synthesized Layer"
                    className="absolute inset-0 w-full h-full object-cover filter contrast-102 saturation-105 select-none animate-fade-in"
                    referrerPolicy="no-referrer"
                  />

                </div>
              </div>

              {/* Slider Controller line */}
              <div
                className="absolute inset-y-0 z-20 w-[1.5px] bg-amber-400 cursor-ew-resize flex items-center justify-center animate-pulse"
                style={{ left: `${compareSplitPercent}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-black border border-amber-400 flex items-center justify-center text-xs shadow-lg shrink-0">
                  <Sliders className="w-3 h-3 text-amber-400 pointer-events-none" />
                </div>
              </div>

              {/* Slider Input range (invisible click area) */}
              <input
                type="range"
                min="0"
                max="100"
                value={compareSplitPercent}
                onChange={(e) => setCompareSplitPercent(parseInt(e.target.value, 10))}
                className="absolute inset-0 z-25 opacity-0 cursor-ew-resize w-full h-full"
              />

              {/* Dynamic labels before and after */}
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[9px] font-mono text-neutral-400">
                BEFORE (selfie)
              </div>
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[9px] font-mono text-amber-400">
                AFTER (virtual try-on)
              </div>
            </div>

            {/* AI synthesis description text */}
            <div className="w-full mt-4 p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5 text-center">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest leading-none flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Curator Stylist Evaluation
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans max-w-2xl mx-auto italic font-light">
                &ldquo;{visualDescription}&rdquo;
              </p>
            </div>

            {/* Bottom actions bar: add, save combo */}
            <div className="w-full mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={saveLookName}
                  onChange={(e) => setSaveLookName(e.target.value)}
                  placeholder="Name look combination..."
                  className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors font-mono max-w-[200px]"
                />
                <button
                  type="button"
                  onClick={handleSaveCombo}
                  disabled={didSave}
                  className={`py-2 px-4 rounded-xl text-xs font-mono font-medium tracking-tight border transition-colors cursor-pointer ${
                    didSave 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                  id="save-try-on-look-btn"
                >
                  {didSave ? 'Look Vaulted!' : 'Save Styling Combo'}
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto self-end shrink-0">
                <button
                  type="button"
                  onClick={handleAddBundleToCart}
                  className="w-full sm:w-auto py-2.5 px-5 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 shadow-[0_4px_15px_rgba(251,191,36,0.1)] cursor-pointer shrink-0"
                  id="add-bundle-cart-btn"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Bag Outfit Bundle (Discounted)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODALS AND DRAWERS */}

      {/* Category garment swap drawers */}
      <AnimatePresence>
        {activeCategoryDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center p-4 sm:items-center"
            id="category-drawer-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-panel border border-white/15 w-full max-w-2xl rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setActiveCategoryDrawer(null)}
                  type="button"
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold font-display uppercase tracking-tight text-white inline-block">
                  Select {activeCategoryDrawer}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-1 py-1">
                {products
                  .filter(p => p.category === activeCategoryDrawer)
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectDrawerItem(p)}
                      className="border border-white/10 hover:border-amber-400/55 rounded-2xl p-3 bg-white/2 hover:bg-white/5 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-neutral-900 mb-2">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover scale-102 group-hover:scale-104 transition-transform" />
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block leading-none">{p.brand}</span>
                        <h4 className="text-xs font-semibold text-white truncate font-display leading-tight">{p.name}</h4>
                        <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-amber-400">
                          <span>${p.price}</span>
                          <span className="text-emerald-400">{p.alignment.fitMatch}% Score</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom personal garment upload modal */}
      <AnimatePresence>
        {isCustomUploadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            id="custom-garment-upload-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-panel border border-white/15 w-full max-w-md rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setIsCustomUploadOpen(false)}
                  type="button"
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-display">Add Custom Wardrobe Piece</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xxs font-mono text-neutral-500 uppercase tracking-wider mb-2">Garment Name</label>
                  <input
                    type="text"
                    required
                    value={customGarmentName}
                    onChange={(e) => setCustomGarmentName(e.target.value)}
                    placeholder="e.g. My Favorite Sage Knit Sweater"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-mono text-neutral-500 uppercase tracking-wider mb-2">Garment Photo</label>
                  <div
                    onClick={() => document.getElementById('garment-file-uploader')?.click()}
                    className={`border border-dashed border-white/10 rounded-2xl h-44 flex flex-col items-center justify-center bg-white/2 hover:bg-white/5 cursor-pointer relative overflow-hidden`}
                  >
                    <input
                      type="file"
                      id="garment-file-uploader"
                      accept="image/*"
                      onChange={handleCustomFileChange}
                      className="hidden"
                    />

                    {customGarmentImage ? (
                      <>
                        <img src={customGarmentImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex justify-center items-center">
                          <span className="text-[10px] font-mono text-white bg-black/60 px-2.5 py-1 rounded-md border border-white/10">Replace Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 text-neutral-400 space-y-2">
                        <Upload className="w-7 h-7 mx-auto animate-pulse" />
                        <p className="text-xs font-semibold">Select clothing flat-lay photo</p>
                        <p className="text-[9px] text-neutral-500 font-mono">PNG / JPEG / WebP sizes under 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEquipCustomGarment}
                  disabled={!customGarmentImage || !customGarmentName}
                  className="w-full py-3 mt-4 bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                  id="equip-custom-garment-btn"
                >
                  Equip garment & trigger analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
