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
      alert("অরিজিনাল অ্যাপের মতো ব্যবহার করতে অনুগ্রহ করে নতুন ট্যাবে (অথবা ক্রোম ব্রাউজারে সরাসরি) biddayan.com সাইটে প্রবেশ করে ইনস্টল বাটনে চাপুন।");
      setShowPrompt(false);
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
        alert("আইফোনে সরাসরি ডাউনলোড করতে সাফারি ব্রাউজারের নিচে শেয়ার (Share) আইকন থেকে 'Add to Home Screen' এ চাপুন।");
      } else {
        alert("আপনার ক্রোম ব্রাউজারের উপরে ডানদিকের থ্রি-ডট (⋮) মেনু থেকে 'Install app' বা 'Add to Home Screen' অপশনে চাপুন।");
      }
    }
    setShowPrompt(false);
  };

  const handleClose = () => {
    localStorage.setItem("pwaPromptDismissed", "true");
    setShowPrompt(false);
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
              aria-label="বন্ধ করুন"
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

    </>
  );
};
