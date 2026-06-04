import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">পেমেন্ট বাতিল করা হয়েছে</h2>
          <p className="text-slate-600 font-bengali mb-8">
            আপনি পেমেন্ট প্রক্রিয়াটি বাতিল করেছেন।
          </p>
          <Button onClick={() => navigate("/subscription")} className="w-full h-14 rounded-2xl text-lg font-bengali bg-slate-900 hover:bg-slate-800">
            পেছনে ফিরে যান
          </Button>
      </div>
    </div>
  );
}
