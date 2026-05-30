import { useState } from "react";
import { Check, Star, Zap, Crown, Lock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const plans = [
  {
    id: "1-month",
    name: "১ মাস",
    price: 50,
    duration: "মাসিক",
    popular: false,
    color: "from-blue-200 to-blue-300"
  },
  {
    id: "3-months",
    name: "৩ মাস",
    price: 120,
    duration: "ত্রৈমাসিক",
    popular: true,
    color: "from-[#ffa726] to-[#ffb74d]"
  },
  {
    id: "6-months",
    name: "৬ মাস",
    price: 270,
    duration: "ষাণ্মাসিক",
    popular: false,
    color: "from-emerald-200 to-emerald-300"
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
  const [selectedPlan, setSelectedPlan] = useState(plans[1].id);
  const [couponCode, setCouponCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isPro: true
      });
      
      // Usually need to update context too, assuming reload or it triggers onSnapshot, else we navigate home
      alert("অভিনন্দন! আপনার সাবস্ক্রিপশন সফলভাবে এক্টিভ হয়েছে।");
      window.location.href = "/dashboard";
      
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

        {/* Pricing Column */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full lg:max-w-none">
          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ translateY: -4 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`cursor-pointer border-2 rounded-[32px] p-5 pt-8 text-center relative transition-all flex flex-col justify-between ${
                  selectedPlan === plan.id 
                    ? "border-[#ffa726] bg-[#fffaf0] shadow-md shadow-orange-500/10" 
                    : "border-slate-100 bg-white hover:border-orange-100"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ffa726] to-[#e65100] text-white font-bengali text-xs font-bold px-4 py-1 rounded-full shadow-md flex items-center gap-1 w-max">
                    <Star className="w-3 h-3 fill-white" /> সর্বাধিক প্রিয়
                  </div>
                )}
                
                <div className="mb-6 flex-1">
                   <h4 className="text-xl font-bengali font-bold text-slate-700 mb-4">{plan.name}</h4>
                   <div className="flex items-center justify-center gap-1">
                      <span className="text-4xl font-bold font-mono text-slate-900">৳{plan.price}</span>
                   </div>
                   <div className="text-slate-500 font-bengali text-sm mt-1">/{plan.duration}</div>
                </div>

                <div>
                   <div className={`w-16 mx-auto h-1.5 rounded-full bg-gradient-to-r ${plan.color} opacity-80 mb-5`} />

                   <div className="flex items-center justify-center">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === plan.id ? 'border-[#ffa726] bg-[#ffa726]' : 'border-slate-300'}`}>
                         {selectedPlan === plan.id && <Check className="w-4 h-4 text-white" />}
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-6 flex flex-col gap-4">
             <div className="flex items-center gap-2 text-slate-700">
               <Tag className="w-5 h-5 text-[#ffa726]" />
               <span className="font-bengali font-bold text-base">কুপন কোড (যদি থাকে)</span>
             </div>
             <div className="flex flex-col sm:flex-row gap-3">
               <Input 
                 placeholder="কুপন কোড লিখুন" 
                 value={couponCode}
                 onChange={(e) => setCouponCode(e.target.value)}
                 className="flex-1 rounded-2xl bg-slate-50 border-slate-200 font-mono h-14 px-5 text-lg"
               />
               <Button variant="secondary" className="rounded-2xl font-bengali h-14 px-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base">
                 প্রয়োগ করুন
               </Button>
             </div>
          </div>

          <div className="mt-2">
            <Button 
               size="lg"
               onClick={handleSubscribe}
               disabled={isProcessing || userData?.isPro}
               className="w-full h-16 rounded-[24px] font-bengali font-bold text-xl bg-gradient-to-r from-[#ffa726] to-[#e65100] hover:from-[#f57c00] hover:to-[#d84315] text-white shadow-xl shadow-orange-500/20"
            >
               {isProcessing ? "প্রসেসিং হচ্ছে..." : userData?.isPro ? "আপনি ইতিমধ্যে প্রো মেম্বার" : "সাবস্ক্রাইব করুন"}
            </Button>
            <p className="text-center font-bengali text-sm text-slate-500 mt-5">
              বিকাশ, নগদ, রকেট সহ যে কোনো কার্ডে পেমেন্ট করতে পারবেন।
            </p>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
