import { Trophy, Medal, Award, TrendingUp, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { useAuth } from "../lib/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Leaderboard() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("points", "desc"), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const currentUserIndex = users.findIndex(u => u.id === userData?.uid);
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : "-";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-4 pt-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-secondary to-yellow-600 rounded-full flex items-center justify-center shadow-lg mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <h1 className="text-4xl font-bengali font-bold text-primary">লিডারবোর্ড</h1>
        <p className="text-muted-foreground font-bengali text-lg max-w-2xl mx-auto">
          সেরাদের তালিকায় নিজের অবস্থান দেখুন। প্রতিটি পরীক্ষা আপনাকে লক্ষ্যের এক ধাপ কাছে নিয়ে যাবে।
        </p>
      </div>

      <Card className="rounded-[32px] shadow-sm overflow-hidden border border-muted">
        <CardHeader className="bg-slate-50 border-b p-6">
          <Tabs defaultValue="all-time" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto font-bengali h-12 bg-slate-200/50 rounded-2xl">
              <TabsTrigger value="daily" className="text-base data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">আজকে</TabsTrigger>
              <TabsTrigger value="weekly" className="text-base data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">সাপ্তাহিক</TabsTrigger>
              <TabsTrigger value="monthly" className="text-base data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">মাসিক</TabsTrigger>
              <TabsTrigger value="all-time" className="text-base data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">সর্বোচ্চ</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-24 text-center font-bengali font-bold py-4">Rank</TableHead>
                <TableHead className="font-bengali font-bold">Student Name</TableHead>
                <TableHead className="text-right font-bengali font-bold text-primary">Points</TableHead>
                <TableHead className="text-center font-bengali font-bold hidden sm:table-cell">Exams</TableHead>
                <TableHead className="text-center font-bengali font-bold hidden md:table-cell">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-bengali">
                    লোড হচ্ছে...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-bengali">
                    লিডারবোর্ড তৈরির জন্য পর্যাপ্ত ডেটা নেই।
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u, i) => (
                  <TableRow key={u.id} className={userData?.uid === u.id ? "bg-orange-50/50" : ""}>
                    <TableCell className="text-center">
                      {i === 0 ? <Trophy className="w-6 h-6 text-yellow-500 mx-auto" /> : 
                       i === 1 ? <Medal className="w-6 h-6 text-slate-400 mx-auto" /> : 
                       i === 2 ? <Medal className="w-6 h-6 text-orange-400 mx-auto" /> : 
                       <span className="font-bold font-mono text-slate-500">{i + 1}</span>}
                    </TableCell>
                    <TableCell className="font-bengali">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{u.fullName || "No Name"}</span>
                        {u.isPro && <Crown className="w-4 h-4 text-[#ffa726] drop-shadow-sm" />}
                        {userData?.uid === u.id && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">You</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-orange-600 text-lg">
                      {u.points || 0}
                    </TableCell>
                    <TableCell className="text-center font-mono text-slate-500 hidden sm:table-cell">
                      {u.totalExams || 0}
                    </TableCell>
                    <TableCell className="text-center font-bengali text-slate-500 hidden md:table-cell">
                      {u.class || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Current User Summary Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-900 rounded-[32px] p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full shrink-0">
            <Award className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <h4 className="font-bengali font-bold text-xl">আপনার বর্তমান র‍্যাঙ্ক</h4>
            <p className="text-blue-200 text-sm font-bengali">আপনি দারুণ উন্নতি করছেন! চালিয়ে যান।</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Rank</p>
            <p className="font-bold text-3xl font-mono text-secondary">{currentUserRank}</p>
          </div>
          <div className="w-px h-10 bg-white/20 shrink-0"></div>
          <div className="text-center shrink-0">
            <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Points</p>
            <p className="font-bold text-3xl font-mono">{userData?.points || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
