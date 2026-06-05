/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { Sparkles, ArrowLeft, Heart, ShoppingBag, Eye, ShieldAlert, Star, ShieldCheck } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onTryOn: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  savedLookIds: string[];
  onToggleSaveLookId: (id: string) => void;
}

export default function ProductDetails({
  product,
  onBack,
  onTryOn,
  onAddToCart,
  savedLookIds,
  onToggleSaveLookId
}: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isAdded, setIsAdded] = useState(false);

  const isSaved = savedLookIds.includes(product.id);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 font-sans text-white z-10 relative" id="product-detail-module">
      <button
        onClick={onBack}
        type="button"
        className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center mb-6 font-mono gap-1 cursor-pointer"
        id="back-to-feed-btn"
      >
        ← Back to curation feed
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left column: Large high fashion garment photo */}
        <div className="md:col-span-6 space-y-4">
          <div className="glass-panel border border-white/10 rounded-3xl overflow-hidden relative aspect-[4/5] bg-neutral-900 group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover filter brightness-95 group-hover:scale-101 transition-transform"
              referrerPolicy="no-referrer"
            />
            {/* Ambient vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />



            <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-mono text-purple-400">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              {product.alignment.fitMatch}% Aesthetic Compatibility
            </div>
          </div>
        </div>

        {/* Right column: Details, sizes, colors and AI layers */}
        <div className="md:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{product.brand}</span>
                <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight mt-1 text-white">{product.name}</h1>
                
                {/* Visual reviews system */}
                <div className="flex items-center gap-1 mt-2.5">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400/30" />
                  </div>
                  <span className="text-xs text-neutral-400 font-mono ml-1">({product.rating} / 5.0)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400 font-display">${product.price}</span>
                <span className="block text-[8px] font-mono text-neutral-500 tracking-wider">Duties Included</span>
              </div>
            </div>

            <p className="text-neutral-300 text-sm leading-relaxed mt-5 font-sans font-light">
              {product.description}
            </p>

            {/* AI Fit Matching Analysis Section */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">Design & Styling Evaluation</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                  <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Color Compatibility</p>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">{product.alignment.colorCompatibility}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                  <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Silhouette Fitting</p>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">{product.alignment.styleExplanation}</p>
                </div>
              </div>
            </div>

            {/* Custom Sizing Selector */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Select Size</span>
                <span className="text-xxs text-neutral-500 font-mono">True to standard measurements</span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    type="button"
                    className={`w-11 h-11 rounded-lg text-xs font-mono font-semibold tracking-tighter border transition-all cursor-pointer flex items-center justify-center ${
                      selectedSize === size
                        ? 'bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-400/10'
                        : 'bg-white/3 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Selector */}
            <div className="mt-6 space-y-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Select Color</span>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    type="button"
                    className={`px-3.5 py-2 rounded-lg text-xxs font-mono border transition-all cursor-pointer flex items-center gap-2 ${
                      selectedColor === color
                        ? 'bg-white/8 border-white text-white'
                        : 'bg-white/3 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {/* Visual dot */}
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Cams Buttons */}
            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => onTryOn(product)}
                  type="button"
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 font-display transition-all duration-300 active:scale-98 cursor-pointer"
                  id="trigger-try-on-product"
                >
                  <Eye className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                  <id className="hidden" />
                  Virtual Try-on
                </button>

                <button
                  onClick={handleAddToCart}
                  type="button"
                  className={`w-full py-4 text-black font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 font-display transition-all duration-300 active:scale-98 cursor-pointer ${
                    isAdded ? 'bg-emerald-500 text-white' : 'bg-amber-400 hover:bg-amber-500'
                  }`}
                  id="add-to-cart-product"
                >
                  <ShoppingBag className="w-4.5 h-4.5 shrink-0" />
                  {isAdded ? 'Added to Bag' : 'Add to Bag'}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => onToggleSaveLookId(product.id)}
                  type="button"
                  className="text-xxs font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
                </button>
                
                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Only {product.inventory} units in inventory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
