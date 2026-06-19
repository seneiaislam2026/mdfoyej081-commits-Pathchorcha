import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Check if the app is already installed or if it's running standalone
    const isStandalone = window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false;
    if (isStandalone) {
      console.log('App is running in standalone mode, skipping install prompt');
      return;
    }

    // Detect Facebook / Messenger / Instagram in-app browsers
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isFb = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
    setIsInAppBrowser(isFb);

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // We can also show the prompt immediately when the event fires
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (window.self !== window.top) {
      // Inside an iframe, can't install, open in new tab instead
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (err) {
      console.error('Error triggering PWA prompt:', err);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[380px] z-[9999] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-5 overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col gap-4 pt-1">
            {/* Brand/Product Header row */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 shrink-0 relative bg-white flex items-center justify-center rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden p-2">
                <img src="/logo.png" alt="শিক্ষাঙ্গন Icon" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h3 className="font-bengali font-bold text-lg text-slate-800 leading-tight">শিক্ষাঙ্গন অ্যাপ ইনস্টল করুন</h3>
                <span className="text-[10px] font-sans font-bold tracking-wider text-amber-500 uppercase">OFFICIAL MOBILE APP</span>
              </div>
            </div>
            
            {/* Description and layout content details */}
            <div className="flex-1">
              <p className="font-bengali text-sm text-slate-500 mb-4 leading-relaxed">
                এটি একটি প্রোগ্রেসিভ ওয়েব অ্যাপ (PWA)। ব্রাউজার থেকে এটি ইনস্টল করলে আপনার ফোনে সরাসরি আসল অ্যাপের মতোই আইকন এবং সুবিধা পাবেন।
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
                    ⚠️ মেসেঞ্জার থেকে সরাসরি অ্যাপ ইনস্টল করা যাবে কাম্য নয়!
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
