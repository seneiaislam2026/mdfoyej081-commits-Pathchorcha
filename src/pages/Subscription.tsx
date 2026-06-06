import { useState, useEffect } from "react";
import { Check, Star, Zap, Crown, Lock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentButton from "../components/payment/PaymentButton";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const defaultPlans = [
  {
    id: "1-month",
    name: "১ মাস",
    price: 80,
    duration: "মাসিক",
    popular: false,
    color: "from-blue-200 to-blue-300"
  },
  {
    id: "3-months",
    name: "৩ মাস",
    price: 220,
    duration: "ত্রৈমাসিক",
    popular: true,
    color: "from-[#ffa726] to-[#ffb74d]"
  },
  {
    id: "6-months",
    name: "৬ মাস",
    price: 430,
    duration: "ষাণ্মাসিক",
    popular: false,
    color: "from-emerald-200 to-emerald-300"
  },
  {
    id: "custom",
    name: "কাস্টম",
    price: 0,
    duration: "দিন হিসেবে",
    popular: false,
    color: "from-purple-200 to-purple-300"
  }
];

const features = [
  { text: "সীমাহীন মডেল টেস্ট ও মক টেস্ট", included: true },
  { text: "সব প্রশ্নের প্রো (Pro) ব্যাখ্যা আনলক", included: true },
  { text: "স্মার্ট নোটস এক্সেস", included: true },
  { text: "অফলাইন ডাউনলোড সুবিধা (আসছে)", included: true },
  { text: "AI টিউটর এর আনলিমিটেড ব্যবহার", included: true }
];

export default function Subscription() {
  const [plans, setPlans] = useState(defaultPlans);
  const [selectedPlan, setSelectedPlan] = useState(defaultPlans[0].id);
  const [customDays, setCustomDays] = useState(7);
  const [couponCode, setCouponCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.subscriptionPlans) {
            setPlans(data.subscriptionPlans);
          }
          if (data.discountPercentage) {
            setDiscountPercentage(Number(data.discountPercentage));
          }
        }
      } catch(e) {
        console.error(e);
      }
    };
    fetchPlans();
  }, []);
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("দয়াকরে কুপন কোড লিখুন");
      return;
    }
    if (!user || !userData?.uid) {
      navigate("/auth");
      return;
    }
    setIsProcessing(true);
    try {
      const { doc, getDoc, updateDoc, Timestamp, deleteDoc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      
      const compCode = couponCode.trim().toUpperCase();
      const couponRef = doc(db, "coupons", compCode);
      const couponSnap = await getDoc(couponRef);
      
      if (!couponSnap.exists() || !couponSnap.data().active) {
        alert("কুপন কোডটি সঠিক নয় অথবা এর মেয়াদ শেষ হয়ে গেছে।");
        setIsProcessing(false);
        return;
      }

      const couponData = couponSnap.data();
      const months = couponData.months || 1;
      const proUntilMillis = Date.now() + months * 30 * 24 * 60 * 60 * 1000;
      
      await updateDoc(doc(db, "users", userData.uid), {
        isPro: true,
        proUntil: Timestamp.fromMillis(proUntilMillis)
      });
      
      // Delete coupon if it's one-time use (optional), here we assume it's one-time use for safety if they try to reuse,
      // but if the admin wants it multi-use, we shouldn't delete it.
      // We will keep it multi-use for this implementation unless explicitly stated.
      
      alert(`অভিনন্দন! আপনার ${months} মাসের প্রো সাবস্ক্রিপশন সফলভাবে এক্টিভেট হয়েছে।`);
      window.location.reload();

    } catch (e) {
      console.error("Coupon error:", e);
      alert("কুপন প্রয়োগ করতে সমস্যা হয়েছে।");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { Timestamp } = await import("firebase/firestore");
      let durationDays = 30;
      if (selectedPlan === "3-months") durationDays = 90;
      else if (selectedPlan === "6-months") durationDays = 180;
      else if (selectedPlan === "custom") durationDays = customDays;
      
      const proUntilMillis = Date.now() + durationDays * 24 * 60 * 60 * 1000;
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isPro: true,
        proUntil: Timestamp.fromMillis(proUntilMillis)
      });
      
      // Usually need to update context too, assuming reload or it triggers onSnapshot, else we navigate home
      alert("অভিনন্দন! আপনার সাবস্ক্রিপশন সফলভাবে এক্টিভ হয়েছে।");
      navigate("/dashboard");
      
    } catch (error) {
      console.error(error);
      alert("কোনো একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {userData?.isPro ? (
        <div className="max-w-3xl mx-auto py-16 px-4 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-[#ffa726] to-[#e65100] rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl shadow-orange-500/20"
          >
            <Crown className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bengali font-bold text-slate-800 mb-6">
            আপনি একজন প্রো (Pro) মেম্বার!
          </h1>
          <p className="text-lg md:text-xl font-bengali text-slate-600 mb-10">
            প্রো ব্যাচ, আনলিমিটেড মক টেস্ট এবং প্রো ব্যাখ্যা সহ সব সুবিধা উপভোগ করুন।
          </p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bengali px-8 h-14 text-lg">
            ড্যাশবোর্ডে ফিরে যান
          </Button>
        </div>
      ) : (
      <>
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-[#ffa726] to-[#e65100] rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-orange-500/20"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bengali font-bold text-slate-800 mb-6">
            প্রো (Pro) মেম্বারশিপে আপগ্রেড করুন
          </h1>
          <p className="text-lg md:text-xl font-bengali text-slate-600 max-w-2xl mx-auto">
            মডেল টেস্টের সকল প্রশ্নের প্রো ব্যাখ্যা, আনলিমিটেড মক টেস্ট এবং আরও অনেক এক্সক্লুসিভ ফিচার উপভোগ করুন।
          </p>
        </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Features Column */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 h-full">
          <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-6">ফ্রি অ্যাকাউন্টে কী কী থাকছে?</h3>
          <ul className="space-y-4 font-bengali mb-8">
            <li className="flex items-start gap-3 text-slate-600">
               <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
               </div>
               <span>মাসিক ১৫টি ফ্রি মক টেস্ট</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600">
               <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
               </div>
               <span>স্মার্ট নোটস পড়া যাবে</span>
            </li>
            <li className="flex items-start gap-3 text-slate-600">
               <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
               </div>
               <span>প্রশ্নব্যাংক ও মডেল টেস্ট (শুধুমাত্র সঠিক উত্তর দেখা যাবে)</span>
            </li>
            <li className="flex items-start gap-3 text-slate-400 line-through">
               <div className="mt-1 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Lock className="w-3 h-3 text-slate-400" />
               </div>
               <span>প্রশ্নের প্রো ব্যাখ্যা (Pro Explanation)</span>
            </li>
          </ul>

          <div className="w-full h-px bg-slate-100 my-8"></div>

          <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-6 flex items-center gap-2">
             প্রো ফিচারের সুবিধা <Zap className="w-6 h-6 text-[#ffa726]" />
          </h3>
          <ul className="space-y-4 font-bengali">
            {features.map((f, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex items-center gap-3 text-slate-800 font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ffa726] to-[#e65100] flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-4 h-4 text-white" />
                </div>
                {f.text}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6 w-full lg:max-w-none">
          {discountPercentage > 0 && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-3xl p-5 flex items-center justify-between gap-3 animate-pulse">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    <Tag className="w-5 h-5" />
                 </div>
                 <div className="font-bengali">
                   <p className="font-bold text-amber-900 text-sm sm:text-base">বিশেষ ক্যাম্পেইন অফার সক্রিয়! 🎉</p>
                   <p className="text-xs sm:text-sm text-amber-800">সকল রেগুলার প্রো প্ল্যানে সরাসরি {discountPercentage}% ছাড় দেওয়া হয়েছে।</p>
                 </div>
               </div>
               <span className="text-xs font-black font-sans text-amber-700 bg-amber-100/50 border border-amber-200 px-3 py-1 rounded-full shrink-0">-{discountPercentage}% Off</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {plans.map((plan) => {
              const hasDiscount = discountPercentage > 0 && plan.id !== 'custom';
              const originalPrice = plan.price;
              const discountedPrice = hasDiscount ? Math.round(originalPrice * (1 - discountPercentage / 100)) : originalPrice;

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center justify-between transition-all ${
                    selectedPlan === plan.id 
                      ? "border-orange-500 bg-orange-50/40 shadow-[0_8px_20px_-8px_rgba(249,115,22,0.2)]" 
                      : "border-slate-100 bg-white hover:border-orange-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${selectedPlan === plan.id ? 'border-orange-500 bg-orange-500 scale-110' : 'border-slate-300'}`}>
                       {selectedPlan === plan.id && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-base sm:text-lg font-bengali font-bold leading-tight ${selectedPlan === plan.id ? 'text-orange-800' : 'text-slate-800'}`}>{plan.name}</h4>
                        {plan.popular && (
                          <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full font-bengali shadow-sm">জনপ্রিয়</span>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bengali mt-0.5 ${selectedPlan === plan.id ? 'text-orange-600/80' : 'text-slate-500'}`}>{plan.duration}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {plan.id === 'custom' ? (
                      <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-1 rounded-xl p-1 pl-2 pr-3 border transition-colors ${selectedPlan === plan.id ? 'bg-white border-orange-300 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                          <Input 
                            type="number"
                            min="1"
                            max="365"
                            value={customDays}
                            onChange={(e) => {
                               let val = parseInt(e.target.value);
                               if (isNaN(val) || val < 1) val = 1;
                               if (val > 365) val = 365;
                               setCustomDays(val);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 h-8 text-center border-none p-0 focus-visible:ring-0 text-base font-sans font-bold shadow-none bg-transparent text-slate-800"
                          />
                          <span className="text-sm font-bengali font-medium text-slate-500">দিন</span>
                        </div>
                        <div className={`flex items-start tracking-tight ${selectedPlan === plan.id ? 'text-orange-600' : 'text-slate-800'}`}>
                           <span className={`text-base font-medium mt-1 mr-0.5 ${selectedPlan === plan.id ? 'text-orange-400' : 'text-slate-400'}`}>৳</span>
                           <span className="text-3xl sm:text-4xl font-black">{Math.ceil((80/30) * customDays)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        {hasDiscount && (
                          <span className="text-xs font-sans font-bold text-red-500 line-through mb-0.5">
                            ৳{originalPrice}
                          </span>
                        )}
                        <div className={`flex items-start tracking-tight ${selectedPlan === plan.id ? 'text-orange-600' : 'text-slate-800'}`}>
                           <span className={`text-base font-medium mt-1 mr-0.5 ${selectedPlan === plan.id ? 'text-orange-400' : 'text-slate-400'}`}>৳</span>
                           <span className="text-3xl sm:text-4xl font-black">{discountedPrice}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm mt-2">
             <div className="flex items-center gap-2 text-slate-700">
               <Tag className="w-5 h-5 text-slate-400" />
               <span className="font-bengali font-bold text-sm sm:text-base">কুপন কোড (যদি থাকে)</span>
             </div>
             <div className="flex flex-col sm:flex-row gap-3">
               <Input 
                 placeholder="কুপন কোড লিখুন" 
                 value={couponCode}
                 onChange={(e) => setCouponCode(e.target.value)}
                 className="flex-1 rounded-2xl bg-slate-50/50 border-slate-200 hover:border-slate-300 font-mono h-14 px-5 text-lg shadow-inner"
               />
               <Button 
                variant="secondary" 
                onClick={handleApplyCoupon}
                disabled={isProcessing}
                className="rounded-2xl font-bengali h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md">
                 প্রয়োগ করুন
               </Button>
             </div>
          </div>

          <div className="mt-2">
            {userData?.isPro ? (
               <Button size="lg" disabled className="w-full h-16 rounded-[24px] font-bengali font-bold text-xl bg-slate-200 text-slate-500">আপনি ইতিমধ্যে প্রো মেম্বার</Button>
            ) : (
               <PaymentButton 
                 plan={selectedPlan} 
                 amount={
                   selectedPlan === 'custom' 
                     ? Math.ceil((80/30) * customDays) 
                     : (() => {
                         const plan = plans.find(p => p.id === selectedPlan);
                         if (!plan) return 0;
                         const hasDiscount = discountPercentage > 0 && plan.id !== 'custom';
                         return hasDiscount ? Math.round(plan.price * (1 - discountPercentage / 100)) : plan.price;
                       })()
                 } 
                 days={selectedPlan === 'custom' ? customDays : undefined} 
               />
            )}
            <p className="text-center font-bengali text-sm text-slate-500 mt-5">
              বিকাশ, নগদ, রকেট, উপায় সহ যেকোনো কার্ডে পেমেন্ট করতে পারবেন।
            </p>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
