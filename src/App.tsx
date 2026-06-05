/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, StyleProfile, CartItem, SavedLook, UserProfile } from './types.ts';
import { PRODUCTS } from './data/products.ts';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase.ts';

// Component Imports
import WelcomeScreen from './components/WelcomeScreen.tsx';
import SelfieUpload from './components/SelfieUpload.tsx';
import AIAnalysis from './components/AIAnalysis.tsx';
import StyleProfileScreen from './components/StyleProfileScreen.tsx';
import PersonalizedFeed from './components/PersonalizedFeed.tsx';
import ProductDetails from './components/ProductDetails.tsx';
import VirtualTryOn from './components/VirtualTryOn.tsx';
import AIStylistChat from './components/AIStylistChat.tsx';
import CartScreen from './components/CartScreen.tsx';
import UserProfileScreen from './components/UserProfileScreen.tsx';
import VendorDashboard from './components/VendorDashboard.tsx';

// Icons for navigation docks
import { Home, MessageSquare, Eye, ShoppingBag, User, Settings, Sparkles, Check, Play, ChevronUp, ChevronDown } from 'lucide-react';

type Tab = 'home' | 'chat' | 'tryon' | 'cart' | 'profile' | 'vendor';

export default function App() {
  // Global Session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Custom states
  const [welcomeKey, setWelcomeKey] = useState(0);
  const [welcomeState, setWelcomeState] = useState<'splash' | 'welcome' | 'login' | 'signup'>('splash');
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showProfileResult, setShowProfileResult] = useState(false);
  const [scannedSelfieUrl, setScannedSelfieUrl] = useState('');
  const [scannedPrefs, setScannedPrefs] = useState('');

  // Catalog products
  const [activeProductsList, setActiveProductsList] = useState<Product[]>(PRODUCTS);
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);
  const [equippedTryOnProduct, setEquippedTryOnProduct] = useState<Product | null>(null);

  // Cart & Orders
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<UserProfile['orderHistory']>([
    {
      id: 'ORD-77402',
      date: '2026-05-24',
      items: [
        { productName: 'Raw Heavyweight Crewneck Tee', price: 65, quantity: 1 },
        { productName: 'Stealth Drop-Crotch Joggers', price: 120, quantity: 1 }
      ],
      total: 185,
      status: 'Acquisition Dispatched'
    }
  ]);

  // Saved combinations lists
  const [savedLookIds, setSavedLookIds] = useState<string[]>(['prod-1', 'prod-4']);
  const [savedLooksList, setSavedLooksList] = useState<SavedLook[]>([
    {
      id: 'look-9201',
      name: 'Milan Core Essential',
      date: '2026-05-30',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      resultImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
      products: [PRODUCTS[1], PRODUCTS[3]]
    }
  ]);

  // Current tab routing
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [demoGuideOpen, setDemoGuideOpen] = useState(true);

  // Personalized dynamic feeds states
  const [personalizedOutfits, setPersonalizedOutfits] = useState<any[]>([]);
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  // Synchronize personalized boutique feed whenever styleProfile changes
  useEffect(() => {
    if (!styleProfile) {
      setPersonalizedOutfits([]);
      return;
    }

    setIsPersonalizing(true);
    fetch('/api/products/personalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ styleProfile })
    })
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          setActiveProductsList(data.products);
        }
        if (data.outfits && Array.isArray(data.outfits)) {
          setPersonalizedOutfits(data.outfits);
        }
      })
      .catch(err => console.error('Personalization failed:', err))
      .finally(() => setIsPersonalizing(false));
  }, [styleProfile]);

  // checkout success parameters
  const [showCheckoutSuccessModal, setShowCheckoutSuccessModal] = useState(false);
  const [latestOrderSummary, setLatestOrderSummary] = useState<{ id: string; price: number; qty: number } | null>(null);

  // Load initial backend database state on startup and handle Firebase Auth observer
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActiveProductsList(data);
        }
      })
      .catch(err => console.error('Failed to load active catalog:', err));

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrderHistory(data);
        }
      })
      .catch(err => console.error('Failed to load order history:', err));

    fetch('/api/looks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedLooksList(data);
        }
      })
      .catch(err => console.error('Failed to load saved looks:', err));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || '');
        let userNameToUse = user.displayName || 'Tosin Oyesanya';
        
        // Load persistency details like personal styleProfile or orderHistory
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const profileData = userSnap.data();
            if (profileData.name) {
              userNameToUse = profileData.name;
            }
            if (profileData.styleProfile) {
              setStyleProfile(profileData.styleProfile);
              setShowProfileResult(true);
            }
            if (profileData.orderHistory && profileData.orderHistory.length > 0) {
              setOrderHistory(profileData.orderHistory);
            }
          }
        } catch (dbErr: any) {
          console.error("Firestore loading error:", dbErr);
        }

        setUserName(userNameToUse);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserName('');
        setUserEmail('');
        setStyleProfile(null);
        setShowProfileResult(false);
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Handlers ---
  const handleAuthComplete = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleSelfiePrepared = (selfieUrl: string, preferences: string) => {
    setScannedSelfieUrl(selfieUrl);
    setScannedPrefs(preferences);
    setIsScanning(true);
  };

  const handleAnalysisComplete = async () => {
    setIsScanning(false);
    
    // Query our backend style/analyze endpoint to retrieve high-fidelity personalized styles
    try {
      const response = await fetch('/api/style/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfieUrl: scannedSelfieUrl, preferences: scannedPrefs })
      });
      const data = await response.json();
      if (data.success) {
        setStyleProfile(data.profile);

        // Save style profile securely to user Firestore document for continuous persistence
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          try {
            await setDoc(userRef, {
              styleProfile: data.profile
            }, { merge: true });
          } catch (dbErr: any) {
            handleFirestoreError(dbErr, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
          }
        }
      }
    } catch (err) {
      console.error('Styles compilation failed, using local fallback:', err);
    } finally {
      setShowProfileResult(true);
    }
  };

  const handleAddToCart = (product: Product, size: string, color: string) => {
    setCartItems((prev) => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          (item.product.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  };

  const handleUpdateQty = (pId: string, delta: number) => {
    setCartItems((prev) => 
      prev.map(item => 
        item.product.id === pId 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (pId: string) => {
    setCartItems((prev) => prev.filter(item => item.product.id !== pId));
  };

  const handleToggleSaveLookId = (id: string) => {
    setSavedLookIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveComboLook = async (comboName: string, selectedProducts: Product[], resultImg: string, uploadedGarmentFile?: string) => {
    const newLook = {
      id: `look-combination-${Date.now()}`,
      name: comboName,
      date: new Date().toISOString().split('T')[0],
      avatarUrl: scannedSelfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      resultImageUrl: resultImg,
      products: selectedProducts,
      uploadedGarmentUrl: uploadedGarmentFile
    };

    try {
      const response = await fetch('/api/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLook)
      });
      const data = await response.json();
      if (data.success) {
        setSavedLooksList(prev => [data.look, ...prev]);
      } else {
        setSavedLooksList(prev => [newLook, ...prev]);
      }
    } catch (err) {
      console.error('Failed to sync looks configuration with server, running fallback update:', err);
      setSavedLooksList(prev => [newLook, ...prev]);
    }
  };

  const handleCheckoutSuccess = async (orderId: string, itemsCount: number, total: number) => {
    setLatestOrderSummary({ id: orderId, price: total, qty: itemsCount });
    const newOrder = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: cartItems.map(it => ({ productName: it.product.name, price: it.product.price, quantity: it.quantity })),
      total,
      status: 'Arrival Scheduled'
    };

    let updatedOrders = [newOrder];

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const data = await response.json();
      if (data.success) {
        setOrderHistory(prev => {
          updatedOrders = [data.order, ...prev];
          return updatedOrders;
        });
      } else {
        setOrderHistory(prev => {
          updatedOrders = [newOrder, ...prev];
          return updatedOrders;
        });
      }
    } catch (err) {
      console.error('Failed to register checkout with server, running fallback update:', err);
      setOrderHistory(prev => {
        updatedOrders = [newOrder, ...prev];
        return updatedOrders;
      });
    }

    // Persist to Firestore privately
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await setDoc(userRef, {
          orderHistory: updatedOrders
        }, { merge: true });
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }

    setShowCheckoutSuccessModal(true);
  };

  const handleAddProductVendor = async (newProd: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      const data = await response.json();
      if (data.success) {
        setActiveProductsList(prev => [data.product, ...prev]);
      } else {
        setActiveProductsList(prev => [newProd, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save design with server database, running fallback update:', err);
      setActiveProductsList(prev => [newProd, ...prev]);
    }
    setActiveTab('home');
  };

  // Fast Hackathon Presentation Jumps State Manipulators
  const handleFastDemoJump = (phase: string) => {
    const defaultProfile = {
      styleType: 'Minimalist Streetwear',
      preferredColors: ['#0A0A0A', '#1C1C1E', '#3A3A3C', '#E5E5EA'],
      fitRecommendations: 'An oversized, drop-shoulder look layered with boxy structured shapes works nicely with your measurements.',
      aestheticTags: ['Avant-Garde', 'Monochrome', 'Quiet Luxury'],
      selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
    };

    if (phase === 'splash') {
      setIsLoggedIn(false);
      setWelcomeState('splash');
      setWelcomeKey(prev => prev + 1);
      setStyleProfile(null);
      setIsScanning(false);
      setShowProfileResult(false);
      setOpenedProduct(null);
    } else if (phase === 'auth') {
      setIsLoggedIn(false);
      setWelcomeState('welcome');
      setWelcomeKey(prev => prev + 1);
      setStyleProfile(null);
      setIsScanning(false);
      setShowProfileResult(false);
      setOpenedProduct(null);
    } else if (phase === 'upload') {
      setIsLoggedIn(true);
      setStyleProfile(null);
      setIsScanning(false);
      setShowProfileResult(false);
      setOpenedProduct(null);
    } else if (phase === 'scanning') {
      setIsLoggedIn(true);
      setScannedSelfieUrl(defaultProfile.selfieUrl);
      setIsScanning(true);
      setShowProfileResult(false);
      setOpenedProduct(null);
    } else if (phase === 'profile') {
      setIsLoggedIn(true);
      setIsScanning(false);
      setStyleProfile(defaultProfile);
      setScannedSelfieUrl(defaultProfile.selfieUrl);
      setShowProfileResult(true);
      setOpenedProduct(null);
    } else if (phase === 'feed') {
      setIsLoggedIn(true);
      setIsScanning(false);
      setShowProfileResult(false);
      setStyleProfile(defaultProfile);
      setScannedSelfieUrl(defaultProfile.selfieUrl);
      setUserName('Tosin Oyesanya');
      setUserEmail('oyesanyaoluwatosin25@gmail.com');
      setOpenedProduct(null);
      setActiveTab('home');
    } else if (phase === 'product') {
      setIsLoggedIn(true);
      setIsScanning(false);
      setShowProfileResult(false);
      setStyleProfile(defaultProfile);
      setScannedSelfieUrl(defaultProfile.selfieUrl);
      setUserName('Tosin Oyesanya');
      setUserEmail('oyesanyaoluwatosin25@gmail.com');
      setOpenedProduct(activeProductsList[4] || PRODUCTS[4]);
      setActiveTab('home');
    } else if (phase === 'tryon') {
      setIsLoggedIn(true);
      setIsScanning(false);
      setShowProfileResult(false);
      setStyleProfile(defaultProfile);
      setScannedSelfieUrl(defaultProfile.selfieUrl);
      setUserName('Tosin Oyesanya');
      setUserEmail('oyesanyaoluwatosin25@gmail.com');
      setOpenedProduct(null);
      setActiveTab('tryon');
    } else if (phase === 'cart') {
      setIsLoggedIn(true);
      setIsScanning(false);
      setShowProfileResult(false);
      setStyleProfile(defaultProfile);
      setScannedSelfieUrl(defaultProfile.selfieUrl);
      setUserName('Tosin Oyesanya');
      setUserEmail('oyesanyaoluwatosin25@gmail.com');
      setOpenedProduct(null);
      setShowCheckoutSuccessModal(false);
      if (cartItems.length === 0) {
        setCartItems([
          { product: activeProductsList[0] || PRODUCTS[0], quantity: 1, selectedSize: 'M', selectedColor: 'Black' },
          { product: activeProductsList[3] || PRODUCTS[3], quantity: 1, selectedSize: 'L', selectedColor: 'Charcoal' }
        ]);
      }
      setActiveTab('cart');
    } else if (phase === 'checkout') {
      setIsLoggedIn(true);
      setIsScanning(false);
      setShowProfileResult(false);
      setStyleProfile(defaultProfile);
      setScannedSelfieUrl(defaultProfile.selfieUrl);
      setUserName('Tosin Oyesanya');
      setUserEmail('oyesanyaoluwatosin25@gmail.com');
      setOpenedProduct(null);
      const items = cartItems.length > 0 ? cartItems : [
        { product: activeProductsList[0] || PRODUCTS[0], quantity: 1, selectedSize: 'M', selectedColor: 'Black' },
        { product: activeProductsList[3] || PRODUCTS[3], quantity: 1, selectedSize: 'L', selectedColor: 'Charcoal' }
      ];
      if (cartItems.length === 0) {
        setCartItems(items);
      }
      const sum = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
      setLatestOrderSummary({
        id: `ORD-SUC-${Math.floor(10000 + Math.random() * 90000)}`,
        price: sum + 15, // subtotal plus delivery fee markup
        qty: items.reduce((s, it) => s + it.quantity, 0)
      });
      setActiveTab('cart');
      setShowCheckoutSuccessModal(true);
    }
  };

  // --- Sub-Routing View Builders ---
  const renderBespokeTabContent = () => {
    if (openedProduct) {
      return (
        <ProductDetails
          product={openedProduct}
          onBack={() => setOpenedProduct(null)}
          onTryOn={(p) => { setEquippedTryOnProduct(p); setOpenedProduct(null); setActiveTab('tryon'); }}
          onAddToCart={handleAddToCart}
          savedLookIds={savedLookIds}
          onToggleSaveLookId={handleToggleSaveLookId}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <PersonalizedFeed
            products={activeProductsList}
            profile={styleProfile!}
            userName={userName}
            onOpenProduct={setOpenedProduct}
            onTryOn={(p) => { setEquippedTryOnProduct(p); setActiveTab('tryon'); }}
            onAddToCart={handleAddToCart}
            onNavigateToTab={setActiveTab}
            savedLookIds={savedLookIds}
            onToggleSaveLookId={handleToggleSaveLookId}
            outfits={personalizedOutfits}
          />
        );
      case 'chat':
        return (
          <AIStylistChat
            products={activeProductsList}
            onTryOn={(p) => { setEquippedTryOnProduct(p); setActiveTab('tryon'); }}
            onAddToCart={handleAddToCart}
            onOpenProduct={setOpenedProduct}
          />
        );
      case 'tryon':
        return (
          <VirtualTryOn
            products={activeProductsList}
            profile={styleProfile!}
            equippedProduct={equippedTryOnProduct}
            onClearEquippedProduct={() => setEquippedTryOnProduct(null)}
            onAddToCart={handleAddToCart}
            onSaveLook={handleSaveComboLook}
          />
        );
      case 'cart':
        return (
          <CartScreen
            cartItems={cartItems}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={() => setCartItems([])}
            onCheckoutSuccess={handleCheckoutSuccess}
          />
        );
      case 'profile':
        return (
          <UserProfileScreen
            profile={{
              name: userName,
              email: userEmail,
              styleProfile: styleProfile || undefined,
              orderHistory
            }}
            savedLooks={savedLooksList}
            onOpenProduct={setOpenedProduct}
            onNavigateToTab={setActiveTab}
            onReanalyzeStyle={() => {
              setStyleProfile(null);
              setShowProfileResult(false);
            }}
            onSignOut={async () => {
              try {
                await signOut(auth);
              } catch (err) {
                console.error('Sign-out error:', err);
              }
              setIsLoggedIn(false);
              setStyleProfile(null);
              setShowProfileResult(false);
              setCartItems([]);
            }}
          />
        );
      case 'vendor':
        return (
          <VendorDashboard
            products={activeProductsList}
            onAddProduct={handleAddProductVendor}
          />
        );
      default:
        return <div className="text-center py-20 font-mono text-neutral-500">Routing Empty</div>;
    }
  };

  // List of flow steps mimicking Screen 0 header in Figma
  const FLOW_STEPS = [
    { id: 'splash', label: '1. Splash' },
    { id: 'auth', label: '2. Auth' },
    { id: 'upload', label: '3. Upload' },
    { id: 'scanning', label: '4. AI Analysis' },
    { id: 'profile', label: '5. Profile' },
    { id: 'feed', label: '6. Feed' },
    { id: 'product', label: '7. Product' },
    { id: 'tryon', label: '8. Try-On' },
    { id: 'cart', label: '9. Cart' },
    { id: 'checkout', label: '10. Checkout' }
  ];

  function renderTopFlowHeader(currentStepId: string) {
    return (
      <header className="w-full bg-[#050505]/95 backdrop-blur-md border-b border-white/10 py-3 px-6 sticky top-0 z-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 select-none shrink-0 shadow-lg">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-purple-950/40 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.15)] shrink-0">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold font-display tracking-tight text-white m-0">FitMuse <span className="text-purple-450 font-extrabold text-[15px] text-purple-400">AI</span></span>
            </div>
            <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest leading-none">AI FASHION STYLIST & TRY-ON</p>
          </div>
        </div>

        {/* Right: Steps Tracker */}
        <div className="flex flex-col md:items-end gap-1.5 max-w-full overflow-x-auto">
          <div className="flex items-center justify-between md:justify-end gap-6 w-full text-[8px] font-mono uppercase tracking-widest text-neutral-500 mb-0.5 leading-none">
            <span>UI SCREEN MAP & USER FLOW</span>
            <span className="text-purple-300 hidden md:inline font-sans normal-case text-[9px] font-medium">Click steps to jump instantly</span>
          </div>
          <div className="flex items-center gap-1.5 max-w-full overflow-x-auto pb-1 scrollbar-none select-none">
            {FLOW_STEPS.map((step, idx) => {
              const isActive = currentStepId === step.id;
              return (
                <div key={step.id} className="flex items-center gap-1.5 shrink-0">
                  {idx > 0 && <span className="text-neutral-700 text-[10px]">&rarr;</span>}
                  <button
                    onClick={() => handleFastDemoJump(step.id)}
                    type="button"
                    className={`px-2.5 py-1.5 rounded-full text-[9px] font-mono transition-all duration-200 border flex items-center gap-1 cursor-pointer select-none ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-700 via-purple-600 to-rose-500 border-purple-500 text-white font-semibold shadow-[0_0_10px_rgba(168,85,247,0.35)]' 
                        : 'bg-[#121214]/65 border-white/5 text-neutral-400 hover:text-white hover:border-white/10 hover:bg-white/2'
                    }`}
                  >
                    {isActive && <div className="w-1 h-1 rounded-full bg-white animate-ping shrink-0" />}
                    <span>{step.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </header>
    );
  }

  // 1. Loading Authentication State check
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center font-sans relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,25,35,0.45)_0%,rgba(0,0,0,1)_90%)] z-0 pointer-events-none" />
        <div className="relative p-6 flex flex-col items-center">
          <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-ping scale-150 opacity-25 pointer-events-none" />
          <div className="absolute -inset-4 rounded-full border border-purple-400/20 animate-spin opacity-40 [animation-duration:15s] pointer-events-none" />
          <Sparkles className="w-12 h-12 text-purple-400 shrink-0 animate-pulse" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-500 text-center">
          FitMuse <span className="text-purple-400">AI</span>
        </h1>
        <p className="mt-2 text-[9px] tracking-widest uppercase text-neutral-400 font-mono">
          Authenticating style profile...
        </p>
      </div>
    );
  }

  // 2. Unlogged auth shield
  if (!isLoggedIn) {
    const stepId = welcomeState === 'splash' ? 'splash' : 'auth';
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans relative">
        {renderTopFlowHeader(stepId)}
        <div className="flex-1 w-full relative flex flex-col justify-center">
          <WelcomeScreen key={welcomeKey} onSuccess={handleAuthComplete} initialState={welcomeState === 'splash' ? 'splash' : 'welcome'} />
        </div>
      </div>
    );
  }

  // 2. Onboarding step: Selfie upload & priorities lacing
  if (isLoggedIn && !styleProfile && !isScanning && !showProfileResult) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans relative">
        {renderTopFlowHeader('upload')}
        <div className="flex-1 w-full relative flex flex-col justify-center py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,25,35,0.45)_0%,rgba(0,0,0,1)_90%)] z-0 pointer-events-none" />
          <SelfieUpload 
            onAnalyze={handleSelfiePrepared}
            onBack={() => setIsLoggedIn(false)}
          />
        </div>
      </div>
    );
  }

  // 3. Holographic processing scanner
  if (isScanning) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans relative">
        {renderTopFlowHeader('scanning')}
        <div className="flex-1 w-full relative flex flex-col justify-center py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(241,191,36,0.05)_0%,rgba(0,0,0,1)_90%)] z-0 pointer-events-none" />
          <AIAnalysis
            selfieUrl={scannedSelfieUrl}
            preferences={scannedPrefs}
            onComplete={handleAnalysisComplete}
          />
        </div>
      </div>
    );
  }

  // 4. Style compilation success profile page
  if (showProfileResult && styleProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans relative">
        {renderTopFlowHeader('profile')}
        <div className="flex-1 w-full relative flex flex-col justify-center py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,rgba(0,0,0,1)_95%)] z-0 pointer-events-none" />
          <StyleProfileScreen
            profile={styleProfile}
            userName={userName}
            onContinue={() => setShowProfileResult(false)}
            onBack={() => {
              setStyleProfile(null);
              setShowProfileResult(false);
            }}
          />
        </div>
      </div>
    );
  }

  // 5. STANDARD BOUTIQUE INTERFACE: main navigation loops
  let regularStepId = 'feed';
  if (openedProduct) {
    regularStepId = 'product';
  } else if (activeTab === 'tryon') {
    regularStepId = 'tryon';
  } else if (activeTab === 'cart' && showCheckoutSuccessModal) {
    regularStepId = 'checkout';
  } else if (activeTab === 'cart') {
    regularStepId = 'cart';
  } else {
    regularStepId = 'feed';
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative">
      {renderTopFlowHeader(regularStepId)}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,25,35,0.4)_0%,rgba(0,0,0,1)_90%)] z-0 pointer-events-none" />
      
      {/* Scrollable Layout Context */}
      <main className="flex-1 w-full relative z-10 overflow-x-hidden pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={openedProduct ? `prod-${openedProduct.id}` : activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderBespokeTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Elegant Bottom Glass Navigation Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92%] glass-panel rounded-2xl border border-white/10 py-3.5 px-4 flex items-center justify-around shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <button
          onClick={() => { setOpenedProduct(null); setActiveTab('home'); }}
          type="button"
          className={`flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
            activeTab === 'home' ? 'text-purple-400 font-semibold scale-105 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-neutral-400 hover:text-white'
          }`}
          id="nav-tab-home-btn"
        >
          <Home className="w-5.5 h-5.5" />
          <span className="text-[9px] font-mono leading-none tracking-tight">Main Feed</span>
        </button>

        <button
          onClick={() => { setOpenedProduct(null); setActiveTab('chat'); }}
          type="button"
          className={`flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
            activeTab === 'chat' ? 'text-purple-400 font-semibold scale-105 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-neutral-400 hover:text-white'
          }`}
          id="nav-tab-chat-btn"
        >
          <MessageSquare className="w-5.5 h-5.5" />
          <span className="text-[9px] font-mono leading-none tracking-tight">AI Stylist</span>
        </button>

        <button
          onClick={() => { setOpenedProduct(null); setActiveTab('tryon'); }}
          type="button"
          className={`flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
            activeTab === 'tryon' ? 'text-purple-400 font-semibold scale-105 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-neutral-400 hover:text-white'
          }`}
          id="nav-tab-tryon-btn"
        >
          <Eye className="w-5.5 h-5.5" />
          <span className="text-[9px] font-mono leading-none tracking-tight">Try-On</span>
        </button>

        <button
          onClick={() => { setOpenedProduct(null); setActiveTab('cart'); }}
          type="button"
          className={`flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer relative ${
            activeTab === 'cart' ? 'text-purple-400 font-semibold scale-105 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-neutral-400 hover:text-white'
          }`}
          id="nav-tab-cart-btn"
        >
          <ShoppingBag className="w-5.5 h-5.5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-gradient-to-r from-purple-500 to-rose-500 border border-white/20 text-white font-semibold font-mono text-[9px] rounded-full flex items-center justify-center leading-none">
              {cartItems.length}
            </span>
          )}
          <span className="text-[9px] font-mono leading-none tracking-tight">Bag</span>
        </button>

        <button
          onClick={() => { setOpenedProduct(null); setActiveTab('profile'); }}
          type="button"
          className={`flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
            activeTab === 'profile' ? 'text-purple-400 font-semibold scale-105 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-neutral-400 hover:text-white'
          }`}
          id="nav-tab-profile-btn"
        >
          <User className="w-5.5 h-5.5" />
          <span className="text-[9px] font-mono leading-none tracking-tight">Looks Vault</span>
        </button>

        <button
          onClick={() => { setOpenedProduct(null); setActiveTab('vendor'); }}
          type="button"
          className={`flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
            activeTab === 'vendor' ? 'text-purple-400 font-semibold scale-105 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-neutral-400 hover:text-white'
          }`}
          id="nav-tab-vendor-btn"
        >
          <Settings className="w-5.5 h-5.5 text-neutral-400" />
          <span className="text-[9px] font-mono leading-none tracking-tight">Vendors</span>
        </button>
      </nav>

      {/* Master Success checkout confirmation overlay dialog */}
      <AnimatePresence>
        {showCheckoutSuccessModal && latestOrderSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
            id="checkout-success-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="glass-panel border-2 border-emerald-500/20 max-w-md w-full rounded-3xl p-8 text-center relative overflow-hidden"
            >
              {/* Confetti sparkle accents */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-2">Wardrobe Laced Successfully!</h2>
              <p className="text-neutral-400 text-xs font-mono mb-6 uppercase tracking-wider">{latestOrderSummary.id}</p>

              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2 text-sm text-left mb-6 font-mono text-neutral-300">
                <div className="flex justify-between items-center">
                  <span>CURATED APPAREL</span>
                  <span className="text-white">{latestOrderSummary.qty} units wrapped</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>INVOICE SUM PAID</span>
                  <span className="text-amber-400 font-bold">${latestOrderSummary.price}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-1.5">
                  <span>DISPATCH DELIV</span>
                  <span className="text-emerald-400">Scheduled: 2026-06-03</span>
                </div>
              </div>

              <button
                onClick={() => { setShowCheckoutSuccessModal(false); setActiveTab('profile'); }}
                type="button"
                className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Close Summary & View Vault
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
