import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function PaymentButton({ plan, amount, days }: { plan: string, amount: number, days?: number }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { userData } = useAuth();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      const merchantTransactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const customerOrderId = `ORD-${Date.now()}`;
      
      // Send required payload to Netlify Function (or Express Route in our Preview environment)
      const payload = {
        merchantTransactionId,
        customerOrderId,
        totalAmount: amount,
        successUrl: `${window.location.origin}/payment-success?txnId=${merchantTransactionId}`,
        failUrl: `${window.location.origin}/payment-fail`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
        customerName: userData?.fullName || "Student",
        customerEmail: userData?.email || "student@example.com",
        customerPhone: "01700000000",
        productName: `Pathchorcha ${plan} Subscription`,
      };

      const response = await fetch('/.netlify/functions/createPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.RedirectURL) {
         // Store transaction locally so we can verify the status after redirect
         sessionStorage.setItem('eps_pending_txn', JSON.stringify({
            txnId: merchantTransactionId,
            plan,
            days
         }));
         
         window.location.href = data.data.RedirectURL;
      } else {
         alert("Payment initialization failed. Server responded: " + JSON.stringify(data.error));
      }
    } catch (err: any) {
      console.error(err);
      alert("Error initializing payment: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      size="lg"
      className="w-full h-16 rounded-[24px] font-bengali font-bold text-xl bg-gradient-to-r from-[#ffa726] to-[#e65100] hover:from-[#f57c00] hover:to-[#d84315] text-white shadow-[0_8px_30px_rgb(255,167,38,0.3)] transition-all transform hover:-translate-y-1"
      onClick={handlePayment}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> প্রসেসিং হচ্ছে...</span>
      ) : (
        "পেমেন্ট করুন (EPS)"
      )}
    </Button>
  );
}
