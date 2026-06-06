import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, ChevronRight, ArrowLeft, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const paymentMethods = [
  { 
    id: 'bkash', 
    name: 'বিকাশ (bKash)', 
    sub: 'বিকাশ অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', 
    color: 'text-pink-600', 
    bg: 'bg-pink-50', 
    brandColor: 'bg-[#e2136e]',
    textColor: 'text-white',
    hoverBorder: 'hover:border-pink-300', 
    ring: 'ring-pink-100', 
    dot: 'border-pink-500', 
    logo: 'https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png',
    number: '01887350503',
    typeText: 'মার্চেন্ট পেমেন্ট',
  },
  { 
    id: 'nagad', 
    name: 'নগদ (Nagad)', 
    sub: 'নগদ অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', 
    color: 'text-orange-500', 
    bg: 'bg-orange-50', 
    brandColor: 'bg-[#f74622]',
    textColor: 'text-white',
    hoverBorder: 'hover:border-orange-300', 
    ring: 'ring-orange-100', 
    dot: 'border-orange-500', 
    logo: 'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png',
    number: '01309154780',
    typeText: 'সেন্ড মানি (Send Money)',
  },
  { 
    id: 'rocket', 
    name: 'রকেট (Rocket)', 
    sub: 'রকেট অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', 
    color: 'text-purple-700', 
    bg: 'bg-purple-50', 
    brandColor: 'bg-[#8c2e8c]',
    textColor: 'text-white',
    hoverBorder: 'hover:border-purple-300', 
    ring: 'ring-purple-100', 
    dot: 'border-purple-600', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Rocket_logo_DBBL.svg/512px-Rocket_logo_DBBL.svg.png',
    number: '01309154780',
    typeText: 'সেন্ড মানি (Send Money)',
  },
  { 
    id: 'upay', 
    name: 'উপায় (Upay)', 
    sub: 'উপায় অ্যাকাউণ্ট দিয়ে পেমেন্ট করুন', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    brandColor: 'bg-[#00529b]',
    textColor: 'text-white',
    hoverBorder: 'hover:border-blue-300', 
    ring: 'ring-[#00529b]/20', 
    dot: 'border-blue-500', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Upay_logo.svg/512px-Upay_logo.svg.png',
    number: '01309154780',
    typeText: 'সেন্ড মানি (Send Money)',
  },
];

