import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProApprovedCongrats() {
  const { userData } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!userData) {
      setShow(false);
      return;
    }

    if (userData.isPro) {
      const storageKey = `has_seen_pro_congrats_${userData.uid}`;
      const hasSeen = localStorage.getItem(storageKey);
      
      if (hasSeen !== 'true') {
        setShow(true);
        localStorage.setItem(storageKey, 'true');
        
        // Fire initial confetti blast!
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100000 };

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          // since particles fall down, animate a bit higher than random
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
      }
    } else {
      setShow(false);
    }
  }, [userData?.isPro, userData?.uid]);

  const handleClose = () => {
    if (userData?.uid) {
      localStorage.setItem(`has_seen_pro_congrats_${userData.uid}`, 'true');
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { type: "spring", damping: 15, stiffness: 200 }
            }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="relative bg-white max-w-md w-full rounded-[36px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(30,41,59,0.9)] border border-amber-200 p-6 sm:p-8 text-center font-bengali z-10"
          >
            {/* Visual background accents */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
            <div className="absolute top-10 left-10 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-orange-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Glowing Icon Crown Badge */}
            <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[30px] flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6 group transform rotate-6 hover:rotate-12 transition-transform duration-300">
              <Crown className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute -top-1.5 -right-1.5 bg-yellow-300 text-slate-900 text-[10px] uppercase font-bold py-1 px-1.5 rounded-full border border-white flex items-center justify-center shadow-xs">
                <Star className="w-3.5 h-3.5 fill-slate-900" />
              </div>
            </div>

            {/* Greetings & Success text */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              অভিনন্দন!
              <Sparkles className="w-6 h-6 text-amber-500" />
            </h2>
            <h3 className="text-lg font-bold text-amber-600 mb-4 select-none">
              আপনার প্রো অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে!
            </h3>

            <p className="text-slate-600 leading-relaxed text-sm mb-6 max-w-sm mx-auto">
              স্বাগতম শিক্ষাঙ্গন প্রিমিয়ামে! এখন আপনি পাবেন লিমিটহীন মডেল টেস্ট, নির্ভুল ব্যাখ্যামূলক প্রশ্নোত্তর, প্রিমিয়াম নোটস এবং ইন্টারেক্টিভ এআই টিউটরের সব আনলকড সুবিধা।
            </p>

            {/* Features Highlight Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8 text-left text-xs bg-amber-50/50 p-4 rounded-3xl border border-amber-100/60">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>আনলিমিটেড মডেল টেস্ট</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>প্রো ব্যাখ্যা অ্যাক্সেস</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>স্মার্ট নোটস লাইব্রেরি</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>সীমাহীন AI টিউটর</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleClose}
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg rounded-2xl shadow-md hover:shadow-lg hover:shadow-amber-500/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-hidden"
            >
              অসাধারণ! পথচলা শুরু হোক
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
