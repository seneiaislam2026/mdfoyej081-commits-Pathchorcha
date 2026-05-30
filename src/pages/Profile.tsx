import { UserCircle, Award, Target, BookOpen, Clock, Activity, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();

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
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">০%</Badge>
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
                <p className="text-3xl font-bold font-mono mb-1">০</p>
                <p className="text-sm text-muted-foreground font-bengali">প্রশ্ন সমাধান</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Clock className="w-8 h-8 text-green-500 mb-3" />
                <p className="text-3xl font-bold font-mono mb-1">০</p>
                <p className="text-sm text-muted-foreground font-bengali">মোট এক্সাম</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Activity className="w-8 h-8 text-orange-500 mb-3" />
                <p className="text-3xl font-bold font-mono mb-1">০%</p>
                <p className="text-sm text-muted-foreground font-bengali">গড় নম্বর</p>
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
        </div>
      </div>
    </div>
  );
}
