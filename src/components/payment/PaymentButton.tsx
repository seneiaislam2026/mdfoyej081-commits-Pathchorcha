import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PaymentButton({ plan, amount, days }: { plan: string, amount: number, days?: number }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      const merchantTransactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      sessionStorage.setItem('eps_pending_txn', JSON.stringify({
          txnId: merchantTransactionId,
          plan,
          days
      }));
      
      const successUrl = encodeURIComponent(`${window.location.origin}/payment-success?txnId=${merchantTransactionId}`);
      const cancelUrl = encodeURIComponent(`${window.location.origin}/payment-cancel`);
      
      navigate(`/mock-payment?amount=${amount}&uid=${userData?.uid || ''}&txnId=${merchantTransactionId}&successUrl=${successUrl}&cancelUrl=${cancelUrl}`);
      
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
        "পেমেন্ট করুন"
      )}
    </Button>
  );
}
