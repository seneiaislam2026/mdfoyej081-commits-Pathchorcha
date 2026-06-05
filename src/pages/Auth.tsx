import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Phone, Mail, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { ConfirmationResult, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Auth() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState<'input' | 'otp' | 'new_password'>('input');
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  
  const { signInWithGoogle, signInOrSignUpWithEmail, user, userData, loading: authLoading } = useAuth();
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier && password) {
      try {
        setErrorMsg("");
        setLoading(true);
        let loginEmail = identifier.trim();
        if (!loginEmail.includes('@')) {
           // Normalize phone to english digits just in case and remove spaces
           loginEmail = loginEmail.replace(/\s+/g, "");
           loginEmail = `${loginEmail}@pathchorcha.app`;
        }
        const data = await signInOrSignUpWithEmail(loginEmail, password);
        if (data && data.class) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } catch (e: any) {
        console.error(e);
        if (e.code === 'auth/operation-not-allowed') {
          setErrorMsg("ইমেইল ও পাসওয়ার্ড লগইন চালু নেই। দয়া করে আপনার Firebase প্রজেক্টের Authentication সেটিংসে গিয়ে 'Email/Password' Provider চালু করুন।");
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const isEmail = forgotIdentifier.includes('@');
      
      if (forgotStep === 'input') {
        if (isEmail) {
          await sendPasswordResetEmail(auth, forgotIdentifier.trim());
          alert("আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। দয়া করে ইনবক্স চেক করুন।");
          setShowForgotModal(false);
        } else {
          // Sending SMS OTP
          const res = await fetch("/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: forgotIdentifier.trim() })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          
          if (data.mockOtp) {
             alert(`(Test Mode) Your OTP is: ${data.mockOtp}`);
          }
          
          setForgotStep('otp');
        }
      } else if (forgotStep === 'otp') {
        const res = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: forgotIdentifier.trim(), otp: forgotOtp.trim() })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setForgotStep('new_password');
      } else if (forgotStep === 'new_password') {
        // Here we hit the server to reset password.
        // It requires Admin SDK to actually change firebase auth.
        const res = await fetch("/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: forgotIdentifier.trim(), newPassword: newPassword })
        });
        const data = await res.json();
        
        if (res.ok) {
           alert("পাসওয়ার্ড সফলভাবে পরিবর্তনের রিকুয়েস্ট করা হয়েছে (এটি কাজ করতে Admin SDK প্রয়োজন)। দয়া করে পুরানো পাসওয়ার্ড দিয়েই লগইন করুন আপাতত।");
           setShowForgotModal(false);
           setForgotStep('input');
           setForgotOtp("");
           setNewPassword("");
        } else {
           throw new Error(data.error || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setForgotError("এই ইমেইলের কোনো একাউন্ট পাওয়া যায়নি।");
      } else if (err.code === 'auth/invalid-email') {
        setForgotError("সঠিক ইমেইল অ্যাড্রেস দিন।");
      } else {
        setForgotError(err.message || "কোনো একটি সমস্যা হয়েছে।");
      }
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-slate-100">
          
          <div className="text-center mb-10">
            <div className="lg:hidden mb-6 flex justify-center">
              <Link to="/" className="inline-flex items-center gap-2">
                <span className="font-bengali font-bold text-[32px] tracking-tight">
                  <span className="text-primary">শিক্ষা</span>
              <span className="text-secondary">ঙ্গন</span>
                </span>
              </Link>
            </div>
            <h2 className="text-2xl md:text-3xl font-bengali font-bold text-slate-900 mb-2">স্বাগতম</h2>
            <p className="text-slate-500 font-bengali">লগইন বা রেজিস্ট্রেশন করতে বিস্তারিত দিন</p>
          </div>

          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => { setLoginMethod('email'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all bg-white text-primary shadow-sm font-bengali`}
            >
              <Mail className="w-4 h-4" /> লগইন / রেজিস্ট্রেশন
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
              <>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm font-bengali mb-4 border border-blue-100">
                  ঈমেইল ও পাসওয়ার্ড দিন। একাউন্ট না থাকলে স্বয়ংক্রিয়ভাবে নতুন একাউন্ট তৈরি হয়ে যাবে।
                </div>
                {errorMsg && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-xl text-sm font-bengali mb-4 border border-red-100 text-center">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="font-bengali font-medium text-slate-700">
                    ইমেইল / ফোন নম্বর
                  </Label>
                  <Input 
                    id="identifier" 
                    type="text"
                    placeholder="example@gmail.com অথবা 01XXXXXXXXX" 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:border-primary px-4 font-sans shadow-sm"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-bengali font-medium text-slate-700">পাসওয়ার্ড</Label>
                    <button type="button" onClick={() => {
                        setForgotError("");
                        setForgotStep('input');
                        setShowForgotModal(true);
                      }} className="text-sm font-bengali text-primary hover:underline font-medium">পাসওয়ার্ড ভুলে গেছেন?</button>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:border-primary px-4 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 mt-4 bg-primary hover:bg-primary/95 text-white rounded-full font-bengali font-bold text-lg shadow-[0_4px_14px_0_rgb(15,39,68,0.39)] hover:shadow-[0_6px_20px_rgba(15,39,68,0.23)] hover:transform hover:-translate-y-0.5 transition duration-200">
                  {loading ? "অপেক্ষা করুন..." : <span className="flex items-center justify-center">চালিয়ে যান <ArrowRight className="ml-2 w-5 h-5" /></span>}
                </Button>
              </>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-4 text-sm text-slate-500 font-bengali">অথবা</span>
          </div>

          <div className="mt-8">
            <Button disabled={loading} onClick={handleGoogleLogin} variant="outline" className="w-full h-14 rounded-full font-sans font-medium text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm relative overflow-hidden">
               {/* Minimal Google Icon */}
               <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
               Continue with Google
            </Button>
            
            <p className="text-center text-slate-500 font-bengali text-sm mt-6">
              লগইন করার মাধ্যমে আপনি আমাদের <Link to="/terms" className="text-primary font-medium hover:underline">শর্তাবলী</Link> ও <Link to="/privacy" className="text-primary font-medium hover:underline">গোপনীয়তা নীতিতে</Link> সম্মতি জানাচ্ছেন।
            </p>
          </div>
        </div>
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
              {forgotStep === 'input' && "ইমেইল অথবা ফোন নম্বর দিন"}
              {forgotStep === 'otp' && "আপনার নম্বরে পাঠানো OTP দিন"}
              {forgotStep === 'new_password' && "নতুন পাসওয়ার্ড সেট করুন"}
            </p>
            
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStep === 'input' && (
                <div className="space-y-2">
                  <Label className="font-bengali">ইমেইল / ফোন নম্বর</Label>
                  <Input 
                    type="text" 
                    placeholder="example@gmail.com অথবা 01XXXXXXXXX" 
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
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
