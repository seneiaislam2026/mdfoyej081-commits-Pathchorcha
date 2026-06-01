/// <reference types="vite-plugin-pwa/client" />
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
           initial={{ opacity: 0, y: 50, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: 50, scale: 0.95 }}
           className="fixed bottom-4 right-4 z-50 p-4 border border-slate-200 bg-white shadow-xl rounded-2xl flex flex-col gap-3 max-w-sm w-full"
        >
          <div className="flex items-start justify-between gap-4">
             <div className="pr-4">
                <h3 className="font-bengali font-bold text-slate-800 text-sm">
                   {offlineReady ? 'অফলাইন মোড প্রস্তুত' : 'নতুন আপডেট এসেছে!'}
                </h3>
                <p className="font-bengali text-slate-500 text-xs mt-1">
                   {offlineReady 
                     ? 'অ্যাপটি এখন অফলাইনে ব্যবহারের জন্য প্রস্তুত।'
                     : 'অ্যাপের একটি নতুন ভার্সন এসেছে। নতুন ফিচার পেতে আপডেট করুন।'}
                </p>
             </div>
             <button onClick={close} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
             </button>
          </div>
          
          {needRefresh && (
            <Button 
              size="sm" 
              onClick={() => updateServiceWorker(true)} 
              className="w-full font-bengali bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm gap-2"
            >
              <RefreshCw className="w-4 h-4" /> আপডেট করুন
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
