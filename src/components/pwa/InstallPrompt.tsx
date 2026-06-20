import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showChromeSuggestion, setShowChromeSuggestion] = useState(false);
  const [pwaIcon, setPwaIcon] = useState<string>('https://i.ibb.co/wFXWcZXP/file-00000000bc2872099134372cd3b088f3.jpg');

  const [showManualInstallGuide, setShowManualInstallGuide] = useState(false);

  useEffect(() => {
    // Check if the app is already installed or if it's running standalone
    const isStandalone = window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false;
    const isInstalled = localStorage.getItem('appInstalled') === 'true';
    if (isStandalone || (window.navigator as any).standalone || isInstalled) {
      console.log('App is running in standalone mode or already installed, skipping install prompt');
      return;
    }

    // Synchronous state fetch
    getDoc(doc(db, 'settings', 'general')).then((snap) => {
      if (snap.exists() && snap.data()?.pwaIconUrl) {
        const url = snap.data().pwaIconUrl.trim();
        if (url !== "") {
          setPwaIcon(url);
        }
      }
    }).catch(err => {
      console.warn("Failed to load settings in InstallPrompt:", err);
    });

    // Detect unsupported browsers
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isFb = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
    const isMessenger = ua.indexOf("Messenger") > -1;
    const isInstagram = ua.indexOf("Instagram") > -1;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isUnsupported = isFb || isMessenger || isInstagram || isSafari;

    if (isUnsupported && !sessionStorage.getItem('intentTriggered')) {
      sessionStorage.setItem('intentTriggered', 'true');
      
      // Automatically try to open in Chrome
      window.location.href = "intent://biddayan.com/#Intent;scheme=https;package=com.android.chrome;end";
      
      // If Chrome is not available, intent fails, so we show the suggestion modal after a short delay
      setTimeout(() => {
        setShowChromeSuggestion(true);
      }, 1500);
    }

    // Initial check of global window property
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
        // Hide button/card after successful installation
        localStorage.setItem('appInstalled', 'true');
        setShowPrompt(false);
    });
    
    // Show prompt immediately 
    setShowPrompt(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (window.self !== window.top) {
      // In iframe preview mode, open in new tab
      alert("অ্যাপটি ইনস্টল করার জন্য এটি একটি নতুন ট্যাবে খোলা হচ্ছে।");
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
      return;
    }

    const prompt = deferredPrompt || (window as any).deferredPrompt;

    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          localStorage.setItem('appInstalled', 'true');
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      } catch (err) {
        console.error('Error triggering PWA prompt:', err);
      }
    } else {
      setShowManualInstallGuide(true);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showChromeSuggestion && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
           <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full mx-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
               <button 
                  onClick={() => setShowChromeSuggestion(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
               >
                  ✕
               </button>
               <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
               </div>
               <h3 className="text-xl font-bold font-bengali text-slate-800 mb-2">Google Chrome আবশ্যক</h3>
               <p className="text-slate-500 text-sm font-bengali leading-relaxed mb-6">
                 সেরা অভিজ্ঞতার জন্য Google Chrome ব্যবহার করুন।
               </p>
               <Button onClick={() => setShowChromeSuggestion(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bengali h-11 rounded-xl">
                 বুঝতে পেরেছি
               </Button>
           </div>
        </div>
      )}

      {showManualInstallGuide && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
           <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full mx-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
               <button 
                  onClick={() => setShowManualInstallGuide(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
               >
                  <X size={16} />
               </button>
               <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="text-blue-500 w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold font-bengali text-slate-800 mb-2">ম্যানুয়াল ইনস্টল</h3>
               <p className="text-slate-500 text-[13px] font-bengali leading-relaxed mb-4 text-justify">
                 আপনার ব্রাউজারটি সরাসরি ইনস্টলেশন সমর্থন করছে না অথবা অ্যাপটি ইতোমধ্যে ইনস্টল হয়ে আছে। দয়া করে ব্রাউজারের উপরে ডানদিকে থাকা <b>থ্রি-ডট (⋮)</b> মেনু থেকে <b>"Install app"</b> বা <b>"Add to Home screen"</b> নির্বাচন করুন।
               </p>
               <Button onClick={() => setShowManualInstallGuide(false)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bengali h-11 rounded-xl">
                 ঠিক আছে
               </Button>
           </div>
        </div>
      )}

      {showPrompt && (
        <motion.div
          key="pwa-install-prompt"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[380px] z-[9999] bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-5 overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-muted-foreground transition-colors p-1"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col gap-4 pt-1">
            {/* Brand/Product Header row */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 shrink-0 relative bg-card flex items-center justify-center rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden p-2">
                  <img 
                  src={pwaIcon || "https://i.ibb.co/wFXWcZXP/file-00000000bc2872099134372cd3b088f3.jpg"} 
                  alt="বিদ্যায়ন Icon" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.ibb.co/wFXWcZXP/file-00000000bc2872099134372cd3b088f3.jpg';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bengali font-bold text-lg text-foreground leading-tight">বিদ্যায়ন Official App</h3>
                <span className="text-[10px] font-sans font-bold tracking-wider text-amber-500 uppercase">OFFICIAL MOBILE APP</span>
              </div>
            </div>
            
            {/* Description and layout content details */}
            <div className="flex-1">
              <p className="font-bengali text-sm text-slate-500 mb-4 leading-relaxed">
                ব্রাউজার থেকে এটি ইনস্টল করলে আপনার ফোনে সরাসরি আসল অ্যাপের মতোই আইকন এবং সুবিধা পাবেন।
              </p>

              <div className="flex gap-3">
                <Button 
                  onClick={handleInstallClick}
                  className="flex-1 text-white rounded-xl shadow-sm font-bengali font-bold h-10 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ইনস্টল অ্যাপ
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
