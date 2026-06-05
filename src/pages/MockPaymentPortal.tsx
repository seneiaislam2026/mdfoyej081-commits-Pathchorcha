import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';

const paymentMethods = [
  { id: 'bkash', name: 'বিকাশ', sub: 'বিকাশ অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', color: 'text-pink-600', bg: 'bg-pink-50', hoverBorder: 'hover:border-pink-300', ring: 'ring-pink-100', dot: 'border-pink-500', logo: 'https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png' },
  { id: 'nagad', name: 'নগদ', sub: 'নগদ অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', color: 'text-orange-500', bg: 'bg-orange-50', hoverBorder: 'hover:border-orange-300', ring: 'ring-orange-100', dot: 'border-orange-500', logo: 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png' },
  { id: 'rocket', name: 'রকেট', sub: 'রকেট অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', color: 'text-purple-700', bg: 'bg-purple-50', hoverBorder: 'hover:border-purple-300', ring: 'ring-purple-100', dot: 'border-purple-600', logo: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png' },
  { id: 'upay', name: 'উপায়', sub: 'উপায় অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', color: 'text-blue-600', bg: 'bg-blue-50', hoverBorder: 'hover:border-blue-300', ring: 'ring-blue-100', dot: 'border-blue-500', logo: 'https://seeklogo.com/images/U/upay-logo-2882A2E2A8-seeklogo.com.png' },
];

export default function MockPaymentPortal() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  const successUrl = searchParams.get('successUrl') || '/';
  const cancelUrl = searchParams.get('cancelUrl') || '/';
  const txnId = searchParams.get('txnId') || 'MOCK_TXN';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>('bkash');

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
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-6 text-center lg:py-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bengali font-bold text-white mb-1">শিক্ষাঙ্গন পেমেন্ট গেটওয়ে</h1>
          <p className="text-slate-400 text-sm">নিরাপদ পেমেন্ট পরিবেশ</p>
        </div>
        
        <div className="p-6 lg:p-10">
          <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 flex justify-between items-center text-center max-w-sm mx-auto">
            <span className="text-slate-500 font-bengali text-lg">মোট বিল (Total)</span>
            <span className="text-3xl font-bold text-slate-800 font-sans">৳ {amount}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {paymentMethods.map((method) => {
               const isSelected = selectedMethod === method.id;
               return (
                 <button
                   key={method.id}
                   onClick={() => setSelectedMethod(method.id)}
                   className={`relative w-full p-4 rounded-3xl border-2 transition-all flex items-center text-left ${
                     isSelected 
                       ? `border-${method.color.split('-')[1]}-500 ${method.bg} shadow-md` 
                       : `border-slate-100 bg-white hover:bg-slate-50 ${method.hoverBorder}`
                   }`}
                 >
                   <div className="mr-4 pl-2 shrink-0">
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? method.dot : 'border-slate-300'}`}>
                         {isSelected && <div className={`w-2.5 h-2.5 rounded-full bg-current ${method.color}`} />}
                     </div>
                   </div>
                   
                   <div className="flex-1 flex items-center">
                     <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 mr-4 p-2">
                       <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                     </div>
                     <div>
                       <h3 className="font-bengali font-bold text-slate-800 text-lg">{method.name}</h3>
                       <p className="font-bengali text-slate-500 text-sm">{method.sub}</p>
                     </div>
                   </div>

                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-2 ${isSelected ? 'bg-white shadow-sm' : method.bg}`}>
                     <ChevronRight className={`w-5 h-5 ${method.color}`} />
                   </div>
                 </button>
               )
            })}
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <Button 
              onClick={handlePay} 
              disabled={isProcessing || !selectedMethod}
              className="w-full h-14 rounded-2xl font-bengali text-lg bg-green-600 hover:bg-green-700 shadow-md"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "পেমেন্ট সম্পন্ন করুন"}
            </Button>

            <Button 
              onClick={handleCancel}
              disabled={isProcessing}
              variant="ghost" 
              className="w-full h-14 rounded-2xl font-bengali text-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              বাতিল করুন (Cancel)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 