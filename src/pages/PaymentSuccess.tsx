import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../lib/AuthContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    verifyTransaction();
  }, []);

  useEffect(() => {
    if (status === 'success') {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }
  }, [status]);

  const verifyTransaction = async () => {
    try {
      const pendingTxnStr = sessionStorage.getItem('eps_pending_txn');
      if (!pendingTxnStr) {
         setStatus('failed');
         setErrorMsg('No pending transaction found in session.');
         return;
      }

      const pendingTxn = JSON.parse(pendingTxnStr);
      const urlTxnId = searchParams.get('txnId') || searchParams.get('merchantTransactionId');

      if (!pendingTxn.txnId && !urlTxnId) {
         setStatus('failed');
         setErrorMsg('Invalid Transaction ID returned.');
         return;
      }
      
      const txnIdToVerify = pendingTxn.txnId || urlTxnId;

      // Mock verification for mock payment portal
      setTimeout(async () => {
         await grantProAccess(pendingTxn.plan, pendingTxn.days);
         sessionStorage.removeItem('eps_pending_txn');
         setStatus('success');
      }, 1000);
    } catch (err: any) {
       console.error("Verification error:", err);
       setStatus('failed');
       setErrorMsg(err.message);
    }
  };

  const grantProAccess = async (plan: string, customDays?: number) => {
      if (!userData?.uid) return;
      
      let durationDays = 30;
      if (plan === "3-months") durationDays = 90;
      else if (plan === "6-months") durationDays = 180;
      else if (plan === "custom" && customDays) durationDays = customDays;
      
      const proUntilMillis = Date.now() + durationDays * 24 * 60 * 60 * 1000;
      
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        isPro: true,
        proUntil: Timestamp.fromMillis(proUntilMillis)
      });
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
       {status === 'verifying' && (
         <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-bengali font-bold text-slate-800">পেমেন্ট ভেরিফাই করা হচ্ছে...</h2>
            <p className="text-slate-500 font-bengali mt-2">দয়া করে অপেক্ষা করুন</p>
         </div>
       )}

       {status === 'success' && (
         <div className="flex flex-col items-center max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
               <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">পেমেন্ট সফল!</h2>
            <p className="text-slate-600 font-bengali mb-8">
               আপনার প্রো সাবস্ক্রিপশন সফলভাবে এক্টিভ হয়েছে। অভিনন্দন!
            </p>
            <Button onClick={() => window.location.href = "/dashboard"} className="w-full h-14 rounded-2xl text-lg font-bengali bg-slate-900 hover:bg-slate-800">
               ড্যাশবোর্ডে যান
            </Button>
         </div>
       )}

       {status === 'failed' && (
         <div className="flex flex-col items-center max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
               <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">পেমেন্ট ব্যর্থ</h2>
            <p className="text-slate-600 font-bengali mb-8">
               ভেরিফিকেশন ব্যর্থ হয়েছে। {errorMsg}
            </p>
            <Button onClick={() => navigate("/subscription")} className="w-full h-14 rounded-2xl text-lg font-bengali">
               আবার চেষ্টা করুন
            </Button>
         </div>
       )}
    </div>
  );
}
