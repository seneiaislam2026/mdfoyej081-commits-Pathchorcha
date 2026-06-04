import { useEffect, useState } from "react";
import { UserCircle, Award, Target, BookOpen, Clock, Activity, LogOut, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Profile() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [savedNotes, setSavedNotes] = useState<{id: string, title: string, link: string}[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);

  useEffect(() => {
    if (userData?.uid) {
      fetchSavedNotes();
      fetchExamResults();
    }
  }, [userData]);

  const fetchExamResults = async () => {
    if (!userData?.uid) return;
    try {
      const q = query(collection(db, "users", userData.uid, "exam_results"));
      const snap = await getDocs(q);
      const results = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      })).sort((a,b) => a.timestamp - b.timestamp);
      setExamResults(results);
    } catch (e) {
      console.error("Error fetching exam results:", e);
    }
  };

  const fetchSavedNotes = async () => {
    if (!userData?.uid) return;
    try {
      const q = query(collection(db, "users", userData.uid, "saved_notes"));
      const snap = await getDocs(q);
      const notes = snap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        link: doc.data().link,
      }));
      setSavedNotes(notes);
    } catch (e) {
      console.error(e);
    }
  };

  const totalQuestionsSolved = examResults.reduce((acc, curr) => acc + (curr.total || 0) / 10, 0);
  const avgScore = examResults.length > 0 ? (examResults.reduce((acc, curr) => acc + (curr.score / Math.max(curr.total, 1)) * 100, 0) / examResults.length).toFixed(1) : "0";

  const chartData = examResults.map((r, i) => ({
    name: `Ex-${i + 1}`,
    score: Math.round((r.score / Math.max(r.total, 1)) * 100) || 0
  })).slice(-10);
  
  const subjectCounts = examResults.reduce((acc, curr) => {
    const sub = curr.subject === "সকল বিষয়" ? "Mixed" : curr.subject;
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  const pieData = Object.keys(subjectCounts).map((key, index) => ({
    name: key,
    value: subjectCounts[key],
    color: PIE_COLORS[index % PIE_COLORS.length]
  }));

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Profile Header */}
      <div className="bg-white rounded-[32px] shadow-sm border border-muted overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-blue-800 flex justify-end p-6">
           <Button variant="secondary" size="sm" onClick={handleSignOut} className="bg-white/20 hover:bg-white/30 text-white border-none shadow-none font-bengali">
             <LogOut className="w-4 h-4 mr-2" /> লগ আউট
           </Button>
        </div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12 relative">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-md flex items-center justify-center">
              <UserCircle className="w-24 h-24 text-slate-300" />
            </div>
            <div className="text-center sm:text-left flex-1 pb-2">
              <h1 className="text-3xl font-bengali font-bold text-foreground">{userData?.fullName || userData?.email || "নাম জানা যায়নি"}</h1>
              <p className="text-muted-foreground font-bengali">{userData?.institution || "শিক্ষাপ্রতিষ্ঠান যুক্ত করা হয়নি"}</p>
            </div>
            <div className="flex gap-3 pb-2 pt-4 sm:pt-0">
              <Badge variant="secondary" className="bg-primary text-white border-none py-1.5 px-4 text-sm font-bengali hover:bg-primary">
                {userData?.class || "ক্লাস নেই"}
              </Badge>
              <Badge variant="outline" className="border-secondary text-secondary-foreground py-1.5 px-4 text-sm font-medium">
                {userData?.points || 0} Coins
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Quick Stats */}
        <div className="space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-bengali text-lg flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" /> সারাংশ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-muted-foreground font-bengali">লিডারবোর্ড র‍্যাঙ্ক</span>
                <span className="font-bold text-lg text-primary">-</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-muted-foreground font-bengali">অর্জিত ব্যাজ</span>
                <span className="font-bold text-lg">০</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-bengali">নির্ভুলতা</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{avgScore}%</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-secondary/20 shadow-none">
            <CardContent className="p-6 text-center space-y-3">
              <Award className="w-12 h-12 text-secondary mx-auto opacity-50" />
              <h3 className="font-bengali font-bold text-lg text-slate-500">কোনো ব্যাজ নেই</h3>
              <p className="text-sm text-foreground/70 font-bengali">মক টেস্ট দিয়ে ব্যাজ অর্জন করুন।</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Statistics */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="font-bengali font-bold text-xl text-primary border-b pb-2">পারফরম্যান্স অ্যানালিটিক্স</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <BookOpen className="w-8 h-8 text-blue-500 mb-3" />
                <p className="text-3xl font-bold font-mono mb-1">{totalQuestionsSolved}</p>
                <p className="text-sm text-muted-foreground font-bengali">প্রশ্ন সমাধান</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Clock className="w-8 h-8 text-green-500 mb-3" />
                <p className="text-3xl font-bold font-mono mb-1">{examResults.length}</p>
                <p className="text-sm text-muted-foreground font-bengali">মোট এক্সাম</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Activity className="w-8 h-8 text-orange-500 mb-3" />
                <p className="text-3xl font-bold font-mono mb-1">{avgScore}%</p>
                <p className="text-sm text-muted-foreground font-bengali">গড় নম্বর</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="font-bengali text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" /> উন্নতির গ্রাফ (Test Scores)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 h-[250px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value}%`, "স্কোর"]}
                      />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bengali">
                    পর্যাপ্ত ডেটা নেই
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="font-bengali text-lg flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" /> বিষয়ভিত্তিক হার
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 h-[250px] w-full flex items-center justify-center relative">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [value, "পরীক্ষা"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bengali">
                    পর্যাপ্ত ডেটা নেই
                  </div>
                )}
                {/* Custom Legend */}
                {pieData.length > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs font-bengali text-slate-600">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-100 shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="font-bengali text-lg">সাম্প্রতিক কাজ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-slate-500 font-bengali">
                কোনো সাম্প্রতিক কাজ নেই। এক্সাম দেওয়া শুরু করুন!
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="font-bengali text-lg flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                সংরক্ষিত নোটস (Saved)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedNotes.length > 0 ? (
                <div className="grid gap-3 pt-2">
                  {savedNotes.map(note => (
                    <Link key={note.id} to={note.link} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <p className="font-bengali font-bold text-foreground group-hover:text-primary transition-colors">{note.title}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="hidden sm:flex text-primary font-bengali mt-2 sm:mt-0">
                        পড়ুন
                      </Button>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 font-bengali">
                  কোনো নোট সংরক্ষণ করা হয়নি।
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
