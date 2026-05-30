import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the app is already installed or if it's running standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return;
    }

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install prompt
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds of entering
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
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
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[380px] z-[100] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-5 overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={18} />
          </button>
          
          <div className="flex gap-4 items-start pt-1">
            <div className="w-16 h-16 shrink-0 relative bg-white flex items-center justify-center rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-1">
               <img src="/icon.svg" alt="পাঠচর্চা Icon" className="w-[85%] h-[85%] object-contain" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bengali font-bold text-lg text-slate-800 leading-tight">পাঠচর্চা অ্যাপ ইনস্টল করুন</h3>
              <p className="font-bengali text-sm text-slate-500 mt-1 mb-4 leading-relaxed">
                দ্রুত এবং স্মুথ অভিজ্ঞতার জন্য আমাদের অ্যাপটি আপনার ফোনে ইনস্টল করে নিন।
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleInstallClick}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm font-bengali font-medium h-10"
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
