/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { Sparkles, Package, Plus, DollarSign, Upload, LayoutGrid, BarChart3, ArrowUpRight, TrendingUp } from 'lucide-react';

interface VendorDashboardProps {
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
}

export default function VendorDashboard({ products, onAddProduct }: VendorDashboardProps) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('NEXUS CLAN');
  const [newProductPrice, setNewProductPrice] = useState(140);
  const [newProductCategory, setNewProductCategory] = useState<'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'accessories'>('outerwear');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [customProductImage, setCustomProductImage] = useState<string>('https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomProductImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductDesc) return;

    setIsUploading(true);
    setTimeout(() => {
      onAddProduct({
        id: `prod-custom-${Date.now()}`,
        name: newProductName,
        brand: newProductBrand.toUpperCase(),
        category: newProductCategory,
        price: Number(newProductPrice),
        image: customProductImage,
        rating: 4.8,
        description: newProductDesc,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Core Black', 'Drape Sand'],
        tags: ['Designer Piece', 'Merchant Upload', 'Bespoke AI'],
        alignment: {
          fitMatch: 95,
          colorCompatibility: 'Sophisticated dark tone base that frames skin structures securely.',
          styleExplanation: 'Constructed using relaxed tailors with structural dropped waist contours.'
        },
        inventory: 12
      });

      setIsUploading(false);
      setUploadSuccess(true);
      setNewProductName('');
      setNewProductDesc('');
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 font-sans text-white z-10 relative" id="vendor-dashboard-module">
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xxs font-mono rounded-full uppercase tracking-widest inline-block mb-3">
          Design Studio: Seller Portal
        </span>
        <h2 className="text-3xl font-bold font-display tracking-tight text-white">Merchant Workstation</h2>
        <p className="text-neutral-400 text-xs max-w-sm mx-auto mt-2 leading-relaxed">
          Upload products, manage design files, and track sales metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: upload a product */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative">
            <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Publish New Apparel Design
            </h3>

            {uploadSuccess && (
              <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono">
                ✓ Product successfully added to the customer boutique catalog!
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-sm text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Apparel Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Sage Sherpa Fleece Jacket"
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Brand Label</label>
                  <input
                    type="text"
                    required
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    placeholder="e.g. ATELIER MONO"
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors cursor-pointer"
                  >
                    <option value="outerwear">Outerwear</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Product Image</label>
                <div
                  onClick={() => document.getElementById('new-item-visual-uploader')?.click()}
                  className="border border-dashed border-white/10 rounded-2xl h-40 bg-white/2 hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                >
                  <input
                    type="file"
                    id="new-item-visual-uploader"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {customProductImage ? (
                    <>
                      <img src={customProductImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[10px] font-mono text-white bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 text-neutral-500 space-y-2">
                      <Upload className="w-8 h-8 mx-auto" />
                      <p className="text-xs">Drag and drop flat lay design image</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Apparel Description</label>
                <textarea
                  rows={3}
                  required
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="e.g. Medium weight, windproof microfleece drapes featuring layered pocket assemblies and heavy duty brass metal zipper cords."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-amber-400 text-white transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 font-display cursor-pointer"
              >
                {isUploading ? 'Adding to catalog...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Analytics tracking */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 text-left space-y-6">
            <h3 className="text-lg font-bold font-display flex items-center gap-2 border-b border-white/5 pb-3">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Sales Analytics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block leading-none">Total Revenue</span>
                <span className="text-2xl font-bold font-display text-white mt-1 block">$14,580</span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <TrendingUp className="w-3 h-3" /> +18.4% this cycle
                </span>
              </div>

              <div className="p-4 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block leading-none">Virtual Try-Ons</span>
                <span className="text-2xl font-bold font-display text-white mt-1 block">482 times</span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <TrendingUp className="w-3 h-3" /> 84% conversion rate
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-3 leading-none">Active Boutique inventory metrics:</span>
              <div className="space-y-2">
                {products.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs">
                    <span className="font-sans text-neutral-300 truncate max-w-[170px]">{p.name}</span>
                    <span className="font-mono text-neutral-500">{p.inventory} units active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
