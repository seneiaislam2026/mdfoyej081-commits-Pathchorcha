import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center max-w-md w-full bg-card p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bengali font-bold text-foreground mb-4">পেমেন্ট ব্যর্থ হয়েছে</h2>
          <p className="text-muted-foreground font-bengali mb-8">
            আপনার পেমেন্টটি সফল হয়নি। কোনো টেকনিকাল সমস্যার কারণে এমনটি হতে পারে।
          </p>
          <Button onClick={() => navigate("/subscription")} className="w-full h-14 rounded-2xl text-lg font-bengali">
            আবার চেষ্টা করুন
          </Button>
      </div>
    </div>
  );
}
