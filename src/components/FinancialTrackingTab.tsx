import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, PlusCircle, PieChart } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function FinancialTrackingTab() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const q = query(collection(db, "finance_records"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(data);
    });
    return () => unsubscribe();
  }, []);

  const translateBanglaDigits = (str: string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (d) => String(banglaDigits.indexOf(d)));
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!amount || !category || !date) {
      alert("অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }
    
    setLoading(true);
    try {
      const sanitizedAmountStr = translateBanglaDigits(amount.trim());
      const parsedAmount = parseFloat(sanitizedAmountStr);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert("অনুগ্রহ করে একটি সঠিক পরিমাণ (সংখ্যা) প্রদান করুন।");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "finance_records"), {
        amount: parsedAmount,
        type,
        category: category.trim(),
        date,
        createdAt: serverTimestamp()
      });
      setAmount("");
      setCategory("");
      alert("রেকর্ডটি সফলভাবে যুক্ত করা হয়েছে!");
    } catch (err: any) {
      console.error(err);
      alert("রেকর্ড যুক্ত করতে ব্যর্থ হয়েছে: " + (err.message || err));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছতে চান?")) {
      await deleteDoc(doc(db, "finance_records", id));
    }
  };

  // Calculate totals robustly to avoid any NaN or crashed outputs
  const totalIncome = records
    .filter(r => r.type === "income")
    .reduce((acc, curr) => acc + (typeof curr.amount === "number" && !isNaN(curr.amount) ? curr.amount : 0), 0);
  const totalExpense = records
    .filter(r => r.type === "expense")
    .reduce((acc, curr) => acc + (typeof curr.amount === "number" && !isNaN(curr.amount) ? curr.amount : 0), 0);
  const balance = totalIncome - totalExpense;

  // Group by month for chart
  const monthlyData = records.reduce((acc, curr) => {
    const month = curr.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0, balance: 0 };
    if (curr.type === "income") {
      acc[month].income += curr.amount;
      acc[month].balance += curr.amount;
    } else {
      acc[month].expense += curr.amount;
      acc[month].balance -= curr.amount;
    }
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Generate Insights
  const profitMargin = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0.0";
  let insightMessage = "";
  let insightIcon = <AlertCircle className="w-6 h-6" />;
  let alertClasses = "bg-blue-50 border-blue-200 text-blue-800";

  if (totalExpense > totalIncome && totalIncome > 0) {
    insightMessage = "সতর্কতা: আপনার ব্যয় আয়ের চেয়ে উল্লেখযোগ্যভাবে বেশি। অবিলম্বে আপনার খরচ কমানোর পদক্ষেপ নিতে হবে এবং আয় বাড়ানোর জন্য মার্কেটিং বা নতুন কোর্সে ফোকাস করা উচিত।";
    alertClasses = "bg-red-50 border-red-200 text-red-800";
    insightIcon = <AlertCircle className="w-6 h-6 text-red-600" />;
  } else if (totalExpense > totalIncome * 0.7 && totalIncome > 0) {
    insightMessage = `সতর্কতা: আপনার খরচের হার আয়ের ৭০% এর বেশি (${(totalExpense/totalIncome*100).toFixed(1)}%)। অতিরিক্ত খরচ কমানোর সুযোগ থাকলে তা বাস্তবায়ন করুন অথবা ব্যবহারকারী বাড়িয়ে আয় বৃদ্ধির দিকে নজর দিন।`;
    alertClasses = "bg-amber-50 border-amber-200 text-amber-800";
    insightIcon = <AlertCircle className="w-6 h-6 text-amber-600" />;
  } else if (totalIncome > 0) {
    insightMessage = `দুর্দান্ত অবস্থা! আপনার আর্থিক স্থিতি অনেক মজবুত। বর্তমান প্রফিট মার্জিন ${profitMargin}%। আপনার ব্যয়ের হার নিয়ন্ত্রণে রয়েছে, প্রফিট আরও বাড়াতে এই ধারা অব্যাহত রাখুন।`;
    alertClasses = "bg-emerald-50 border-emerald-200 text-emerald-800";
    insightIcon = <TrendingUp className="w-6 h-6 text-emerald-600" />;
  } else {
    insightMessage = "এখনো কোনো আয়ের রেকর্ড নেই। আপনার আয় ও ব্যয়ের হিসাব যুক্ত করা শুরু করুন।";
    alertClasses = "bg-muted border-slate-200 text-foreground";
    insightIcon = <Activity className="w-6 h-6 text-muted-foreground" />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bengali font-bold text-foreground flex items-center gap-2">
          <PieChart className="w-8 h-8 text-indigo-600" />
          আয়-ব্যয় ট্র্যাকিং ও এনালাইসিস
        </h2>
        <p className="text-slate-500 font-bengali">আপনার প্ল্যাটফর্মের প্রতিদিনের আয় ও ব্যয় ট্র্যাক করুন এবং আর্থিক গ্রোথ বিশ্লেষণ করুন।</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bengali font-medium text-emerald-600 mb-1">সর্বমোট আয় (Revenue)</p>
                <h3 className="text-3xl font-bold text-emerald-700 flex items-center">
                  <span className="font-sans mr-1">৳</span> {totalIncome.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bengali font-medium text-red-600 mb-1">সর্বমোট ব্যয় (Expense)</p>
                <h3 className="text-3xl font-bold text-red-700 flex items-center">
                  <span className="font-sans mr-1">৳</span> {totalExpense.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border shadow-sm ${balance >= 0 ? "border-indigo-200 bg-indigo-50/50" : "border-orange-200 bg-orange-50/50"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-bengali font-medium mb-1 ${balance >= 0 ? "text-indigo-600" : "text-orange-600"}`}>
                  বর্তমান ব্যালেন্স (Profit)
                </p>
                <h3 className={`text-3xl font-bold flex items-center ${balance >= 0 ? "text-indigo-700" : "text-orange-700"}`}>
                  <span className="font-sans mr-1">{balance < 0 ? "-" : ""}৳</span> {Math.abs(balance).toLocaleString()}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${balance >= 0 ? "bg-indigo-100" : "bg-orange-100"}`}>
                <DollarSign className={`w-6 h-6 ${balance >= 0 ? "text-indigo-600" : "text-orange-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Alert */}
      <div className={`p-5 rounded-xl border flex items-start gap-4 ${alertClasses}`}>
        <div className="shrink-0 mt-0.5">
          {insightIcon}
        </div>
        <div>
          <h4 className="font-bengali font-bold text-lg mb-1 flex items-center gap-2">
            আর্থিক বিশ্লেষণ ও পরামর্শ (Insights)
          </h4>
          <p className="font-bengali leading-relaxed opacity-90">{insightMessage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form and List */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="font-bengali text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-500" /> নতুন রেকর্ড যুক্ত করুন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg">
                  <button 
                    type="button"
                    onClick={() => setType("income")}
                    className={`py-2 px-3 text-sm font-bengali font-bold rounded-md transition-all ${type === "income" ? "bg-card text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    আয় (Income)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType("expense")}
                    className={`py-2 px-3 text-sm font-bengali font-bold rounded-md transition-all ${type === "expense" ? "bg-card text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    ব্যয় (Expense)
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">পরিমাণ (Amount)</label>
                  <Input 
                    type="text" 
                    required 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="e.g. 5000"
                    className="font-mono text-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block flex items-center gap-1 font-bengali">ক্যাটাগরি বা বিবরণ</label>
                  <Input 
                    type="text" 
                    required 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    placeholder={type === "income" ? "e.g. Subscription Sales" : "e.g. Server Cost / Marketing"}
                    className="font-bengali"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">তারিখ (Date)</label>
                  <Input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                  />
                </div>

                <Button type="submit" disabled={loading} className={`w-full font-bengali font-bold ${type === "income" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
                  {loading ? "যুক্ত হচ্ছে..." : (type === "income" ? "আয় যুক্ত করুন" : "ব্যয় যুক্ত করুন")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Graph and Recent List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-bengali text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" /> আয়-ব্যয়ের গ্রাফ (মাসিক)
                </CardTitle>
                <CardDescription className="font-bengali text-sm mt-1">সবুজ লাইন দিয়ে আয় এবং লাল লাইন দিয়ে ব্যয় নির্দেশ করা হয়েছে</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                      <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`৳ ${value}`, '']}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="income" name="আয় (Income)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expense" name="ব্যয় (Expense)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bengali text-sm">
                    পর্যাপ্ত ডেটা নেই
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-muted border-b border-slate-100 py-4">
              <CardTitle className="font-bengali text-lg">সাম্প্রতিক রেকর্ডসমূহ</CardTitle>
            </CardHeader>
            <div className="max-h-[350px] overflow-y-auto">
              {records.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {records.map(record => (
                    <div key={record.id} className="p-4 flex items-center justify-between hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                          {record.type === "income" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bengali font-bold text-foreground">{record.category}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{record.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold font-mono ${record.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                          {record.type === "income" ? "+" : "-"}৳{record.amount.toLocaleString()}
                        </span>
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 font-bengali">
                  কোনো রেকর্ড পাওয়া যায়নি
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
