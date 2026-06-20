import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [pwaIcon, setPwaIcon] = useState<string>('https://i.ibb.co/wFXWcZXP/file-00000000bc2872099134372cd3b088f3.jpg');

  useEffect(() => {
    // Check if the app is already installed or if it's running standalone
    const isStandalone = window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false;
    if (isStandalone || (window.navigator as any).standalone) {
      console.log('App is running in standalone mode, skipping install prompt');
      return;
    }

    // Determine if iOS
    const iosCheck = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(iosCheck);

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

    // Detect Facebook / Messenger / Instagram in-app browsers
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isFb = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
    setIsInAppBrowser(isFb);

    // Initial check of global window property
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setShowPrompt(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      setShowPrompt(true);
    };

    const handleCustomPrompt = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('pwa-prompt-available' as any, handleCustomPrompt);
    
    // Show prompt immediately 
    setShowPrompt(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-prompt-available' as any, handleCustomPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt || (window as any).deferredPrompt;
    
    if (window.self !== window.top) {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      } catch (err) {
        console.error('Error triggering PWA prompt:', err);
      }
    } else {
        if (isIos) {
            alert('Safari ব্রাউজারের নিচে "Share" আইকনে ক্লিক করে "Add to Home Screen" নির্বাচন করুন।');
        } else {
            alert('আপনার ব্রাউজারটি সরাসরি ইনস্টলেশন সমর্থন করছে না। অনুগ্রহ করে ব্রাউজারের মেনু (⋮) অপশন থেকে "Install app" বা "Add to Home screen" নির্বাচন করুন।');
        }
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
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
                <h3 className="font-bengali font-bold text-lg text-foreground leading-tight">বিদ্যায়ন অ্যাপ ইনস্টল করুন</h3>
                <span className="text-[10px] font-sans font-bold tracking-wider text-amber-500 uppercase">OFFICIAL MOBILE APP</span>
              </div>
            </div>
            
            {/* Description and layout content details */}
            <div className="flex-1">
              <p className="font-bengali text-sm text-slate-500 mb-4 leading-relaxed">
                ব্রাউজার থেকে এটি ইনস্টল করলে আপনার ফোনে সরাসরি আসল অ্যাপের মতোই আইকন এবং সুবিধা পাবেন।
              </p>
              
              {window.self !== window.top ? (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl mb-4">
                  <p className="text-orange-800 text-xs font-bengali">
                    ⚠️ আপনি এখন প্রিভিউ মোডে আছেন। সরাসরি ইনস্টল করতে, উপরের শেয়ার বাটন থেকে অথবা লিংক কপি করে নতুন ট্যাবে/ব্রাউজারে ওপেন করুন।
                  </p>
                </div>
              ) : null}

              {isInAppBrowser ? (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                  <p className="text-red-800 text-[13px] font-bengali font-medium mb-1">
                    ⚠️ মেসেঞ্জার/ফেসবুক থেকে সরাসরি অ্যাপ ইনস্টল করা সম্ভব নয়!
                  </p>
                  <p className="text-red-700 text-xs font-bengali">
                    উপরে ডানদিকের মেনু <span className="font-bold whitespace-nowrap">( ⋮ )</span> থেকে <span className="font-bold">"Open in Chrome"</span> বা <span className="font-bold">"Open in system browser"</span> এ ক্লিক করুন। তারপর খুব সহজেই ইনস্টল করতে পারবেন।
                  </p>
                </div>
              ) : null}

              <div className="flex gap-3">
                <Button 
                  onClick={handleInstallClick}
                  className={`flex-1 text-white rounded-xl shadow-sm font-bengali font-medium h-10 ${window.self !== window.top ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary/95'}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {window.self !== window.top ? "নতুন ট্যাবে ওপেন করুন" : "ইনস্টল অ্যাপ"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
