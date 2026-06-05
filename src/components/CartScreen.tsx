/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { Sparkles, Trash2, ArrowRight, ShieldCheck, Check, Sparkle, ShoppingBag } from 'lucide-react';

interface CartScreenProps {
  cartItems: CartItem[];
  onUpdateQty: (pId: string, delta: number) => void;
  onRemoveItem: (pId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (orderId: string, itemsCount: number, total: number) => void;
}

export default function CartScreen({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess
}: CartScreenProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<'card' | 'crypto' | 'gold'>('card');
  const [shippingChoice, setShippingChoice] = useState<'standard' | 'express'>('standard');
  const [isOrderPending, setIsOrderPending] = useState(false);

  // Math equations
  const baseSubtotal = cartItems.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  
  // Custom Bundle Pricing Discount: 15% discount if they buy 3 or more items
  const isBundleQualified = cartItems.length >= 3;
  const bundleDiscount = isBundleQualified ? baseSubtotal * 0.15 : 0;
  
  const shippingCost = baseSubtotal === 0 ? 0 : (shippingChoice === 'express' ? 25 : 0);
  const finalTotal = baseSubtotal - bundleDiscount + shippingCost;

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setIsOrderPending(true);
    setTimeout(() => {
      setIsOrderPending(false);
      onCheckoutSuccess(
        `ORD-${Math.floor(Date.now() % 500000)}`,
        cartItems.reduce((ac, c) => ac + c.quantity, 0),
        finalTotal
      );
      onClearCart();
    }, 1800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 font-sans text-white z-10 relative" id="wardrobe-cart-module">
      <div className="text-center mb-8 shrink-0">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xxs font-mono rounded-full uppercase tracking-widest inline-block mb-3">
          Adaptive Phase 06: Wardrobe Acquisitions
        </span>
        <h2 className="text-3xl font-bold font-display tracking-tight text-white">Your Wardrobe Bag</h2>
        <p className="text-neutral-400 text-xs max-w-md mx-auto mt-2 leading-relaxed">
          Manage curated items, verify size/color combinations, and proceed with secure sandbox checkouts.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 glass-panel max-w-xl mx-auto rounded-3xl border border-white/10 space-y-4">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-neutral-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display">Your bag is empty</h3>
            <p className="text-neutral-400 text-xs max-w-xs mx-auto leading-relaxed mt-1">Navigate to our Personalized Feed or Stylist AI conversations to lock in fits.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main items panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider font-display border-b border-white/5 pb-2 mb-2 text-amber-400">
                Laced Pieces ({cartItems.length})
              </h3>

              <div className="space-y-4 divide-y divide-white/5">
                {cartItems.map((item, idx) => (
                  <div key={`${item.product.id}-${idx}`} className="pt-4 first:pt-0 flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left space-y-1">
                        <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest leading-none block">{item.product.brand}</span>
                        <h4 className="text-sm font-semibold text-white leading-tight font-display">{item.product.name}</h4>
                        
                        <div className="flex items-center gap-2.5 text-[10px] font-mono text-neutral-400">
                          <span>Fits: {item.selectedSize}</span>
                          <span>|</span>
                          <span>Tone: {item.selectedColor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      {/* Quantity sliders */}
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
                        <button
                          onClick={() => onUpdateQty(item.product.id, -1)}
                          type="button"
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-400 hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQty(item.product.id, 1)}
                          type="button"
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-400 hover:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Line pricing and removal */}
                      <div className="text-right space-y-1">
                        <p className="text-sm font-mono text-white">${item.product.price * item.quantity}</p>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          type="button"
                          className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors uppercase cursor-pointer"
                        >
                          Erase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout drawer billing summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider font-display border-b border-white/5 pb-2 mb-2 text-amber-400">
                Checkout Invoices
              </h3>

              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Bag Items Subtotal</span>
                  <span className="font-mono text-white">${baseSubtotal}</span>
                </div>

                {isBundleQualified ? (
                  <div className="flex justify-between items-center text-xs text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkle className="w-3.5 h-3.5 text-emerald-400" />
                      15% Outfit Bundle Pricing applied
                    </span>
                    <span className="font-mono">-${Math.round(bundleDiscount * 100) / 100}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-neutral-400 text-xxs flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>Lace 3 or more garments to activate our **15% Outfit Bundle Pricing** AI discount. Add remaining garments now.</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400">Express Delivery</span>
                    <input
                      type="checkbox"
                      checked={shippingChoice === 'express'}
                      onChange={(e) => setShippingChoice(e.target.checked ? 'express' : 'standard')}
                      className="accent-amber-400"
                    />
                  </div>
                  <span className="font-mono text-white">${shippingChoice === 'express' ? 25 : 0}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold border-t border-white/10 pt-4 text-white">
                  <span className="font-display">Total Bespoke Cost</span>
                  <span className="font-mono text-amber-400 text-lg">${finalTotal}</span>
                </div>
              </div>

              {!isCheckingOut ? (
                <button
                  onClick={() => setIsCheckingOut(true)}
                  type="button"
                  className="w-full py-4.5 bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 font-display transition-all duration-300 active:scale-98 cursor-pointer shadow-[0_4px_15px_rgba(251,191,36,0.15)]"
                  id="checkout-trigger-btn"
                >
                  Initiate Secure checkout
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              ) : (
                <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-white/5 space-y-4">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-amber-400">Delivery Information</h4>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Shipping Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 15 Brutal Row, Milan Fashion District"
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-sans text-white focus:outline-none focus:border-amber-400 transition-colors"
                      id="checkout-address-input"
                    />
                  </div>

                  {/* Payment selection dropdown */}
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-2">Payment Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['card', 'crypto', 'gold'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPaymentChoice(opt)}
                          className={`py-1.5 bg-neutral-900 border text-[10px] font-mono uppercase rounded-lg transition-all cursor-pointer ${
                            paymentChoice === opt ? 'border-amber-400 text-amber-400' : 'border-white/10 text-neutral-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentChoice === 'card' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Name on pass</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="T. Oyesanya"
                          className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Pass number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="•••• •••• •••• 9210"
                          className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      type="button"
                      className="w-full py-2.5 bg-neutral-900 text-xs font-mono uppercase text-neutral-400 border border-white/5 rounded-lg hover:bg-neutral-800 cursor-pointer"
                    >
                      Erase Information
                    </button>
                    <button
                      type="submit"
                      disabled={isOrderPending}
                      className="w-full py-2.5 bg-white text-xs font-mono uppercase text-black font-semibold rounded-lg hover:bg-neutral-200 cursor-pointer"
                      id="place-checkout-order-btn"
                    >
                      {isOrderPending ? 'Lacing order pass...' : 'Confirm purchase'}
                    </button>
                  </div>
                </form>
              )}

              <div className="flex gap-2 justify-center items-center text-[10px] text-neutral-500 font-mono pt-3 border-t border-white/5 select-none">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>Locked Sandbox checkout loop enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
