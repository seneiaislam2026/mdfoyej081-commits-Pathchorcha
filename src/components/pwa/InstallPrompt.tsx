import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [pwaIcon, setPwaIcon] = useState<string>(
    "https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg",
  );
  const [installGuide, setInstallGuide] = useState<"ios" | "android" | "iframe" | null>(null);

  useEffect(() => {
    // If inside an iframe (like AI Studio preview), do not show the custom prompt
    if (window.self !== window.top) {
      setShowPrompt(false);
      return;
    }

    // Listen for the custom event dispatched from index.html
    const handlePwaPrompt = (e: any) => {
      e.preventDefault();
      const isDismissed = localStorage.getItem("pwaPromptDismissed") === "true";
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("pwa-prompt-available", handlePwaPrompt);

    // Also check if app is already installed and direct installation is available
    const isStandalone = window.matchMedia
      ? window.matchMedia("(display-mode: standalone)").matches
      : false;
    const isInstalled = localStorage.getItem("appInstalled") === "true";
    const isDismissed = localStorage.getItem("pwaPromptDismissed") === "true";
    const hasDeferred = !!(window as any).deferredPrompt;

    if (!isStandalone && !isInstalled && !isDismissed && hasDeferred) {
      setShowPrompt(true);
    }

    // Synchronous state fetch
    getDoc(doc(db, "settings", "general"))
      .then((snap) => {
        if (snap.exists() && snap.data()?.pwaIconUrl) {
          const url = snap.data().pwaIconUrl.trim();
          if (url !== "") {
            setPwaIcon(url);
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to load settings in InstallPrompt:", err);
      });

    const handleAppInstalled = () => {
      localStorage.setItem("appInstalled", "true");
      setShowPrompt(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-prompt-available", handlePwaPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (window.self !== window.top) {
      setInstallGuide("iframe");
      return;
    }

    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          localStorage.setItem("appInstalled", "true");
        }
        (window as any).deferredPrompt = null;
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        setInstallGuide("ios");
      } else {
        setInstallGuide("android");
      }
    }
    setShowPrompt(false);
  };

  const handleClose = () => {
    localStorage.setItem("pwaPromptDismissed", "true");
    setShowPrompt(false);
  };

  const handleCloseGuide = () => {
    localStorage.setItem("pwaPromptDismissed", "true");
    setInstallGuide(null);
  };

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            key="pwa-install-prompt"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                <div className="w-14 h-14 shrink-0 relative bg-card flex items-center justify-center rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-2">
                  <img
                    src={
                      pwaIcon ||
                      "https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg"
                    }
                    alt="বিদ্যায়ন Icon"
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bengali font-bold text-lg text-foreground leading-tight">
                    বিদ্যায়ন Official App
                  </h3>
                  <span className="text-[10px] font-sans font-bold tracking-wider text-amber-500 uppercase">
                    OFFICIAL MOBILE APP
                  </span>
                </div>
              </div>

              {/* Description and layout content details */}
              <div className="flex-1">
                <p className="font-bengali text-sm text-slate-500 mb-4 leading-relaxed">
                  ব্রাউজার থেকে এটি ইনস্টল করলে আপনার ফোনে সরাসরি আসল অ্যাপের মতোই
                  আইকন এবং সুবিধা পাবেন।
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

      {installGuide && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col pointer-events-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={handleCloseGuide}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md p-1.5">
                  <img
                    src="https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg"
                    alt="বিদ্যায়ন"
                    className="w-full h-full object-contain rounded-xl mix-blend-multiply"
                  />
                </div>
                <div>
                  <h3 className="font-bengali font-bold text-lg leading-tight">বিদ্যায়ন</h3>
                  <span className="text-[10px] tracking-wider text-green-400 font-bold uppercase">INSTALL APP</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {installGuide === "iframe" && (
                <div className="space-y-4 font-bengali">
                  <p className="text-slate-600 leading-relaxed text-sm">
                    অরিজিনাল অ্যাপের মতো ব্যবহার করতে আপনার ফোন থেকে সরাসরি যেকোনো ব্রাউজার দিয়ে আমাদের ওয়েবসাইটটিতে প্রবেশ করুন।
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 font-semibold text-center select-all">
                    biddayan.com
                  </div>
                </div>
              )}

              {installGuide === "ios" && (
                <div className="space-y-4 font-bengali">
                  <h4 className="font-bold text-slate-800 text-[15px]">আইফোনে (Safari) ডাউনলোড করার নিয়ম:</h4>
                  <ol className="space-y-3.5 text-slate-600 text-[14px]">
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">১</span>
                      <span>সাফারি (Safari) ব্রাউজারের নিচে থাকা <span className="font-bold text-blue-600">"Share" (শেয়ার)</span> আইকনে ক্লিক করুন।</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">২</span>
                      <span>তালিকায় নিচের দিকে স্ক্রল করে <span className="font-bold text-blue-600">"Add to Home Screen"</span> অপশনটি সিলেক্ট করুন।</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">৩</span>
                      <span>এখন উপরে ডানদিকে থাকা <span className="font-bold text-blue-600">"Add"</span> বাটনে ট্যাপ করুন।</span>
                    </li>
                  </ol>
                </div>
              )}

              {installGuide === "android" && (
                <div className="space-y-4 font-bengali">
                  <h4 className="font-bold text-slate-800 text-[15px]">অ্যান্ড্রয়েডে ডাউনলোড করার নিয়ম:</h4>
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 leading-relaxed text-[13px]">
                      📢 আপনি যদি Facebook, Messenger, বা অন্য কোনো অ্যাপের ভেতর থেকে ব্রাউজ করে থাকেন, তবে অফলাইনে ব্যবহারের জন্য দয়া করে প্রথম পদক্ষেপটি অনুসরণ করুন।
                    </div>
                    <ol className="space-y-3.5 text-slate-600 text-[14px]">
                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">১</span>
                        <span>ফোনের আসল <span className="font-bold text-blue-600">Google Chrome</span> ব্রাউজার দিয়ে <span className="font-bold">biddayan.com</span> এ প্রবেশ করুন।</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">২</span>
                        <span>ব্রাউজারের উপরে ডানদিকের বা নিচে থাকা <span className="font-bold text-blue-600">থ্রি-ডট (⋮)</span> মেনু বাটনে ডাবল ক্লিক করুন।</span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">৩</span>
                        <span>মেনু তালিকা থেকে <span className="font-bold text-blue-600">"Install app"</span> অথবা <span className="font-bold text-blue-600">"Add to Home Screen"</span> অপশনে চাপ দিন।</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleCloseGuide}
                className="px-5 py-2 bg-slate-800 text-white font-bengali font-bold text-sm rounded-xl hover:bg-slate-700 transition-colors"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