export default function MockPaymentPortal() {
  const { userData } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get('amount') || '0';
  const successUrl = searchParams.get('successUrl') || '/';
  const cancelUrl = searchParams.get('cancelUrl') || '/';
  const txnId = searchParams.get('txnId') || 'MOCK_TXN';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('bkash');
  const [step, setStep] = useState<'select' | 'details' | 'processing' | 'success'>('select');
  const [paymentRef, setPaymentRef] = useState('');
  const [walletError, setWalletError] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const currentBrand = paymentMethods.find(m => m.id === selectedMethod) || paymentMethods[0];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentBrand.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextStep = () => {
    if (!selectedMethod) return;
    setWalletError('');
    setStep('details');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletError('');

    const rawRef = paymentRef.trim();

    if (!rawRef) {
      setWalletError('দয়া করে আপনার পেমেন্টকৃত মোবাইল নম্বরের শেষ ৪ ডিজিট অথবা ট্রানজেকশন আইডি (TrxID) লিখুন');
      return;
    }
    if (rawRef.length < 4) {
      setWalletError('পেমেন্ট রেফারেন্স অবশ্যই কমপক্ষে ৪ সংখ্যার বা অক্ষরের হতে হবে (যেমন: ৪৭৮০ অথবা TR8A7BD9)');
      return;
    }

    // Convert Bengali digits to English
    let normalizedRef = rawRef.replace(/[০-৯]/g, (match) => 
      ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"].indexOf(match).toString()
    );

    const isLast4 = /^[0-9]{4}$/.test(normalizedRef);

    setStep('processing');
    setIsProcessing(true);
    
    try {
      const pendingTxnStr = sessionStorage.getItem('eps_pending_txn');
      let planDetails = { plan: 'unknown', days: undefined, txnId: txnId };
      if (pendingTxnStr) {
        try {
          const parsed = JSON.parse(pendingTxnStr);
          if (parsed.txnId === txnId) {
            planDetails = parsed;
          }
        } catch(e) {
          console.error(e);
        }
      }

      // We do not await this write to network to prevent blocking the user on slow networks.
      // Firestore client local cache handles this optimistic/offline persist instantly!
      setDoc(doc(db, "payment_requests", txnId), {
        uid: userData?.uid || searchParams.get('uid') || '',
        email: userData?.email || '',
        fullName: userData?.fullName || '',
        className: userData?.class || '',
        method: selectedMethod,
        walletNumber: normalizedRef,
        last4Digits: isLast4 ? normalizedRef : '',
        trxId: isLast4 ? '' : normalizedRef,
        amount: parseFloat(amount) || 0,
        plan: planDetails.plan,
        days: planDetails.days || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      }).catch((firebaseErr) => {
        console.error("Background setDoc failed:", firebaseErr);
      });

      setTimeout(() => {
        setIsProcessing(false);
        setStep('success');
      }, 500);
    } catch (err: any) {
      console.error(err);
      setWalletError('পেমেন্ট রিকোয়েস্ট সংরক্ষণ করতে ব্যর্থ হয়েছে: ' + err.message);
      setIsProcessing(false);
      setStep('details');
    }
  };

  const handleCompleteSuccess = () => {
    sessionStorage.removeItem('eps_pending_txn');
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/subscription');
  };

  // Dynamic dynamic styles for the Merchant Number Banner
  const bannerBg = 
    currentBrand.id === 'bkash' ? 'bg-[#e2136e]/5 border-[#e2136e]/20 text-[#e2136e]' :
    currentBrand.id === 'nagad' ? 'bg-[#f74622]/5 border-[#f74622]/20 text-[#f74622]' :
    currentBrand.id === 'rocket' ? 'bg-[#8c2e8c]/5 border-[#8c2e8c]/20 text-[#8c2e8c]' :
    'bg-[#00529b]/5 border-[#00529b]/15 text-[#00529b]';

  const bannerBadge = 
    currentBrand.id === 'bkash' ? 'bg-[#e2136e] text-white' :
    currentBrand.id === 'nagad' ? 'bg-[#f74622] text-white' :
    currentBrand.id === 'rocket' ? 'bg-[#8c2e8c] text-white' :
    'bg-[#00529b] text-white';

  const copyButtonStyles =
    currentBrand.id === 'bkash' ? 'bg-[#e2136e]/10 text-[#e2136e] hover:bg-[#e2136e]/20 border-[#e2136e]/20' :
    currentBrand.id === 'nagad' ? 'bg-[#f74622]/10 text-[#f74622] hover:bg-[#f74622]/20 border-[#f74622]/20' :
    currentBrand.id === 'rocket' ? 'bg-[#8c2e8c]/10 text-[#8c2e8c] hover:bg-[#8c2e8c]/20 border-[#8c2e8c]/20' :
    'bg-[#00529b]/10 text-[#00529b] hover:bg-[#00529b]/20 border-[#00529b]/25';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl overflow-hidden border border-slate-100 transition-all duration-300">
        
        {step === 'select' && (
          <>
            {/* Header */}
            <div className="bg-slate-900 p-6 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bengali font-bold text-white leading-tight">পেমেন্ট গেটওয়ে</h1>
              <p className="text-slate-400 text-xs mt-1">সুরক্ষিত উপায়ে পেমেন্ট করুন</p>
            </div>

            {/* Bill Info */}
            <div className="p-6 pb-0">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-500 font-bengali font-medium">মোট বিল (Total Payable)</span>
                <span className="text-2xl font-bold text-slate-900 font-sans">৳ {amount}</span>
              </div>
            </div>

            {/* Methods list */}
            <div className="p-6 space-y-3">
              <p className="text-sm font-semibold text-slate-700 font-bengali mb-1">পেমেন্ট পদ্ধতি নির্বাচন করুন:</p>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`relative w-full py-4 px-2 bg-transparent transition-all flex items-center text-left border-b border-slate-100/80 last:border-b-0 ${
                        isSelected ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'
                      }`}
                    >
                      <div className="mr-3 shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-slate-800' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />}
                        </div>
                      </div>
                      
                      <div className="flex-1 flex items-center min-w-0">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center shrink-0 mr-3 p-1.5 overflow-hidden">
                          {imageErrors[method.id] ? (
                            <div className={`w-full h-full rounded-lg flex items-center justify-center font-bengali font-extrabold text-[11px] ${method.brandColor} ${method.textColor}`}>
                              {method.id === 'upay' ? 'উপায়' : method.name.split(' ')[0]}
                            </div>
                          ) : (
                            <img 
                              src={method.logo} 
                              alt={method.name} 
                              className="w-full h-full object-contain" 
                              onError={() => setImageErrors(prev => ({ ...prev, [method.id]: true }))}
                            />
                          )}
                        </div>
                        <div className="truncate">
                          <h3 className="font-bengali font-bold text-slate-800 text-sm">{method.name}</h3>
                          <p className="font-bengali text-slate-500 text-xs truncate">{method.sub}</p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={handleNextStep} 
                  disabled={!selectedMethod}
                  className="w-full h-12 rounded-xl font-bengali text-base bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2"
                >
                  পরবর্তী ধাপে যান <ChevronRight className="w-4 h-4" />
                </Button>

                <button 
                  onClick={handleCancel}
                  type="button"
                  className="w-full py-2.5 text-center font-bengali text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  বাতিল করুন (Cancel)
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'details' && (
          <form onSubmit={handlePay} className="transition-all duration-300">
            {/* Custom Brand Header */}
            <div className={`${currentBrand.brandColor} p-6 pb-8 text-center text-white relative`}>
              <button 
                type="button" 
                onClick={() => setStep('select')}
                className="absolute left-4 top-5 p-1 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors animate-fade-in"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center mb-3 p-2 shadow-md overflow-hidden">
                {imageErrors[currentBrand.id] ? (
                  <div className={`w-full h-full rounded-xl flex items-center justify-center font-bengali font-extrabold text-xs ${currentBrand.brandColor} ${currentBrand.textColor}`}>
                    {currentBrand.id === 'upay' ? 'উপায়' : currentBrand.name.split(' ')[0]}
                  </div>
                ) : (
                  <img 
                    src={currentBrand.logo} 
                    alt={currentBrand.name} 
                    className="w-full h-full object-contain" 
                    onError={() => setImageErrors(prev => ({ ...prev, [currentBrand.id]: true }))}
                  />
                )}
              </div>
              <h2 className="text-xl font-bengali font-black tracking-wide">{currentBrand.name} দিয়ে পেমেন্ট করুন</h2>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs backdrop-blur-xs font-bengali font-normal">
                <span>পেমেন্ট পরিমাণ:</span> <strong className="font-sans text-sm">৳ {amount}</strong>
              </div>
            </div>

            {/* Content / Steps & Inputs */}
            <div className="p-6 space-y-5">
              {/* Steps Area styled like the banner layout carefully */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex flex-col items-center text-center">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-xs">১</span>
                    <span className="text-[10px] font-bengali text-slate-600 leading-tight">
                      {currentBrand.id === 'bkash' ? 'bKash' : currentBrand.name.split(' ')[0]} অ্যাপ খুলুন
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex flex-col items-center text-center">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-xs">২</span>
                    <span className="text-[10px] font-bengali text-slate-600 leading-tight">
                      {currentBrand.typeText} অপশনটি সিলেক্ট করুন
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 flex flex-col items-center text-center">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-xs">৩</span>
                    <span className="text-[10px] font-bengali text-slate-600 leading-tight">
                      নিচের নম্বরটি দিন এবং পেমেন্ট করুন
                    </span>
                  </div>
                </div>
              </div>

              {/* Big Merchant Number Banner - Redesigned to be extremely beautiful with matching brand colors */}
              <div className={`rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs border transition-colors ${bannerBg}`}>
                <div className="text-center sm:text-left">
                  <span className={`text-[10px] font-bengali uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block font-semibold ${bannerBadge}`}>
                    {currentBrand.id === 'bkash' ? 'মার্চেন্ট নম্বর (Merchant)' : 'পার্সোনাল নম্বর (Send Money)'}
                  </span>
                  <div className="text-2xl font-black font-sans tracking-widest mt-1.5 select-all text-slate-900">
                    {currentBrand.number}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bengali font-bold transition-all border ${copyButtonStyles}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> নম্বর কপি করুন
                    </>
                  )}
                </button>
              </div>

              {walletError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-bengali flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{walletError}</span>
                </div>
              )}

              {/* Inputs Area */}
              <div className="space-y-4 pt-1.5 border-t border-slate-100">
                <div className="bg-amber-50/70 border border-amber-100/60 rounded-2xl p-4 text-xs text-amber-800 font-bengali leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1 text-amber-900">
                    💡 পেমেন্ট সম্পন্ন করার নিয়মাবলি:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 mt-1 text-emerald-950">
                    <li>
                      আপনার {currentBrand.name.split(' ')[0]} অ্যাপ অথবা ডায়াল কোড ব্যবহার করে <strong className="font-bold">"{currentBrand.typeText}"</strong> অপশনে গিয়ে উপরে দেওয়া নম্বরটিতে সঠিক পরিমাণ টাকা পেমেন্ট/সেন্ড করুন।
                    </li>
                    <li>
                      পেমেন্ট সফল হলে আপনার ব্যবহৃত <strong className="font-bold">মোবাইল নম্বরের শেষ ৪ ডিজিট অথবা সম্পূর্ণ TrxID</strong> নিচে ইনপুট করে ভেরিফাই করুন।
                    </li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="paymentRef" className="block text-sm font-bold text-slate-700 font-bengali text-center sm:text-left">
                      মোবাইল নম্বরের শেষ ৪ ডিজিট অথবা TrxID (যেমন: ৪৭৮০ অথবা TR8A7BD9)
                    </label>
                    <input 
                      id="paymentRef"
                      type="text"
                      maxLength={24}
                      placeholder="শেষ ৪ ডিজিট অথবা সম্পূর্ণ TrxID লিখুন"
                      value={paymentRef}
                      onChange={(e) => {
                        let val = e.target.value;
                        val = val.replace(/[^a-zA-Z0-9০-৯]/g, '');
                        setPaymentRef(val);
                      }}
                      required
                      className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 px-4 font-sans text-center text-lg font-bold tracking-widest text-slate-900 shadow-xs focus:ring-1 focus:ring-slate-800/20 outline-none transition-all placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Verification & Cancel button */}
              <div className="pt-2 space-y-3">
                <Button 
                  type="submit"
                  className={`w-full h-12 rounded-2xl font-bengali text-base font-bold shadow-md text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    currentBrand.id === 'bkash' ? 'bg-[#e2136e] hover:bg-[#c20d5c]' :
                    currentBrand.id === 'nagad' ? 'bg-[#f74622] hover:bg-[#db3512]' :
                    currentBrand.id === 'rocket' ? 'bg-[#8c2e8c] hover:bg-[#702170]' :
                    'bg-[#00529b] hover:bg-[#003f77]'
                  }`}
                >
                  পেমেন্ট ভেরিফাই করুন (Verify)
                </Button>

                <button 
                  onClick={() => setStep('select')}
                  type="button"
                  className="w-full py-2 text-center font-bengali text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ফিরে যান (Back)
                </button>
              </div>
            </div>
          </form>
        )}


        {step === 'processing' && (
          <div className="p-8 py-16 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-pulse" />
              <Loader2 className={`w-16 h-16 animate-spin ${
                selectedMethod === 'bkash' ? 'text-[#e2136e]' :
                selectedMethod === 'nagad' ? 'text-[#f74622]' :
                selectedMethod === 'rocket' ? 'text-[#8c2e8c]' :
                'text-[#00529b]'
              }`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold font-bengali text-slate-800 animate-pulse">পেমেন্ট ভেরিফাই করা হচ্ছে...</h3>
              <p className="text-slate-500 font-bengali text-xs max-w-xs mx-auto leading-relaxed">
                দয়া করে অপেক্ষা করুন, আপনার পেমেন্ট ইনফরমেশনটি সিস্টেমে যুক্ত করা হচ্ছে। এই উইন্ডোটি বন্ধ করবেন না।
              </p>
            </div>

            <div className="pt-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest font-sans">
              TRANSACTION ID: {txnId}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 text-center space-y-6 animate-fade-in transition-all">
            {/* Custom Brand Header for success */}
            <div className="pt-6 pb-2">
              <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-emerald-150 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bengali font-black text-slate-800 tracking-wide">পেমেন্ট রিকোয়েস্ট সাবমিট হয়েছে!</h2>
              <p className="text-slate-400 text-xs mt-1 uppercase font-sans tracking-wider">Transaction Status: Pending Verification</p>
            </div>

            {/* Content / Info Card */}
            <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-3xl p-5 text-left space-y-4">
              <h4 className="font-bengali font-bold text-slate-800 text-sm flex items-center gap-1.5">
                🎯 পেমেন্ট সংক্রান্ত তথ্য:
              </h4>
              <div className="space-y-2.5 font-bengali text-xs text-slate-600 leading-relaxed">
                <p>
                  আপনার পেমেন্ট ভেরিফিকেশন রিকোয়েস্টটি সফলভাবে সিস্টেমে গ্রহণ করা হয়েছে। 
                </p>
                <p className="bg-white p-3 rounded-xl border border-emerald-100 text-slate-800">
                  ⚡️ আগামী <strong className="text-emerald-600 font-extrabold text-sm">২০ মিনিটের মধ্যে</strong> আপনার পেমেন্টটি যাচাই সম্পন্ন করে আপনাকে নিশ্চিতকরণ মেসেজের (SMS) মাধ্যমে জানিয়ে দেওয়া হবে।
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  শিক্ষাঙ্গন (Shikkhangon) পরিবারের সাথে থাকার জন্য আপনাকে এবং আপনার শুভকামনাকে আন্তরিক ধন্যবাদ!
                </p>
              </div>
            </div>

            {/* action buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleCompleteSuccess}
                className="w-full h-12 rounded-2xl font-bengali text-base font-bold bg-slate-950 hover:bg-slate-900 text-white shadow-lg shadow-slate-950/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                ড্যাশবোর্ডে ফিরে যান (Return Home)
              </Button>

              <div className="text-slate-400 font-bengali text-[10px]">
                Transaction Ref: <span className="font-sans font-semibold text-slate-600">{txnId}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
