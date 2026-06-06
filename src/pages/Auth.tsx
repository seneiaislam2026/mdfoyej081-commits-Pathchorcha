import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Phone, Mail, X, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../lib/AuthContext";
import { ConfirmationResult, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Auth() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('phone');
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const convertBanglaToEnglishDigits = (str: string) => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return str.replace(/[০-৯]/g, (match) => banglaDigits.indexOf(match).toString());
  };

  const handlePhoneChange = (val: string) => {
    let englishVal = convertBanglaToEnglishDigits(val);
    englishVal = englishVal.replace(/[^0-9+]/g, "");
    setIdentifier(englishVal);
  };

  const handleForgotPhoneChange = (val: string) => {
    let englishVal = convertBanglaToEnglishDigits(val);
    englishVal = englishVal.replace(/[^0-9+]/g, "");
    setForgotIdentifier(englishVal);
  };
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState<'input' | 'otp' | 'new_password'>('input');
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  
  const { signInWithGoogle, signInWithFacebook, signInOrSignUpWithEmail, user, userData, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      if (userData?.class) {
        navigate("/dashboard");
      } else if (userData) {
        navigate("/onboarding");
      }
    }
  }, [user, userData, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <span className="font-bengali font-bold text-4xl sm:text-5xl tracking-tight">
            <span className="text-[#0F2744]">শিক্ষা</span>
            <span className="text-[#F4B400]">ঙ্গন</span>
          </span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier && password) {
      try {
        setErrorMsg("");
        setLoading(true);
        let phoneNum = identifier.trim().replace(/\s+/g, "");
        
        if (phoneNum.startsWith("+880")) {
          phoneNum = phoneNum.substring(3);
        } else if (phoneNum.startsWith("880")) {
          phoneNum = phoneNum.substring(2);
        }

        const phoneRegex = /^01[3-9]\d{8}$/;
        if (!phoneRegex.test(phoneNum)) {
          throw new Error("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)");
        }

        const loginEmail = `${phoneNum}@pathchorcha.app`;
        const data = await signInOrSignUpWithEmail(loginEmail, password);
        if (data && data.class) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } catch (e: any) {
        console.error(e);
        if (e.code === 'auth/operation-not-allowed') {
          setErrorMsg("মোবাইল ও পাসওয়ার্ড লগইন চালু নেই। দয়া করে আপনার Firebase প্রজেক্টের Authentication সেটিংসে গিয়ে 'Email/Password' Provider চালু করুন।");
        } else {
          setErrorMsg(e.message || "লগিন বা রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const data = await signInWithGoogle();
      if (data && data.class) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await signInWithFacebook();
      if (data && data.class) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/operation-not-allowed') {
        setErrorMsg("ফেসবুক লগইন এই মুহূর্তে চালু নেই। অনুগ্রহ করে Firebase কনসোলে গিয়ে Facebook Sign-in Provider চালু করুন।");
      } else {
        setErrorMsg(e.message || "ফেসবুক লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      let phoneNum = forgotIdentifier.trim().replace(/\s+/g, "");
      if (phoneNum.startsWith("+880")) {
        phoneNum = phoneNum.substring(3);
      } else if (phoneNum.startsWith("880")) {
        phoneNum = phoneNum.substring(2);
      }

      // Check format
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(phoneNum)) {
        throw new Error("দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।");
      }

      if (forgotStep === 'input') {
        const res = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phoneNum })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        if (data.mockOtp) {
           alert(`(Test Mode) Your OTP is: ${data.mockOtp}`);
        }
        
        setForgotStep('otp');
      } else if (forgotStep === 'otp') {
        const res = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phoneNum, otp: forgotOtp.trim() })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setForgotStep('new_password');
      } else if (forgotStep === 'new_password') {
        const res = await fetch("/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phoneNum, newPassword: newPassword })
        });
        const data = await res.json();
        
        if (res.ok) {
           alert("পাসওয়ার্ড সফলভাবে পরিবর্তনের রিকুয়েস্ট করা হয়েছে (এটি কাজ করতে Admin SDK প্রয়োজন)। দয়া করে পুরানো পাসওয়ার্ড দিয়েই লগইন করুন আপাতত।");
           setShowForgotModal(false);
           setForgotStep('input');
           setForgotIdentifier("");
           setForgotOtp("");
           setNewPassword("");
        } else {
           throw new Error(data.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
        }
      }
    } catch (err: any) {
      setForgotError(err.message || "কোনো একটি সমস্যা হয়েছে।");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Left Decoration Panel (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-blue-900 z-0"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-secondary rounded-full opacity-20 blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-[80px] pointer-events-none z-0"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="font-bengali font-bold text-[36px] tracking-tight text-white">
              শিক্ষা<span className="text-secondary">ঙ্গন</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 text-white max-w-md">
          <h1 className="text-4xl font-bengali font-bold leading-tight mb-6">
            লক্ষ্য স্থির করো,<br/>নিয়মিত চর্চা করো,<br/>সাফল্য আসবেই!
          </h1>
          <p className="text-primary-foreground/70 font-bengali text-lg leading-relaxed">
            ১০ লক্ষের বেশি ছাত্রছাত্রী ইতিমধ্যে শিক্ষাঙ্গন-এ যুক্ত হয়েছে। আজই শুরু করো তোমার প্রস্তুতি।
          </p>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-12 relative bg-slate-50/50 min-h-screen">
        {/* Subtle decorative background canvas glows */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#00A86B]/5 rounded-full filter blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full filter blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[400px] bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100/90 relative z-10 flex flex-col justify-between"
        >
          {/* Centered Artistic Brand Logo and Title */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center justify-center mb-4">
              <Link to="/" className="inline-flex flex-col items-center gap-1 group">
                {/* Custom stylized "Shikkhangon" badge with correct brand colors */}
                <div className="relative w-[76px] h-[76px] bg-white border-2 border-[#0F2744]/12 rounded-full flex items-center justify-center shadow-lg shadow-slate-200/80 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute top-1 right-3 w-3 h-1.5 bg-red-500 rounded-full rotate-12" /> {/* Red splash accent */}
                  <span className="font-bengali text-xs font-black select-none tracking-tight">
                    <span className="text-[#0F2744]">শিক্ষা</span><span className="text-[#F4B400]">ঙ্গন</span>
                  </span>
                </div>
                <span className="font-bengali font-bold text-xl tracking-tight mt-2.5">
                  <span className="text-[#0F2744]">শিক্ষা</span><span className="text-[#F4B400]">ঙ্গন</span>
                </span>
              </Link>
            </div>
            
            <h2 className="text-lg font-bengali font-bold text-slate-700 tracking-tight">
              লগইন / রেজিস্টার
            </h2>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-50 text-red-800 p-3 rounded-2xl text-xs font-bengali mb-4 border border-red-100 text-center font-medium"
            >
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Styled Mobile Input Field */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="font-bengali font-bold text-slate-600 text-xs pl-1">
                মোবাইল নম্বর
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <Input 
                  id="identifier" 
                  type="tel"
                  placeholder="যেমন: 01XXXXXXXXX" 
                  className="h-12 pl-11 pr-4 rounded-2xl bg-slate-50/70 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 font-sans shadow-none transition-all text-slate-800 text-sm"
                  value={identifier}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Styled Password Input Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-1">
                <Label htmlFor="password" className="font-bengali font-bold text-slate-600 text-xs">
                  পাসওয়ার্ড
                </Label>
                <button 
                  type="button" 
                  onClick={() => {
                    setForgotError("");
                    setForgotStep('input');
                    setShowForgotModal(true);
                  }} 
                  className="text-[10px] text-[#0F2744] hover:text-[#0C1F36] font-bengali font-semibold transition-colors"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 pl-11 pr-4 rounded-2xl bg-slate-50/70 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-none transition-all text-slate-800 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Primary Action Button (Beautiful brand-matching Deep Navy Blue) */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 mt-4 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bengali font-bold text-sm shadow-sm transition-all duration-200"
            >
              {loading ? (
                "অপেক্ষা করুন..."
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  এগিয়ে যাও <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Minimal Divider */}
          <div className="my-5 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-3 text-[11px] text-slate-400 font-medium">Login / Registration with</span>
          </div>

          {/* Social Sign-In (Beautiful side-by-side Grid of Google & Facebook) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Facebook Button */}
            <Button 
              variant="outline" 
              type="button"
              disabled={loading}
              onClick={handleFacebookLogin}
              className="h-11 rounded-2xl font-sans text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-none"
            >
              <svg className="w-4 h-4 text-[#1877F2] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>

            {/* Google Button */}
            <Button 
              disabled={loading} 
              onClick={handleGoogleLogin} 
              variant="outline" 
              type="button"
              className="h-11 rounded-2xl font-sans text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-none"
            >
               <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
               Google
            </Button>
          </div>

          <p className="text-center text-slate-400 font-bengali text-[10px] mt-4 leading-relaxed">
            লগইন করার মাধ্যমে আপনি আমাদের <Link to="/terms" className="text-primary font-semibold hover:underline">শর্তাবলী</Link> ও <Link to="/privacy" className="text-primary font-semibold hover:underline">গোপনীয়তা নীতিতে</Link> সম্মতি জানাচ্ছেন।
          </p>
        </motion.div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 relative shadow-xl">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bengali font-bold text-slate-900 mb-2">পাসওয়ার্ড পুনরুদ্ধার</h3>
            <p className="text-slate-500 font-bengali mb-6">
              {forgotStep === 'input' && "আপনার ১১ ডিজিটের মোবাইল নম্বর দিন"}
              {forgotStep === 'otp' && "আপনার নম্বরে পাঠানো OTP দিন"}
              {forgotStep === 'new_password' && "নতুন পাসওয়ার্ড সেট করুন"}
            </p>
            
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStep === 'input' && (
                <div className="space-y-2">
                  <Label className="font-bengali">মোবাইল নম্বর</Label>
                  <Input 
                    type="tel" 
                    placeholder="যেমন: 01XXXXXXXXX" 
                    value={forgotIdentifier}
                    onChange={(e) => handleForgotPhoneChange(e.target.value)}
                    required
                    className="h-12 rounded-2xl bg-slate-50"
                  />
                </div>
              )}
              
              {forgotStep === 'otp' && (
                <div className="space-y-2">
                  <Label className="font-bengali">OTP</Label>
                  <Input 
                    type="text" 
                    placeholder="4 ডিজিটের কোড" 
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    className="h-12 rounded-2xl bg-slate-50 tracking-widest text-center text-xl"
                  />
                </div>
              )}
              
              {forgotStep === 'new_password' && (
                <div className="space-y-2">
                  <Label className="font-bengali">নতুন পাসওয়ার্ড</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-12 rounded-2xl bg-slate-50"
                  />
                </div>
              )}
              
              {forgotError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-bengali border border-red-100">
                  {forgotError}
                </div>
              )}
              
              <Button disabled={forgotLoading} type="submit" className="w-full h-14 bg-primary text-white font-bengali font-bold rounded-xl">
                {forgotLoading ? "অপেক্ষা করুন..." : 
                  forgotStep === 'input' ? "OTP পাঠান" : 
                  forgotStep === 'otp' ? "যাচাই করুন" : "পাসওয়ার্ড আপডেট করুন"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
