import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileQuestion, BookOpen, Layers, Target, BarChart, Settings, Plus, Upload, MoreVertical, LogOut, Check, Gift, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
  { id: "students", label: "Students", icon: <Users className="w-5 h-5 mr-3" /> },
  { id: "questions", label: "Questions Management", icon: <FileQuestion className="w-5 h-5 mr-3" /> },
  { id: "subjects", label: "Subjects", icon: <BookOpen className="w-5 h-5 mr-3" /> },
  { id: "chapters", label: "Chapters", icon: <Layers className="w-5 h-5 mr-3" /> },
  { id: "exams", label: "Exams", icon: <Target className="w-5 h-5 mr-3" /> },
  { id: "leaderboard", label: "Leaderboard", icon: <Target className="w-5 h-5 mr-3" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart className="w-5 h-5 mr-3" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5 mr-3" /> },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("students");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "students") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: any[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { isPro: !currentStatus });
      fetchUsers(); // Refresh
    } catch (error) {
      console.error("Error updating pro status:", error);
      alert("Failed to update user.");
    }
  };

  const toggleTutorStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { isTutor: !currentStatus });
      fetchUsers(); // Refresh
    } catch (error) {
      console.error("Error updating tutor status:", error);
      alert("Failed to update user.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] gap-6 -mt-2">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border border-muted rounded-[32px] p-6 shrink-0 flex flex-col shadow-sm">
        <div className="mb-8 p-2">
          <h2 className="text-xl font-bold text-primary font-bengali">এডমিন প্যানেল</h2>
          <p className="text-xs text-muted-foreground mt-1">PathCharcha Admin v1.0</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="pt-8 mt-auto">
          <Button 
            onClick={() => navigate("/")}
            variant="ghost" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 flex justify-start"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1">
        {activeTab === "questions" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold">Question Management</h3>
                <p className="text-muted-foreground">Manage and organize all test materials</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="bg-white border-primary/20 text-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4 p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-2">
                    <Input placeholder="Search questions..." className="max-w-xs bg-white" />
                  </div>
                  <div className="flex gap-2">
                    <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background max-w-[150px]">
                      <option>All Subjects</option>
                      <option>Bangla</option>
                      <option>English</option>
                    </select>
                    <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background max-w-[150px]">
                      <option>All Difficulties</option>
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Question (Bengali)</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">#Q10{i}</TableCell>
                        <TableCell className="font-bengali font-medium max-w-[300px] truncate">
                          'সোনার তরী' কবিতাটি কোন কাব্যগ্রন্থে সংকলিত?
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">Bangla 1st Paper</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100">Medium</Badge>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "students" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">স্টুডেন্ট ম্যানেজমেন্ট</h3>
                <p className="text-muted-foreground">ইউজারদের তথ্য দেখুন এবং সাবস্ক্রিপশন এক্সেস দিন</p>
              </div>
            </div>

            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4 p-6 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">সব ইউজার</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Phone / Email</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.fullName || 'No Name'}</TableCell>
                        <TableCell className="text-slate-600">{u.email || u.phoneNumber}</TableCell>
                        <TableCell>
                          {u.class && <Badge variant="outline">{u.class}</Badge>}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{u.points || 0}</TableCell>
                        <TableCell>
                          {u.isPro ? (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 flex w-fit items-center gap-1 mb-1">
                              <Crown className="w-3 h-3" /> Pro Member
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 mb-1 block">Free</Badge>
                          )}
                          {u.isTutor && (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 flex w-fit items-center gap-1">
                              <BookOpen className="w-3 h-3" /> Tutor
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 items-end">
                            <Button 
                              variant={u.isPro ? "outline" : "default"} 
                              size="sm" 
                              className={`w-full justify-center ${u.isPro ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-gradient-to-r from-[#ffa726] to-[#e65100] text-white"}`}
                              onClick={() => toggleProStatus(u.id, u.isPro)}
                            >
                              {u.isPro ? "Revoke Pro" : <><Gift className="w-4 h-4 mr-1"/> Gift Pro</>}
                            </Button>
                            <Button 
                              variant={u.isTutor ? "outline" : "secondary"} 
                              size="sm" 
                              className={`w-full justify-center ${u.isTutor ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                              onClick={() => toggleTutorStatus(u.id, u.isTutor)}
                            >
                              {u.isTutor ? "Revoke Tutor" : "Make Tutor"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && !loading && (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No users found.</TableCell>
                       </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px] rounded-xl border border-dashed text-muted-foreground border-slate-300">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1">Module Under Construction</h3>
              <p>The {activeTab} module is coming soon.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
