import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { useAuth } from "../lib/AuthContext";

export default function Leaderboard() {
  const { userData } = useAuth();
  
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
                <TableHead className="text-center font-bengali font-bold hidden sm:table-cell">Accuracy</TableHead>
                <TableHead className="text-center font-bengali font-bold hidden md:table-cell">Total Exams</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Empty state until real data arrives */}
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-bengali">
                  লিডারবোর্ড তৈরির জন্য পর্যাপ্ত ডেটা নেই।
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Current User Summary Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-900 rounded-[32px] p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Award className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <h4 className="font-bengali font-bold text-xl">আপনার বর্তমান র‍্যাঙ্ক</h4>
            <p className="text-blue-200 text-sm font-bengali">আপনি দারুণ উন্নতি করছেন! চালিয়ে যান।</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Rank</p>
            <p className="font-bold text-3xl font-mono text-secondary">-</p>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div className="text-center">
            <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Points</p>
            <p className="font-bold text-3xl font-mono">{userData?.points || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
