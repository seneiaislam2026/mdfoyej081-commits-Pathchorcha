import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard, ShieldCheck, Smartphone, Loader2 } from 'lucide-react';

export default function MockPaymentPortal() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  const successUrl = searchParams.get('successUrl') || '/';
  const cancelUrl = searchParams.get('cancelUrl') || '/';
  const txnId = searchParams.get('txnId') || 'MOCK_TXN';
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const separator = successUrl.includes('?') ? '&' : '?';
      window.location.href = successUrl + separator + 'merchantTransactionId=' + txnId;
    }, 2000);
  };

  const handleCancel = () => {
    window.location.href = cancelUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-6 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bengali font-bold text-white mb-1">EPS Payment Gateway</h1>
          <p className="text-slate-400 text-sm">Sandbox / Test Environment</p>
        </div>
        
        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex justify-between items-center">
            <span className="text-slate-500 font-bengali">Total</span>
            <span className="text-2xl font-bold text-slate-800">Tk {amount}</span>
          </div>

          <div className="space-y-3 mb-8">
            <Button variant="outline" className="w-full h-14 justify-start px-4 text-left font-bengali text-lg border-slate-200">
              <Smartphone className="w-5 h-5 mr-3 text-pink-500" />
              Mobile Banking
            </Button>
            <Button variant="outline" className="w-full h-14 justify-start px-4 text-left font-bengali text-lg border-slate-200">
              <CreditCard className="w-5 h-5 mr-3 text-blue-500" />
              Card (Visa / Mastercard)
            </Button>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handlePay} 
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl font-bengali text-lg bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Payment (Test Success)"}
            </Button>

            <Button 
              onClick={handleCancel}
              disabled={isProcessing}
              variant="ghost" 
              className="w-full h-14 rounded-2xl font-bengali text-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 