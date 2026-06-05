/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Product, StyleProfile } from '../types';
import { Sparkles, Heart, Eye, ShoppingCart, Search, Bell, Grid, Filter, Lightbulb, Check } from 'lucide-react';

interface PersonalizedFeedProps {
  products: Product[];
  profile: StyleProfile;
  userName: string;
  onOpenProduct: (product: Product) => void;
  onTryOn: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onNavigateToTab: (tab: string) => void;
  savedLookIds: string[];
  onToggleSaveLookId: (id: string) => void;
  outfits?: any[];
}

export default function PersonalizedFeed({
  products,
  profile,
  userName,
  onOpenProduct,
  onTryOn,
  onAddToCart,
  onNavigateToTab,
  savedLookIds,
  onToggleSaveLookId,
  outfits
}: PersonalizedFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Filter products based on search and selected category filter
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCartQuick = (e: MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product, product.sizes[0], product.colors[0]);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  // Pre-configured Outfits linking catalog IDs for composite look tries
  const DEFAULT_OUTFITS = [
    {
      id: 'look-outfit-1',
      name: 'Avant Obsidian Layer',
      style: 'Minimalist Streetwear',
      items: ['prod-1', 'prod-3', 'prod-5'],
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      matchRating: 98
    },
    {
      id: 'look-outfit-2',
      name: 'Tricolor Modular Drape',
      style: 'Quiet Luxury Tailored',
      items: ['prod-2', 'prod-4', 'prod-5'],
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
      matchRating: 95
    },
    {
      id: 'look-outfit-3',
      name: 'Modern Technical Layering',
      style: 'Luxury Technical Outerwear',
      items: ['prod-7', 'prod-6', 'prod-5'],
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
      matchRating: 92
    }
  ];

  const outfitsToUse = outfits && outfits.length > 0 ? outfits : DEFAULT_OUTFITS;

  return (
    <div className="w-full font-sans text-white z-10 pb-16 relative" id="personalized-feed-module">
      {/* 1. Header/Navigation Zone */}
      <header className="border-b border-white/10 bg-[#050505]/95 backdrop-blur-md py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span className="font-display font-medium tracking-wider text-xl uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-rose-400 font-bold">FITMUSE</span>
        </div>

        {/* Dynamic Search */}
        <div className="relative max-w-sm w-full hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search obsidian bombers, trenches, sneakers..."
            className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-400 text-white transition-colors placeholder:text-neutral-600 font-mono"
            id="product-search-input"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              type="button"
              className="p-2 hover:bg-white/5 rounded-xl border border-white/10 transition-colors relative cursor-pointer"
              id="notifications-bell-btn"
            >
              <Bell className="w-4 h-4 text-neutral-300" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            </button>

            {/* Notifications Menu box */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/15 rounded-2xl p-4 shadow-xl text-sm z-40">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                  <span>Styling Notifications</span>
                  <span className="text-rose-400">2 Active</span>
                </div>
                <div className="space-y-3 font-sans">
                  <div className="p-2.5 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5">
                    <p className="text-xs font-semibold text-white">Winter Obsidian Shells Loaded</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Our designers integrated heavy 320GSM bomber drapes targeted directly for your {profile.styleType} profile.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5">
                    <p className="text-xs font-semibold text-white">Palette Compatibility Met</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Matched 3 palette configurations to complement your design profile.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToTab('profile')}
            type="button"
            className="flex items-center gap-2.5 py-1 px-2.5 hover:bg-white/5 rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            <div className="w-6.5 h-6.5 rounded-full overflow-hidden border border-purple-400/30">
              {profile.selfieUrl ? (
                <img src={profile.selfieUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-800 text-white flex items-center justify-center text-xs">P</div>
              )}
            </div>
            <span className="text-xs font-mono tracking-tight hidden lg:inline">{userName.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-12">
        {/* 2. Top Banner: AI personalized recommendations notification */}
        <div className="glass-panel bg-[#080808]/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-white/10 gap-6 overflow-hidden relative shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 z-10 relative md:max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono rounded-full uppercase tracking-widest leading-none">
              <Sparkles className="w-3.5 h-3.5" />
              Personal Wardrobe Feed
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white leading-tight">
              Curated exclusively for your <span className="text-purple-400 font-bold">{profile.styleType}</span> lifestyle.
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed font-sans">
              These fits target neutral tones to pair nicely with your skin undertones, supporting the structured drape contours.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-4 w-full md:w-auto text-sm z-10">
            <div className="flex flex-col items-center text-center">
              <span className="text-neutral-500 uppercase font-mono text-[9px] tracking-wider leading-none">Compatibility level</span>
              <span className="text-3xl md:text-4xl font-bold text-purple-400 font-display mt-1 tracking-tight">96%</span>
              <span className="text-[10px] text-neutral-400 mt-1 font-mono">Style alignment</span>
            </div>
          </div>
        </div>

        {/* 3. Recommended Outfits Carousel */}
        <div>
          <h3 className="text-xl font-bold font-display tracking-tight mb-5 flex items-center gap-2">
            Recommended Outfits Catalog
            <span className="px-2 py-0.5 bg-neutral-800 text-[9px] font-mono text-neutral-400 rounded-full">Bespoke combinations</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {outfitsToUse.map((outfit) => (
              <div
                key={outfit.id}
                className="glass-panel border border-white/10 rounded-3xl overflow-hidden relative group w-full flex flex-col justify-between"
                id={`outfit-card-${outfit.id}`}
              >
                 {/* Visual cover display */}
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover filter brightness-85 group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-mono text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        {outfit.matchRating}% Compatibility
                      </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold font-display text-white">{outfit.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">{outfit.style}</p>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Outfit Includes</p>
                    <span className="text-xxs text-neutral-400 font-mono">3 Layers Linked</span>
                  </div>

                  {/* Actions Bar */}
                  <button
                    onClick={() => onNavigateToTab('tryon')}
                    type="button"
                    className="w-full py-3 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:to-rose-500 hover:text-white border border-white/15 rounded-xl font-display font-medium text-xs tracking-tight transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_4px_15px_rgba(168,85,247,0.2)]"
                  >
                     Try Combination
                    <Eye className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Filter Catalog Headers */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
                Curated Boutique Pieces
              </h3>
              <p className="text-xs text-neutral-400 mt-1">Select items for details on material drape and aesthetics.</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 shrink-0">
              {['all', 'outerwear', 'tops', 'bottoms', 'footwear'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xxs font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                    selectedCategory === cat 
                      ? 'bg-gradient-to-r from-purple-600 to-rose-500 border-transparent text-white font-semibold' 
                      : 'bg-white/3 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                  id={`cat-filter-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
              <p className="text-neutral-400 text-sm font-mono">No garment coordinates matched your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="product-grid-catalog">
              {filteredProducts.map((p) => {
                const isSaved = savedLookIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => onOpenProduct(p)}
                    className="glass-panel border border-white/10 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group glass-card-hover relative"
                  >
                    <div className="aspect-[4/5] bg-neutral-900 overflow-hidden relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover filter brightness-90 group-hover:scale-104 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />

                      {/* Wear compatibility overlay */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[9px] font-mono text-purple-400 flex items-center gap-1 z-10 leading-none">
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        {p.alignment.fitMatch}% Match
                      </div>

                      {/* Save look toggler */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveLookId(p.id);
                        }}
                        type="button"
                        className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 border border-white/10 rounded-md text-neutral-400 hover:text-white transition-all pointer-events-auto z-10 cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-mono text-neutral-500 tracking-wider uppercase">{p.brand}</span>
                          <span className="text-xs font-bold text-rose-400 font-display shrink-0">${p.price}</span>
                        </div>
                        <h4 className="text-sm font-semibold tracking-tight text-white line-clamp-1 mt-0.5 font-display group-hover:text-purple-400 transition-colors">{p.name}</h4>
                      </div>

                      {/* Why it matches micro text */}
                      <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2 italic font-sans animate-fade-in font-light">
                        &ldquo;{p.alignment.colorCompatibility}&rdquo;
                      </p>

                      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTryOn(p);
                          }}
                          type="button"
                          className="py-1.5 px-2 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:to-rose-500 hover:text-white border border-white/10 rounded-lg text-[10px] font-mono tracking-tight cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 hover:border-transparent hover:shadow-[0_4px_10px_rgba(168,85,247,0.15)]"
                        >
                          <Eye className="w-3.5 h-3.5" /> Try On
                        </button>

                        <button
                          onClick={(e) => handleAddToCartQuick(e, p)}
                          type="button"
                          className={`py-1.5 px-2 border rounded-lg text-[10px] font-mono tracking-tight cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 ${
                            addedProductId === p.id 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent' 
                              : 'bg-white hover:bg-neutral-200 text-black border-white'
                          }`}
                        >
                          {addedProductId === p.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" /> Buy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Bottom AI Suggestion Tip box */}
        <div className="glass-panel bg-[#080808]/50 rounded-2xl p-5 border border-white/10 flex items-start gap-4">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl shrink-0">
            <Lightbulb className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold font-display">Minimalist Color Harmony</h4>
            <p className="text-neutral-400 text-xs leading-relaxed font-sans mt-1">
              Your style profile indicates a strong affinity for understated bases. We have elevated graphite charcoal, dark blacks, and deep neutral layers to offer seamless combinations that highlight modern tailoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
