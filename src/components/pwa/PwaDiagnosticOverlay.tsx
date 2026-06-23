import React, { useState, useEffect, useRef } from "react";
import { X, Shield, Activity, RefreshCw, Smartphone, CheckCircle, AlertTriangle, Play, HelpCircle, Terminal, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warn" | "error";
  message: string;
}

export const PwaDiagnosticOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "logs" | "troubleshoot" | "sysinfo">("status");
  
  // Realtime Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Diagnostic states
  const [isSecure, setIsSecure] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [displayMode, setDisplayMode] = useState<"standalone" | "browser">("browser");
  const [swSupport, setSwSupport] = useState(false);
  const [swStatus, setSwStatus] = useState<"checking" | "registered" | "none">("checking");
  const [swController, setSwController] = useState<"controlling" | "none">("checking" as any);
  const [regCount, setRegCount] = useState(0);
  const [deferredPromptState, setDeferredPromptState] = useState<"captured" | "not_captured">("not_captured");
  const [manifestStatus, setManifestStatus] = useState<"checking" | "valid" | "error" | "missing">("checking");
  const [manifestDetails, setManifestDetails] = useState<any>(null);
  const [manifestErrorMsg, setManifestErrorMsg] = useState("");
  const [uaDetails, setUaDetails] = useState("");
  
  const [tapCount, setTapCount] = useState(0);
  const lastTapRef = useRef<number>(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize and check URL / localStorage for visibility
  useEffect(() => {
    // 1. Visiblity check (query param ?pwa-debug=true or localStorage)
    const urlParams = new URLSearchParams(window.location.search);
    const hasQueryParam = urlParams.get("pwa-debug") === "true" || urlParams.get("debug") === "true";
    const hasLocalStore = localStorage.getItem("pwa_debug_mode") === "true";
    
    if (hasQueryParam) {
      localStorage.setItem("pwa_debug_mode", "true");
      setIsVisible(true);
      addLocalLog("success", "PWA Debug Mode enabled via URL parameter");
    } else if (hasLocalStore) {
      setIsVisible(true);
    }

    // Initialize global logs if they exist
    if ((window as any).pwaLogs) {
      setLogs([...(window as any).pwaLogs]);
    } else {
      (window as any).pwaLogs = [];
    }

    // Listen to real-time logs dispatched from index.html or elsewhere
    const handleLogUpdate = (e: any) => {
      setLogs(prev => [...prev, e.detail]);
    };
    window.addEventListener("pwa-log-updated", handleLogUpdate);

    // Click/tap count gesture to toggle debug overlay
    // 5 taps anywhere on element with class 'pwa-trigger' or double-clicks
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.closest(".pwa-trigger") || target.closest("#navbar-logo"))) {
        const now = Date.now();
        if (now - lastTapRef.current < 800) {
          const newCount = tapCount + 1;
          setTapCount(newCount);
          if (newCount >= 4) { // 5 taps total
            const nextMode = !isVisible;
            setIsVisible(nextMode);
            localStorage.setItem("pwa_debug_mode", nextMode ? "true" : "false");
            setTapCount(0);
            addLocalLog("success", `PWA Debug Mode ${nextMode ? "Enabled" : "Disabled"} via secret gesture!`);
            alert(`PWA Diagnostics ${nextMode ? "চ চালু হয়েছে" : "বন্ধ হয়েছে"}! স্ক্রিনের নিচে ডান কোণায় আইকনটি দেখুন।`);
          }
        } else {
          setTapCount(1);
        }
        lastTapRef.current = now;
      }
    };

    window.addEventListener("click", handleGlobalClick);

    // Initial system diagnostics run
    runDiagnostics();

    // Set up a quick interval to check beforeinstallprompt status
    const interval = setInterval(() => {
      const isCaptured = !!(window as any).deferredPrompt;
      setDeferredPromptState(isCaptured ? "captured" : "not_captured");
    }, 1000);

    return () => {
      window.removeEventListener("pwa-log-updated", handleLogUpdate);
      window.removeEventListener("click", handleGlobalClick);
      clearInterval(interval);
    };
  }, [tapCount, isVisible]);

  // Scroll to bottom of logs when log tab is active and logs update
  useEffect(() => {
    if (activeTab === "logs") {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, activeTab]);

  const addLocalLog = (type: "info" | "success" | "warn" | "error", message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: LogEntry = { timestamp, type, message };
    if ((window as any).addPwaLog) {
      (window as any).addPwaLog(type, message);
    } else {
      if (!(window as any).pwaLogs) (window as any).pwaLogs = [];
      (window as any).pwaLogs.push(newLog);
      setLogs(prev => [...prev, newLog]);
      console.log(`[PWA-Diagnostic] [${type.toUpperCase()}] ${message}`);
    }
  };

  const runDiagnostics = async () => {
    addLocalLog("info", "Running full PWA diagnostics suite...");

    // 1. Check secure context
    const secure = window.isSecureContext;
    setIsSecure(secure);
    addLocalLog(secure ? "success" : "error", `Secure Context (HTTPS/localhost): ${secure ? "YES" : "NO"}`);

    // 2. Check Iframe
    const inIframe = window.self !== window.top;
    setIsIframe(inIframe);
    addLocalLog(inIframe ? "warn" : "success", `Running in Iframe: ${inIframe ? "YES (Install Prompt will be blocked by browser!)" : "NO"}`);

    // 3. Display Mode
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setDisplayMode(standalone ? "standalone" : "browser");
    addLocalLog("info", `Display Mode: ${standalone ? "Standalone (App Installed)" : "Browser (Regular web view)"}`);

    // 4. User Agent Info
    const ua = navigator.userAgent;
    setUaDetails(ua);
    addLocalLog("info", `User Agent detected: ${ua}`);

    // In-app browsers warning
    const isInApp = /FBAN|FBAV|Instagram|Twitter|Pinterest|WhatsApp|Telegram|Line\//i.test(ua);
    if (isInApp) {
      addLocalLog("error", "Detected In-App Browser (Facebook/Instagram/WhatsApp). PWAs CANNOT be installed inside WebViews. Users must open in Safari/Chrome!");
    }

    // 5. Service Worker Support & Status
    const hasSw = "serviceWorker" in navigator;
    setSwSupport(hasSw);
    addLocalLog(hasSw ? "success" : "error", `Service Worker Supported in Browser: ${hasSw ? "YES" : "NO"}`);

    if (hasSw) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        setRegCount(regs.length);
        setSwStatus(regs.length > 0 ? "registered" : "none");
        addLocalLog(regs.length > 0 ? "success" : "warn", `Registered Service Workers count: ${regs.length}`);
        
        regs.forEach((reg, idx) => {
          addLocalLog("info", `SW Registration [${idx}]: Scope: ${reg.scope}, Active: ${reg.active ? "Yes" : "No"}, Waiting: ${reg.waiting ? "Yes" : "No"}`);
        });

        const isControlling = !!navigator.serviceWorker.controller;
        setSwController(isControlling ? "controlling" : "none");
        addLocalLog(isControlling ? "success" : "warn", `Service Worker Controlling Page: ${isControlling ? "YES (Requests are being intercepted!)" : "NO (Page loaded before SW activated, refresh needed)"}`);
      } catch (err: any) {
        setSwStatus("none");
        addLocalLog("error", `Failed to get Service Worker registrations: ${err?.message || err}`);
      }
    }

    // 6. Test manifest.json
    try {
      setManifestStatus("checking");
      addLocalLog("info", "Attempting to fetch and validate manifest.json...");
      const res = await fetch("/manifest.json");
      if (res.ok) {
        const data = await res.json();
        setManifestDetails(data);
        setManifestStatus("valid");
        addLocalLog("success", `manifest.json fetched successfully! App Name: "${data.name || data.short_name}"`);
        
        // Check core parameters for prompt criteria
        if (!data.icons || data.icons.length === 0) {
          addLocalLog("error", "Manifest missing 'icons' array. This will fail PWA installability!");
        } else {
          addLocalLog("info", `Manifest contains ${data.icons.length} icons. Specifying resolutions like ${data.icons.map((i: any) => i.sizes).join(", ")}`);
        }

        if (!data.start_url) {
          addLocalLog("warn", "Manifest missing 'start_url'. Browsers default to current directory.");
        }

        if (data.display !== "standalone" && data.display !== "minimal-ui") {
          addLocalLog("warn", `Manifest display field set to '${data.display}'. Standalone is recommended for full app feel.`);
        }
      } else {
        setManifestStatus("missing");
        setManifestErrorMsg(`Status code: ${res.status}`);
        addLocalLog("error", `manifest.json could not be loaded. Server responded with status ${res.status}`);
      }
    } catch (err: any) {
      setManifestStatus("error");
      setManifestErrorMsg(err?.message || "JSON parsing error");
      addLocalLog("error", `manifest.json validation failed: ${err?.message || err}`);
    }

    // 7. Check current beforeinstallprompt state
    const isCaptured = !!(window as any).deferredPrompt;
    setDeferredPromptState(isCaptured ? "captured" : "not_captured");
    addLocalLog(isCaptured ? "success" : "info", `deferredPrompt Event: ${isCaptured ? "Captured (Install is fully ready!)" : "Not captured yet (Browser has not triggered beforeinstallprompt yet)"}`);
  };

  const handleManualPromptTrigger = () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      addLocalLog("info", "Triggering captured browser install prompt...");
      promptEvent.prompt();
      promptEvent.userChoice.then((choice: any) => {
        addLocalLog("success", `User choice captured: ${choice.outcome}`);
        if (choice.outcome === "accepted") {
          localStorage.setItem("appInstalled", "true");
        }
        (window as any).deferredPrompt = null;
        setDeferredPromptState("not_captured");
      }).catch((err: any) => {
        addLocalLog("error", `Failed during install prompt execution: ${err?.message || err}`);
      });
    } else {
      addLocalLog("error", "Cannot trigger install: deferredPrompt is null! Check the 'Status' tab for reasons.");
      alert("ইনস্টল প্রম্পট সচল নেই। ব্রাউজার এখনো অ্যাপটিকে ইনস্টল করার উপযোগী মনে করেনি বা অ্যাপটি ইতিমধ্যে ইনস্টল আছে।");
    }
  };

  const simulateBeforeInstallPrompt = () => {
    addLocalLog("info", "Simulating custom 'beforeinstallprompt' event to test dialog UI...");
    const mockEvent = {
      preventDefault: () => addLocalLog("info", "MockEvent: preventDefault() called"),
      prompt: () => {
        addLocalLog("success", "MockEvent: prompt() triggered!");
        alert("Simulated App Installation Successful! (UI Mock)");
        return Promise.resolve();
      },
      userChoice: Promise.resolve({ outcome: "accepted" })
    };

    (window as any).deferredPrompt = mockEvent;
    setDeferredPromptState("captured");
    
    // Dispatch custom event to notify UI components (like InstallPrompt)
    window.dispatchEvent(new CustomEvent("pwa-prompt-available", { detail: mockEvent }));
    addLocalLog("success", "Dispatched 'pwa-prompt-available' custom event. UI InstallPrompt should pop up now!");
  };

  const clearAllPwaCache = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি সকল ক্যাশ ও সার্ভিস ওয়ার্কার রিমুভ করতে চান? এটি অ্যাপটি সতেজ করতে ব্যবহার করা হয়।")) {
      return;
    }
    
    addLocalLog("warn", "Starting complete PWA cleanup/reset...");
    
    // 1. Unregister Service Workers
    if ("serviceWorker" in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          const success = await reg.unregister();
          addLocalLog("success", `Service Worker scope ${reg.scope} unregistered: ${success}`);
        }
      } catch (err: any) {
        addLocalLog("error", `Error unregistering service workers: ${err?.message || err}`);
      }
    }

    // 2. Clear Cache Storage
    if ("caches" in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          const success = await caches.delete(key);
          addLocalLog("success", `Cache Storage key "${key}" deleted: ${success}`);
        }
      } catch (err: any) {
        addLocalLog("error", `Error deleting Cache Storage: ${err?.message || err}`);
      }
    }

    // 3. Clear prompt state overrides
    localStorage.removeItem("pwaPromptDismissed");
    localStorage.removeItem("appInstalled");
    addLocalLog("success", "PWA state overrides reset successfully!");
    
    alert("সকল ক্যাশ ও সার্ভিস ওয়ার্কার সফলভাবে পরিষ্কার করা হয়েছে! পেজটি পুনরায় রিলোড হবে।");
    window.location.reload();
  };

  const clearLogs = () => {
    (window as any).pwaLogs = [];
    setLogs([]);
    addLocalLog("info", "Logs cleared.");
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating diagnostics activator badge */}
      <div className="fixed bottom-4 right-4 z-[10000]">
        <button
          onClick={() => {
            runDiagnostics();
            setIsOpen(true);
          }}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs px-3.5 py-2 rounded-full shadow-lg border border-slate-700/60 transition-transform active:scale-95"
          title="PWA Diagnostics Panel"
        >
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>PWA Diagnostics</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950 text-slate-100 w-full max-w-3xl h-[85vh] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              {/* Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="font-mono font-bold text-base leading-none text-white">Biddayan PWA Debugger</h2>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Service Worker & Installability Validator</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={runDiagnostics}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8"
                    title="রিলোড ডায়াগনস্টিক"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-1 flex gap-1 overflow-x-auto shrink-0">
                <button
                  onClick={() => setActiveTab("status")}
                  className={`px-3 py-2 font-mono text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "status" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Checking Status
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`px-3 py-2 font-mono text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "logs" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Live Log ({logs.length})
                </button>
                <button
                  onClick={() => setActiveTab("troubleshoot")}
                  className={`px-3 py-2 font-mono text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "troubleshoot" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Troubleshoot
                </button>
                <button
                  onClick={() => setActiveTab("sysinfo")}
                  className={`px-3 py-2 font-mono text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "sysinfo" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Client Info
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
                
                {/* 1. STATUS TAB */}
                {activeTab === "status" && (
                  <div className="space-y-6">
                    {/* General Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Criteria 1: Secure Context */}
                      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex items-start gap-3">
                        {isSecure ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-200">Secure Connection (HTTPS)</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {isSecure 
                              ? "The site is running on a secure domain or localhost. (Required for PWA)" 
                              : "NOT secure. Standard browsers completely disable Service Workers on HTTP connections."}
                          </p>
                        </div>
                      </div>

                      {/* Criteria 2: Service Worker */}
                      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex items-start gap-3">
                        {swStatus === "registered" && swController === "controlling" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : swStatus === "registered" ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-200">Service Worker Registration</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {swSupport 
                              ? (swStatus === "registered" 
                                  ? `SW Registered (${regCount}). Controller Status: ${swController === "controlling" ? "Controlling & intercepting requests" : "Inactive (Please refresh the page to claim control)"}` 
                                  : "No Service Worker registered! Check main.tsx registration workflow.") 
                              : "This browser does not support Service Workers."}
                          </p>
                        </div>
                      </div>

                      {/* Criteria 3: Manifest.json */}
                      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex items-start gap-3">
                        {manifestStatus === "valid" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-200">Manifest Validation</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {manifestStatus === "valid" 
                              ? `Parsed manifest.json correctly. Theme Color: ${manifestDetails?.theme_color || "None"}. Icons found: ${manifestDetails?.icons?.length || 0}.`
                              : `Failed to load/parse manifest.json: ${manifestErrorMsg}`}
                          </p>
                        </div>
                      </div>

                      {/* Criteria 4: Install Event captured */}
                      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex items-start gap-3">
                        {deferredPromptState === "captured" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-200">beforeinstallprompt Event</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {deferredPromptState === "captured"
                              ? "Event captured successfully! Browser is ready to trigger the Native Install Dialog."
                              : "Event not captured yet. The browser decides when to fire this based on user engagement metrics and PWA compliance criteria."}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Check if inside an iframe */}
                    {isIframe && (
                      <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <div>
                          <h4 className="font-mono text-xs font-bold text-rose-200">Iframe Blocker Active</h4>
                          <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                            আপনি বর্তমানে একটি iFrame (AI Studio প্রিভিউ উইন্ডো) এর ভেতর থেকে সাইটটি ওপেন করেছেন। সকল মডার্ন ব্রাউজারে আইফ্রেমের ভেতর থেকে PWA ইনস্টলেশন সম্পূর্ণ বন্ধ থাকে। অনুগ্রহ করে সাইটটি আলাদা ট্যাবে খুলুন (Development App URL এ ক্লিক করে) এবং ইনস্টল বাটনে চাপুন।
                          </p>
                        </div>
                      </div>
                    )}

                    {/* General Diagnostic Summary Table */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
                      <div className="bg-slate-900 px-4 py-2 text-slate-300 font-bold border-b border-slate-800">
                        PWA Criteria Check List
                      </div>
                      <div className="divide-y divide-slate-800/60">
                        <div className="px-4 py-3 flex justify-between items-center">
                          <span className="text-slate-400">PWA Manifest Link in DOM</span>
                          <span className="text-emerald-400 font-semibold">Yes (/manifest.json)</span>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center">
                          <span className="text-slate-400">Display Standalone Confirmed</span>
                          <span className={manifestDetails?.display === "standalone" ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                            {manifestDetails?.display || "Checking..."}
                          </span>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center">
                          <span className="text-slate-400">Secure Protocol</span>
                          <span className={isSecure ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                            {window.location.protocol}
                          </span>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center">
                          <span className="text-slate-400">Running Standalone Mode</span>
                          <span className="text-slate-300">{displayMode === "standalone" ? "Yes (App Mode)" : "No (Browser Mode)"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleManualPromptTrigger}
                        disabled={deferredPromptState !== "captured"}
                        className="flex-1 font-mono text-xs font-bold py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md disabled:bg-slate-800 disabled:text-slate-500"
                      >
                        <Play className="w-4 h-4 mr-2 shrink-0" />
                        Trigger Install Prompt
                      </Button>
                      <Button
                        onClick={simulateBeforeInstallPrompt}
                        variant="outline"
                        className="flex-1 font-mono text-xs font-semibold py-5 border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl"
                      >
                        <HelpCircle className="w-4 h-4 mr-2 shrink-0" />
                        Simulate Event Prompt
                      </Button>
                    </div>

                  </div>
                )}

                {/* 2. LOGS TAB */}
                {activeTab === "logs" && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex justify-between items-center shrink-0">
                      <span className="font-mono text-xs text-slate-400">Realtime PWA Engine Stream</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearLogs}
                        className="text-slate-400 hover:text-rose-400 font-mono text-xs h-7 hover:bg-rose-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Logs
                      </Button>
                    </div>

                    <div className="flex-1 min-h-[300px] max-h-[420px] overflow-y-auto bg-slate-950 border border-slate-900 p-4 rounded-2xl font-mono text-xs leading-relaxed space-y-2">
                      {logs.length === 0 ? (
                        <p className="text-slate-500 text-center py-10">No diagnostic logs recorded yet.</p>
                      ) : (
                        logs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2.5">
                            <span className="text-slate-500 text-[10px] select-none pt-0.5 shrink-0">{log.timestamp}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                              log.type === "success" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900" :
                              log.type === "error" ? "bg-rose-950/60 text-rose-400 border border-rose-900" :
                              log.type === "warn" ? "bg-amber-950/60 text-amber-400 border border-amber-900" :
                              "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}>
                              {log.type}
                            </span>
                            <span className={`break-all ${
                              log.type === "success" ? "text-emerald-300" :
                              log.type === "error" ? "text-rose-300 font-semibold" :
                              log.type === "warn" ? "text-amber-300" :
                              "text-slate-300"
                            }`}>
                              {log.message}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}

                {/* 3. TROUBLESHOOT TAB */}
                {activeTab === "troubleshoot" && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <h3 className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        PWA ইনস্টল কেন হচ্ছে না? (সম্ভাব্য কারণ ও সমাধান)
                      </h3>
                      <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                        <p>
                          ১. <strong>ব্রাউজার সীমাবদ্ধতা:</strong> ক্রোম ব্রাউজার বা সাফারিতে শুধুমাত্র সরাসরি ইনস্টলেশন সম্ভব। আপনি যদি ফেইসবুক, মেসেঞ্জার, হোয়াটসঅ্যাপ, বা জিমেইল অ্যাপের ভেতর থেকে লিংকটি ওপেন করে থাকেন, তবে ব্রাউজার ইনস্টলেশন ব্লক করে দেবে। সমাধানের জন্য পেজের ডানদিকের ৩-ডটে চাপ দিয়ে <span className="text-emerald-400">"Open in Chrome/Safari"</span> চাপুন।
                        </p>
                        <p>
                          ২. <strong>আইফ্রেম বা প্রিভিউ উইন্ডো:</strong> AI Studio প্রিভিউ উইন্ডো থেকে ট্রাই করলে ইনস্টলেশন কাজ করবে না। অবশ্যই <span className="text-emerald-400">Development App Link</span> টি কপি করে নতুন একটি ব্রাউজার ট্যাবে সরাসরি খুলুন।
                        </p>
                        <p>
                          ৩. <strong>ইতিমধ্যে ইনস্টলড:</strong> আপনার ফোনে অ্যাপটি ইতিমধ্যে ডাউনলোড করা থাকলে ক্রোম দ্বিতীয়বার "Install" বাটন দেখাবে না। আপনি ফোনের হোম স্ক্রিন বা অ্যাপ ড্রয়ারে চেক করতে পারেন।
                        </p>
                      </div>
                    </div>

                    <div className="border border-rose-900/40 bg-rose-950/10 p-5 rounded-2xl">
                      <h4 className="font-mono text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4" />
                        পাওয়ারফুল রিসেট ও ক্যাশ ক্লিয়ার টুল
                      </h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        যদি সার্ভিস ওয়ার্কারের পুরাতন সংস্করণ ক্যাশ হয়ে আটকে থাকে বা ইনস্টল বাটন ঠিকমতো কাজ না করে, নিচের বোতামটি চাপলে ব্রাউজারের সকল PWA ক্যাশ ফাইল রিমুভ হবে এবং নতুন করে সার্ভিস ওয়ার্কার রেজিস্টার হয়ে পেজ রিলোড হবে।
                      </p>
                      <Button
                        onClick={clearAllPwaCache}
                        className="mt-4 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl"
                      >
                        Reset PWA Engine & Re-register
                      </Button>
                    </div>
                  </div>
                )}

                {/* 4. CLIENT INFO */}
                {activeTab === "sysinfo" && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="bg-slate-900 px-4 py-2 text-slate-300 font-bold border-b border-slate-800">
                        Browser & Hardware Specifications
                      </div>
                      <div className="divide-y divide-slate-800/60 p-1">
                        <div className="px-4 py-2.5 flex justify-between items-start gap-4">
                          <span className="text-slate-400 shrink-0">User Agent</span>
                          <span className="text-slate-300 break-all text-right">{uaDetails}</span>
                        </div>
                        <div className="px-4 py-2.5 flex justify-between items-center">
                          <span className="text-slate-400">Secure Context</span>
                          <span className={isSecure ? "text-emerald-400" : "text-rose-400"}>{isSecure ? "True" : "False"}</span>
                        </div>
                        <div className="px-4 py-2.5 flex justify-between items-center">
                          <span className="text-slate-400">Is Touch Screen</span>
                          <span className="text-slate-300">{("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "Yes" : "No"}</span>
                        </div>
                        <div className="px-4 py-2.5 flex justify-between items-center">
                          <span className="text-slate-400">Window Inner Size</span>
                          <span className="text-slate-300">{window.innerWidth} x {window.innerHeight}</span>
                        </div>
                        <div className="px-4 py-2.5 flex justify-between items-center">
                          <span className="text-slate-400">Device Pixel Ratio</span>
                          <span className="text-slate-300">{window.devicePixelRatio}</span>
                        </div>
                        <div className="px-4 py-2.5 flex justify-between items-center">
                          <span className="text-slate-400">Standalone Mode (PWA)</span>
                          <span className="text-slate-300">{displayMode === "standalone" ? "True" : "False"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Panel */}
              <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span>Created with ❤️ for Biddayan App</span>
                <span>Press PWA logo 5 times to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
