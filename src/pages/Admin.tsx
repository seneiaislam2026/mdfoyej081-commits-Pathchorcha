import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LayoutDashboard, Users, FileQuestion, BookOpen, Layers, Target, BarChart, Settings, Plus, Upload, MoreVertical, LogOut, Check, Gift, Crown, Trophy, Link as LinkIcon, Copy, MessageCircleQuestion, AlertCircle, User, Trash2, Send, TrendingUp, Calendar, Clock, Bell, LineChart, Edit, RotateCcw, X, Search, Moon, Menu, Printer, DollarSign } from "lucide-react";
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
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import NotesCreator from "../components/NotesCreator";
import BoardQuestionsCreator from "../components/BoardQuestionsCreator";
import UnifiedUploader from "../components/UnifiedUploader";
import FinancialTrackingTab from "../components/FinancialTrackingTab";
import { EventExamTab } from "../components/EventExamTab";
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

const normalizeSubjectName = (sub: any): string => {
  if (!sub) return "";
  const s = String(sub).trim().toLowerCase();
  
  // Bangla 1st Paper matching
  if (
    s === "বাংলা" ||
    s === "bangla" ||
    s === "বাংলা ১ম" ||
    s === "বাংলা ১ম পত্র" ||
    s === "bangla 1" ||
    s === "bangla 1st" ||
    s === "bangla 1st paper"
  ) {
    return "Bangla 1st Paper";
  }
  
  // Bangla 2nd Paper matching
  if (
    s === "বাংলা ২য়" ||
    s === "বাংলা ২য় পত্র" ||
    s === "bangla 2" ||
    s === "bangla 2nd" ||
    s === "bangla 2nd paper"
  ) {
    return "Bangla 2nd Paper";
  }

  // English 1st Paper matching
  if (
    s === "ইংরেজি" ||
    s === "english" ||
    s === "ইংরেজি ১ম" ||
    s === "ইংরেজি ১ম পত্র" ||
    s === "english 1" ||
    s === "english 1st" ||
    s === "english 1st paper"
  ) {
    return "English 1st Paper";
  }

  // English 2nd Paper matching
  if (
    s === "ইংরেজি ২য়" ||
    s === "ইংরেজি ২য় পত্র" ||
    s === "english 2" ||
    s === "english 2nd" ||
    s === "english 2nd paper"
  ) {
    return "English 2nd Paper";
  }

  // Accounting 1st Paper
  if (
    s === "হিসাববিজ্ঞান" ||
    s === "accounting" ||
    s === "হিসাববিজ্ঞান ১ম" ||
    s === "হিসাববিজ্ঞান ১ম পত্র" ||
    s === "accounting 1" ||
    s === "accounting 1st" ||
    s === "accounting 1st paper"
  ) {
    return "Accounting 1st Paper";
  }

  // Accounting 2nd Paper
  if (
    s === "হিসাববিজ্ঞান ২য়" ||
    s === "হিসাববিজ্ঞান ২য় পত্র" ||
    s === "accounting 2" ||
    s === "accounting 2nd" ||
    s === "accounting 2nd paper"
  ) {
    return "Accounting 2nd Paper";
  }

  // Physics 1st Paper
  if (
    s === "পদার্থবিজ্ঞান" ||
    s === "physics" ||
    s === "পদার্থবিজ্ঞান ১ম" ||
    s === "পদার্থবিজ্ঞান ১ম পত্র" ||
    s === "physics 1" ||
    s === "physics 1st" ||
    s === "physics 1st paper"
  ) {
    return "Physics 1st Paper";
  }

  // Physics 2nd Paper
  if (
    s === "পদার্থবিজ্ঞান ২য়" ||
    s === "পদার্থবিজ্ঞান ২য় পত্র" ||
    s === "physics 2" ||
    s === "physics 2nd" ||
    s === "physics 2nd paper"
  ) {
    return "Physics 2nd Paper";
  }

  // Chemistry 1st Paper
  if (
    s === "রসায়ন" ||
    s === "chemistry" ||
    s === "রসায়ন ১ম" ||
    s === "রসায়ন ১ম পত্র" ||
    s === "chemistry 1" ||
    s === "chemistry 1st" ||
    s === "chemistry 1st paper"
  ) {
    return "Chemistry 1st Paper";
  }

  // Chemistry 2nd Paper
  if (
    s === "রসায়ন ২য়" ||
    s === "রসায়ন ২য় পত্র" ||
    s === "chemistry 2" ||
    s === "chemistry 2nd" ||
    s === "chemistry 2nd paper"
  ) {
    return "Chemistry 2nd Paper";
  }

  // Biology 1st Paper
  if (
    s === "জীববিজ্ঞান" ||
    s === "biology" ||
    s === "জীববিজ্ঞান ১ম" ||
    s === "জীববিজ্ঞান ১ম পত্র" ||
    s === "biology 1" ||
    s === "biology 1st" ||
    s === "biology 1st paper"
  ) {
    return "Biology 1st Paper";
  }

  // Biology 2nd Paper
  if (
    s === "জীববিজ্ঞান ২য়" ||
    s === "জীববিজ্ঞান ২য় পত্র" ||
    s === "biology 2" ||
    s === "biology 2nd" ||
    s === "biology 2nd paper"
  ) {
    return "Biology 2nd Paper";
  }

  // Higher Math 1st Paper
  if (
    s === "উচ্চতর গণিত" ||
    s === "উচ্চতর গণিত ১ম" ||
    s === "উচ্চতর গণিত ১ম পত্র" ||
    s === "higher math" ||
    s === "higher math 1" ||
    s === "higher math 1st" ||
    s === "higher math 1st paper" ||
    s === "math 1" ||
    s === "math 1st" ||
    s === "math 1st paper" ||
    s === "গণিত ১ম" ||
    s === "গণিত"
  ) {
    return "Higher Math 1st Paper";
  }

  // Higher Math 2nd Paper
  if (
    s === "উচ্চতর গণিত ২য়" ||
    s === "উচ্চতর গণিত ২য় পত্র" ||
    s === "higher math 2" ||
    s === "higher math 2nd" ||
    s === "higher math 2nd paper" ||
    s === "math 2" ||
    s === "math 2nd" ||
    s === "math 2nd paper" ||
    s === "গণিত ২য়"
  ) {
    return "Higher Math 2nd Paper";
  }

  // Management 1st Paper
  if (
    s === "ব্যবস্থাপনা" ||
    s === "management" ||
    s === "ব্যবস্থাপনা ১ম" ||
    s === "ব্যবস্থাপনা ১ম পত্র" ||
    s === "management 1" ||
    s === "management 1st" ||
    s === "management 1st paper" ||
    s === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা"
  ) {
    return "Management 1st Paper";
  }

  // Management 2nd Paper
  if (
    s === "ব্যবস্থাপনা ২য়" ||
    s === "ব্যবস্থাপনা ২য় পত্র" ||
    s === "management 2" ||
    s === "management 2nd" ||
    s === "management 2nd paper"
  ) {
    return "Management 2nd Paper";
  }

  if (s === "ict" || s === "আইসিটি" || s === "তথ্য ও যোগাযোগ প্রযুক্তি") {
    return "ICT";
  }

  return sub;
};

const getSubjectDisplayName = (sub: string) => {
  const mapping: Record<string, string> = {
    "Bangla 1st Paper": "বাংলা ১ম পত্র (Bangla 1st Paper)",
    "Bangla 2nd Paper": "বাংলা ২য় পত্র (Bangla 2nd Paper)",
    "English 1st Paper": "ইংরেজি ১ম পত্র (English 1st Paper)",
    "English 2nd Paper": "ইংরেজি ২য় পত্র (English 2nd Paper)",
    "Physics 1st Paper": "পদার্থবিজ্ঞান ১ম পত্র (Physics 1st Paper)",
    "Physics 2nd Paper": "পদার্থবিজ্ঞান ২য় পত্র (Physics 2nd Paper)",
    "Chemistry 1st Paper": "রসায়ন ১ম পত্র (Chemistry 1st Paper)",
    "Chemistry 2nd Paper": "রসায়ন ২য় পত্র (Chemistry 2nd Paper)",
    "Higher Math 1st Paper": "উচ্চতর গণিত ১ম পত্র (Higher Math 1st Paper)",
    "Higher Math 2nd Paper": "উচ্চতর গণিত ২য় পত্র (Higher Math 2nd Paper)",
    "Biology 1st Paper": "জীববিজ্ঞান ১ম পত্র (Biology 1st Paper)",
    "Biology 2nd Paper": "জীববিজ্ঞান ২য় পত্র (Biology 2nd Paper)",
    "Accounting 1st Paper": "হিসাববিজ্ঞান ১ম পত্র (Accounting 1st Paper)",
    "Accounting 2nd Paper": "হিসাববিজ্ঞান ২য় পত্র (Accounting 2nd Paper)",
    "Management 1st Paper": "ব্যবস্থাপনা ১ম পত্র (Management 1st Paper)",
    "Management 2nd Paper": "ব্যবস্থাপনা ২য় পত্র (Management 2nd Paper)",
    "ICT": "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
  };
  return mapping[sub] || sub;
};

const menuItems = [
  { id: "dashboard", bnLabel: "ড্যাশবোর্ড", enLabel: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "students", bnLabel: "শিক্ষার্থী", enLabel: "Students", icon: <Users className="w-5 h-5" /> },
  { id: "class_requests", bnLabel: "ক্লাস রিকুয়েস্ট", enLabel: "Class Requests", icon: <Users className="w-5 h-5 text-orange-500" /> },
  { id: "payments", bnLabel: "পেমেন্ট ভেরিফাই", enLabel: "Payments", icon: <Crown className="w-5 h-5 text-amber-500" /> },
  { id: "questions", bnLabel: "প্রশ্ন ব্যাংক", enLabel: "Questions", icon: <FileQuestion className="w-5 h-5" /> },
  { id: "subject_questions", bnLabel: "বিষয়ভিত্তিক প্রশ্ন", enLabel: "Subject Questions", icon: <BookOpen className="w-5 h-5 text-sky-500" /> },
  { id: "board_questions", bnLabel: "বোর্ড প্রশ্ন", enLabel: "Board Questions", icon: <FileQuestion className="w-5 h-5 text-indigo-500" />, isNew: true },
  { id: "unified_uploader", bnLabel: "ইউনিফাইড আপলোডার", enLabel: "Unified Uploader", icon: <Upload className="w-5 h-5 text-purple-500" />, isNew: true },
  { id: "vocabulary", bnLabel: "শব্দকোষ", enLabel: "Vocabulary", icon: <BookOpen className="w-5 h-5 text-indigo-500" /> },
  { id: "note_publisher", bnLabel: "নোট পাবলিশার", enLabel: "Note Publisher", icon: <BookOpen className="w-5 h-5 text-cyan-500" />, isNew: true },
  { id: "notes_creator", bnLabel: "নোটস মেকার", enLabel: "Notes Creator", icon: <BookOpen className="w-5 h-5 text-emerald-500" />, isNew: true },
  { id: "subjects", bnLabel: "বিষয়", enLabel: "Subjects", icon: <BookOpen className="w-5 h-5" /> },
  { id: "chapters", bnLabel: "অধ্যায়", enLabel: "Chapters", icon: <Layers className="w-5 h-5" /> },
  { id: "exams", bnLabel: "পরীক্ষা", enLabel: "Exams", icon: <Target className="w-5 h-5" /> },
  { id: "event_exam", bnLabel: "ইভেন্ট এক্সাম", enLabel: "Event Exam", icon: <Trophy className="w-5 h-5 text-rose-500" />, isNew: true },
  { id: "leaderboard", bnLabel: "লিডারবোর্ড", enLabel: "Leaderboard", icon: <Trophy className="w-5 h-5" /> },
  { id: "doubts", bnLabel: "শিক্ষার্থীর প্রশ্ন", enLabel: "Doubts", icon: <MessageCircleQuestion className="w-5 h-5 font-bold" /> },
  { id: "reports", bnLabel: "রিপোর্টকৃত", enLabel: "Reports", icon: <AlertCircle className="w-5 h-5" /> },
  { id: "sms", bnLabel: "এসএমএস", enLabel: "SMS", icon: <MessageCircleQuestion className="w-5 h-5 text-sky-500" /> },
  { id: "analytics", bnLabel: "অ্যানালিটিক্স", enLabel: "Analytics", icon: <BarChart className="w-5 h-5" /> },
  { id: "finance", bnLabel: "হিসাব নিকাশ", enLabel: "Finance", icon: <DollarSign className="w-5 h-5 text-emerald-500" />, isNew: true },
  { id: "premium_marketing", bnLabel: "প্রো ও মার্কেটিং", enLabel: "Growth & Marketing", icon: <TrendingUp className="w-5 h-5" /> },
  { id: "settings", bnLabel: "সেটিংস", enLabel: "Settings", icon: <Settings className="w-5 h-5" /> },
];

export const formatEmail = (email: string) => {
  if (!email) return "";
  if (email.includes("@pathchola.com") || email.includes("@biddayan.com") || email.includes("@pathchorcha")) {
     return email.split("@")[0];
  }
  return email;
};

const ClassRequestsTab = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "class_change_requests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const res: any[] = [];
      snap.forEach(doc => res.push({ id: doc.id, ...doc.data() }));
      setRequests(res);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, userId: string, approvedClass: string, status: "approved" | "declined") => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await updateDoc(doc(db, "class_change_requests", id), { status });
      if (status === "approved") {
        await updateDoc(doc(db, "users", userId), { class: approvedClass });
      }
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      alert(`Request has been ${status}`);
    } catch(e) {
      console.error(e);
      alert("Failed to perform action");
    }
  };

  return (
    <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden mt-4">
      <CardHeader className="bg-muted border-b pb-4 p-6">
        <CardTitle className="font-bengali">অপেক্ষমান ক্লাস রিকুয়েস্ট সমূহ</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="font-bold text-foreground font-bengali">শিক্ষার্থী</TableHead>
              <TableHead className="font-bold text-foreground font-bengali">বর্তমান ক্লাস</TableHead>
              <TableHead className="font-bold text-foreground font-bengali">অনুরোধকৃত ক্লাস</TableHead>
              <TableHead className="font-bold text-foreground font-bengali">কারন</TableHead>
              <TableHead className="font-bold text-foreground font-bengali">স্ট্যাটাস</TableHead>
              <TableHead className="font-bold text-foreground text-right font-bengali">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map(req => (
               <TableRow key={req.id}>
                 <TableCell>
                    <div className="font-bold">{req.userName}</div>
                    <div className="text-xs text-slate-500">{req.email}</div>
                 </TableCell>
                 <TableCell>{req.currentClass}</TableCell>
                 <TableCell className="font-bold text-indigo-600">{req.requestedClass}</TableCell>
                 <TableCell className="max-w-[150px] truncate" title={req.reason}>{req.reason || "N/A"}</TableCell>
                 <TableCell>
                    <Badge variant={req.status === "pending" ? "default" : req.status === "approved" ? "outline" : "destructive"} 
                           className={req.status === "pending" ? "bg-amber-100 text-amber-700" : req.status === "approved" ? "bg-green-100 text-green-700" : ""}>
                      {req.status}
                    </Badge>
                 </TableCell>
                 <TableCell className="text-right flex items-center justify-end gap-2">
                    {req.status === "pending" && (
                       <>
                         <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50" onClick={() => handleAction(req.id, req.userId, req.requestedClass, "approved")}><Check className="w-4 h-4 mr-1"/> Approve</Button>
                         <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAction(req.id, req.userId, req.requestedClass, "declined")}><X className="w-4 h-4 mr-1"/> Decline</Button>
                       </>
                    )}
                 </TableCell>
               </TableRow>
            ))}
            {requests.length === 0 && !loading && (
              <TableRow><TableCell colSpan={6} className="text-center py-6">কোনো রিকুয়েস্ট নেই</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const NotePublisherTab = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    classInfo: "১০ম শ্রেনী",
    subject: "Bangla",
    type: "pdf", // type of note
    contentLink: "", 
    jsonContent: "" // for json_array
  });

  const publishNote = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.type === "json_array") {
        const notes = JSON.parse(formData.jsonContent);
        if (!Array.isArray(notes)) throw new Error("JSON must be an array");
        const batch = writeBatch(db);
        notes.forEach((note: any) => {
          const docRef = doc(collection(db, "subject_notes"));
          batch.set(docRef, {
            ...note,
            classInfo: note.classInfo || formData.classInfo,
            subject: note.subject || formData.subject,
            type: note.type || "pdf",
            createdAt: serverTimestamp(),
            active: true
          });
        });
        await batch.commit();
        alert(`${notes.length} টি নোট সফলভাবে যুক্ত হয়েছে!`);
      } else {
        await addDoc(collection(db, "subject_notes"), {
          title: formData.title,
          classInfo: formData.classInfo,
          subject: formData.subject,
          type: formData.type,
          contentLink: formData.contentLink,
          createdAt: serverTimestamp(),
          active: true
        });
        alert("নোট সফলভাবে তৈরি হয়েছে!");
      }
      setFormData({ ...formData, title: "", contentLink: "", jsonContent: "" });
    } catch(err: any) {
      console.error(err);
      alert("নোট তৈরি করতে সমস্যা হয়েছে: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden mt-4 max-w-2xl">
       <CardHeader className="bg-muted border-b pb-4 p-6">
         <CardTitle className="font-bengali">সহজ নোট পাবলিশার</CardTitle>
         <CardDescription className="font-bengali text-xs">পিডিএফ ড্রাইভ লিংক বা অন্যান্য এক্সটার্নাল লিংক সরাসরি যুক্ত করুন</CardDescription>
       </CardHeader>
       <CardContent className="p-6">
         <form onSubmit={publishNote} className="space-y-4">
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold font-bengali mb-1">ক্লাস</label>
               <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={formData.classInfo} onChange={e => setFormData({...formData, classInfo: e.target.value})}>
                  {["১ম শ্রেনী","২য় শ্রেনী","৩য় শ্রেনী","৪র্থ শ্রেনী","৫ম শ্রেনী","৬ষ্ঠ শ্রেনী","৭ম শ্রেনী","৮ম শ্রেনী","৯ম শ্রেনী","১০ম শ্রেনী","এসএসসি","একাদশ","দ্বাদশ","এইচএসসি","ভার্সিটি এডমিশন","মেডিকেল এডমিশন","ইঞ্জিনিয়ারিং এডমিশন"].map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-bold font-bengali mb-1">বিষয়</label>
               <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                  {["Bangla","English","General Knowledge","Physics","Chemistry","Biology","Higher Math","ICT","Accounting","Management"].map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>
           <div>
             <label className="block text-sm font-bold font-bengali mb-1">নোটের ধরন</label>
             <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="pdf">গুগল ড্রাইভ পিডিএফ লিংক</option>
                <option value="video">ইউটিউব ভিডিও ক্লাস লিংক</option>
                <option value="external">অন্যান্য লিংক</option>
                <option value="json_array">JSON Array (Bulk Upload)</option>
             </select>
           </div>
           
           {formData.type === "json_array" ? (
             <div>
               <label className="block text-sm font-bold font-bengali mb-1">JSON কন্টেন্ট</label>
               <textarea 
                 required 
                 className="min-h-[200px] font-mono text-xs w-full p-2 border border-slate-300 rounded" 
                 placeholder={`[
  { "title": "অধ্যায় ১", "contentLink": "...", "type": "pdf" },
  { "title": "অধ্যায় ২", "contentLink": "...", "type": "video" }
]`} 
                 value={formData.jsonContent} 
                 onChange={e => setFormData({...formData, jsonContent: e.target.value})} 
               />
             </div>
           ) : (
             <>
               <div>
                 <label className="block text-sm font-bold font-bengali mb-1">নোটের টাইটেল</label>
                 <Input required placeholder="উদাঃ বাংলা ব্যাকরণ - সমাস" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-bold font-bengali mb-1">লিংক</label>
                 <Input required placeholder="https://drive.google.com/..." value={formData.contentLink} onChange={e => setFormData({...formData, contentLink: e.target.value})} />
               </div>
             </>
           )}

           <Button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold font-bengali">
             {loading ? "পাবলিশ হচ্ছে..." : "নতুন নোট পাবলিশ করুন"}
           </Button>
         </form>
       </CardContent>
    </Card>
  );
};

export default function Admin() {
  const { user, userData, previewClass, setPreviewClass } = useAuth();
  const [activeTab, setActiveTab ] = useState("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [publicExams, setPublicExams] = useState<any[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsData, setSettingsData] = useState<any>({
    maintenanceMode: false,
    alertBannerActive: false,
    alertBannerMessage: "",
    discountPercentage: 0,
    pwaIconUrl: "",
    subscriptionPlans: [
      { id: "1-month", name: "১ মাস", price: 50, duration: "মাসিক", popular: false, color: "from-blue-200 to-blue-300" },
      { id: "3-months", name: "৩ মাস", price: 120, duration: "ত্রৈমাসিক", popular: true, color: "from-[#ffa726] to-[#ffb74d]" },
      { id: "6-months", name: "৬ মাস", price: 270, duration: "ষাণ্মাসিক", popular: false, color: "from-emerald-200 to-emerald-300" },
      { id: "12-months", name: "১ বছর", price: 500, duration: "বার্ষিক", popular: false, color: "from-purple-200 to-purple-300" }
    ]
  });
  const [pendingDoubts, setPendingDoubts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadSubject, setBulkUploadSubject] = useState("");
  const [bulkUploadTargets, setBulkUploadTargets] = useState({
    hsc: true,
    class11: true,
    class12: false,
    admission: true,
    ssc: false,
    class9: false,
    class6_8: false,
  });
  const [bulkUploadUniversity, setBulkUploadUniversity] = useState("");
  const [bulkUploadType, setBulkUploadType] = useState("mcq");
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponMonths, setNewCouponMonths] = useState("1");
  const [bulkUploadText, setBulkUploadText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [newExamTitle, setNewExamTitle] = useState("Weekly Public Exam");
  const [newExamDuration, setNewExamDuration] = useState("25");
  const [newExamQuestionsJSON, setNewExamQuestionsJSON] = useState("");
  const [newExamClass, setNewExamClass] = useState("সকল ক্লাস");
  const [newExamType, setNewExamType] = useState("public"); // "public" or "live_model_test"
  const [newExamScheduledDate, setNewExamScheduledDate] = useState("");
  const [newExamCloseDate, setNewExamCloseDate] = useState("");
  const [newExamCustomId, setNewExamCustomId] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [subjectBankFilter, setSubjectBankFilter] = useState("Bangla 1st Paper");
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState("All Subjects");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("All Classes");
  const [userRoleTab, setUserRoleTab] = useState("all"); // "all", "tutor", "admin", "leaderboard"
  const [studentsLimit, setStudentsLimit] = useState(24);

  useEffect(() => {
    setStudentsLimit(24);
  }, [studentSearch, studentClassFilter, userRoleTab]);
  const [selectedUserModal, setSelectedUserModal] = useState<any | null>(null);
  const [selectedBankTitle, setSelectedBankTitle] = useState<string | null>(null);
  const [explorerMode, setExplorerMode] = useState<"by_bank" | "universal">("by_bank");
  const [explorerFormatFilter, setExplorerFormatFilter] = useState<string>("all");
  const [explorerClassFilter, setExplorerClassFilter] = useState<string>("all");
  const [explorerSubjectFilter, setExplorerSubjectFilter] = useState<string>("all");
  const [explorerSearch, setExplorerSearch] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [premiumData, setPremiumData] = useState<any>(null);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [customMonths, setCustomMonths] = useState<Record<string, number>>({});
  const [proGiftUser, setProGiftUser] = useState<{ id: string, name: string } | null>(null);
  const [giftMonths, setGiftMonths] = useState<string>("1");
  const [tutorSubjectModal, setTutorSubjectModal] = useState<{ userId: string, name: string, subjects: string[] } | null>(null);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [vocabularyLoading, setVocabularyLoading] = useState(false);
  const [newVocabJSON, setNewVocabJSON] = useState("");
  const [editingVocab, setEditingVocab] = useState<any>(null);
  const [isSavingVocab, setIsSavingVocab] = useState(false);
  const navigate = useNavigate();

  const allDynamicSubjects = [
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "Physics 1st Paper",
    "Physics 2nd Paper",
    "Chemistry 1st Paper",
    "Chemistry 2nd Paper",
    "Higher Math 1st Paper",
    "Higher Math 2nd Paper",
    "Biology 1st Paper",
    "Biology 2nd Paper",
    "ICT",
    "Accounting 1st Paper",
    "Accounting 2nd Paper",
    "Management 1st Paper",
    "Management 2nd Paper",
    "বাংলা",
    "English",
    "গণিত",
    "বাংলাদেশ ও বিশ্বপরিচয়",
    "ধর্ম",
    "হিসাববিজ্ঞান",
    "ফিন্যান্স",
    "ব্যবসায় উদ্যোগ",
    "ব্যবসায় সংগঠন ও ব্যবস্থাপনা",
    "অর্থনীতি",
    "পৌরনীতি",
    "ইতিহাস",
    "ভূগোল",
    "সাধারণ জ্ঞান"
  ];

  useEffect(() => {
    if (activeTab === "students" || activeTab === "dashboard") {
      fetchUsers();
      fetchAnalytics();
      fetchPaymentRequests();
    }
    if (activeTab === "settings") {
      fetchSettings();
      fetchCoupons();
    } else if (activeTab === "exams") {
      fetchPublicExams();
    } else if (activeTab === "doubts") {
      fetchPendingDoubts();
    } else if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "subjects") {
      fetchSubjects();
    } else if (activeTab === "questions" || activeTab === "subject_questions") {
      fetchQuestions();
    } else if (activeTab === "vocabulary") {
      fetchVocabulary();
    } else if (activeTab === "payments") {
      fetchPaymentRequests();
    } else if (activeTab === "analytics") {
      fetchAnalytics();
    } else if (activeTab === "premium_marketing") {
      fetchPremiumData();
    }
  }, [activeTab]);

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const q = query(collection(db, "questions"), limit(1500));
      const qs = await getDocs(q);
      const data: any[] = [];
      qs.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setQuestions(data.sort((a,b) => (b.createdAt?.localeCompare?.(a.createdAt) || 0)));
    } catch (error) {
      console.error(error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchVocabulary = async () => {
    setVocabularyLoading(true);
    try {
      const qs = await getDocs(collection(db, "vocabulary"));
      const data: any[] = [];
      qs.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setVocabulary(data.sort((a, b) => (b.createdAt?.localeCompare?.(a.createdAt) || 0)));
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
    } finally {
      setVocabularyLoading(false);
    }
  };

  const handleBulkUploadVocabulary = async () => {
    if (!newVocabJSON.trim()) {
      alert("দয়াকরে JSON Array টেক্সট বক্সে লিখুন!");
      return;
    }

    try {
      let parsed;
      try {
        parsed = JSON.parse(newVocabJSON.trim());
      } catch (jsonErr: any) {
        alert("ভুল JSON ফরম্যাট! দয়াকরে নিশ্চিত করুন আপনার পেস্ট করা টেক্সটটি একটি সঠিক JSON বা JSON Array।\nত্রুটির বিবরণ: " + jsonErr.message);
        return;
      }

      let wordsToInsert: any[] = [];
      if (Array.isArray(parsed)) {
        wordsToInsert = parsed;
      } else if (parsed && typeof parsed === "object") {
        // Find if they wrapped it in an array property (e.g. { "vocabulary": [...] }, { "words": [...] })
        const keys = Object.keys(parsed);
        const arrayKey = keys.find(k => Array.isArray((parsed as any)[k]));
        if (arrayKey) {
          wordsToInsert = (parsed as any)[arrayKey];
        } else {
          // Maybe it's a single object
          wordsToInsert = [parsed];
        }
      }

      if (wordsToInsert.length === 0) {
        alert("JSON-এর মধ্যে কোনো ডেটা বা শব্দকোষের তালিকা খুঁজে পাওয়া যায়নি!");
        return;
      }

      setVocabularyLoading(true);
      let successCount = 0;
      let skipCount = 0;
      
      const parseStringOrArray = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) {
          return val.map((s: any) => String(s).trim()).filter(Boolean);
        }
        if (typeof val === "string") {
          return val.split(",").map((s: any) => s.trim()).filter(Boolean);
        }
        return [String(val).trim()];
      };

      for (const item of wordsToInsert) {
        if (!item || typeof item !== "object") {
          skipCount++;
          continue;
        }

        // Map alternate fields/aliases
        const rawWord = item.word || item.vocab || item.term || item.name || item.text || item.title;
        const rawMeaning = item.meaning || item.definition || item.def || item.translation || item.translate || item.bn || item.meaning_bn;
        
        if (!rawWord || !rawMeaning) {
          console.warn("Skipping invalid item (missing word or meaning mapping):", item);
          skipCount++;
          continue;
        }

        const wordVal = String(rawWord).trim();
        const meaningVal = String(rawMeaning).trim();

        const bnRegex = /[\u0980-\u09FF]/;
        const isBangla = bnRegex.test(wordVal) || bnRegex.test(meaningVal);
        const rawLanguage = item.language || item.lang || (isBangla ? "bangla" : "english");
        const languageVal = rawLanguage === "bangla" ? "bangla" : "english";

        const rawCategory = item.category || item.type || item.class || item.tag || "vocabulary";
        const categoryVal = String(rawCategory).trim();

        const rawPronunciation = item.pronunciation || item.pronounce || item.phonetic || item.pron || "";
        const pronunciationVal = String(rawPronunciation).trim();

        const synonymsVal = parseStringOrArray(item.synonyms || item.synonym || item.syn);
        const antonymsVal = parseStringOrArray(item.antonyms || item.antonym || item.ant);
        const rawExample = item.example || item.sentence || item.eg || item.ex || "";
        const exampleVal = String(rawExample).trim();

        const payload = {
          word: wordVal,
          language: languageVal,
          category: categoryVal,
          pronunciation: pronunciationVal,
          meaning: meaningVal,
          synonyms: synonymsVal,
          antonyms: antonymsVal,
          example: exampleVal,
          createdAt: new Date().toISOString()
        };

        const { addDoc, collection } = await import("firebase/firestore");
        await addDoc(collection(db, "vocabulary"), payload);
        successCount++;
      }

      if (skipCount > 0) {
        alert(`সাফল্যের সাথে ${successCount}টি শব্দ যোগ করা হয়েছে! এবং ${skipCount}টি শব্দ বাদ দেওয়া হয়েছে (প্রয়োজনীয় ক্ষেত্র যেমন word বা meaning না থাকায়)।`);
      } else {
        alert(`সাফল্যের সাথে ${successCount}টি শব্দ যোগ করা হয়েছে!`);
      }
      setNewVocabJSON("");
      fetchVocabulary();
    } catch (error: any) {
      alert("JSON পার্সিং বা আপলোডে ত্রুটি হয়েছে: " + error.message);
    } finally {
      setVocabularyLoading(false);
    }
  };

  const handleUpdateVocabulary = async () => {
    if (!editingVocab || !editingVocab.word) {
      alert("শব্দটি দিন!");
      return;
    }
    try {
      setIsSavingVocab(true);
      const vocabRef = doc(db, "vocabulary", editingVocab.id);
      
      const payload: any = {
        word: editingVocab.word,
        meaning: editingVocab.meaning,
        pronunciation: editingVocab.pronunciation || "",
        language: editingVocab.language || "english",
        category: editingVocab.category || "vocabulary",
        example: editingVocab.example || "",
      };

      if (editingVocab.synonyms && Array.isArray(editingVocab.synonyms)) {
          payload.synonyms = editingVocab.synonyms;
      } else if (editingVocab.synonyms && typeof editingVocab.synonyms === 'string') {
          payload.synonyms = editingVocab.synonyms.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      } else {
          payload.synonyms = [];
      }

      if (editingVocab.antonyms && Array.isArray(editingVocab.antonyms)) {
          payload.antonyms = editingVocab.antonyms;
      } else if (editingVocab.antonyms && typeof editingVocab.antonyms === 'string') {
          payload.antonyms = editingVocab.antonyms.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      } else {
          payload.antonyms = [];
      }

      await updateDoc(vocabRef, payload);
      alert("শব্দটি আপডেট করা হয়েছে!");
      setEditingVocab(null);
      fetchVocabulary();
    } catch (error: any) {
      alert("আপডেট করতে ত্রুটি হয়েছে: " + error.message);
    } finally {
      setIsSavingVocab(false);
    }
  };

  const deleteVocabularyWord = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই শব্দটি মুছে ফেলতে চান?")) return;
    try {
      setVocabularyLoading(true);
      await deleteDoc(doc(db, "vocabulary", id));
      alert("শব্দটি মুছে ফেলা হয়েছে!");
      fetchVocabulary();
    } catch (error: any) {
      alert("মুছে ফেলতে ত্রুটি হয়েছে: " + error.message);
    } finally {
      setVocabularyLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { getCountFromServer, collection } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      
      const usersSnap = await getCountFromServer(collection(db, "users"));
      const questionsSnap = await getCountFromServer(collection(db, "questions"));
      const examsSnap = await getCountFromServer(collection(db, "public_exams"));
      const subjectsSnap = await getCountFromServer(collection(db, "subjects"));
      const doubtsSnap = await getCountFromServer(collection(db, "doubts"));
      const reportsSnap = await getCountFromServer(collection(db, "reports"));
      
      setAnalyticsData({
        usersCount: usersSnap.data().count,
        questionsCount: questionsSnap.data().count,
        examsCount: examsSnap.data().count,
        subjectsCount: subjectsSnap.data().count,
        doubtsCount: doubtsSnap.data().count,
        reportsCount: reportsSnap.data().count,
      });
    } catch(e) {
      console.error(e);
    }
  };

  const fetchPremiumData = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const now = Date.now();
      const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      let premiumUsers = 0;
      let expiringSoonList: any[] = [];
      let expiredRecentlyList: any[] = [];
      let newUsersLast7Days = 0;
      let newUsersLast30Days = 0;

      allUsers.forEach(user => {
        // Track Premium Expiries
        if (user.isPro) {
          premiumUsers++;
          let until = user.proUntil;
          if (until) {
            let untilTime = typeof until === 'number' ? until : (until?.toMillis ? until.toMillis() : new Date(until).getTime());
             if (untilTime <= sevenDaysFromNow && untilTime > now) {
               expiringSoonList.push({ ...user, expiry: untilTime });
             } else if (untilTime < now) {
               expiredRecentlyList.push({ ...user, expiry: untilTime });
             }
          }
        } else {
          let until = user.proUntil;
          if (until) {
             let untilTime = typeof until === 'number' ? until : (until?.toMillis ? until.toMillis() : new Date(until).getTime());
             if (untilTime > thirtyDaysAgo && untilTime <= now) {
               expiredRecentlyList.push({ ...user, expiry: untilTime });
             }
          }
        }

        // Track New Users Growth
        let createdAt = user.createdAt;
        if (createdAt) {
          let createdTime = typeof createdAt === 'number' ? createdAt : (createdAt?.toMillis ? createdAt.toMillis() : new Date(createdAt).getTime());
          if (createdTime >= sevenDaysAgo) {
            newUsersLast7Days++;
          }
          if (createdTime >= thirtyDaysAgo) {
            newUsersLast30Days++;
          }
        }
      });
      
      setPremiumData({
        totalUsers: allUsers.length,
        premiumCount: premiumUsers,
        premiumPercent: allUsers.length > 0 ? (premiumUsers / allUsers.length * 100).toFixed(1) : "0",
        expiringSoon: expiringSoonList,
        expiredRecently: expiredRecentlyList,
        newUsersLast7Days,
        newUsersLast30Days
      });
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentRequests = async () => {
    setPaymentsLoading(true);
    try {
      const { orderBy, query } = await import("firebase/firestore");
      const querySnapshot = await getDocs(query(collection(db, "payment_requests"), orderBy("createdAt", "desc")));
      const reqs: any[] = [];
      querySnapshot.forEach((doc) => {
        reqs.push({ id: doc.id, ...doc.data() });
      });
      setPaymentRequests(reqs);
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const approvePaymentRequest = async (request: any, approvedMonths: number) => {
    try {
      setLoading(true);
      const { Timestamp, addDoc } = await import("firebase/firestore");
      
      const durationDays = approvedMonths * 30;
      const proUntilMillis = Date.now() + durationDays * 24 * 60 * 60 * 1000;
      
      await updateDoc(doc(db, "users", request.uid), {
        isPro: true,
        proUntil: Timestamp.fromMillis(proUntilMillis)
      });
      
      await updateDoc(doc(db, "payment_requests", request.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
        approvedDays: durationDays,
        approvedMonths: approvedMonths
      });

      // Send automated real-time notification
      await addDoc(collection(db, "notifications"), {
        userId: request.uid,
        title: "প্রো সাবস্ক্রিপশন সফল! 🎉",
        message: `আপনার ৳${request.amount} মূল্যের পেমেন্টটি অনুমোদিত হয়েছে এবং ${approvedMonths} মাসের জন্য প্রো মেম্বারশিপ অ্যাক্টিভেট হয়েছে। ধন্যবাদ!`,
        type: "pro_approval",
        read: false,
        createdAt: serverTimestamp()
      });
      
      alert(`রিকোয়েস্টটি সফলভাবে এপ্রুভ হয়েছে এবং ইউজারকে ${approvedMonths} মাসের প্রো মেম্বারশিপ ও অটো কনগ্রাচুলেশন মেসেজ দেওয়া হয়েছে।`);
      fetchPaymentRequests();
    } catch (e: any) {
      console.error(e);
      alert("এপ্রুভ করতে সমস্যা হয়েছে: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectPaymentRequest = async (requestId: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "payment_requests", requestId), {
        status: "rejected",
        rejectedAt: serverTimestamp()
      });
      alert("রিকোয়েস্টটি রিজেক্ট করা হয়েছে।");
      fetchPaymentRequests();
    } catch (e: any) {
      console.error(e);
      alert("রিজেক্ট করতে সমস্যা হয়েছে: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentRequest = async (requestId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "আপনি কি নিশ্চিত যে এই পেমেন্ট রিকোয়েস্টটি চিরতরে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।",
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteDoc(doc(db, "payment_requests", requestId));
          alert("পেমেন্ট রিকোয়েস্টটি সফলভাবে মুছে ফেলা হয়েছে।");
          fetchPaymentRequests();
        } catch (e: any) {
          console.error(e);
          alert("মুছে ফেলতে সমস্যা হয়েছে: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getProposedMonths = (request: any) => {
    if (customMonths[request.id] !== undefined) {
      return customMonths[request.id];
    }
    let m = 1;
    if (request.plan === "1-month" || Number(request.amount) === 80) m = 1;
    else if (request.plan === "3-months" || Number(request.amount) === 220) m = 3;
    else if (request.plan === "6-months" || Number(request.amount) === 430) m = 6;
    else if (request.plan === "12-months") m = 12;
    else if (request.plan === "custom" && request.days) m = Math.ceil(Number(request.days) / 30);
    else if (request.amount) {
      m = Math.max(1, Math.floor(Number(request.amount) / 70));
    }
    return m;
  };

  const handleUpdateQuestion = async () => {
    if (!editQuestion) return;
    try {
      const { id, ...data } = editQuestion;
      if (data.subject) {
        data.subject = normalizeSubjectName(data.subject);
      }
      if (id === 'new') {
        const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
        await addDoc(collection(db, "questions"), {
          ...data,
          createdAt: serverTimestamp()
        });
        alert("Question added successfully!");
      } else {
        await updateDoc(doc(db, "questions", id), data);
        alert("Question updated successfully!");
      }
      setEditQuestion(null);
      fetchQuestions();
    } catch (e) {
      console.error(e);
      alert("Failed to save question.");
    }
  };

  const handleBulkUploadSubmit = async () => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      let cleanedText = bulkUploadText.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.replace(/^```json/, '');
      if (cleanedText.startsWith('```')) cleanedText = cleanedText.replace(/^```/, '');
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.replace(/```$/, '');
      cleanedText = cleanedText.trim();
      
      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseErr: any) {
        try {
          parsed = new Function("return " + cleanedText)();
        } catch (evalErr) {
          throw new Error("JSON Parse Error: " + parseErr.message);
        }
      }
      let targetArray: any[] = [];
      let rootTitle = '';
      if (Array.isArray(parsed)) {
        targetArray = parsed;
      } else if (parsed && Array.isArray(parsed.questions)) {
        targetArray = parsed.questions;
        rootTitle = String(parsed.title || parsed.chapter || '');
      } else if (parsed && typeof parsed === 'object') {
        // Single question or custom structure
        if (parsed.question || parsed.text) {
          targetArray = [parsed];
        }
        rootTitle = String(parsed.chapter || parsed.title || '');
      }

      const targetMappings: { classGroup: string; class: string; university?: string }[] = [];
      if (bulkUploadTargets.hsc) targetMappings.push({ classGroup: "HSC", class: "HSC" });
      if (bulkUploadTargets.class11) targetMappings.push({ classGroup: "HSC", class: "Class 11" });
      if (bulkUploadTargets.class12) targetMappings.push({ classGroup: "HSC", class: "Class 12" });
      if (bulkUploadTargets.admission) targetMappings.push({ classGroup: "Admission", class: "Admission", university: bulkUploadUniversity });
      if (bulkUploadTargets.ssc) targetMappings.push({ classGroup: "SSC", class: "Class 10" });
      if (bulkUploadTargets.class9) targetMappings.push({ classGroup: "Class 9", class: "Class 9" });
      if (bulkUploadTargets.class6_8) targetMappings.push({ classGroup: "Class 6-8", class: "Class 6" });

      if (targetMappings.length === 0) {
        throw new Error("দয়া করে কমপক্ষে একটি টার্গেট ক্লাস সিলেক্ট করুন।");
      }

      if (targetArray.length > 0) {
        const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
        
        let count = 0;
        
        // chunking promises to avoid overwhelming connection
        const chunkSize = 20;
        for (let i = 0; i < targetArray.length; i += chunkSize) {
            const chunk = targetArray.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (q: any) => {
               if (!q || typeof q !== 'object') return;

               const rawSubject = bulkUploadSubject || q.subject || (questionSubjectFilter !== "All Subjects" ? questionSubjectFilter : '');
               const finalSubject = normalizeSubjectName(rawSubject);
               const finalTitle = rootTitle || String(q.title || '').trim() || (selectedBankTitle && selectedBankTitle !== 'Uncategorized' ? selectedBankTitle : (finalSubject || 'Uncategorized'));
               
               let is_cq = q.is_cq === true || q.isCq === true;
               let is_k_vandar = q.is_k_vandar === true || q.isKVandar === true;
               let is_kh_vandar = q.is_kh_vandar === true || q.isKhaVandar === true;

               if (bulkUploadType === "cq") is_cq = true;
               else if (bulkUploadType === "mcq") {
                 is_cq = false;
                 is_k_vandar = false;
                 is_kh_vandar = false;
               }
               else if (bulkUploadType === "k_vandar") { is_cq = true; is_k_vandar = true; }
               else if (bulkUploadType === "kh_vandar") { is_cq = true; is_kh_vandar = true; }

               const qText = String(q.text || q.question || q.q || q.questionText || "").trim();
               if (!qText) return;

               let formattedOptions: any[] = [];
               let correctOption = q.correctOption || q.correct_answer || q.correctAnswer || q.answer || 'A';
               let explanation = String(q.explanation || q.exp || "").trim();

               // Try to normalize correctOption to A/B/C/D
               const getNormalizedKey = (k: any) => {
                 if (!k) return "A";
                 const s = String(k).trim().toUpperCase();
                 if (s === "ক" || s === "A" || s === "১" || s === "1") return "A";
                 if (s === "খ" || s === "B" || s === "২" || s === "2") return "B";
                 if (s === "গ" || s === "C" || s === "৩" || s === "3") return "C";
                 if (s === "ঘ" || s === "D" || s === "৪" || s === "4") return "D";
                 return s;
               };
               correctOption = getNormalizedKey(correctOption);

               if (!is_cq) {
                 // Format option structure
                 if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                   const ids = ['A', 'B', 'C', 'D', 'E'];
                   const keys = Object.keys(q.options);
                   formattedOptions = keys.map((key, index) => ({
                     id: ids[index] || key,
                     label: String(q.options[key] || "")
                   }));
                   
                   // Double-check if correctOption was matching keys of object (e.g. ক)
                   const rawCorrect = q.correctOption || q.correct_answer || q.correctAnswer || q.answer || '';
                   if (rawCorrect && q.options[rawCorrect]) {
                     const keyIdx = keys.indexOf(rawCorrect);
                     if (keyIdx !== -1) {
                       correctOption = ids[keyIdx] || correctOption;
                     }
                   }
                 } else if (Array.isArray(q.options) && q.options.length > 0) {
                   if (typeof q.options[0] === 'string') {
                     const ids = ['A', 'B', 'C', 'D', 'E'];
                     formattedOptions = q.options.map((optLabel: string, index: number) => ({
                       id: ids[index] || String(index),
                       label: String(optLabel || "")
                     }));
                   } else {
                     formattedOptions = q.options.map((opt: any, optIdx: number) => {
                       if (!opt || typeof opt !== 'object') {
                         return {
                           id: ['A', 'B', 'C', 'D', 'E'][optIdx] || String(optIdx),
                           label: String(opt || "")
                         };
                       }
                       return {
                         id: String(opt.id || ['A', 'B', 'C', 'D', 'E'][optIdx] || String(optIdx)),
                         label: String(opt.label || opt.text || opt.value || "")
                       };
                     });
                   }
                 } else {
                   // Fallback to optionA, optionB, etc.
                   const optA = q.optionA || q.option_a || q.option1;
                   const optB = q.optionB || q.option_b || q.option2;
                   const optC = q.optionC || q.option_c || q.option3;
                   const optD = q.optionD || q.option_d || q.option4;
                   if (optA || optB) {
                     formattedOptions = [
                       { id: 'A', label: String(optA || "") },
                       { id: 'B', label: String(optB || "") },
                       { id: 'C', label: String(optC || "") },
                       { id: 'D', label: String(optD || "") }
                     ].filter(o => o.label);
                   }
                 }
               }

               // Generate flat option fields to be perfectly backward and forward compatible
               const optionA = formattedOptions.find(o => o.id === 'A')?.label || "";
               const optionB = formattedOptions.find(o => o.id === 'B')?.label || "";
               const optionC = formattedOptions.find(o => o.id === 'C')?.label || "";
               const optionD = formattedOptions.find(o => o.id === 'D')?.label || "";

               for (const mapping of targetMappings) {
                 const payload: any = {
                   text: qText,
                   is_cq,
                   is_k_vandar,
                   is_kh_vandar,
                   class: mapping.class,
                   classGroup: mapping.classGroup,
                   university: mapping.university || "",
                   subject: finalSubject,
                   title: finalTitle,
                   correctOption,
                   explanation,
                   createdAt: serverTimestamp()
                 };

                 if (!is_cq) {
                   payload.options = formattedOptions;
                   payload.optionA = optionA;
                   payload.optionB = optionB;
                   payload.optionC = optionC;
                   payload.optionD = optionD;
                 }

                 try {
                   await addDoc(collection(db, "questions"), payload);
                   count++;
                 } catch (uploadErr) {
                   console.error("Single question upload failed:", uploadErr, payload);
                 }
               }
            }));
        }
        
        alert(`Successfully added ${count} question entries to Firestore.`);
        setBulkUploadText("");
        setShowBulkUpload(false);
        fetchQuestions();
      } else {
        alert("JSON does not contain any valid array of questions.");
      }
    } catch (err) {
      console.error("Bulk upload error", err);
      alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "questions", id));
      fetchQuestions();
    } catch (e) {
      console.error(e);
      alert("Failed to delete question.");
    }
  };

  const fetchSubjects = async () => {
    try {
      const qs = await getDocs(collection(db, "subjects"));
      const data: any[] = [];
      qs.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setSubjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  const createSubject = async () => {
    const name = window.prompt("বিষয়ের নাম দিন:");
    if (!name) return;
    const group = window.prompt("গ্রুপের নাম দিন (যেমন: বিজ্ঞান, ব্যবসায় শিক্ষা, common):", "common");
    if (!group) return;
    try {
      const { setDoc } = await import("firebase/firestore");
      // Use name as ID for simplicity or auto id
      await addDoc(collection(db, "subjects"), {
        name,
        group,
        createdAt: serverTimestamp()
      });
      fetchSubjects();
    } catch (e) {
      console.error(e);
      alert("Failed to create subject");
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "subjects", id));
      fetchSubjects();
    } catch (e) {
      console.error(e);
      alert("Failed to delete subject");
    }
  };

  const fetchCoupons = async () => {
    try {
      const qs = await getDocs(collection(db, "coupons"));
      const data: any[] = [];
      qs.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setCoupons(data);
    } catch (error) {
      console.error(error);
    }
  };

  const createCoupon = async () => {
    if (!newCouponCode.trim() || !newCouponMonths.trim()) {
      alert("কোড এবং মেয়াদ দিন।");
      return;
    }
    const months = parseInt(newCouponMonths);
    if (isNaN(months) || months <= 0) {
      alert("সঠিক মেয়াদ দিন (যেমন: ১, ৩, ৬)।");
      return;
    }
    const finalCode = newCouponCode.trim().toUpperCase();
    try {
      const { setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "coupons", finalCode), {
        code: finalCode,
        months: months,
        active: true,
        createdAt: serverTimestamp()
      });
      fetchCoupons();
      setShowCreateCouponModal(false);
      setNewCouponCode("");
      setNewCouponMonths("1");
    } catch (e) {
      console.error(e);
      alert("Failed to create coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "coupons", id));
      fetchCoupons();
    } catch (e) {
      console.error(e);
      alert("Failed to delete coupon");
    }
  };

  const fetchPendingDoubts = async () => {
    setLoading(true);
    try {
      const { query, where } = await import("firebase/firestore");
      const q = query(collection(db, "doubts"), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      setPendingDoubts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "reports"));
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const answerDoubt = async (doubtId: string, answer: string) => {
    if(!answer.trim()) return;
    try {
      await updateDoc(doc(db, "doubts", doubtId), {
        status: "answered",
        answer: answer,
        answeredBy: "বিদ্যায়ন"
      });
      fetchPendingDoubts();
    } catch (e) {
      console.error(e);
      alert("Failed to submit answer.");
    }
  };

  const fetchPublicExams = async () => {
    setExamsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "public_exams"));
      const examsData: any[] = [];
      const now = new Date();
      const updatePromises: Promise<any>[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let isActive = data.active;
        if (data.active && data.closeAt) {
          const closeTime = new Date(data.closeAt);
          if (now > closeTime) {
            isActive = false;
            updatePromises.push(updateDoc(doc(db, "public_exams", docSnap.id), { active: false }));
          }
        }
        examsData.push({ id: docSnap.id, ...data, active: isActive });
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      // Sort by creation time manually or order in query
      setPublicExams(examsData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setExamsLoading(false);
    }
  };

  const resetLeaderboard = () => {
    setConfirmDialog({
      isOpen: true,
      message: "আপনি কি নিশ্চিত যে আপনি লিডারবোর্ড রিসেট করতে চান?",
      onConfirm: async () => {
        try {
          const usersSnapshot = await getDocs(collection(db, "users"));
          const updatePromises: any[] = [];
          usersSnapshot.forEach((userDoc) => {
            updatePromises.push(updateDoc(doc(db, "users", userDoc.id), { points: 0, totalExams: 0 }));
          });
          await Promise.all(updatePromises);
          alert("লিডারবোর্ড সফলভাবে রিসেট করা হয়েছে।");
        } catch (error) {
          console.error("Error resetting leaderboard:", error);
          alert("লিডারবোর্ড রিসেট করতে সমস্যা হয়েছে।");
        }
      }
    });
  };

  const createPublicExam = async () => {
    if (!newExamTitle) {
      alert("পরীক্ষার নাম দিন");
      return;
    }
    const duration = parseInt(newExamDuration);
    if (!duration) {
      alert("সঠিক সময় দিন");
      return;
    }

    let parsedQuestions: any[] = [];
    if (newExamQuestionsJSON.trim()) {
      try {
        parsedQuestions = JSON.parse(newExamQuestionsJSON);
        if (!Array.isArray(parsedQuestions)) {
           alert("JSON must be an array of questions.");
           return;
        }
      } catch(e) {
        alert("Invalid JSON format for questions.");
        return;
      }
    }

    const cleanCustomId = newExamCustomId.trim().replace(/[^a-zA-Z0-9\-_]/g, "");

    setExamsLoading(true);
    try {
      if (editingExamId) {
        const docData: any = {
          title: newExamTitle,
          duration,
          questions: parsedQuestions.length > 0 ? parsedQuestions : undefined,
          targetClass: newExamClass,
          type: newExamType,
          scheduledDate: newExamScheduledDate || null,
          closeAt: newExamCloseDate || null,
        };

        if (cleanCustomId && cleanCustomId !== editingExamId) {
          const existingExam = publicExams.find(e => e.id === editingExamId) || {};
          await setDoc(doc(db, "public_exams", cleanCustomId), {
            ...existingExam,
            ...docData,
            id: cleanCustomId
          });
          await deleteDoc(doc(db, "public_exams", editingExamId));
          alert("Public exam updated and ID changed successfully.");
        } else {
          await updateDoc(doc(db, "public_exams", editingExamId), docData);
          alert("Public exam updated successfully.");
        }
      } else {
        const finalDocId = cleanCustomId || Math.random().toString(36).substring(2, 8);
        await setDoc(doc(db, "public_exams", finalDocId), {
          title: newExamTitle,
          duration,
          active: true,
          questions: parsedQuestions,
          targetClass: newExamClass,
          type: newExamType,
          scheduledDate: newExamScheduledDate || null,
          closeAt: newExamCloseDate || null,
          createdAt: serverTimestamp()
        });
        alert("Public exam created successfully with ID: " + finalDocId);
      }
      fetchPublicExams();
      setShowCreateExamModal(false);
      setEditingExamId(null);
      setNewExamQuestionsJSON("");
      setNewExamTitle("Weekly Public Exam");
      setNewExamDuration("25");
      setNewExamClass("সকল ক্লাস");
      setNewExamType("public");
      setNewExamScheduledDate("");
      setNewExamCloseDate("");
      setNewExamCustomId("");
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("Failed to save public exam.");
    } finally {
      setExamsLoading(false);
    }
  };

  const deletePublicExam = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to delete this exam?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "public_exams", id));
          alert("Exam deleted.");
          fetchPublicExams();
        } catch (e) {
          console.error(e);
          alert("Failed to delete exam.");
        }
      }
    });
  };

  const resetPublicExamLeaderboard = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "আপনি কি নিশ্চিত যে আপনি এই পরীক্ষার লিডারবোর্ড রিসেট করতে চান?",
      onConfirm: async () => {
        try {
          const { query, where, getDocs, deleteDoc, doc, collection } = await import("firebase/firestore");
          const q = query(collection(db, "public_exam_results"), where("examId", "==", id));
          const snapshot = await getDocs(q);
          let count = 0;
          for (const resultDoc of snapshot.docs) {
            await deleteDoc(doc(db, "public_exam_results", resultDoc.id));
            count++;
          }
          alert(`লিডারবোর্ড সফলভাবে রিসেট করা হয়েছে। (${count} টি ডাটা মুছে ফেলা হয়েছে)`);
        } catch (e) {
          console.error(e);
          alert("লিডারবোর্ড রিসেট করতে সমস্যা হয়েছে।");
        }
      }
    });
  };

  const togglePublicExamActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "public_exams", id), { active: !currentStatus });
      fetchPublicExams();
    } catch (e) {
      console.error(e);
      alert("Failed to toggle status.");
    }
  };

  const printExam = (exam: any, showAnswers: boolean) => {
    // Capture scroll position and disable smooth scroll behavior
    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;
    const htmlEl = document.documentElement;
    const originalScrollBehavior = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    // Safeguard: Clean up any stale nodes from previous failed attempts
    const existingModal = document.getElementById("pdf-download-modal-exam");
    if (existingModal) existingModal.remove();
    const existingContainer = document.getElementById("print-temporary-container-exam");
    if (existingContainer) existingContainer.remove();

    // Create a loading modal overlay
    const modal = document.createElement("div");
    modal.id = "pdf-download-modal-exam";
    modal.className = "fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4";
    modal.innerHTML = `
      <div class="bg-card rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center gap-6 transform transition-all duration-300 scale-100">
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 animate-bounce">
          <svg class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 font-bengali">পিডিএফ ও প্রিন্ট সংস্করণ তৈরি হচ্ছে...</h3>
          <p class="text-sm text-slate-500 mt-2 font-bengali leading-relaxed font-semibold">
            প্রশ্নপত্রটি প্রসেস ও কম্পাইল করা হচ্ছে। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।
          </p>
        </div>
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div class="bg-indigo-600 h-full w-1/3 rounded-full animate-infinite-loader"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.body.classList.add("printing-allowed");
    const styleEl = document.createElement("style");
    styleEl.id = "print-style-override-exam";
    styleEl.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
      @media print {
        html, body {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
        }
        body > :not(#print-temporary-container-exam) {
          display: none !important;
        }
        #print-temporary-container-exam {
          display: block !important;
          position: relative !important;
          width: 100% !important;
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 20px !important;
          box-sizing: border-box !important;
          background: #fff;
          height: auto !important;
          overflow: visible !important;
        }
        @page { size: A4 portrait; margin: 15mm; }
      }
      #print-temporary-container-exam {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        max-width: 800px !important;
        background: white !important;
        display: block !important;
        margin: 0 auto !important;
        padding: 25px !important;
        box-sizing: border-box !important;
        z-index: 99999 !important;
      }
      .print-box-exam { font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif; color: #1e293b; padding: 20px 40px; width: 100%; box-sizing: border-box; line-height: 1.6; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .q-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
      .q-grid div { font-size: 15px; color: #334155; }
      .ans-box { background-color: #f0fdf4; padding: 12px; margin-top: 16px; border-radius: 4px; font-size: 14px; border-left: 3px solid #22c55e; }
      .header-title-exam { font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif; text-align: center !important; font-size: 32px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin: 0 auto 24px auto !important; width: 100% !important; display: block !important; }
      .header-title-sub { text-align: center; font-size: 22px; font-weight: 600; margin-bottom: 12px; color: #1e293b; }
      .header-meta-exam { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 30px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;}
    `;
    document.head.appendChild(styleEl);

    const container = document.createElement("div");
    container.id = "print-temporary-container-exam";
    // Prepend container to body flow at the very top
    document.body.insertBefore(container, document.body.firstChild);

    // Helper to dynamically extract options from embedded text strings
    const extractOptions = (text: string) => {
      const options: { id: string; label: string }[] = [];
      let cleanText = text;

      // Regular expressions for Latin and Bengali patterns
      const latinP1 = /A\)\s*(.*?)\s*B\)\s*(.*?)\s*C\)\s*(.*?)\s*D\)\s*(.*)/i;
      const latinP2 = /A\.\s*(.*?)\s*B\.\s*(.*?)\s*C\.\s*(.*?)\s*D\.\s*(.*)/i;
      const latinP3 = /\(A\)\s*(.*?)\s*\(B\)\s*(.*?)\s*\(C\)\s*(.*?)\s*\(D\)\s*(.*)/i;

      const benP1 = /ক\)\s*(.*?)\s*খ\)\s*(.*?)\s*গ\)\s*(.*?)\s*ঘ\)\s*(.*)/;
      const benP2 = /ক\.\s*(.*?)\s*খ\.\s*(.*?)\s*গ\.\s*(.*?)\s*ঘ\.\s*(.*)/;
      const benP3 = /\(ক\)\s*(.*?)\s*\(খ\)\s*(.*?)\s*\(গ\)\s*(.*?)\s*\(ঘ\)\s*(.*)/;

      let match = text.match(latinP1);
      const ids = ['A', 'B', 'C', 'D'];
      if (match) {
        cleanText = text.replace(/A\)\s*(.*?)\s*B\)\s*(.*?)\s*C\)\s*(.*?)\s*D\)\s*(.*)/i, "").trim();
        for (let j = 0; j < 4; j++) {
          options.push({ id: ids[j], label: match[j + 1].trim() });
        }
        return { cleanText, options };
      }

      match = text.match(latinP2);
      if (match) {
        cleanText = text.replace(/A\.\s*(.*?)\s*B\.\s*(.*?)\s*C\.\s*(.*?)\s*D\.\s*(.*)/i, "").trim();
        for (let j = 0; j < 4; j++) {
          options.push({ id: ids[j], label: match[j + 1].trim() });
        }
        return { cleanText, options };
      }

      match = text.match(latinP3);
      if (match) {
        cleanText = text.replace(/\(A\)\s*(.*?)\s*\(B\)\s*(.*?)\s*\(C\)\s*(.*?)\s*\(D\)\s*(.*)/i, "").trim();
        for (let j = 0; j < 4; j++) {
          options.push({ id: ids[j], label: match[j + 1].trim() });
        }
        return { cleanText, options };
      }

      const bIds = ['ক', 'খ', 'গ', 'ঘ'];
      match = text.match(benP1);
      if (match) {
        cleanText = text.replace(/ক\)\s*(.*?)\s*খ\)\s*(.*?)\s*গ\)\s*(.*?)\s*ঘ\)\s*(.*)/, "").trim();
        for (let j = 0; j < 4; j++) {
          options.push({ id: bIds[j], label: match[j + 1].trim() });
        }
        return { cleanText, options };
      }

      match = text.match(benP2);
      if (match) {
        cleanText = text.replace(/ক\.\s*(.*?)\s*খ\.\s*(.*?)\s*গ\.\s*(.*?)\s*ঘ\.\s*(.*)/, "").trim();
        for (let j = 0; j < 4; j++) {
          options.push({ id: bIds[j], label: match[j + 1].trim() });
        }
        return { cleanText, options };
      }

      match = text.match(benP3);
      if (match) {
        cleanText = text.replace(/\(ক\)\s*(.*?)\s*\(খ\)\s*(.*?)\s*\(গ\)\s*(.*?)\s*\(ঘ\)\s*(.*)/, "").trim();
        for (let j = 0; j < 4; j++) {
          options.push({ id: bIds[j], label: match[j + 1].trim() });
        }
        return { cleanText, options };
      }

      return { cleanText, options: [] };
    };
    
    let html = `<div class="print-box-exam">
      <div class="header-title-exam">বিদ্যায়ন</div>
      <div class="header-title-sub">${exam.title || 'Question Paper'}</div>
      <div class="header-meta-exam">
        <span>প্রিন্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}</span>
        <span>মোট প্রশ্ন: ${exam.questions?.length || 0} টি</span>
      </div>
      <div>
    `;
    
    if (exam.questions) {
        exam.questions.forEach((q: any, i: number) => {
            const qText = q.text || q.question || q.title || "No question provided.";
            let cleanQText = qText.trim().replace(/^[\d\u09E6-\u09EF]+\s*[\.\-\|)।:]+\s*/, "");
            let rawOptions = q.options || q.choices || [];
            if (!Array.isArray(rawOptions)) {
              if (typeof rawOptions === 'object' && rawOptions !== null) {
                rawOptions = Object.keys(rawOptions).map(key => ({
                  id: key,
                  label: (rawOptions as any)[key]
                }));
              } else {
                rawOptions = [];
              }
            }

            let safeOptions: any[] = [];
            // Try extracting from embedded question text first
            const extracted = extractOptions(cleanQText);
            if (extracted.options.length > 0) {
              cleanQText = extracted.cleanText;
              safeOptions = extracted.options;
            } else {
              safeOptions = rawOptions.map((opt: any, optIdx: number) => {
                if (typeof opt === 'string') {
                  return { id: String.fromCharCode(65 + optIdx), label: opt };
                }
                return {
                  id: opt?.id || String.fromCharCode(65 + optIdx),
                  label: opt?.label || opt?.text || opt?.value || ""
                };
              });
            }

            let rawCorrect = q.correctOption ?? q.correctAnswer ?? q.answer ?? "A";
            if (safeOptions.length > 0) {
               // Normalizer to map A->0, B->1, C->2, D->3, or ক->0, খ->1, etc.
               const getIndexFromChar = (char: string) => {
                 const clean = char.trim().toUpperCase();
                 if (clean === "A" || clean === "ক" || clean === "১") return 0;
                 if (clean === "B" || clean === "খ" || clean === "২") return 1;
                 if (clean === "C" || clean === "গ" || clean === "৩") return 2;
                 if (clean === "D" || clean === "ঘ" || clean === "৪") return 3;
                 return -1;
               };

               const targetIdx = getIndexFromChar(String(rawCorrect));
               if (targetIdx >= 0 && targetIdx < safeOptions.length) {
                 rawCorrect = safeOptions[targetIdx].id;
               } else {
                 const matchedOpt = safeOptions.find((o: any, oIndex: number) => {
                    const c = String(rawCorrect).trim().toLowerCase();
                    const oid = String(o.id).trim().toLowerCase();
                    const olbl = String(o.label).trim().toLowerCase();
                    return oid === c || olbl === c || olbl.startsWith(c) || c.startsWith(oid) || String(oIndex) === c;
                 });
                 if (matchedOpt) {
                    rawCorrect = matchedOpt.id;
                 } else if (typeof rawCorrect === 'number' && safeOptions[rawCorrect]) {
                    rawCorrect = safeOptions[rawCorrect].id;
                 }
               }
            }

            const correctOptionObj = safeOptions.find((o: any) => o.id === rawCorrect);
            const correctLabel = correctOptionObj ? correctOptionObj.label : rawCorrect;

            html += `
            <div class="page-break">
                <div style="font-weight: 600; font-size: 17px; color: #0f172a;">${i+1}. ${cleanQText}</div>
                <div class="q-grid">
                    ${safeOptions.map((opt: any) => 
                      `<div><span style="color: #2563eb; font-weight: 600; margin-right: 4px;">${opt.id})</span> ${opt.label}</div>`
                    ).join('')}
                </div>
                ${showAnswers ? `<div class="ans-box">
                    <div style="margin-bottom: 4px;">
                      <span style="font-weight: 700; color: #166534; font-size: 13px; background: #dcfce7; padding: 2px 6px; border-radius: 4px; margin-right: 8px;">ANS: ${rawCorrect}</span> 
                      <span style="font-weight: 700; color: #15803d;">সঠিক উত্তর: ${correctLabel}</span>
                    </div>
                    ${q.explanation ? `<div style="margin-top: 6px; font-size: 13px; color: #3f6212;"><span style="font-weight: 600; color: #4d7c0f">ব্যাখ্যা:</span> ${q.explanation}</div>` : ''}
                </div>` : ''}
            </div>`;
        });
    }
    
    html += `</div></div>`;
    container.innerHTML = html;

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      setTimeout(() => {
        styleEl.remove();
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        if (container && container.parentNode) container.parentNode.removeChild(container);
        htmlEl.style.scrollBehavior = originalScrollBehavior;
        window.scrollTo(originalScrollX, originalScrollY);
        document.body.classList.remove("printing-allowed");
      }, 1000);
    };

    const runHtml2Pdf = () => {
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `${exam.title || 'বিদ্যায়ন-প্রশ্ন'}${showAnswers ? '-উত্তরসহ' : ''}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5, 
          useCORS: true,
          letterRendering: false,
          logging: false,
          width: 800,
          windowWidth: 800,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: '.ans-box'
        }
      };

      const win = window as any;
      if (win.html2pdf) {
        win.html2pdf()
          .set(opt)
          .from(container)
          .save()
          .then(() => {
            window.focus();
            try { window.print(); } catch(e) { console.error(e); }
            cleanup();
          })
          .catch((err: any) => {
            console.error("html2pdf failed: ", err);
            window.focus();
            try { window.print(); } catch(e) { console.error(e); }
            cleanup();
          });
      } else {
        window.focus();
        try { window.print(); } catch(e) { console.error(e); }
        cleanup();
      }
    };

    window.addEventListener("afterprint", cleanup, { once: true });
    
    const win = window as any;
    if (win.html2pdf) {
      setTimeout(runHtml2Pdf, 350);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        setTimeout(runHtml2Pdf, 350);
      };
      script.onerror = () => {
        window.focus();
        try { window.print(); } catch(e) { console.error(e); }
        cleanup();
      };
      document.head.appendChild(script);
    }

    setTimeout(cleanup, 35000);
  };

  const openEditPublicExam = (exam: any) => {
    setEditingExamId(exam.id);
    setNewExamTitle(exam.title);
    setNewExamDuration(exam.duration?.toString() || "25");
    setNewExamQuestionsJSON(exam.questions ? JSON.stringify(exam.questions, null, 2) : "");
    setNewExamClass(exam.targetClass || "সকল ক্লাস");
    setNewExamType(exam.type || "public");
    setNewExamScheduledDate(exam.scheduledDate || "");
    setNewExamCloseDate(exam.closeAt || "");
    setNewExamCustomId(exam.id || "");
    setShowCreateExamModal(true);
  };

  const copyExamLink = (id: string, type?: string) => {
    const domain = window.location.origin;
    let path = "Exam";
    
    if (type === "event_exam") {
      path = "Quiz";
    } else if (type === "question_bank" || type === "qs_bank" || type === "qsbank") {
      path = "Qsbank";
    } else if (type === "model_test" || type === "live_model_test") {
      path = "Modeltest";
    }
    
    const url = `${domain}/${path}/${id}`;
    navigator.clipboard.writeText(url);
    alert("Exam Link Copied: " + url);
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      // Just check a single doc for global settings, e.g. "settings/general"
      const docRef = doc(db, "settings", "general");
      const { getDoc } = await import("firebase/firestore");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettingsData((prev: any) => ({
          ...prev,
          ...data,
          subscriptionPlans: data.subscriptionPlans || prev.subscriptionPlans
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    try {
       const docRef = doc(db, "settings", "general");
       const { setDoc } = await import("firebase/firestore");
       await setDoc(docRef, settingsData, { merge: true });
       alert("Settings saved successfully.");
    } catch (error) {
       console.error("Error saving settings:", error);
       alert("Failed to save settings.");
    } finally {
       setSettingsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let isPro = data.isPro;
        
        const userEmail = data.email?.toLowerCase() || '';
        const isAdmin = userEmail === "mdfoyej081@gmail.com" || userEmail === "seneiaislam@gmail.com" || data.isAdmin === true;
        
        if (isAdmin || data.isTutor) {
          isPro = true;
        } else if (data.proUntil && new Date(data.proUntil.toMillis ? data.proUntil.toMillis() : data.proUntil).getTime() < Date.now()) {
          isPro = false;
        }
        
        usersData.push({ id: doc.id, ...data, isPro, isAdmin });
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProStatus = async (userId: string, currentStatus: boolean, months?: number) => {
    try {
      if (!currentStatus) {
        const giftMonthsValue = months || 1;
        const { Timestamp } = await import("firebase/firestore");
        const proUntilMillis = Date.now() + giftMonthsValue * 30 * 24 * 60 * 60 * 1000;
        await updateDoc(doc(db, "users", userId), { 
          isPro: true,
          proUntil: Timestamp.fromMillis(proUntilMillis)
        });
      } else {
        await updateDoc(doc(db, "users", userId), { isPro: false, proUntil: null });
      }
      fetchUsers(); // Refresh
    } catch (error) {
      console.error("Error updating pro status:", error);
      alert("Failed to update user.");
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setConfirmDialog({
      isOpen: true,
      message: `আপনি কি নিশ্চিতভাবে এই ইউজারকে ${currentStatus ? 'এডমিন থেকে সাধারণ ইউজার' : 'এডমিন'} করতে চান?`,
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "users", userId), { isAdmin: !currentStatus });
          fetchUsers();
          alert("Admin status updated successfully!");
        } catch (error) {
          console.error("Error updating admin status:", error);
          alert("Failed to update status.");
        }
      }
    });
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

  const deleteUser = (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to delete this user?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "users", userId));
          alert("User deleted successfully.");
          fetchUsers();
        } catch (e) {
          console.error(e);
          alert("Failed to delete user.");
        }
      }
    });
  };

  const groupedBanks = questions.reduce((acc, q) => {
    const title = q.title || "Uncategorized";
    if (!acc[title]) acc[title] = [];
    acc[title].push(q);
    return acc;
  }, {} as Record<string, any[]>);

  const activeBankQuestions = selectedBankTitle 
    ? (groupedBanks[selectedBankTitle] || []) 
    : (questionSubjectFilter !== "All Subjects" ? questions : []);

  const filteredQuestions = activeBankQuestions.filter(q => {
    const matchesSearch = questionSearch ? (q.text?.toLowerCase().includes(questionSearch.toLowerCase()) || q.title?.toLowerCase().includes(questionSearch.toLowerCase())) : true;
    const matchesSubject = questionSubjectFilter !== "All Subjects" ? q.subject === questionSubjectFilter : true;
    return matchesSearch && matchesSubject;
  });

  const universalFilteredQuestions = questions.filter(q => {
    // 1. Search text matching
    const matchesSearch = explorerSearch 
      ? (
          q.text?.toLowerCase().includes(explorerSearch.toLowerCase()) || 
          q.title?.toLowerCase().includes(explorerSearch.toLowerCase()) || 
          q.subject?.toLowerCase().includes(explorerSearch.toLowerCase())
        ) 
      : true;

    // 2. Format filter: "all" | "mcq" | "cq" | "k_vandar" | "kh_vandar"
    let matchesFormat = true;
    if (explorerFormatFilter === "mcq") {
      matchesFormat = !q.is_cq && !q.is_k_vandar && !q.is_kh_vandar;
    } else if (explorerFormatFilter === "cq") {
      matchesFormat = q.is_cq && !q.is_k_vandar && !q.is_kh_vandar;
    } else if (explorerFormatFilter === "k_vandar") {
      matchesFormat = q.is_k_vandar === true;
    } else if (explorerFormatFilter === "kh_vandar") {
      matchesFormat = q.is_kh_vandar === true;
    }

    // 3. Class filter: "all" | "HSC" | "SSC" | "Admission" | "Class 11" | "Class 12" etc.
    let matchesClass = true;
    if (explorerClassFilter !== "all") {
      matchesClass = q.classGroup === explorerClassFilter || q.class === explorerClassFilter;
    }

    // 4. Subject filter: "all" | string
    let matchesSubject = true;
    if (explorerSubjectFilter !== "all") {
      matchesSubject = normalizeSubjectName(q.subject) === normalizeSubjectName(explorerSubjectFilter);
    }

    return matchesSearch && matchesFormat && matchesClass && matchesSubject;
  });

  
  const classCounts = users.reduce((acc: Record<string, number>, user: any) => {
    const c = user.class || "Unknown";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const sortedClasses = Object.entries(classCounts).sort((a, b) => Number(b[1]) - Number(a[1]));

  const uniqueClasses = Array.from(new Set(users.map(u => u.class).filter(Boolean))).sort();
  const filteredUsers = users.filter(u => {
    const matchesSearch = studentSearch ? (u.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) || u.phoneNumber?.includes(studentSearch) || u.email?.toLowerCase().includes(studentSearch.toLowerCase())) : true;
    const matchesClass = studentClassFilter !== "All Classes" ? u.class === studentClassFilter : true;
    let matchesRole = true;
    if (userRoleTab === "tutor") matchesRole = u.isTutor === true;
    if (userRoleTab === "admin") matchesRole = u.isAdmin === true;
    
    return matchesSearch && matchesClass && matchesRole;
  });

  const topTutors = [...users].filter(u => u.isTutor).sort((a, b) => (b.points || 0) - (a.points || 0));

  const toBengaliNumber = (num: number) => {
    const bnNo = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().replace(/\d/g, (d) => bnNo[parseInt(d)]);
  };

  const dynamicTrends = useMemo(() => {
    const monthsName = ["জানু", "ফের", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const now = new Date();
    const list: any[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      
      const studentsCumulative = users.filter(usr => {
        if (!usr.createdAt) return true;
        const usrDate = usr.createdAt.seconds ? new Date(usr.createdAt.seconds * 1000) : new Date(usr.createdAt);
        return usrDate <= new Date(yr, mIdx + 1, 0);
      }).length;

      const monthEarnings = paymentRequests.filter(req => {
        if (req.status !== "approved" && req.status !== "success") return false;
        if (!req.createdAt) return false;
        const reqDate = req.createdAt.seconds ? new Date(req.createdAt.seconds * 1000) : new Date(req.createdAt);
        return reqDate.getMonth() === mIdx && reqDate.getFullYear() === yr;
      }).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const examsCount = Number(analyticsData?.examsCount || 0);

      list.push({
        name: monthsName[mIdx],
        student: studentsCumulative || 5,
        testCount: Math.ceil((examsCount || 10) * (6 - i) / 12) || i + 1,
        income: monthEarnings || 0
      });
    }
    return list;
  }, [users, paymentRequests, analyticsData]);

  const dynamicEnrollmentData = useMemo(() => {
    const proCount = users.filter(u => u.isPro).length;
    const generalCount = users.filter(u => !u.isPro).length;
    const pendingCount = users.filter(u => !u.class && !u.group).length;

    const totalCalculated = Math.max(users.length, 1);
    const activePct = Math.round((proCount / totalCalculated) * 100);
    const inactivePct = Math.round(((generalCount - pendingCount) / totalCalculated) * 100);
    const pendingPct = Math.max(100 - activePct - inactivePct, 0);

    return {
      pieData: [
        { name: "একটিভ প্রিমিয়াম", value: Math.max(proCount, proCount > 0 ? proCount : 1) },
        { name: "সাধারণ শিক্ষার্থী", value: Math.max(generalCount - pendingCount, generalCount - pendingCount > 0 ? generalCount - pendingCount : 1) },
        { name: "অনবোর্ডিং পেন্ডিং", value: Math.max(pendingCount, pendingCount > 0 ? pendingCount : 1) }
      ],
      counts: {
        proCount,
        generalCount: Math.max(generalCount - pendingCount, 0),
        pendingCount,
        activePct,
        inactivePct,
        pendingPct
      }
    };
  }, [users]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background gap-6 -mt-2 -mx-4 px-4 py-4 md:-mx-8 md:px-8">
      {/* Premium Admin Sidebar */}
      <aside className="w-full lg:w-[280px] bg-card border border-slate-100/80 rounded-[32px] p-5 shrink-0 flex flex-col shadow-sm transition-all duration-300">
        {/* Logo Header */}
        <div className="mb-6 p-2 flex items-center gap-3 border-b border-slate-50 pb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Crown className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-bengali flex items-center gap-1 leading-none">
              বিদ্যা<span className="text-amber-500">য়ন</span>
            </h2>
            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-1.5 font-mono">Admin Portal</p>
          </div>
        </div>
        
        {/* Sidebar Navigation Links styled after image */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/15 font-bold" 
                    : "text-muted-foreground hover:bg-muted hover:text-slate-900"
                  }
                `}
              >
                {/* Icon wrapper */}
                <div className={`p-2 rounded-xl transition-colors shrink-0
                  ${isActive ? "bg-card/15 text-white" : "bg-muted text-slate-500 group-hover:bg-card group-hover:text-slate-700"}
                `}>
                  {item.icon}
                </div>
                
                {/* Dual label text (Bengali bold + English small) */}
                <div className="flex flex-col text-left leading-tight">
                  <span className={`font-bengali text-sm font-semibold tracking-wide ${isActive ? "text-white" : "text-slate-700"}`}>
                    {item.bnLabel}
                  </span>
                  <span className={`text-[10px] font-mono tracking-normal mt-0.5 ${isActive ? "text-blue-100" : "text-slate-400 font-semibold"}`}>
                    {item.enLabel}
                  </span>
                </div>

                {/* Optional "New" Badge */}
                {item.isNew && (
                  <span className="ml-auto px-2 py-0.5 text-[9px] font-bold tracking-tight bg-blue-550 text-white font-mono rounded-md uppercase animate-pulse">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Decorative Promotional / Workspace Card at the bottom of the sidebar */}
        <div className="mt-6 p-4 bg-gradient-to-b from-[#0F2744] to-[#0A1B30] rounded-[28px] text-white text-center shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
          <div className="relative z-10 flex flex-col items-center">
            {/* Standard illustrative icon */}
            <div className="w-12 h-12 rounded-2xl bg-card/10 backdrop-blur-md flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-sm font-bengali font-semibold tracking-wide text-zinc-100">শিক্ষাকে করবো সহজ</h4>
            <p className="text-[11px] text-zinc-400 font-bengali mt-1 leading-snug">আমাদের সাথে এগিয়ে চলুন সর্বদা</p>
            <Button 
              onClick={() => navigate("/")}
              variant="secondary" 
              className="mt-4 w-full h-9 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-none rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 group/btn shadow-sm"
            >
              <span>ভিজিট করুন</span>
              <span className="text-xs transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
            </Button>
          </div>
        </div>

        {/* Quick Logout Button */}
        <div className="pt-4 mt-4 border-t border-slate-50">
          <Button 
            onClick={async () => { const { auth } = await import('../lib/firebase'); await auth.signOut(); navigate('/'); }}
            variant="ghost" 
            className="w-full text-red-650 hover:text-red-700 hover:bg-red-50/50 rounded-2xl flex justify-start pl-4 cursor-pointer font-bold"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            <span className="font-bengali">লগআউট (Logout)</span>
          </Button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 min-w-0">
        {/* Premium Top Navigation Header */}
        <header className="bg-card border border-slate-100/50 rounded-3xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Left search */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <button className="md:hidden p-2 hover:bg-muted rounded-xl">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="খুঁজুন (শিক্ষার্থী, বিষয়, পরীক্ষা...)" 
                className="w-full bg-[#F1F5F9]/80 border-none rounded-2xl pl-12 pr-4 py-2.5 text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder-slate-400 font-semibold"
              />
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4 shrink-0 justify-end w-full md:w-auto">
            {/* Bell notification */}
            <button className="relative p-2.5 bg-muted hover:bg-slate-100 rounded-2xl transition-all cursor-pointer">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-550 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                6
              </span>
            </button>

            {/* Theme Toggle placeholder */}
            <button className="p-2.5 bg-muted hover:bg-slate-100 rounded-2xl transition-all cursor-pointer">
              <Moon className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Profile info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-550 border border-indigo-100 overflow-hidden flex items-center justify-center">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5 text-indigo-505" />
                )}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground font-bengali leading-none">Admin</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 font-semibold leading-none">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" ? (
          <div className="space-y-6 pb-12">
            {/* Dashboard Welcome Head row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground font-bengali flex items-center gap-2 leading-tight">
                  স্বাগতম, Admin 👋
                </h3>
                <p className="text-sm text-slate-500 mt-1 font-semibold font-bengali">এখানে আপনার প্রতিষ্ঠানের সার্বিক অগ্রগতি দেখুন</p>
              </div>
              
              {/* Date dropdown */}
              <div className="flex items-center gap-2 bg-card px-4 py-2.5 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 font-bengali shadow-sm cursor-pointer hover:bg-muted transition-all">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>২৬ মে, ২০২৪</span>
                <span className="text-[10px] text-slate-400 ml-1">▼</span>
              </div>
            </div>

            {/* 4 Premium Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Students */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-slate-400 font-bengali">মোট শিক্ষার্থী</div>
                  <div className="text-2xl md:text-3xl font-black text-foreground mt-2 tracking-tight">
                    {toBengaliNumber(users.length)} জন
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#10B981] font-semibold">
                    <span className="bg-[#10B981]/15 px-2 py-0.5 rounded-full text-[10px]">সরাসরি</span>
                    <span className="text-slate-400 font-bengali">ডাটাবেজ থেকে</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <Users className="w-7 h-7" />
                </div>
              </div>

              {/* Card 2: Total Courses */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-slate-400 font-bengali">মোট কোর্স</div>
                  <div className="text-2xl md:text-3xl font-black text-foreground mt-2 tracking-tight">
                    {toBengaliNumber(analyticsData?.subjectsCount || subjects.length || 0)} টি
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#10B981] font-semibold">
                    <span className="bg-[#10B981]/15 px-2 py-0.5 rounded-full text-[10px]">সক্রিয়</span>
                    <span className="text-slate-400 font-bengali">বিষয় ও নোটস</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <BookOpen className="w-7 h-7" />
                </div>
              </div>

              {/* Card 3: Total Exams */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-slate-400 font-bengali">মোট পরীক্ষা</div>
                  <div className="text-2xl md:text-3xl font-black text-foreground mt-2 tracking-tight">
                    {toBengaliNumber(analyticsData?.examsCount || publicExams.length || 0)} টি
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#10B981] font-semibold">
                    <span className="bg-[#10B981]/15 px-2 py-0.5 rounded-full text-[10px]">অংশগ্রহণযোগ্য</span>
                    <span className="text-slate-400 font-bengali">মডেল টেস্ট</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <Layers className="w-7 h-7" />
                </div>
              </div>

              {/* Card 4: Total Earnings */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-slate-400 font-bengali">মোট আয়</div>
                  <div className="text-2xl md:text-3xl font-black text-foreground mt-2 tracking-tight flex items-baseline">
                    ৳ {toBengaliNumber(paymentRequests.filter(r => r.status === 'approved' || r.status === 'success').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#10B981] font-semibold">
                    <span className="bg-[#10B981]/15 px-2 py-0.5 rounded-full text-[10px]">অনুমোদিত</span>
                    <span className="text-slate-400 font-bengali">পেমেন্ট রিসিভ</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-550 shrink-0">
                  <Crown className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Recharts Analytics: Line chart + Pie charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Progress (Line Chart) */}
              <div className="lg:col-span-2 bg-card border border-slate-100/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-foreground font-bengali font-black">সার্বিক অগ্রগতি <span className="text-xs text-slate-400 font-semibold">(গত ৬ মাস)</span></h4>
                  </div>
                  <select className="border border-slate-105 bg-muted px-3 py-1.5 rounded-xl text-xs text-slate-500 font-bengali focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer">
                    <option>৬ মাস</option>
                    <option>৩ মাস</option>
                    <option>১ বছর</option>
                  </select>
                </div>

                {/* 3 legends from image */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
                    <span className="text-muted-foreground font-bengali">শিক্ষার্থী</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#10b981] rounded-full inline-block"></span>
                    <span className="text-muted-foreground font-bengali">পরীক্ষায় অংশগ্রহণ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#a855f7] rounded-full inline-block"></span>
                    <span className="text-muted-foreground font-bengali font-black">আয় (৳)</span>
                  </div>
                </div>

                {/* Main line chart */}
                <div className="h-64 sm:h-72 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart 
                      data={[
                        { name: "ভিদে", student: 6200, testCount: 3800, income: 2800 },
                        { name: "জানু", student: 9000, testCount: 6800, income: 3800 },
                        { name: "ফের", student: 7800, testCount: 5200, income: 3200 },
                        { name: "মার্চ", student: 10200, testCount: 8100, income: 4200 },
                        { name: "এপ্রিল", student: 9500, testCount: 7300, income: 3900 },
                        { name: "মে", student: 11400, testCount: 9200, income: 5200 },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="student" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="testCount" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="income" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Student Enrollment Doughnut Chart */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-foreground font-bengali font-black"> শিক্ষার্থীর এনরোলমেন্ট</h4>
                </div>

                <div className="relative flex items-center justify-center my-6 h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "একটিভ", value: 7845 },
                          { name: "ইনএকটিভ", value: 3245 },
                          { name: "পেন্ডিং", value: 1755 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#3B82F6" />
                        <Cell fill="#10B981" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Absolute core dynamic indicator total in center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-foreground tracking-tight leading-none">
                      {users.length && users.length > 0 ? users.length.toLocaleString('en-US') : "12,845"}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-400 font-bengali mt-1">মোট</span>
                  </div>
                </div>

                {/* Custom Styled Legends to match image */}
                <div className="space-y-2 text-xs font-semibold mt-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                      <span className="text-muted-foreground font-bengali">একটিভ</span>
                    </div>
                    <span className="text-slate-500 font-mono">7,845 (61%)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></span>
                      <span className="text-muted-foreground font-bengali font-black">ইনএকটিভ</span>
                    </div>
                    <span className="text-slate-500 font-mono">3,245 (25%)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                      <span className="text-muted-foreground font-bengali">পেন্ডিং</span>
                    </div>
                    <span className="text-slate-500 font-mono">1,755 (14%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List Row (3 Columns: Students, Payments, Model Tests) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Recent Students Column */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-foreground font-bengali">সাম্প্রতিক শিক্ষার্থী</h4>
                  <button onClick={() => setActiveTab("students")} className="text-xs text-blue-600 hover:underline font-bengali font-semibold cursor-pointer">
                    সব দেখুন
                  </button>
                </div>

                <div className="space-y-3.5 flex-1">
                  {(users.length > 0 ? users.slice(0, 4) : [
                    { id: "s1", fullName: "রাফি আহমেদ", class: "১০ম শ্রেনী", dateText: "25 মে, 2024", status: "Active" },
                    { id: "s2", fullName: "তাসনিম যারা", class: "৯ম শ্রেনী", dateText: "25 মে, 2024", status: "Active" },
                    { id: "s3", fullName: "আরিফুল ইসলাম", class: "৮ম শ্রেনী", dateText: "24 মে, 2024", status: "Inactive" },
                    { id: "s4", fullName: "সাদিয়া আফরিন", class: "১ম শ্রেনী", dateText: "24 মে, 2024", status: "Pending" }
                  ]).map((stu: any, index: number) => {
                    const fallbackNames = ["রাফি আহমেদ", "তাসনিম যারা", "আরিফুল ইসলাম", "সাদিয়া আফরিন"];
                    const fallbackStatuses = ["Active", "Active", "Inactive", "Pending"];
                    const fallbackDates = ["25 মে, 2024", "25 মে, 2024", "24 মে, 2024", "24 মে, 2024"];

                    const name = stu.fullName || stu.name || fallbackNames[index % 4];
                    const dateVal = stu.createdAt ? new Date(stu.createdAt?.seconds * 1000).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : fallbackDates[index % 4];
                    const status = stu.status || fallbackStatuses[index % 4];

                    return (
                      <div key={stu.id || index} className="flex items-center justify-between border-b border-slate-50/50 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-650 font-black text-xs font-mono uppercase bg-gradient-to-br from-indigo-50 to-indigo-100">
                            {name ? name.substring(0, 2) : "ST"}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground font-bengali leading-none text-left">{name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1 text-left">{dateVal}</div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {status === "Active" ? (
                            <span className="px-2.5 py-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-xl font-mono">Active</span>
                          ) : status === "Pending" ? (
                            <span className="px-2.5 py-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-xl font-mono">Pending</span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-xl font-mono">Inactive</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Payments Column */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-foreground font-bengali">সাম্প্রতিক পেমেন্ট</h4>
                  <button onClick={() => setActiveTab("payments")} className="text-xs text-blue-600 hover:underline font-bengali font-semibold cursor-pointer">
                    সব দেখুন
                  </button>
                </div>

                <div className="space-y-3.5 flex-1">
                  {(paymentRequests.length > 0 ? paymentRequests.slice(0, 4) : [
                    { id: "p1", studentName: "রাফি আহমেদ", txid: "#TXN-12548", dateText: "25 মে, 2024", amount: 2500, verified: true },
                    { id: "p2", studentName: "তাসনিম যারা", txid: "#TXN-12547", dateText: "25 মে, 2024", amount: 1200, verified: true },
                    { id: "p3", studentName: "আরিফুল ইসলাম", txid: "#TXN-12546", dateText: "24 মে, 2024", amount: 2500, verified: false, isFailed: true },
                    { id: "p4", studentName: "সাদিয়া আফরিন", txid: "#TXN-12545", dateText: "24 মে, 2024", amount: 1500, verified: false }
                  ]).map((pay: any, index: number) => {
                    const fallbackNames = ["রাফি আহমেদ", "তাসনিম যারা", "আরিফুল ইসলাম", "সাদিয়া আফরিন"];
                    const fallbackDates = ["25 মে, 2024", "25 মে, 2024", "24 মে, 2024", "24 মে, 2024"];
                    const fallbackTxns = ["#TXN-12548", "#TXN-12547", "#TXN-12546", "#TXN-12545"];
                    const fallbackAmounts = [2500, 1200, 2500, 1500];

                    const name = pay.studentName || pay.fullName || fallbackNames[index % 4];
                    const dateVal = pay.timestamp ? new Date(pay.timestamp?.seconds * 1000).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : fallbackDates[index % 4];
                    const amount = pay.amount || fallbackAmounts[index % 4];
                    const txn = pay.txid || pay.transactionId || fallbackTxns[index % 4];
                    const status = pay.verified ? "succeeded" : (pay.isFailed ? "failed" : "pending");

                    return (
                      <div key={pay.id || index} className="flex items-center justify-between border-b border-slate-50/50 pb-2">
                        <div className="text-left">
                          <div className="text-[11px] font-bold text-slate-500 font-mono leading-none">{txn}</div>
                          <div className="text-xs font-semibold text-foreground font-bengali mt-1">{name}</div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">{dateVal}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-850 font-mono">৳ {amount.toLocaleString('en-US')}</div>
                          <div className="mt-1 flex justify-end">
                            {status === "succeeded" ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold text-[#10B981] bg-emerald-50 rounded-xl font-bengali border border-emerald-100 font-bold">সফল</span>
                            ) : status === "failed" ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold text-rose-600 bg-rose-50 rounded-xl font-bengali border border-rose-100 font-bold">ব্যর্থ</span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold text-orange-600 bg-orange-50 rounded-xl font-bengali border border-orange-100 font-bold">পেন্ডিং</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Exams Column */}
              <div className="bg-card border border-slate-100/60 rounded-3xl p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-foreground font-bengali">সাম্প্রতিক পরীক্ষা</h4>
                  <button onClick={() => setActiveTab("exams")} className="text-xs text-blue-600 hover:underline font-bengali font-semibold cursor-pointer">
                    সব দেখুন
                  </button>
                </div>

                <div className="space-y-3.5 flex-1">
                  {(publicExams.length > 0 ? publicExams.slice(0, 4) : [
                    { id: "e1", title: "HSC Physics Quiz", dateText: "25 মে, 2024", attendees: 1245, state: "ongoing" },
                    { id: "e2", title: "SSC Math MCQ", dateText: "24 মে, 2024", attendees: 2357, state: "ongoing" },
                    { id: "e3", title: "JSC English Test", dateText: "23 মে, 2024", attendees: 1026, state: "completed" },
                    { id: "e4", title: "HSC Chemistry", dateText: "22 মে, 2024", attendees: 987, state: "completed" }
                  ]).map((exam: any, index: number) => {
                    const fallbackTitles = ["HSC Physics Quiz", "SSC Math MCQ", "JSC English Test", "HSC Chemistry"];
                    const fallbackDates = ["25 মে, 2024", "24 মে, 2024", "23 মে, 2024", "22 মে, 2024"];
                    const fallbackAttendees = [1245, 2357, 1026, 987];
                    const fallbackStates = ["ongoing", "ongoing", "completed", "completed"];

                    const title = exam.title || fallbackTitles[index % 4];
                    const dateVal = exam.dateText || fallbackDates[index % 4];
                    const attendees = exam.attendees || fallbackAttendees[index % 4];
                    const state = exam.state || fallbackStates[index % 4];

                    return (
                      <div key={exam.id || index} className="flex items-center justify-between border-b border-slate-50/50 pb-2">
                        <div className="text-left">
                          <div className="text-xs font-bold text-foreground tracking-tight leading-none">{title}</div>
                          <div className="text-[9px] text-slate-400 font-mono mt-1">{dateVal}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-700 tracking-tight flex items-baseline justify-end gap-1">
                            <span className="text-[10px] text-slate-400 font-bengali font-semibold">পাস</span>
                            <span>{attendees.toLocaleString('en-US')}</span>
                          </div>
                          <div className="mt-1 flex justify-end">
                            {state === "ongoing" ? (
                              <span className="px-2 py-0.5 text-[9px] font-semibold text-[#10B981] bg-[#10B981]/15 rounded-xl font-bengali border border-emerald-100 font-bold">চলমান</span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-semibold text-blue-600 bg-blue-50/80 rounded-xl font-bengali border border-blue-100 font-bold">সম্পন্ন</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Row */}
            <div className="bg-card border border-slate-100/60 rounded-3xl p-6 shadow-sm">
              <h4 className="text-xs md:text-sm font-bold text-foreground font-bengali mb-4 text-left">দ্রুত অ্যাকশন</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Action 1 */}
                <button 
                  onClick={() => setActiveTab("students")} 
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-blue-600 hover:text-blue-700 transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2 text-blue-600 shadow-sm shrink-0">
                    <Users className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-xs font-bold font-bengali text-slate-700">নতুন শিক্ষার্থী</span>
                </button>

                {/* Action 2 */}
                <button 
                  onClick={() => setActiveTab("exams")} 
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FAF5FF] hover:bg-[#F3E8FF] text-purple-600 hover:text-purple-700 transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-2 text-purple-600 shadow-sm shrink-0">
                    <Layers className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-xs font-bold font-bengali text-slate-705">নতুন পরীক্ষা</span>
                </button>

                {/* Action 3 */}
                <button 
                  onClick={() => setActiveTab("payments")} 
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] hover:text-[#047857] transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center mb-2 text-[#059669] shadow-sm shrink-0">
                    <Crown className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-xs font-bold font-bengali text-slate-700">পেমেন্ট ভেরিফাই</span>
                </button>

                {/* Action 4 */}
                <button 
                  onClick={() => setActiveTab("notes_creator")} 
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] hover:text-[#BE123C] transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] flex items-center justify-center mb-2 text-[#E11D48] shadow-sm shrink-0">
                    <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-xs font-bold font-bengali text-slate-705">নোটস মেকার</span>
                </button>

                {/* Action 5 */}
                <button 
                  onClick={() => setActiveTab("sms")} 
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FFFBEB] hover:bg-[#FEF3C7] text-amber-600 hover:text-amber-700 transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center mb-2 text-amber-600 shadow-sm shrink-0">
                    <Send className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-xs font-bold font-bengali text-slate-700">এসএমএস পাঠান</span>
                </button>

                {/* Action 6 */}
                <button 
                  onClick={() => setActiveTab("reports")} 
                  className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] hover:text-[#0F766E] transition-all duration-200 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] flex items-center justify-center mb-2 text-[#0D9488] shadow-sm shrink-0">
                    <AlertCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-xs font-bold font-bengali text-slate-700">রিপোর্ট দেখুন</span>
                </button>
              </div>
            </div>

            {/* Performance gradient banner */}
            <div className="bg-gradient-to-r from-[#EFF6FF] via-[#EEF2F6] to-white border border-blue-50/50 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex-1">
                <h4 className="text-lg md:text-xl font-bold text-foreground font-bengali leading-none text-left font-black">আপনার প্রতিষ্ঠানের পারফরম্যান্স</h4>
                <p className="text-xs text-slate-500 font-semibold font-bengali mt-2.5 text-left">নিয়মিত অগ্রগতি পর্যবেক্ষণ করুন এবং উন্নতি করুন</p>
                
                {/* 4 statistics row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-slate-100/50 text-left">
                    <div className="text-[12px] font-semibold text-slate-400 font-bengali leading-none font-bold">কোর্স সম্পন্ন</div>
                    <div className="text-xl font-black text-foreground mt-2">৭৮%</div>
                    <div className="text-[10px] text-[#10B981] font-semibold mt-1">↑ ১২.৫%</div>
                  </div>
                  <div className="p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-slate-100/50 text-left">
                    <div className="text-[12px] font-semibold text-slate-400 font-bengali leading-none font-bold">পরীক্ষায় অংশগ্রহণ</div>
                    <div className="text-xl font-black text-foreground mt-2">৬৫%</div>
                    <div className="text-[10px] text-[#10B981] font-semibold mt-1">↑ ৮.৭%</div>
                  </div>
                  <div className="p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-slate-100/50 text-left">
                    <div className="text-[12px] font-semibold text-slate-400 font-bengali leading-none font-bold">শিক্ষার্থীর উপস্থিতি</div>
                    <div className="text-xl font-black text-[#1e293b] mt-2">৯২%</div>
                    <div className="text-[10px] text-[#10B981] font-semibold mt-1">↑ ৫.৩%</div>
                  </div>
                  <div className="p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-slate-100/50 text-left">
                    <div className="text-[12px] font-semibold text-slate-400 font-bengali leading-none font-bold">গড় রেটিং</div>
                    <div className="text-xl font-black text-[#1e293b] mt-2">৪.৬/৫</div>
                    <div className="text-[10px] text-[#10B981] font-semibold mt-1">↑ ৭.৮%</div>
                  </div>
                </div>
              </div>

              {/* Elegant visual shadow student representation */}
              <div className="w-full md:w-56 shrink-0 flex items-center justify-center relative">
                <div className="w-44 h-44 rounded-full bg-indigo-50/70 border border-indigo-100 flex items-center justify-center relative shadow-inner">
                  <span className="absolute -left-1 top-6 p-1.5 bg-blue-500 rounded-lg text-white shadow-sm scale-90"><Send className="w-3.5 h-3.5" /></span>
                  <span className="absolute -right-1.5 top-14 p-1 bg-amber-400 rounded-full text-white shadow-sm scale-90">🏆</span>
                  <span className="absolute top-0 right-4 p-1.5 bg-purple-500 rounded-lg text-white shadow-sm scale-90"><Bell className="w-3.5 h-3.5" /></span>
                  
                  <div className="w-28 h-28 rounded-full bg-[#EEF2F6] border-4 border-white shadow overflow-hidden flex items-center justify-center relative">
                    <div className="w-16 h-16 bg-slate-350 rounded-full relative mt-4">
                      <div className="absolute top-0 inset-x-0 h-7 bg-amber-905 rounded-t-full"></div>
                      <div className="absolute top-5 left-2 w-12 flex justify-between px-1">
                        <span className="w-4 h-4 border-2 border-slate-800 rounded-full bg-card/50"></span>
                        <span className="w-4 h-4 border-2 border-slate-800 rounded-full bg-card/50"></span>
                      </div>
                      <div className="absolute bottom-4 left-6 w-4 h-2 border-b-2 border-slate-800 rounded-b-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class-wise Preview block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden bg-card">
                 <CardHeader className="bg-muted/50 border-b pb-4 p-6">
                   <CardTitle className="text-lg font-bengali font-black">ড্যাশবোর্ড প্রিভিউ (Class-wise Preview)</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                   <p className="text-sm text-slate-500 mb-4 font-bengali">আপনি কোন ক্লাসের ড্যাশবোর্ড দেখতে চান তা নির্বাচন করুন। এটি সাময়িক ভাবে আপনার প্রিভিউর ক্লাস পরিবর্তন করবে, যার ফলে আপনি একজন সাধারণ শিক্ষার্থীর মতো সাইটটি দেখতে পাবেন।</p>
                   <div className="flex flex-wrap gap-2 mb-6">
                     {["৬ষ্ঠ শ্রেণী", "৭ম শ্রেণী", "৮ম শ্রেণী", "নবম শ্রেণী", "দশম শ্রেণী", "এইচএসসি", "এডমিশন"].map((cls) => (
                       <Button 
                         key={cls as string} 
                         variant={(previewClass || userData?.class) === cls ? "default" : "outline"} 
                         size="sm"
                         className={(previewClass || userData?.class) === cls ? "bg-primary font-bengali text-white" : "font-bengali"}
                         onClick={() => {
                           if (setPreviewClass) setPreviewClass(cls as string);
                         }}
                       >
                         {cls as string}
                       </Button>
                     ))}
                   </div>
                   <div className="flex flex-col sm:flex-row gap-3">
                     <Button onClick={() => navigate('/dashboard')} className="flex-1 font-bengali">ড্যাশবোর্ডে যান</Button>
                     <Button variant="outline" onClick={() => navigate('/question-bank')} className="flex-1 font-bengali shadow-sm text-muted-foreground">প্রশ্ন ব্যাংক দেখুন</Button>
                     <Button variant="outline" onClick={() => navigate('/notes')} className="flex-1 font-bengali shadow-sm text-muted-foreground">নোটস দেখুন</Button>
                   </div>
                 </CardContent>
              </Card>
            </div>
          </div>

        ) : activeTab === "subject_questions" ? (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">বিষয়ভিত্তিক প্রশ্ন</h3>
                <p className="text-muted-foreground font-bengali text-sm mt-1">যেকোনো বিষয়ের ওপর সরাসরি প্রশ্ন যোগ করুন।</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-card text-primary font-bengali" onClick={() => {
                  setBulkUploadSubject(subjectBankFilter);
                  setShowBulkUpload(true);
                }}>
                  <Upload className="w-4 h-4 mr-2" /> Bulk Upload JSON
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bengali" onClick={() => setEditQuestion({
                  id: 'new', text: '', university: '', subject: subjectBankFilter, title: '', options: [{id: 'A', label: ''}, {id: 'B', label: ''}, {id: 'C', label: ''}, {id: 'D', label: ''}], correctOption: 'A', explanation: '', isSubjectWiseOnly: true
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন প্রশ্ন
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-2xl shadow-sm border border-slate-100">
               <label className="font-bengali font-bold whitespace-nowrap">বিষয় নির্বাচন করুন:</label>
               <select
                 className="flex-1 max-w-xs border rounded-xl p-2 text-sm font-bengali outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10 bg-muted"
                 value={subjectBankFilter}
                 onChange={(e) => setSubjectBankFilter(e.target.value)}
               >
                 <option value="">সকল বিষয়</option>
                 {Array.from(new Set([...allDynamicSubjects, ...subjects.map(s => s.name)].map(normalizeSubjectName))).map((sub: string) => (
                   <option key={sub} value={sub}>{getSubjectDisplayName(sub)}</option>
                 ))}
               </select>
            </div>

            <div className="grid gap-4 mt-6">
              {questions.filter(q => (!q.title || q.title === "Subject-wise Questions") && (subjectBankFilter ? q.subject === subjectBankFilter : true)).map((q: any) => (
                   <div key={q.id} className="bg-card p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4 group">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <Badge variant="outline" className="bg-blue-50 text-blue-700 font-bengali border-blue-200">{q.subject}</Badge>
                        </div>
                        <h4 className="font-bengali font-medium text-foreground text-base mb-3 leading-relaxed whitespace-pre-wrap">{q.text}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 opacity-80">
                            {Array.isArray(q.options) && q.options.map((opt: any, optIdx: number) => (
                               <div key={optIdx} className={`flex items-center gap-2 p-2 rounded-lg text-sm font-bengali ${q.correctOption === opt.id ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-muted border border-slate-100'}`}>
                                  <span className="font-bold">{opt.id}.</span> {opt.label}
                               </div>
                            ))}
                        </div>
                     </div>
                     <div className="flex sm:flex-col gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="h-8 shadow-none" onClick={() => setEditQuestion({...q, isSubjectWiseOnly: true})}>
                           <Edit className="w-3.5 h-3.5 mr-1.5" /> এডিট
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteQuestion(q.id)}>
                           <Trash2 className="w-3.5 h-3.5 mr-1.5" /> ডিলেট
                        </Button>
                     </div>
                   </div>
              ))}
            </div>
          </div>
        ) : activeTab === "questions" ? (
<div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">
                  {selectedBankTitle ? selectedBankTitle : (questionSubjectFilter !== "All Subjects" ? questionSubjectFilter + " - এর সকল প্রশ্ন" : "প্রশ্ন ব্যাংক ম্যানেজমেন্ট")}
                </h3>
                <p className="text-muted-foreground">
                  {selectedBankTitle || questionSubjectFilter !== "All Subjects" 
                    ? "এই ক্যাটাগরির সকল প্রশ্ন নিচে দেওয়া হলো।" 
                    : "যে ব্যাংক বা ফাইল আপলোড করেছেন তা নির্বাচন করুন অথবা সকল প্রশ্ন এক জায়গা থেকে ফিল্টার ও সার্চ করুন।"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedBankTitle || questionSubjectFilter !== "All Subjects" ? (
                  <>
                    <Button variant="outline" className="bg-card border-primary/20 text-muted-foreground font-bengali" onClick={() => { setSelectedBankTitle(null); setQuestionSubjectFilter("All Subjects"); }}>
                      ← ফিরে যান
                    </Button>
                    <Button variant="outline" className="bg-card border-primary/20 text-primary font-bengali" onClick={() => {
                      if (questionSubjectFilter && questionSubjectFilter !== 'All Subjects') setBulkUploadSubject(questionSubjectFilter);
                      else setBulkUploadSubject('');
                      setShowBulkUpload(true);
                    }}>
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Upload
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bengali" onClick={() => setEditQuestion({
                      id: 'new',
                      text: '',
                      university: '',
                      subject: questionSubjectFilter !== 'All Subjects' ? questionSubjectFilter : '',
                      title: selectedBankTitle !== 'Uncategorized' ? selectedBankTitle : '',
                      options: [{id: 'A', label: ''}, {id: 'B', label: ''}, {id: 'C', label: ''}, {id: 'D', label: ''}],
                      correctOption: 'A',
                      explanation: ''
                    })}>
                      <Plus className="w-4 h-4 mr-2" />
                      প্রশ্ন যোগ করুন
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="bg-card border-primary/20 text-indigo-600" onClick={async () => {
                      alert("Please use Bulk Upload JSON for newer exams.");
                    }}>
                      ঢাবি সি ইউনিট ফাইল আপলোড
                    </Button>
                    <Button variant="outline" className="bg-card border-primary/20 text-primary font-bengali" onClick={() => {
                      if (questionSubjectFilter && questionSubjectFilter !== 'All Subjects') setBulkUploadSubject(questionSubjectFilter);
                      else setBulkUploadSubject('');
                      setShowBulkUpload(true);
                    }}>
                      <Upload className="w-4 h-4 mr-2" />
                      নতুন ব্যাংক যুক্ত করুন (Bulk Upload JSON)
                    </Button>
                  </>
                )}
              </div>
            </div>

            {!selectedBankTitle && questionSubjectFilter === "All Subjects" && (
              <div className="flex bg-muted p-1.5 rounded-2xl w-fit gap-2 border border-slate-200/50">
                <Button 
                  variant={explorerMode === "by_bank" ? "default" : "ghost"}
                  size="sm"
                  className={`font-bengali rounded-xl px-4 py-2 text-xs transition-all ${explorerMode === "by_bank" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
                  onClick={() => setExplorerMode("by_bank")}
                >
                  📁 ক্যাটাগরি বা অধ্যায় ভিত্তিক ভিউ
                </Button>
                <Button 
                  variant={explorerMode === "universal" ? "default" : "ghost"}
                  size="sm"
                  className={`font-bengali rounded-xl px-4 py-2 text-xs transition-all ${explorerMode === "universal" ? "bg-purple-600 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
                  onClick={() => setExplorerMode("universal")}
                >
                  🔍 সার্বজনীন প্রশ্ন এক্সপ্লোরার (সব প্রশ্ন এক জায়গায়)
                </Button>
              </div>
            )}

            {selectedBankTitle || questionSubjectFilter !== "All Subjects" ? (
              <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-muted/50 border-b pb-4 p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input 
                      placeholder="Search questions..." 
                      className="w-full sm:max-w-xs bg-card" 
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background sm:max-w-[150px]"
                      value={questionSubjectFilter}
                      onChange={(e) => setQuestionSubjectFilter(e.target.value)}
                    >
                      <option>All Subjects</option>
                      {subjects.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      <option value="Bangla">Bangla</option>
                      <option value="English">English</option>
                      <option value="Accounting">Accounting</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 bg-muted/50">
                {questionsLoading ? (
                  <div className="text-center p-10 font-bengali">লোড হচ্ছে...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredQuestions.map((q, index) => (
                      <div key={q.id || index} className="group bg-card border border-slate-200/80 rounded-[24px] p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative flex flex-col gap-4">
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-[11px] text-slate-400 shrink-0 truncate max-w-[80px]" title={q.id}>#{q.id.slice(0, 6)}</span>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {q.university && <Badge variant="secondary" className="bg-muted text-muted-foreground border border-slate-200/60 text-[10px] px-2">{q.university}</Badge>}
                            {q.subject && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200/60 text-[10px] px-2">{q.subject}</Badge>}
                          </div>
                        </div>
                        
                        <p className="font-bengali text-base text-foreground flex-1 whitespace-pre-wrap font-medium leading-relaxed">
                          {q.text}
                        </p>
                        
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {q.options.map((opt: any, optIdx: number) => (
                              <div key={`${q.id || index}-${opt.id || optIdx}`} className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm font-bengali transition-colors ${q.correctOption === opt.id ? 'bg-green-50/80 border-green-200 text-green-900 shadow-sm' : 'bg-muted border-slate-200/60 text-slate-700 hover:bg-slate-100/80'}`}>
                                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[11px] shrink-0 font-bold ${q.correctOption === opt.id ? 'bg-green-200 text-green-800' : 'bg-card border shadow-sm text-slate-500'}`}>
                                  {opt.id}
                                </span>
                                <span className="line-clamp-2" title={opt.label}>{opt.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                          <Button variant="outline" size="sm" className="h-9 flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 rounded-xl" onClick={() => setEditQuestion(q)}>
                            Edit Question
                          </Button>
                          <Button variant="outline" size="sm" className="h-9 flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl" onClick={() => handleDeleteQuestion(q.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredQuestions.length === 0 && (
                      <div className="col-span-full py-10 text-center font-bengali text-slate-500">
                        কোনো প্রশ্ন পাওয়া যায়নি।
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            ) : explorerMode === "universal" ? (
              <div className="space-y-6">
                <Card className="border border-purple-100 shadow-sm rounded-[24px] bg-purple-50/10 overflow-hidden">
                  <CardHeader className="bg-purple-50/40 border-b border-purple-100/50 pb-4 p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h4 className="font-bold text-base font-bengali text-purple-950 flex items-center gap-2">
                          <span>🔍 প্রশ্ন ফিল্টারিং এবং কাস্টম সার্চপ্যানেল</span>
                        </h4>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bengali rounded-xl text-xs h-9"
                          onClick={() => setEditQuestion({
                            id: 'new',
                            text: '',
                            university: '',
                            subject: explorerSubjectFilter !== 'all' ? explorerSubjectFilter : '',
                            title: '',
                            options: [{id: 'A', label: ''}, {id: 'B', label: ''}, {id: 'C', label: ''}, {id: 'D', label: ''}],
                            correctOption: 'A',
                            explanation: '',
                            classGroup: explorerClassFilter !== 'all' && ['HSC', 'SSC', 'Admission'].includes(explorerClassFilter) ? explorerClassFilter : 'HSC',
                            class: explorerClassFilter !== 'all' ? explorerClassFilter : 'HSC'
                          })}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> নতুন কাস্টম প্রশ্ন যোগ করুন
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs font-bold font-bengali text-purple-900/80 mb-1 block">কীওয়ার্ড খুঁজুন (প্রশ্ন/টপিক)</label>
                          <Input 
                            placeholder="যেমন: অনুচ্ছেদ, অপরিচিতা, ইত্যাদি..." 
                            className="bg-card border-purple-200 focus:border-purple-500 rounded-xl font-bengali text-xs h-9" 
                            value={explorerSearch}
                            onChange={(e) => setExplorerSearch(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold font-bengali text-purple-900/80 mb-1 block">বিষয় নির্বাচন</label>
                          <select 
                            className="flex h-9 w-full rounded-xl border border-purple-200 bg-card px-3 py-1 text-xs ring-offset-background font-bengali outline-none focus:border-purple-500"
                            value={explorerSubjectFilter}
                            onChange={(e) => setExplorerSubjectFilter(e.target.value)}
                          >
                            <option value="all">সব বিষয় (All Subjects)</option>
                            {Array.from(new Set([...allDynamicSubjects, ...questions.map(q => q.subject).filter(Boolean)].map(normalizeSubjectName))).map((sub: any) => (
                              <option key={sub} value={sub}>{getSubjectDisplayName(sub)}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold font-bengali text-purple-900/80 mb-1 block">শ্রেণী / টার্গেট</label>
                          <select 
                            className="flex h-9 w-full rounded-xl border border-purple-200 bg-card px-3 py-1 text-xs ring-offset-background font-bengali outline-none focus:border-purple-500"
                            value={explorerClassFilter}
                            onChange={(e) => setExplorerClassFilter(e.target.value)}
                          >
                            <option value="all">সব শ্রেণী / গ্রুপ</option>
                            <option value="HSC">HSC</option>
                            <option value="Class 11">Class 11 (একাদশ)</option>
                            <option value="Class 12">Class 12 (দ্বাদশ)</option>
                            <option value="SSC">SSC</option>
                            <option value="Admission">Admission (ভর্তি পরীক্ষা)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold font-bengali text-purple-900/80 mb-1 block">প্রশ্ন ফরম্যাট (Format)</label>
                          <select 
                            className="flex h-9 w-full rounded-xl border border-purple-200 bg-card px-3 py-1 text-xs ring-offset-background font-bengali outline-none focus:border-purple-500"
                            value={explorerFormatFilter}
                            onChange={(e) => setExplorerFormatFilter(e.target.value)}
                          >
                            <option value="all">সব ফরম্যাট (All Formats)</option>
                            <option value="mcq">MCQ (বহুনির্বাচনি)</option>
                            <option value="cq">CQ (সৃজনশীল)</option>
                            <option value="k_vandar">ক ভান্ডার (জ্ঞানমূলক)</option>
                            <option value="kh_vandar">খ ভান্ডার (অনুধাবনমূলক)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-purple-50 p-2 px-3 rounded-xl border border-purple-100 text-xs font-bengali">
                        <span className="text-purple-900 font-bold">
                          📊 ম্যাচিং প্রশ্ন পাওয়া গেছে: <span className="font-mono text-sm bg-purple-200/50 px-2 py-0.5 rounded-lg text-purple-950 font-extrabold">{universalFilteredQuestions.length}</span> টি
                        </span>
                        {(explorerSearch || explorerSubjectFilter !== "all" || explorerClassFilter !== "all" || explorerFormatFilter !== "all") && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px] text-purple-700 hover:text-purple-950 font-bengali font-bold p-0 px-2"
                            onClick={() => {
                              setExplorerSearch("");
                              setExplorerSubjectFilter("all");
                              setExplorerClassFilter("all");
                              setExplorerFormatFilter("all");
                            }}
                          >
                            ✕ ফিল্টার রিসেট করুন
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 bg-purple-50/5">
                    {questionsLoading ? (
                      <div className="text-center py-16 font-bengali font-bold text-purple-600">
                        🔄 প্রশ্নসমূহ লোড হচ্ছে...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {universalFilteredQuestions.slice(0, 300).map((q, index) => {
                          let formatLabel = "MCQ";
                          let formatColor = "bg-teal-50 text-teal-700 border-teal-100";
                          if (q.is_k_vandar) {
                            formatLabel = "ক ভান্ডার";
                            formatColor = "bg-rose-50 text-rose-700 border-rose-100";
                          } else if (q.is_kh_vandar) {
                            formatLabel = "খ ভান্ডার";
                            formatColor = "bg-amber-50 text-amber-700 border-amber-100";
                          } else if (q.is_cq) {
                            formatLabel = "CQ";
                            formatColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                          }

                          return (
                            <div key={q.id || index} className="group bg-card border border-slate-200/80 rounded-[24px] p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative flex flex-col gap-3">
                              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              <div className="flex justify-between items-start gap-2 flex-wrap">
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">#{q.id?.slice(0, 6) || "NEW"}</span>
                                <div className="flex gap-1 flex-wrap justify-end">
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${formatColor}`}>{formatLabel}</Badge>
                                  {q.classGroup && <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0">{q.classGroup}</Badge>}
                                  {q.class && q.class !== q.classGroup && <Badge variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-100 text-[10px] px-1.5 py-0">{q.class}</Badge>}
                                  {q.subject && <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-0 text-[10px] px-1.5 py-0 font-bengali font-bold">{q.subject}</Badge>}
                                </div>
                              </div>

                              <p className="font-bengali text-sm text-foreground flex-1 whitespace-pre-wrap font-medium leading-relaxed">
                                {q.text}
                              </p>

                              {q.options && q.options.length > 0 && !(q.is_cq || q.is_k_vandar || q.is_kh_vandar) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                  {q.options.map((opt: any, optIdx: number) => (
                                    <div key={`${q.id || index}-${opt.id || optIdx}`} className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bengali transition-colors ${q.correctOption === opt.id ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-bold' : 'bg-muted/60 border-slate-200/60 text-slate-700'}`}>
                                      <span className={`w-5 h-5 flex items-center justify-center rounded-lg text-[10px] shrink-0 font-extrabold ${q.correctOption === opt.id ? 'bg-emerald-200 text-emerald-800' : 'bg-card border shadow-xs text-slate-500'}`}>
                                        {opt.id}
                                      </span>
                                      <span className="line-clamp-2">{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {q.explanation && (
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-bengali text-slate-600">
                                  <strong className="text-slate-800 block mb-0.5">💡 উত্তর/ব্যাখ্যা:</strong>
                                  <p className="leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">{q.explanation}</p>
                                </div>
                              )}

                              {q.title && (
                                <span className="text-[10px] font-bold text-slate-400 font-bengali bg-slate-50 border border-slate-100/50 p-1 px-2 rounded-lg w-fit">
                                  📂 অধ্যায়/ব্যাংক: {q.title}
                                </span>
                              )}

                              <div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-slate-100">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 flex-1 text-purple-700 border-purple-200 hover:bg-purple-50 rounded-xl text-xs font-bold font-bengali" 
                                  onClick={() => setEditQuestion({
                                    ...q,
                                    options: q.options && q.options.length > 0 ? q.options : [{id: 'A', label: ''}, {id: 'B', label: ''}, {id: 'C', label: ''}, {id: 'D', label: ''}]
                                  })}
                                >
                                  📝 এডিট করুন
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-bold font-bengali" 
                                  onClick={() => handleDeleteQuestion(q.id)}
                                >
                                  🗑️ মুছে ফেলুন
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        {universalFilteredQuestions.length === 0 && (
                          <div className="col-span-full py-16 text-center font-bengali text-slate-500 flex flex-col items-center justify-center gap-2">
                            <span className="text-3xl">🔍</span>
                            <p className="font-bold">আপনার ফিল্টারিং অনুযায়ী কোনো প্রশ্ন পাওয়া যায়নি।</p>
                          </div>
                        )}

                        {universalFilteredQuestions.length > 300 && (
                          <div className="col-span-full py-3 text-center font-bengali text-slate-400 text-[11px]">
                            💡 কর্মক্ষমতা বজায় রাখতে প্রথম ৩০০টি প্রশ্ন দেখানো হচ্ছে। আরো নিখুঁতভাবে খুঁজতে উপরের ফিল্টার ব্যবহার করুন।
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(groupedBanks).map(([title, qs]) => (
                  <Card key={title} className="border-slate-200 border-2 hover:border-primary/50 shadow-sm hover:shadow-md cursor-pointer transition-all rounded-[24px]" onClick={() => setSelectedBankTitle(title)}>
                    <CardContent className="p-6">
                      <div className="bg-primary/10 w-12 h-12 rounded-[16px] flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg font-bengali text-foreground line-clamp-2 mb-2 leading-tight">{title}</h4>
                      <p className="text-sm font-bengali text-slate-500 font-medium">{(qs as any[]).length} টি প্রশ্ন যুক্ত আছে</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "students" ? (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">স্টুডেন্ট ম্যানেজমেন্ট</h3>
                <p className="text-muted-foreground">ইউজারদের তথ্য দেখুন এবং সাবস্ক্রিপশন এক্সেস দিন</p>
              </div>
            </div>

            <div className="flex space-x-2 border-b border-border pb-2 overflow-x-auto hide-scrollbar">
              <Button variant={userRoleTab === "all" ? "default" : "outline"} className={`rounded-full ${userRoleTab === "all" ? "bg-[#0F2744] text-white" : ""}`} size="sm" onClick={() => setUserRoleTab("all")}>All Users</Button>
              <Button variant={userRoleTab === "tutor" ? "default" : "outline"} className={`rounded-full ${userRoleTab === "tutor" ? "bg-blue-600 text-white" : ""}`} size="sm" onClick={() => setUserRoleTab("tutor")}>Tutors</Button>
              <Button variant={userRoleTab === "admin" ? "default" : "outline"} className={`rounded-full ${userRoleTab === "admin" ? "bg-purple-600 text-white" : ""}`} size="sm" onClick={() => setUserRoleTab("admin")}>Admins</Button>
              <Button variant={userRoleTab === "leaderboard" ? "default" : "outline"} className={`rounded-full ${userRoleTab === "leaderboard" ? "bg-amber-500 text-slate-900" : ""}`} size="sm" onClick={() => setUserRoleTab("leaderboard")}>Top Tutors (Ranking)</Button>
            </div>

            {userRoleTab === "leaderboard" ? (
              <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
                <CardHeader className="bg-amber-50 border-b border-amber-100 pb-4 p-6">
                  <CardTitle className="text-xl font-bengali flex items-center gap-2 text-amber-600">
                    <Trophy className="w-5 h-5" /> সেরা টিউটর র‍্যাংকিং
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {topTutors.map((u, index) => (
                      <div key={u.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" : index === 1 ? "bg-slate-200 text-muted-foreground border border-slate-300" : index === 2 ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-muted text-slate-400"}`}>
                            {index + 1}
                          </div>
                          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold">
                            {u.photoURL ? <img src={u.photoURL} alt={u.fullName} className="w-full h-full object-cover" /> : u.fullName?.charAt(0) || <User className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-bengali font-bold text-foreground text-lg leading-tight">{u.fullName || 'No Name'}</h4>
                            <p className="text-xs text-blue-600 font-bold font-sans truncate">{formatEmail(u.email) || u.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xl font-extrabold text-[#0F2744] bg-slate-100 px-3 py-1 rounded-xl">{u.points || 0}</span>
                          <span className="text-[10px] text-slate-500 font-bold">POINTS</span>
                        </div>
                      </div>
                    ))}
                    {topTutors.length === 0 && (
                      <div className="text-center py-10 text-muted-foreground font-bengali">
                        কোনো টিউটর পাওয়া যায়নি
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
                <CardHeader className="bg-muted/50 border-b pb-4 p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <CardTitle className="text-lg whitespace-nowrap">
                    {userRoleTab === "all" ? "সব ইউজার" : userRoleTab === "tutor" ? "সব টিউটর" : "সব এডমিন"} ({filteredUsers.length})
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                    <Input 
                      placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..." 
                      className="w-full sm:w-64 bg-card" 
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                    <select 
                      className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background"
                      value={studentClassFilter}
                      onChange={(e) => setStudentClassFilter(e.target.value)}
                    >
                      <option value="All Classes">সব ক্লাস</option>
                      {uniqueClasses.map((cls: any) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="h-10">
                      {loading ? "Loading..." : "Refresh"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredUsers.slice(0, studentsLimit).map((u) => (
                      <div 
                        key={u.id} 
                        onClick={() => setSelectedUserModal(u)}
                        className="group bg-card border border-slate-200/80 rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-3 relative overflow-hidden"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-200 to-slate-300 group-hover:from-blue-400 group-hover:to-indigo-500 transition-colors duration-300" />
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden font-bold text-slate-400">
                             {u.photoURL ? <img src={u.photoURL} alt={u.fullName} className="w-full h-full object-cover" /> : u.fullName?.charAt(0) || <User className="w-5 h-5" />}
                           </div>
                           <div className="overflow-hidden">
                             <h4 className="font-bengali font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">{u.fullName || 'No Name'}</h4>
                             <p className="text-[11px] text-blue-600 font-bold font-sans truncate">{formatEmail(u.email) || u.phoneNumber}</p>
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                          {u.isPro && <Badge className="bg-orange-50 text-orange-600 border border-orange-200/50 px-1.5 py-0 rounded-md text-[9px] font-semibold"><Crown className="w-3 h-3 mr-0.5" /> Pro</Badge>}
                          {u.isTutor && <Badge className="bg-blue-50 text-blue-600 border border-blue-200/50 px-1.5 py-0 rounded-md text-[9px] font-semibold"><BookOpen className="w-3 h-3 mr-0.5" /> Tutor</Badge>}
                          {u.isAdmin && <Badge className="bg-purple-50 text-purple-650 border border-purple-200/50 px-1.5 py-0 rounded-md text-[9px] font-semibold"><User className="w-3 h-3 mr-0.5" /> Admin</Badge>}
                          {(!u.isPro && !u.isTutor && !u.isAdmin) && <span className="text-[10px] text-slate-400 font-medium">Free User</span>}
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && !loading && (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center bg-card rounded-2xl border border-dashed border-slate-200">
                        <User className="w-10 h-10 text-slate-300 mb-3" />
                        <h4 className="text-muted-foreground font-bold font-bengali">ইউজার পাওয়া যায়নি</h4>
                      </div>
                    )}
                  </div>

                  {filteredUsers.length > studentsLimit && (
                    <div className="mt-8 flex justify-center pb-2">
                      <Button
                        onClick={() => setStudentsLimit(prev => prev + 24)}
                        className="bg-card border hover:bg-muted font-bengali font-bold px-8 py-2 text-slate-700 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        আরও লোড করুন ({filteredUsers.length - studentsLimit} জন বাকি আছে)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : activeTab === "event_exam" ? (
          <div className="space-y-6 overflow-hidden">
            <EventExamTab />
          </div>
        ) : activeTab === "exams" ? (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">Public Exams Management</h3>
                <p className="text-muted-foreground">পাবলিক পরীক্ষার লিংক তৈরি এবং শেয়ার করুন</p>
              </div>
              <Button onClick={() => {
                setEditingExamId(null);
                setNewExamTitle("Weekly Public Exam");
                setNewExamDuration("25");
                setNewExamQuestionsJSON("");
                setNewExamScheduledDate("");
                setNewExamCloseDate("");
                setNewExamCustomId("");
                setShowCreateExamModal(true);
              }} disabled={examsLoading} className="font-bengali">
                <Plus className="w-4 h-4 mr-2" /> 
                নতুন লিংক তৈরি করুন
              </Button>
            </div>
            
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-muted/50 border-b pb-4 p-6">
                <CardTitle className="text-lg">সকল পাবলিক পরীক্ষা</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicExams.map((exam) => (
                    <div key={exam.id} className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-foreground font-bengali flex-1">{exam.title}</h4>
                        {exam.active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 shrink-0">সক্রিয় (Active)</Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">বন্ধ (Inactive)</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-slate-500 font-medium">সময়: {exam.duration} Minutes</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="outline" className="bg-indigo-50 border-indigo-100/60 text-indigo-700 text-[10px] font-bengali font-semibold">
                            {exam.targetClass || "সকল ক্লাস"}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] font-bengali font-semibold ${
                            exam.type === "model_test" ? "bg-purple-50 border-purple-100/60 text-purple-700" :
                            exam.type === "live_model_test" ? "bg-amber-50 border-amber-100/60 text-amber-700" : 
                            exam.type === "event_exam" ? "bg-rose-50 border-rose-100/60 text-rose-700" : "bg-teal-50 border-teal-100/60 text-teal-700"
                          }`}>
                            {exam.type === "model_test" ? "মডেল টেস্ট" : exam.type === "live_model_test" ? "লাইভ মডেল টেস্ট" : exam.type === "event_exam" ? "ইভেন্ট এক্সাম" : "পাবলিক এক্সাম"}
                          </Badge>
                        </div>
                        {exam.closeAt && (
                          <div className="text-xs text-rose-500 font-bold font-bengali flex items-center gap-1.5 mt-2">
                            <Clock className="w-3.5 h-3.5 text-rose-550 shrink-0" />
                            <span>বন্ধ হবে: {new Date(exam.closeAt).toLocaleString('bn-BD', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            })}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-1 pt-3 border-t grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => copyExamLink(exam.id, exam.type)}>
                          <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> লিংক
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-muted-foreground" onClick={() => togglePublicExamActive(exam.id, exam.active)}>
                          {exam.active ? "বন্ধ করুন" : "চালু করুন"}
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => openEditPublicExam(exam)}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> ইডিট
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => deletePublicExam(exam.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> ডিলিট
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-teal-600 border-teal-200 hover:bg-teal-50" onClick={() => printExam(exam, false)}>
                          <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট (প্রশ্ন)
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => printExam(exam, true)}>
                          <Printer className="w-3.5 h-3.5 mr-1.5" /> প্রিন্ট (উত্তরসহ)
                        </Button>
                        <Button variant="outline" size="sm" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 col-span-2" onClick={() => resetPublicExamLeaderboard(exam.id)}>
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> লিডারবোর্ড রিসেট করুন
                        </Button>
                      </div>
                    </div>
                  ))}
                  {publicExams.length === 0 && !examsLoading && (
                    <div className="col-span-full text-center py-6 text-muted-foreground bg-card border rounded-2xl">
                      কোনো পাবলিক পরীক্ষা তৈরি করা হয়নি।
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "doubts" ? (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">শিক্ষার্থীর প্রশ্ন (Pending Doubts)</h3>
                <p className="text-muted-foreground">শিক্ষার্থীদের জিজ্ঞাসা করা অপেক্ষমান প্রশ্ন ও উত্তর</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchPendingDoubts} disabled={loading}>Refresh List</Button>
            </div>
            
            <div className="space-y-4">
              {pendingDoubts.map(doubt => (
                <Card key={doubt.id} className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-foreground">{doubt.userName}</span>
                          <span className="text-xs text-muted-foreground">asked a question</span>
                        </div>
                        <p className="font-bengali text-lg text-slate-900 mb-2">{doubt.question}</p>
                        {doubt.image && (
                          <img src={doubt.image} alt="Doubt Attachment" className="mt-3 max-h-60 rounded-lg border border-slate-200 object-contain" />
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                      <Input id={`ans-${doubt.id}`} placeholder="উত্তর লিখুন..." className="flex-1 font-bengali" />
                      <Button onClick={() => {
                        const val = (document.getElementById(`ans-${doubt.id}`) as HTMLInputElement)?.value;
                        answerDoubt(doubt.id, val);
                      }} className="shrink-0 bg-primary hover:bg-primary/90 text-white font-bengali">উত্তর দিন</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingDoubts.length === 0 && !loading && (
                <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden text-center py-12">
                  <p className="text-muted-foreground font-bengali">কোনো অপেক্ষমান প্রশ্ন নেই।</p>
                </Card>
              )}
            </div>
          </div>
        ) : activeTab === "reports" ? (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">রিপোর্টকৃত প্রশ্ন (Reported Questions)</h3>
                <p className="text-muted-foreground">ইউজারদের থেকে প্রাপ্ত প্রশ্নের ভুল এবং রিপোর্টের তালিকা</p>
              </div>
            </div>
            
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-muted/50 border-b pb-4 p-6 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">সকল রিপোর্ট</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>Refresh</Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-foreground">{report.user}</p>
                          <p className="text-xs text-muted-foreground">{report.date}</p>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[10px] shrink-0">{report.questionId}</Badge>
                      </div>
                      
                      <p className="font-bengali text-slate-700 bg-muted p-3 rounded-xl border border-slate-100 text-sm flex-1">
                        {report.issue}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2 pt-3 border-t">
                        <Button variant="outline" size="sm" className="h-8 flex-1 text-slate-700 hover:bg-slate-100" onClick={() => alert("Go to question edit")}>
                          Fix Question
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 flex-1 text-green-600 border-green-200 hover:bg-green-50" onClick={() => alert("Mark as resolved")}>
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && !loading && (
                    <div className="col-span-full text-center py-6 text-muted-foreground bg-card border rounded-2xl">
                      কোনো রিপোর্ট নেই।
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "subjects" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">বিষয় ম্যানেজমেন্ট (Subjects)</h3>
                <p className="text-muted-foreground">নতুন বিষয় যুক্ত করুন এবং পরিচালনা করুন।</p>
              </div>
              <Button className="font-bengali" onClick={createSubject}><Plus className="w-4 h-4 mr-2"/> বিষয় যুক্ত করুন</Button>
            </div>
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardContent className="p-6">
                 {subjects.length === 0 ? (
                   <div className="p-10 text-center text-muted-foreground font-bengali">কোনো বিষয় যুক্ত করা হয়নি।</div>
                 ) : (
                   <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>নাম (Name)</TableHead>
                          <TableHead>গ্রুপ (Group)</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-bold text-foreground font-bengali">{sub.name}</TableCell>
                            <TableCell className="font-bengali">{sub.group}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" className="text-primary hover:bg-primary/5 font-bengali" onClick={() => {
                                  setActiveTab("questions");
                                  setQuestionSubjectFilter(sub.name);
                                  setEditQuestion({
                                    id: 'new',
                                    text: '',
                                    university: '',
                                    subject: sub.name,
                                    options: [{id: 'A', label: ''}, {id: 'B', label: ''}, {id: 'C', label: ''}, {id: 'D', label: ''}],
                                    correctOption: 'A',
                                    explanation: ''
                                  });
                                }}>প্রশ্ন যোগ করুন</Button>
                                <Button variant="outline" size="sm" className="text-primary hover:bg-primary/5 font-bengali" onClick={() => {
                                  setActiveTab("questions");
                                  setQuestionSubjectFilter(sub.name);
                                  setBulkUploadSubject(sub.name);
                                  setShowBulkUpload(true);
                                }}>Bulk Upload</Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteSubject(sub.id)}>Delete</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "chapters" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">অধ্যায় ম্যানেজমেন্ট (Chapters)</h3>
                <p className="text-muted-foreground">বিষয়ের অধীন অধ্যায় যুক্ত করুন।</p>
              </div>
              <Button className="font-bengali"><Plus className="w-4 h-4 mr-2"/> অধ্যায় যুক্ত করুন</Button>
            </div>
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardContent className="p-10 text-center text-muted-foreground font-bengali">
                খুব শীঘ্রই অধ্যায়ের তালিকা এবং ম্যানেজমেন্ট ফিচারটি যুক্ত হবে।
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "leaderboard" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">লিডারবোর্ড (Leaderboard)</h3>
                <p className="text-muted-foreground">সেরা শিক্ষার্থীদের তালিকা দেখুন এবং ম্যানেজ করুন।</p>
              </div>
              <Button variant="destructive" className="font-bengali" onClick={resetLeaderboard}>
                <Trophy className="w-4 h-4 mr-2" />
                লিডারবোর্ড রিসেট করুন
              </Button>
            </div>
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardContent className="p-10 text-center text-muted-foreground font-bengali">
                অনুগ্রহ করে মূল ওয়েবসাইট থেকে লিডারবোর্ড দেখুন। এখান থেকে আপনি শুধুমাত্র লিডারবোর্ড রিসেট করতে পারবেন।
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "settings" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">Settings</h3>
                <p className="text-muted-foreground">Manage global application settings.</p>
              </div>
            </div>
            
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
               <CardHeader className="bg-muted/50 border-b pb-4 p-6 flex flex-row justify-between items-center">
                 <CardTitle className="text-lg">Global Parameters</CardTitle>
                 <Button onClick={saveSettings} disabled={settingsLoading}>
                   {settingsLoading ? "Saving..." : "Save Settings"}
                 </Button>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                 {settingsLoading ? (
                   <p className="text-muted-foreground text-center py-4">Loading settings...</p>
                 ) : (
                   <div className="space-y-6 max-w-2xl">
                     <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-bold">Maintenance Mode</p>
                          <p className="text-sm text-muted-foreground">Turn on maintenance mode to block non-admin access.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settingsData.maintenanceMode}
                            onChange={(e) => setSettingsData({ ...settingsData, maintenanceMode: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                     </div>
                      {/* Temporary Free Access Option */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <p className="font-bold font-bengali">সব সুবিধা সাময়িকভাবে ফ্রি করুন (Temporary Free Access)</p>
                            <p className="text-sm text-muted-foreground font-bengali">নির্দিষ্ট সময়ের জন্য সব প্রো ফিচার ও সুবিধা সকল শিক্ষার্থীর জন্য সম্পূর্ণ ফ্রি করুন।</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={settingsData.freeForAllActive || false}
                              onChange={(e) => {
                                const active = e.target.checked;
                                let until = 0;
                                if (active) {
                                  const currentUntil = settingsData.freeForAllUntil ? Number(settingsData.freeForAllUntil) : 0;
                                  if (currentUntil < Date.now()) {
                                    until = Date.now() + 3 * 24 * 60 * 60 * 1000; // default 3 days
                                  } else {
                                    until = currentUntil;
                                  }
                                }
                                setSettingsData({ ...settingsData, freeForAllActive: active, freeForAllUntil: until });
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>

                        {settingsData.freeForAllActive && (
                          <div className="space-y-4 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
                            <p className="text-sm font-semibold text-amber-800 font-bengali leading-snug">
                              🎁 বর্তমানে শিক্ষার্থীর জন্য ফ্রি সুবিধা সক্রিয় আছে। কত দিন ফ্রি সুবিধা দিতে চান তা সিলেক্ট করুন:
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {[1, 3, 5, 7, 15, 30].map((days) => {
                                const currentDur = settingsData.freeForAllUntil ? (Number(settingsData.freeForAllUntil) - Date.now()) / (24 * 60 * 60 * 1000) : 0;
                                const isCurrent = Math.round(currentDur) === days;

                                return (
                                  <button
                                    key={days}
                                    type="button"
                                    onClick={() => {
                                      const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
                                      setSettingsData({ ...settingsData, freeForAllActive: true, freeForAllUntil: expiry });
                                    }}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold font-bengali transition-all ${
                                      isCurrent
                                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    {days} দিন
                                  </button>
                                );
                              })}
                              
                              <div className="flex items-center gap-2 ml-1">
                                <span className="text-xs text-slate-500 font-bengali font-bold">কাস্টম দিন:</span>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="যেমন: ১০"
                                  className="w-20 h-8 text-xs font-bold text-center border rounded-xl bg-white"
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > 0) {
                                      const expiry = Date.now() + val * 24 * 60 * 60 * 1000;
                                      setSettingsData({ ...settingsData, freeForAllActive: true, freeForAllUntil: expiry });
                                    }
                                  }}
                                />
                              </div>
                            </div>

                            {settingsData.freeForAllUntil > 0 && (
                              <div className="text-xs font-bold font-bengali bg-white border border-rose-100 p-3 rounded-xl text-rose-700 space-y-1">
                                <p className="flex items-center gap-1">
                                  <span>⏳ ফ্রি সুবিধা শেষ হওয়ার ডেডলাইন:</span>
                                  <span className="underline">{new Date(Number(settingsData.freeForAllUntil)).toLocaleString("bn-BD")}</span>
                                </p>
                                <p className="text-[10px] font-normal text-slate-500 leading-normal">
                                  (এই সময়ের মধ্যে সব সাধারণ শিক্ষার্থীরা আনলিমিটেড মক টেস্ট, AI ডাউট সলভ এবং অন্যান্য প্রো সুবিধার পূর্ণ অ্যাক্সেস পাবেন)
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                     <div className="border-t pt-6 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-bold">Alert Banner</p>
                          <p className="text-sm text-muted-foreground">Show an alert banner at the top of the app.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settingsData.alertBannerActive}
                            onChange={(e) => setSettingsData({ ...settingsData, alertBannerActive: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                     </div>
                     {settingsData.alertBannerActive && (
                       <div className="space-y-2">
                         <label className="text-sm font-medium">Banner Message</label>
                         <Input 
                           value={settingsData.alertBannerMessage} 
                           onChange={(e) => setSettingsData({ ...settingsData, alertBannerMessage: e.target.value })}
                           placeholder="Enter banner message here..."
                         />
                       </div>
                     )}
                     
                     <div className="border-t pt-6">
                        <div className="flex-1 mb-4">
                          <p className="font-bold">PWA App Icon URL</p>
                          <p className="text-sm text-muted-foreground">Upload the icon url meant for installed app.</p>
                        </div>
                        <div className="space-y-2">
                           <Input 
                             value={settingsData.pwaIconUrl || ""} 
                             onChange={(e) => setSettingsData({ ...settingsData, pwaIconUrl: e.target.value })}
                             placeholder="https://i.ibb.co/..."
                           />
                           {settingsData.pwaIconUrl && (
                             <img src={settingsData.pwaIconUrl} alt="PWA Icon" className="w-16 h-16 object-contain border rounded-xl" />
                           )}
                        </div>
                     </div>

                     <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex-1">
                             <p className="font-bold font-bengali text-foreground">ড্যাশবোর্ড হিরো ব্যানার (Hero Banners)</p>
                             <p className="text-sm text-slate-500 mr-2 font-bengali">ড্যাশবোর্ডের উপরে শিক্ষার্থীদের জন্য ৩-৪টি রোট্যাটিং ব্যানার অ্যাড করুন।</p>
                           </div>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => {
                               const hdBanners = settingsData.heroBanners || [];
                               if (hdBanners.length >= 4) {
                                   alert("সর্বোচ্চ ৪টি ব্যানার যুক্ত করা যাবে।");
                                   return;
                               }
                               setSettingsData({ ...settingsData, heroBanners: [...hdBanners, { id: Date.now().toString(), title: "নতুন ব্যানার", subtitle: "কিছু লিখুন...", gradient: "from-[#1E293B] to-[#0F172A]", illustration: "books" }] })
                             }}
                           >
                             + Add Banner
                           </Button>
                        </div>
                        
                        <div className="space-y-4">
                           {(settingsData.heroBanners || []).length === 0 && (
                             <p className="text-sm text-slate-400 font-bengali text-center py-4 border border-dashed rounded-xl">কোনো ব্যানার যুক্ত করা হয়নি। স্ট্যাটিক ড্যাশবোর্ড ব্যানার দেখাবে।</p>
                           )}
                           {(settingsData.heroBanners || []).map((banner: any, idx: number) => (
                              <div key={banner.id} className="p-4 border rounded-xl bg-muted relative flex flex-col gap-4">
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                   onClick={() => {
                                     const newBanners = [...settingsData.heroBanners];
                                     newBanners.splice(idx, 1);
                                     setSettingsData({ ...settingsData, heroBanners: newBanners });
                                   }}
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </Button>
                                 <div className="font-bengali font-bold text-slate-700 text-sm">ব্যানার #{idx + 1}</div>
                                 <div className="space-y-2 mt-2">
                                   <label className="text-sm font-medium font-bengali">টাইটেল (Title)</label>
                                   <Input 
                                     value={banner.title} 
                                     onChange={(e) => {
                                       const newBanners = [...settingsData.heroBanners];
                                       newBanners[idx].title = e.target.value;
                                       setSettingsData({ ...settingsData, heroBanners: newBanners });
                                     }} 
                                     placeholder="যেমন: চর্চাই সফলতার চাবিকাঠি!"
                                   />
                                 </div>
                                 <div className="space-y-2 mt-2">
                                   <label className="text-sm font-medium font-bengali">সাবটাইটেল (Subtitle)</label>
                                   <Input 
                                     value={banner.subtitle} 
                                     onChange={(e) => {
                                       const newBanners = [...settingsData.heroBanners];
                                       newBanners[idx].subtitle = e.target.value;
                                       setSettingsData({ ...settingsData, heroBanners: newBanners });
                                     }} 
                                     placeholder="যেমন: আজকের লক্ষ্য পুরণ করো..."
                                   />
                                 </div>
                                 <div className="space-y-2 mt-2">
                                   <label className="text-sm font-medium font-bengali">ব্যাকগ্রাউন্ড (Background)</label>
                                   <select
                                     className="w-full form-select rounded border px-3 py-2 text-sm"
                                     value={banner.gradient || "from-[#1E293B] to-[#0F172A]"}
                                     onChange={(e) => {
                                       const newBanners = [...settingsData.heroBanners];
                                       newBanners[idx].gradient = e.target.value;
                                       setSettingsData({ ...settingsData, heroBanners: newBanners });
                                     }}
                                   >
                                     <option value="from-[#1e293b] to-[#0f172a]">Dark Navy Blue (Default)</option>
                                     <option value="from-[#637cf2] to-[#768bfa]">Light Blue Gradient</option>
                                     <option value="from-emerald-600 to-emerald-800">Emerald Green</option>
                                     <option value="from-orange-500 to-orange-700">Sunset Orange</option>
                                     <option value="from-purple-600 to-violet-800">Royal Purple</option>
                                   </select>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                     
                     <div className="border-t pt-6 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-bold font-bengali text-foreground">স্টার্টআপ ক্যাম্পেইন পপ-আপ (Startup Promotional Pop-up)</p>
                          <p className="text-sm text-slate-500 mr-2 font-bengali">স্টুডেন্ট ড্যাশবোর্ডে ঢোকার পর একটি আকর্ষক প্রোমোশনাল কুপন পপ-আপ ও ডিসকাউন্ট অফার নোটিশ দেখান।</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settingsData.popupActive || false}
                            onChange={(e) => setSettingsData({ ...settingsData, popupActive: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                     </div>
                     {settingsData.popupActive && (
                       <div className="space-y-4 bg-muted/50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-3 font-bengali">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Startup Pop-up Parameters</p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-3">
                             <label className="text-sm font-medium">পপ-আপ টাইটেল (Title)</label>
                             <Input 
                               value={settingsData.popupTitle || ""} 
                               onChange={(e) => setSettingsData({ ...settingsData, popupTitle: e.target.value })}
                               placeholder="যেমন: মেগা ডিসকাউন্ট অফার! HSC 25 🌟"
                             />
                           </div>
                           <div className="space-y-3">
                             <label className="text-sm font-medium">প্রোমো কুপন কোড (Promo Coupon Code)</label>
                             <Input 
                               value={settingsData.popupCoupon || ""} 
                               onChange={(e) => setSettingsData({ ...settingsData, popupCoupon: e.target.value })}
                               placeholder="যেমন: PRO20"
                             />
                           </div>
                         </div>
                         <div className="space-y-3">
                           <label className="text-sm font-medium">মূল বার্তা (Message Details)</label>
                           <Input 
                             value={settingsData.popupMessage || ""} 
                             onChange={(e) => setSettingsData({ ...settingsData, popupMessage: e.target.value })}
                             placeholder="যেমন: সকল প্রো মেম্বারশিপে ২০% অতিরিক্ত ছাড় পেতে আজই সাবস্ক্রাইব করুন।"
                           />
                         </div>
                         <div className="space-y-3">
                           <label className="text-sm font-medium">অ্যাকশন বাটন লেখা (Action Button Text)</label>
                           <Input 
                             value={settingsData.popupButtonText || ""} 
                             onChange={(e) => setSettingsData({ ...settingsData, popupButtonText: e.target.value })}
                             placeholder="যেমন: প্রো মেম্বার হোন"
                           />
                         </div>
                       </div>
                     )}

                     <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="mb-6 bg-amber-50/40 p-5 rounded-2xl border border-amber-100/70 space-y-3">
                            <p className="font-bold font-bengali text-amber-800 flex items-center gap-2 text-sm sm:text-base">
                              <Gift className="w-5 h-5 text-amber-600 shrink-0" />
                              ক্যাম্পেইন ডিসকাউন্ট পার্সেন্টেজ (Campaign Discount %)
                            </p>
                            <p className="text-xs text-slate-500 font-bengali leading-relaxed">
                              এখানে একটি পার্সেন্টেজ (% যেমন: ১০, ২০, বা ৩০) দিলে তা স্বয়ংক্রিয়ভাবে সরাসরি সাবস্ক্রিপশন স্ক্রিনে প্রতিটি রেগুলার প্ল্যানের মূল্যের উপর ক্যাশে ডিসকাউন্ট হিসাব করে দেখাবে এবং ক্রশড-আউট বা কাটা-চিহ্ন দাগ দিয়ে প্রাইসিং উইজেটগুলো কাস্টমাইজ করবে।
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="relative max-w-[150px]">
                                <Input 
                                  type="number"
                                  min="0"
                                  max="99"
                                  placeholder="যেমন: ২০"
                                  value={settingsData.discountPercentage || 0}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
                                    setSettingsData({...settingsData, discountPercentage: val});
                                  }}
                                  className="bg-card font-sans font-bold h-10 pr-8"
                                />
                                <span className="absolute right-3 top-2.5 text-slate-400 font-bold font-sans text-sm">%</span>
                              </div>
                              {settingsData.discountPercentage > 0 && (
                                <span className="text-xs font-bold font-bengali text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full animate-pulse">
                                  {settingsData.discountPercentage}% ছাড় সক্রিয় করা হয়েছে 🏷️
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="font-bold font-bengali">সাবস্ক্রিপশন ফি (Subscription Fees)</p>
                          <Button 
                             size="sm" 
                             variant="outline"
                             onClick={() => {
                               const newPlans = [...(settingsData.subscriptionPlans || [])];
                               newPlans.push({
                                 id: Date.now().toString(),
                                 name: "New Plan",
                                 price: 0,
                                 duration: "নতুন",
                                 popular: false,
                                 color: "from-gray-200 to-gray-300"
                               });
                               setSettingsData({...settingsData, subscriptionPlans: newPlans});
                             }}
                          >
                             <Plus className="w-4 h-4 mr-2" />
                             প্ল্যান যুক্ত করুন
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {settingsData.subscriptionPlans?.map((plan: any, index: number) => (
                            <div key={plan.id} className="border border-slate-200 p-4 rounded-xl space-y-3 bg-muted relative">
                               <Button 
                                 variant="destructive" 
                                 size="icon" 
                                 className="absolute top-2 right-2 h-7 w-7"
                                 onClick={() => {
                                    const newPlans = [...(settingsData.subscriptionPlans || [])];
                                    newPlans.splice(index, 1);
                                    setSettingsData({...settingsData, subscriptionPlans: newPlans});
                                 }}
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                               <div className="pr-10">
                                 <label className="text-xs font-bold text-slate-700 font-bengali">নাম (Name)</label>
                                 <Input 
                                    value={plan.name}
                                    onChange={(e) => {
                                       const newPlans = [...(settingsData.subscriptionPlans || [])];
                                       newPlans[index].name = e.target.value;
                                       setSettingsData({...settingsData, subscriptionPlans: newPlans});
                                    }}
                                    className="bg-card h-8 text-sm"
                                 />
                               </div>
                               <div>
                                 <label className="text-xs font-bold text-slate-700 font-bengali">মেয়াদ (Duration text)</label>
                                 <Input 
                                    value={plan.duration}
                                    onChange={(e) => {
                                       const newPlans = [...(settingsData.subscriptionPlans || [])];
                                       newPlans[index].duration = e.target.value;
                                       setSettingsData({...settingsData, subscriptionPlans: newPlans});
                                    }}
                                    className="bg-card h-8 text-sm"
                                 />
                               </div>
                               <div>
                                 <label className="text-xs font-bold text-slate-700 font-bengali">মূল্য (Price ৳)</label>
                                 <Input 
                                    type="number"
                                    value={plan.price}
                                    onChange={(e) => {
                                       const newPlans = [...(settingsData.subscriptionPlans || [])];
                                       newPlans[index].price = parseInt(e.target.value) || 0;
                                       setSettingsData({...settingsData, subscriptionPlans: newPlans});
                                    }}
                                    className="font-mono bg-card h-8 text-sm"
                                 />
                               </div>
                               <label className="flex items-center gap-2 text-sm mt-2 font-medium cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    checked={plan.popular}
                                    onChange={(e) => {
                                       const newPlans = [...(settingsData.subscriptionPlans || [])];
                                       newPlans[index].popular = e.target.checked;
                                       setSettingsData({...settingsData, subscriptionPlans: newPlans});
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span>Popular Tag?</span>
                               </label>
                            </div>
                        ))}
                        </div>
                     </div>
                   </div>
                 )}
               </CardContent>
            </Card>

            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden mt-6">
                <CardHeader className="bg-muted/50 border-b pb-4 p-6 flex flex-row justify-between items-center">
                  <CardTitle className="text-lg">কুপন কোড (Coupon Management)</CardTitle>
                  <Button onClick={() => setShowCreateCouponModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    নতুন কুপন
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {coupons.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 font-bengali">কোনো কুপন কোড তৈরি করা হয়নি।</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>কোড (Code)</TableHead>
                          <TableHead>মেয়াদ (Months)</TableHead>
                          <TableHead>স্ট্যাটাস</TableHead>
                          <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono font-bold text-foreground">{c.code}</TableCell>
                            <TableCell>{c.months} Months</TableCell>
                            <TableCell>
                              {c.active ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">সক্রিয়</Badge>
                              ) : (
                                <Badge variant="secondary">বন্ধ</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteCoupon(c.id)}>Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
            </Card>
          </div>
        ) : activeTab === "sms" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">কাস্টম এসএমএস (Custom SMS)</h3>
                <p className="text-muted-foreground font-bengali text-sm mt-1">যেকোনো নম্বরে সরাসরি এসএমএস পাঠান</p>
              </div>
            </div>
            
            <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden max-w-xl">
               <CardHeader className="bg-muted border-b border-slate-100">
                 <CardTitle className="font-bengali text-lg text-foreground">এসএমএস পাঠান</CardTitle>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                 <form onSubmit={async (e) => {
                   e.preventDefault();
                   const form = e.target as HTMLFormElement;
                   const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
                   const msgInput = form.elements.namedItem("message") as HTMLTextAreaElement;
                   const phone = phoneInput.value;
                   const message = msgInput.value;
                   setLoading(true);
                   try {
                     let cleanPhone = phone.trim().replace(/[^\d+]/g, "");
                     if (cleanPhone.startsWith("+880")) cleanPhone = cleanPhone.substring(1);
                     else if (cleanPhone.startsWith("01")) cleanPhone = "88" + cleanPhone;

                     const res = await fetch("/api/send-sms", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ phone: cleanPhone, message: message })
                     });
                     
                     const data = await res.json();
                     
                     if (!res.ok || data.error) {
                       alert("এসএমএস পাঠাতে সমস্যা হয়েছে: " + (data.error || "Unknown Error"));
                     } else {
                       alert("এসএমএস সফলভাবে পাঠানো হয়েছে।");
                       msgInput.value = "";
                     }
                   } catch(err) {
                     console.error(err);
                     alert("এসএমএস পাঠাতে সমস্যা হয়েছে। (CORS বা নেটওয়ার্ক এরর)");
                   } finally {
                     setLoading(false);
                   }
                 }}>
                   <div className="space-y-2">
                     <label className="font-bengali text-sm font-medium">ফোন নম্বর</label>
                     <Input required name="phone" placeholder="01XXXXXXXXX" className="h-12" />
                   </div>
                   <div className="space-y-2 mt-4">
                     <label className="font-bengali text-sm font-medium">মেসেজ (SMS Text)</label>
                     <textarea required name="message" rows={4} placeholder="এসএমএস টেক্সট লিখুন..." className="w-full p-3 border rounded-xl bg-muted focus:outline-primary placeholder:text-slate-400 font-bengali" />
                     <p className="text-xs text-slate-500 font-bengali">প্রতি এসএমএস এ রেগুলার চার্জ প্রযোজ্য (Greenweb SMS)। Sender ID: +8809617634384</p>
                   </div>
                   <div className="mt-6 flex justify-end">
                     <Button disabled={loading} type="submit" className="bg-primary text-white font-bengali flex items-center h-12 px-6">
                        {loading ? "পাঠানো হচ্ছে..." : (
                          <>
                             <Send className="w-4 h-4 mr-2" />
                             মেসেজ সেন্ড করুন
                          </>
                        )}
                     </Button>
                   </div>
                 </form>
               </CardContent>
            </Card>
          </div>
        ) : activeTab === "analytics" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">অ্যানালিটিক্স ওভারভিউ</h3>
                <p className="text-muted-foreground">Manage the analytics module.</p>
              </div>
              <Button variant="outline" onClick={fetchAnalytics}>
                 Refresh Data
              </Button>
            </div>
            
            {!analyticsData ? (
               <div className="text-center py-10 text-muted-foreground">Loading Analytics...</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                   <CardContent className="p-6 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                       <Users className="w-6 h-6 text-blue-600" />
                     </div>
                     <div>
                       <p className="text-sm text-slate-500 font-medium">Total Students</p>
                       <p className="text-3xl font-bold text-foreground">{analyticsData.usersCount}</p>
                     </div>
                   </CardContent>
                 </Card>
                 
                 <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                   <CardContent className="p-6 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                       <FileQuestion className="w-6 h-6 text-green-600" />
                     </div>
                     <div>
                       <p className="text-sm text-slate-500 font-medium">Total Questions</p>
                       <p className="text-3xl font-bold text-foreground">{analyticsData.questionsCount}</p>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             )}
          </div>
        ) : activeTab === "finance" ? (
          <FinancialTrackingTab />
        ) : activeTab === "premium_marketing" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">প্রিমিয়াম ও মার্কেটিং অ্যানালিটিক্স</h3>
                <p className="text-muted-foreground">Track Premium subsciptions, user growth, and marketing insights</p>
              </div>
              <Button variant="outline" onClick={fetchPremiumData}>
                 Refresh Data
              </Button>
            </div>
            
            {!premiumData ? (
               <div className="text-center py-10 text-muted-foreground">Loading Premium Data...</div>
            ) : (
               <>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                     <CardContent className="p-6 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                         <Users className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                         <p className="text-sm text-slate-500 font-medium font-bengali">সর্বমোট ইউজার</p>
                         <p className="text-2xl font-bold text-foreground">{premiumData.totalUsers}</p>
                       </div>
                     </CardContent>
                   </Card>
                   
                   <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50">
                     <CardContent className="p-6 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 border border-yellow-200">
                         <Crown className="w-6 h-6 text-yellow-600" />
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground font-bengali font-semibold">প্রিমিয়াম ইউজার</p>
                         <div className="flex items-end gap-1.5">
                            <p className="text-2xl font-bold text-yellow-700">{premiumData.premiumCount}</p>
                            <p className="text-xs font-bold text-yellow-600 mb-1 leading-tight">({premiumData.premiumPercent}%)</p>
                         </div>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                     <CardContent className="p-6 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                         <TrendingUp className="w-6 h-6 text-green-600" />
                       </div>
                       <div>
                         <p className="text-sm text-slate-500 font-medium font-bengali">নতুন ইউজার (৭ দিন)</p>
                         <p className="text-2xl font-bold text-foreground">+{premiumData.newUsersLast7Days}</p>
                         <p className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded w-fit mt-1">Growth: {premiumData.newUsersLast30Days} in 30 days</p>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                     <CardContent className="p-6 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                         <Clock className="w-6 h-6 text-orange-600" />
                       </div>
                       <div>
                         <p className="text-sm text-slate-500 font-medium font-bengali">মেয়াদ শেষ হবে (৭ দিন)</p>
                         <p className="text-2xl font-bold text-foreground">{premiumData.expiringSoon.length}</p>
                       </div>
                     </CardContent>
                   </Card>
                 </div>

                 <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden mt-6">
                    <CardHeader className="bg-muted border-b flex flex-row items-center gap-2">
                       <LineChart className="w-5 h-5 text-slate-500" />
                       <CardTitle className="text-lg font-bengali">মার্কেটিং সাজেশন ও ট্র্যাকিং</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                       {/* New User Growth Section */}
                       <div className="space-y-4">
                           <h4 className="font-bengali font-bold text-lg text-foreground border-b pb-2 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-primary" /> নতুন ইউজার কনভার্শন স্ট্র্যাটেজি
                           </h4>
                           <div className="grid md:grid-cols-2 gap-4">
                               <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                   <p className="font-bold text-blue-900 mb-1 font-bengali">সর্বশেষ ৭ দিনে {premiumData.newUsersLast7Days} জন নতুন ইউজার যুক্ত হয়েছে</p>
                                   <p className="text-sm text-blue-800/80 font-bengali">যেকোনো এডুকেশনাল প্ল্যাটফর্মে প্রথম ৭ দিন ইউজারের ইন্টার‍্যাকশন সবচেয়ে বেশি থাকে। এদেরকে প্রিমিয়াম করার জন্য একটি 'Welcome Offer' দেওয়া অত্যন্ত কার্যকর।</p>
                               </div>
                               <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl shadow-sm">
                                  <p className="text-sm font-bengali text-green-900 flex items-start gap-2">
                                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                                    <span><strong>অ্যাকশন:</strong> এই নতুন ইউজারদের টার্গেট করে "Welcome20" প্রোমোকোড দিয়ে একটি ইমেইল ও এসএমএস ক্যাম্পেইন রান করুন। সাথে AI টিউটর-এর ফ্রি ডেমো ভিডিও যুক্ত করে দিন।</span>
                                  </p>
                               </div>
                           </div>
                       </div>

                       {/* Expiring Soon Section */}
                       <div className="space-y-4">
                           <h4 className="font-bengali font-bold text-lg text-foreground border-b pb-2 flex justify-between items-end">
                              <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" /> সামনে যাদের মেয়াদ শেষ হবে (আগামী ৭ দিন)</span>
                              <span className="text-sm text-muted-foreground">{premiumData.expiringSoon.length} জন</span>
                           </h4>
                           {premiumData.expiringSoon.length === 0 ? (
                               <p className="text-sm text-slate-500 font-bengali italic">আগামী ৭ দিনে কোনো ইউজারের মেয়াদ শেষ হবে না।</p>
                           ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {premiumData.expiringSoon.map((u: any, idx: number) => (
                                     <div key={idx} className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex flex-col justify-between">
                                        <div>
                                          <p className="font-bold text-foreground">{u.fullName || u.name || "No Name"}</p>
                                          <p className="text-sm text-muted-foreground break-all">{formatEmail(u.email)}</p>
                                          <p className="text-sm text-muted-foreground">{u.phoneNumber || u.phone || "No Phone Number"}</p>
                                        </div>
                                        <p className="text-xs text-orange-600 mt-3 font-bold bg-orange-100 inline-block px-2 py-1 rounded w-fit">Exp: {new Date(u.expiry).toLocaleDateString()}</p>
                                     </div>
                                  ))}
                               </div>
                           )}
                           <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-xl shadow-sm mt-4">
                              <p className="text-sm font-bengali text-orange-900 flex items-start gap-2">
                                <Bell className="w-5 h-5 mt-0.5 shrink-0" />
                                <span><strong>রিনিউ সাজেশন:</strong> কাস্টমার প্রো-অ্যাক্টিভ না হলে রিনিউ রেট কমে যায়। যাদের মেয়াদ আগামী ৩ দিনের মধ্যে শেষ হবে, তাদের "আপনার সাবস্ক্রিপশন শেষ হচ্ছে, আজই রিনিউ করুন ২০% ছাড়ে" এই মেসেজটি ম্যানুয়ালি বা হোয়াটসঅ্যাপ এ পাঠান।</span>
                              </p>
                           </div>
                       </div>

                       {/* Expired Recently Section */}
                       <div className="space-y-4">
                           <h4 className="font-bengali font-bold text-lg text-foreground border-b pb-2 flex justify-between items-end">
                              <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-red-500" /> সম্প্রতি যাদের মেয়াদ শেষ হয়েছে (গত ৩০ দিন)</span>
                              <span className="text-sm text-muted-foreground">{premiumData.expiredRecently.length} জন</span>
                           </h4>
                           {premiumData.expiredRecently.length === 0 ? (
                               <p className="text-sm text-slate-500 font-bengali italic">গত ৩০ দিনে কোনো ইউজারের মেয়াদ শেষ হয়নি।</p>
                           ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {premiumData.expiredRecently.map((u: any, idx: number) => (
                                     <div key={idx} className="bg-red-50/50 border border-red-100 p-4 rounded-xl opacity-80 flex flex-col justify-between">
                                        <div>
                                          <p className="font-bold text-foreground">{u.fullName || u.name || "No Name"}</p>
                                          <p className="text-sm text-muted-foreground break-all">{formatEmail(u.email)}</p>
                                          <p className="text-sm text-muted-foreground">{u.phoneNumber || u.phone || "No Phone Number"}</p>
                                        </div>
                                        <p className="text-xs text-red-600 mt-3 font-bold bg-red-100 inline-block px-2 py-1 rounded w-fit">Expired: {new Date(u.expiry).toLocaleDateString()}</p>
                                     </div>
                                  ))}
                               </div>
                           )}
                           <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl shadow-sm mt-4">
                              <p className="text-sm font-bengali text-green-900 flex items-start gap-2">
                                <Check className="w-5 h-5 mt-0.5 shrink-0 text-green-600" />
                                <span><strong>উইন-ব্যাক স্ট্র্যাটেজি:</strong> এই ইউজারদের জন্য স্পেশাল উইন-ব্যাক অফার (যেমন, ২৫% ক্যাশব্যাক) দেওয়া যেতে পারে। এরা যেহেতু আগে সার্ভিস ব্যবহার করেছে, তাই নতুন ইউজার কনভার্ট করার চেয়ে এদের ফিরিয়ে আনা ৫ গুণ বেশি লাভজনক।</span>
                              </p>
                           </div>
                       </div>
                    </CardContent>
                 </Card>
               </>
            )}
          </div>

        ) : activeTab === "payments" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">পেমেন্ট ভেরিফিকেশন প্যানেল</h3>
                <p className="text-muted-foreground font-bengali text-sm mt-0.5">ম্যানুয়াল সাবস্ক্রিপশন ও ইউজার পেমেন্ট রিকোয়েস্ট যাচাই করুন।</p>
              </div>
              <Button variant="outline" className="font-bengali bg-card border-slate-200" onClick={fetchPaymentRequests} disabled={paymentsLoading}>
                Refresh Requests
              </Button>
            </div>

            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-muted border-b p-6 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bengali">পেমেন্ট রিকোয়েস্টের তালিকা</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-bengali font-bold">
                    {paymentRequests.filter(r => r.status === 'pending').length} অপেক্ষমান
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs text-slate-500 border-slate-200">
                    Total: {paymentRequests.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 bg-muted/50">
                {paymentsLoading ? (
                  <div className="p-12 text-center text-muted-foreground font-bengali font-bold">লোড হচ্ছে...</div>
                ) : paymentRequests.length === 0 ? (
                  <div className="p-16 text-center text-muted-foreground font-bengali font-bold">কোনো পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি।</div>
                ) : (
                  <div>
                    {/* Mobile Card List: visible only on mobile screens */}
                    <div className="block md:hidden space-y-4 p-4">
                      {paymentRequests.map((req) => (
                        <div key={req.id} className="bg-card rounded-2xl border border-slate-200/80 p-4 shadow-sm relative space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground font-bengali text-sm">{req.fullName || 'No Name'}</span>
                              <span className="text-xs text-blue-600 font-bold font-sans mt-0.5 max-w-[170px] truncate">{formatEmail(req.email) || req.phone}</span>
                              {req.className && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full w-fit mt-1 font-bengali font-semibold">
                                  {req.className}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`px-2 py-0.5 rounded font-bold font-bengali text-[9px] text-white uppercase tracking-wider text-center ${
                                req.method === 'bkash' ? 'bg-[#e2136e]' :
                                req.method === 'nagad' ? 'bg-[#f74622]' :
                                req.method === 'rocket' ? 'bg-[#8c2e8c]' :
                                'bg-[#00529b]'
                              }`}>
                                {req.method}
                              </span>
                              {req.status === 'pending' ? (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-bengali font-bold text-[9px] px-1.5 py-0">অপেক্ষমান</Badge>
                              ) : req.status === 'approved' ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-bengali font-bold text-[9px] px-1.5 py-0">অনুমোদিত</Badge>
                              ) : (
                                <Badge variant="secondary" className="font-bengali font-bold text-[9px] px-1.5 py-0 text-red-700 bg-red-50 hover:bg-red-50 border-0">বাতিল</Badge>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-slate-100 my-2 pt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400 block font-bengali text-[10px]">মোবাইল নম্বর / TrxID</span>
                              <span className="font-mono font-bold text-foreground break-all select-all">{req.walletNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bengali text-[10px]">টাকার পরিমাণ & প্ল্যান</span>
                              <span className="font-extrabold text-[#2e7d32]">৳{req.amount}</span>
                              <span className="text-[9px] text-slate-400 font-bengali block font-normal">প্ল্যান: {req.plan === 'custom' ? `${req.days || ''} দিন` : req.plan}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                            <span>সাবমিট করা হয়েছে:</span>
                            <span className="font-mono">
                              {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('bn-BD') : 'Loading...'}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            {req.status === 'pending' ? (
                              <div className="flex items-center gap-2 w-full justify-between">
                                <div className="flex items-center gap-1 bg-muted border border-slate-200 rounded-lg p-1 shrink-0">
                                  <input 
                                    type="number" 
                                    min={1} 
                                    max={60}
                                    value={getProposedMonths(req)}
                                    onChange={(e) => {
                                      const val = Math.max(1, Number(e.target.value));
                                      setCustomMonths(prev => ({ ...prev, [req.id]: val }));
                                    }}
                                    className="w-10 h-7 bg-card text-center rounded-md border border-slate-200 font-sans font-bold text-xs outline-none"
                                  />
                                  <span className="text-[10px] font-bengali font-bold text-slate-500">মাস</span>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bengali h-8 text-xs font-bold"
                                    onClick={() => approvePaymentRequest(req, getProposedMonths(req))}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-500 hover:bg-red-50 border-red-200 h-8 text-xs font-bold font-bengali"
                                    onClick={() => rejectPaymentRequest(req.id)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-550 italic font-bengali">
                                {req.status === 'approved' ? 'অনুমোদিত হয়েছে ✅ ' : 'বাতিল হয়েছে ❌ '}
                                {req.status === 'approved' && req.approvedMonths && `(${req.approvedMonths} মাস)`}
                              </span>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-550 hover:bg-red-50 hover:text-red-700 h-8 p-1.5 shrink-0 ml-auto border border-red-100"
                              onClick={() => deletePaymentRequest(req.id)}
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View: hidden on mobile */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-card">
                          <TableRow>
                            <TableHead className="font-bengali font-bold text-foreground">শিক্ষার্থী (Student Info)</TableHead>
                            <TableHead className="font-bengali font-bold text-foreground">পেমেন্ট মাধ্যম</TableHead>
                            <TableHead className="font-bengali font-bold text-foreground text-center">মোবাইল নম্বর / TrxID</TableHead>
                            <TableHead className="font-bengali font-bold text-foreground">টাকার পরিমাণ & প্ল্যান</TableHead>
                            <TableHead className="font-bengali font-bold text-foreground">সময় (Submitted)</TableHead>
                            <TableHead className="font-bengali font-bold text-foreground">স্ট্যাটাস</TableHead>
                            <TableHead className="text-right font-bengali font-bold text-foreground">অ্যাকশন</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentRequests.map((req) => (
                            <TableRow key={req.id} className="bg-card border-b hover:bg-muted/50 transition-colors">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground font-bengali text-sm">{req.fullName || 'No Name'}</span>
                                  <span className="text-xs text-blue-600 font-bold font-sans mt-0.5">{formatEmail(req.email) || req.phone}</span>
                                  {req.className && (
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full w-fit mt-1 font-bengali font-semibold">
                                      {req.className}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2.5 py-1 rounded-lg font-bold font-bengali text-[10px] inline-block text-white uppercase text-center tracking-wider shadow-xs ${
                                  req.method === 'bkash' ? 'bg-[#e2136e]' :
                                  req.method === 'nagad' ? 'bg-[#f74622]' :
                                  req.method === 'rocket' ? 'bg-[#8c2e8c]' :
                                  'bg-[#00529b]'
                                }`}>
                                  {req.method}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="font-mono font-bold text-slate-900 tracking-wider bg-muted p-2 text-center rounded-xl border border-slate-100 select-all font-sans text-xs max-w-[150px] mx-auto">
                                  {req.walletNumber}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-[#2e7d32] text-sm">৳{req.amount}</span>
                                  <span className="text-[10px] text-slate-400 font-bengali mt-0.5 font-bold">প্ল্যান: {req.plan === 'custom' ? `${req.days || ''} দিন` : req.plan}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs font-mono text-slate-500">
                                  {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('bn-BD') : 'Loading...'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {req.status === 'pending' ? (
                                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-bengali font-bold text-[10px]">অপেক্ষমান</Badge>
                                ) : req.status === 'approved' ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-bengali font-bold text-[10px]">অনুমোদিত</Badge>
                                ) : (
                                  <Badge variant="secondary" className="font-bengali font-bold text-[10px] text-red-700 bg-red-50 hover:bg-red-50 border-0">বাতিল</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2.5">
                                  {req.status === 'pending' ? (
                                    <>
                                      <div className="flex items-center gap-1 shrink-0 bg-muted border border-slate-200 rounded-lg p-1">
                                        <input 
                                          type="number" 
                                          min={1} 
                                          max={60}
                                          value={getProposedMonths(req)}
                                          onChange={(e) => {
                                            const val = Math.max(1, Number(e.target.value));
                                            setCustomMonths(prev => ({ ...prev, [req.id]: val }));
                                          }}
                                          className="w-10 h-7 bg-card text-center rounded-md border border-slate-200 font-sans font-bold text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                        />
                                        <span className="text-[10px] font-bengali font-bold text-slate-500 px-1">মাস</span>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bengali h-8 text-xs font-bold shrink-0"
                                        onClick={() => approvePaymentRequest(req, getProposedMonths(req))}
                                      >
                                        Approve
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-red-500 hover:bg-red-50 border-red-200 h-8 text-xs font-bold font-bengali shrink-0"
                                        onClick={() => rejectPaymentRequest(req.id)}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-xs text-slate-550 italic font-bengali">
                                        {req.status === 'approved' ? 'অনুমোদিত হয়েছে ✅' : 'বাতিল হয়েছে ❌'}
                                      </span>
                                      {req.status === 'approved' && req.approvedMonths && (
                                        <span className="text-[10px] font-bengali font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5">
                                          {req.approvedMonths} মাসের মেয়াদ
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-550 hover:bg-red-50 border border-transparent hover:border-red-100 h-8 w-8 p-0 rounded-lg shrink-0"
                                    onClick={() => deletePaymentRequest(req.id)}
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        ) : activeTab === "vocabulary" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">সিস্টেম শব্দকোষ ব্যবস্থাপনা Panel</h3>
                <p className="text-muted-foreground font-bengali text-sm mt-0.5">যে কোনো ভাষায় JSON Array ফরম্যাটে সিস্টেম শব্দকোষে নতুন শব্দ যোগ করুন বা মুছুন।</p>
              </div>
              <Button variant="outline" className="font-bengali bg-card border-slate-200" onClick={fetchVocabulary} disabled={vocabularyLoading}>
                Refresh Vocabulary
              </Button>
            </div>

            {/* Quick JSON array guidelines card */}
            <Card className="border border-indigo-100 shadow-sm rounded-[24px] bg-muted/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>JSON ফরম্যাট গাইডলাইন ও উদাহরণসমূহ</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  নিচের উদাহরণটির মতন JSON ফরম্যাট করে আপনি একসাথে একাধিক শব্দকোষ আপলোড করতে পারবেন। আবশ্যিক ফিল্ডগুলো হলো: <code className="font-mono bg-slate-100 px-1 rounded text-red-600 text-[10px]">{"word"}</code>, <code className="font-mono bg-slate-100 px-1 rounded text-red-600 text-[10px]">{"language"}</code>, <code className="font-mono bg-slate-100 px-1 rounded text-red-600 text-[10px]">{"category"}</code> এবং <code className="font-mono bg-slate-100 px-1 rounded text-red-600 text-[10px]">{"meaning"}</code>।
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] font-mono bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto border border-slate-800">
{`[
  {
    "word": "Candid",
    "language": "english",
    "category": "vocabulary",
    "pronunciation": "ক্যান্ডিড",
    "meaning": "অকপট, সরল, স্পষ্টভাষী (Truthful and straightforward)",
    "synonyms": ["Frank", "Honest", "Sincere"],
    "antonyms": ["Deceitful", "Evasive"],
    "example": "She gave a candid opinion about the proposal."
  },
  {
    "word": "তিমির",
    "language": "bangla",
    "category": "samarthok",
    "meaning": "অন্ধকার, আঁধার",
    "synonyms": ["অন্ধকার", "তমসা", "আঁধার"],
    "antonyms": ["আলো", "দীপ্তি"],
    "example": "তিমির বিদীর্ণ করে ভোরের সূর্যের আগমন ঘটল।"
  }
]`}
                </pre>
              </CardContent>
            </Card>

            {/* Upload form card */}
            <Card className="border border-muted shadow-sm rounded-[24px]">
              <CardHeader>
                <CardTitle className="text-base font-bengali">নতুন শব্দকোষ যুক্ত করুন (Bulk Upload)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <textarea
                    rows={8}
                    className="w-full font-mono text-[11px] p-4 bg-muted border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-card transition-all text-foreground"
                    placeholder="[ { ... }, { ... } ]"
                    value={newVocabJSON}
                    onChange={(e) => setNewVocabJSON(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setNewVocabJSON(`[
  {
    "word": "Alacrity",
    "language": "english",
    "category": "vocabulary",
    "pronunciation": "অ্যালাক্রিটি",
    "meaning": "আগ্রহ, ক্লান্তিহীন ক্ষিপ্রতা (DU B-Unit / High Yield)",
    "synonyms": ["Eagerness", "Enthusiasm", "Promptness"],
    "antonyms": ["Apathy", "Lethargy", "Indifference"],
    "example": "He accepted the admission challenge with alacrity."
  },
  {
    "word": "Castigate",
    "language": "english",
    "category": "vocabulary",
    "pronunciation": "ক্যাস্টিগেট",
    "meaning": "কঠোর তিরস্কার করা (Severe reprimand - Varsity Admission)",
    "synonyms": ["Chastise", "Reprimand", "Chide"],
    "antonyms": ["Praise", "Laud", "Commend"],
    "example": "The principal did not castigate the students but advised them with warmth."
  },
  {
    "word": "Frugality",
    "language": "english",
    "category": "vocabulary",
    "pronunciation": "ফ্রুগালিটি",
    "meaning": "মিতব্যয়িতা, হিসেবি চলা (Thrifty or economical behavior)",
    "synonyms": ["Thrift", "Economy", "Parsimony"],
    "antonyms": ["Extravagance", "Wastefulness"],
    "example": "Frugality is a wonderful quality when residing in varsity hostels."
  }
]`);
                    }}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bengali text-xs h-10 px-4"
                  >
                    Load Sample Admission JSON
                  </Button>
                  <Button 
                    onClick={handleBulkUploadVocabulary}
                    disabled={vocabularyLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bengali h-10 text-xs px-6 font-bold"
                  >
                    {vocabularyLoading ? "আপলোড হচ্ছে..." : "শব্দগুলো যুক্ত করুন (Save List)"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* List of existing vocabulary */}
            <Card className="border border-muted shadow-sm rounded-[24px] overflow-hidden">
              <CardHeader className="bg-muted border-b p-6 pb-4">
                <CardTitle className="text-base font-bengali">আপলোডকৃত কাস্টম শব্দসমূহের তালিকা ({vocabulary.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-muted/50">
                {vocabularyLoading && vocabulary.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground font-bengali font-bold">লোড হচ্ছে...</div>
                ) : vocabulary.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 font-bengali font-bold text-xs">আজ পর্যন্ত কোনো কাস্টম শব্দ আপলোড করা হয়নি।</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-card">
                        <TableRow>
                          <TableHead className="font-bengali font-bold text-foreground text-xs">শব্দ</TableHead>
                          <TableHead className="font-bengali font-bold text-foreground text-xs">ভাষা</TableHead>
                          <TableHead className="font-bengali font-bold text-foreground text-xs">ক্যাটাগরি</TableHead>
                          <TableHead className="font-bengali font-bold text-foreground text-xs">উচ্চারণ</TableHead>
                          <TableHead className="font-bengali font-bold text-foreground text-xs">বাংলা অর্থ</TableHead>
                          <TableHead className="font-bengali font-bold text-foreground text-xs">অন্যান্য</TableHead>
                          <TableHead className="text-right font-bengali font-bold text-foreground text-xs">অ্যাকশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vocabulary.map((vocab) => (
                          <TableRow key={vocab.id} className="bg-card border-b hover:bg-muted/50 transition-colors">
                            <TableCell className="font-bold text-slate-900">{vocab.word}</TableCell>
                            <TableCell>
                              <Badge className={vocab.language === "bangla" ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-0 text-[10px]" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 text-[10px]"}>
                                {vocab.language}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-500">{vocab.category}</TableCell>
                            <TableCell className="text-xs font-mono text-slate-400">{vocab.pronunciation || "-"}</TableCell>
                            <TableCell className="text-xs text-slate-700 font-semibold max-w-[200px] truncate" title={vocab.meaning}>{vocab.meaning}</TableCell>
                            <TableCell className="text-[10px] text-slate-400 max-w-[150px] truncate" title={`Synonyms: ${vocab.synonyms?.join(', ')}, Antonyms: ${vocab.antonyms?.join(', ')}`}>
                              {vocab.synonyms?.length > 0 && `Syn: ${vocab.synonyms.slice(0, 2).join(', ')}`}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-550 hover:bg-blue-50 border border-transparent hover:border-blue-100 h-8 w-8 p-0 rounded-lg shrink-0"
                                  onClick={() => {
                                    const toEdit = { ...vocab };
                                    // Convert array to comma-separated string for editing
                                    if (Array.isArray(toEdit.synonyms)) toEdit.synonyms = toEdit.synonyms.join(', ');
                                    if (Array.isArray(toEdit.antonyms)) toEdit.antonyms = toEdit.antonyms.join(', ');
                                    setEditingVocab(toEdit);
                                  }}
                                  title="এডিট করুন"
                                >
                                  <Edit className="w-4 h-4 text-blue-500" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-550 hover:bg-red-50 border border-transparent hover:border-red-100 h-8 w-8 p-0 rounded-lg shrink-0"
                                  onClick={() => deleteVocabularyWord(vocab.id)}
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        ) : activeTab === "class_requests" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">ক্লাস পরিবর্তন রিকুয়েস্ট</h3>
                <p className="text-muted-foreground">শিক্ষার্থীদের ক্লাস পরিবর্তনের অনুরোধসমূহ অনুমোদন করুন</p>
              </div>
            </div>
            {/* Displaying class requests component */}
            <ClassRequestsTab />
          </div>

        ) : activeTab === "note_publisher" ? (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">নোট পাবলিশার</h3>
                 <p className="text-muted-foreground">বিকল্প পদ্ধতিতে সাধারণ নোট পাবলিশ করুন (পিডিএফ বা লিঙ্ক)</p>
              </div>
            </div>
            {/* Dedicated Note Publisher Note Form */}
            <NotePublisherTab />
          </div>

        ) : activeTab === "notes_creator" ? (
          <NotesCreator />

        ) : activeTab === "board_questions" ? (
          <BoardQuestionsCreator />
        ) : activeTab === "unified_uploader" ? (
          <UnifiedUploader />

        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold capitalize">{activeTab.replace('-', ' ')} Overview</h3>
                <p className="text-muted-foreground">Manage the {activeTab.replace('-', ' ')} module.</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => alert(`Create new ${activeTab}`)}>
                 <Plus className="w-4 h-4 mr-2" /> Create New
              </Button>
            </div>
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden min-h-[300px] flex items-center justify-center">
               <div className="text-center p-6">
                  <h3 className="text-lg font-bold mb-1">Module Coming Soon</h3>
                  <p className="text-muted-foreground">The data grid for {activeTab} will appear here.</p>
                  <Button variant="outline" className="mt-4" onClick={() => alert("Trigger action")}>Simulate Action</Button>
               </div>
            </Card>
          </div>
        )}
      </main>

      {/* Edit Question Modal */}
      {editQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-muted sticky top-0 z-10">
              <h3 className="text-xl font-bold font-bengali">{editQuestion.id === 'new' ? 'নতুন প্রশ্ন যোগ করুন' : 'প্রশ্ন এডিট করুন'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditQuestion(null)} className="h-8 w-8 p-0 rounded-full">✕</Button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">প্রশ্ন (Question)</label>
                <textarea 
                  className="w-full border rounded-xl p-3 text-sm font-bengali min-h-[100px] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={editQuestion.text || ""}
                  onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1 block font-bengali">বিশ্ববিদ্যালয়</label>
                  <Input 
                    value={editQuestion.university || ""} 
                    onChange={(e) => setEditQuestion({ ...editQuestion, university: e.target.value })} 
                    className="font-bengali"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block font-bengali">বিষয়</label>
                  <select
                    className="w-full border rounded-xl p-2 text-sm font-bengali outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                    value={editQuestion.subject || ""}
                    onChange={(e) => setEditQuestion({ ...editQuestion, subject: e.target.value })}
                  >
                    <option value="">বিষয় নির্বাচন করুন</option>
                    {Array.from(new Set([...allDynamicSubjects, ...subjects.map(s => s.name)].map(normalizeSubjectName))).map((sub: string) => (
                      <option key={sub} value={sub}>{getSubjectDisplayName(sub)}</option>
                    ))}
                  </select>
                </div>
              </div>

{!editQuestion.isSubjectWiseOnly && (
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">ব্যাংকের নাম / Title (ex: ঢাবি সি ২০২৫-২০২৬)</label>
                <Input 
                  value={editQuestion.title || ""} 
                  onChange={(e) => setEditQuestion({ ...editQuestion, title: e.target.value })} 
                  className="font-bengali"
                />
              </div>
)}

              <div>
                <label className="text-sm font-bold mb-2 block font-bengali">অপশনসমূহ (Options)</label>
                <div className="space-y-3">
                  {editQuestion.options?.map((opt: any, optIdx: number) => (
                    <div key={optIdx} className={`flex items-center gap-3`}>
                      <div className="w-8 h-8 rounded shrink-0 bg-slate-100 flex items-center justify-center font-bold text-sm">
                        {opt.id}
                      </div>
                      <Input 
                        value={opt.label || ""} 
                        onChange={(e) => {
                          const newOpts = editQuestion.options.map((o: any, i: number) => 
                            i === optIdx ? { ...o, label: e.target.value } : o
                          );
                          setEditQuestion({ ...editQuestion, options: newOpts });
                        }}
                        className="font-bengali flex-1"
                      />
                      <label className="flex items-center gap-2 text-sm font-medium shrink-0 cursor-pointer">
                        <input 
                          type="radio" 
                          name="correctOption" 
                          checked={editQuestion.correctOption === opt.id} 
                          onChange={() => setEditQuestion({ ...editQuestion, correctOption: opt.id })}
                        />
                        সঠিক
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">ব্যাখ্যা (Explanation)</label>
                <textarea 
                  className="w-full border rounded-xl p-3 text-sm font-bengali min-h-[100px] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={editQuestion.explanation || ""}
                  onChange={(e) => setEditQuestion({ ...editQuestion, explanation: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t bg-muted flex justify-end gap-3 sticky bottom-0">
              <Button variant="outline" onClick={() => setEditQuestion(null)} className="font-bengali">বাতিল</Button>
              <Button onClick={handleUpdateQuestion} className="font-bengali">সংরক্ষণ করুন</Button>
            </div>
          </div>
        </div>
      )}

      {showBulkUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-muted">
              <h3 className="text-xl font-bold font-bengali">Bulk Upload JSON</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkUpload(false)} className="h-8 w-8 p-0 rounded-full">✕</Button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4">Paste your array of questions in JSON format here. You can select a subject below to automatically assign all uploaded questions to that subject.</p>
              
              <div className="mb-4">
                <label className="text-sm font-bold mb-1 block font-bengali">প্রশ্ন ধরণ (Question Type)</label>
                <select
                  className="w-full border rounded-xl p-2 text-sm font-bengali outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                  value={bulkUploadType}
                  onChange={(e) => setBulkUploadType(e.target.value)}
                >
                  <option value="mixed">মিক্সড (JSON অনুযায়ী নিবে)</option>
                  <option value="mcq">শুধু MCQ</option>
                  <option value="cq">শুধু CQ (সৃজনশীল)</option>
                  <option value="k_vandar">জ্ঞ্যানমূলক ('ক' ভান্ডার)</option>
                  <option value="kh_vandar">অনুধাবনমূলক ('খ' ভান্ডার)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold mb-1 block font-bengali">বিষয় নির্বাচন করুন (Optional)</label>
                <select
                  className="w-full border rounded-xl p-2 text-sm font-bengali outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                  value={bulkUploadSubject}
                  onChange={(e) => setBulkUploadSubject(e.target.value)}
                >
                  <option value="">কোনো বিষয় নির্দিষ্ট নয় (JSON থেকে নিবে)</option>
                  {Array.from(new Set([...allDynamicSubjects, ...subjects.map(s => s.name)].map(normalizeSubjectName))).map((sub: string) => (
                    <option key={sub} value={sub}>{getSubjectDisplayName(sub)}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-bold mb-2 block font-bengali">টার্গেট ক্লাস সিলেক্ট করুন (একাধিক সিলেক্ট করা যাবে)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-muted/50 p-4 rounded-2xl border border-slate-200/60">
                  <label className="flex items-center gap-2 text-sm font-bengali cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                      checked={bulkUploadTargets.hsc}
                      onChange={() => setBulkUploadTargets({ ...bulkUploadTargets, hsc: !bulkUploadTargets.hsc })}
                    />
                    এইচএসসি (HSC)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bengali cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                      checked={bulkUploadTargets.class11}
                      onChange={() => setBulkUploadTargets({ ...bulkUploadTargets, class11: !bulkUploadTargets.class11 })}
                    />
                    একাদশ শ্রেণী (Class 11)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bengali cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                      checked={bulkUploadTargets.class12}
                      onChange={() => setBulkUploadTargets({ ...bulkUploadTargets, class12: !bulkUploadTargets.class12 })}
                    />
                    দ্বাদশ শ্রেণী (Class 12)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bengali cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                      checked={bulkUploadTargets.admission}
                      onChange={() => setBulkUploadTargets({ ...bulkUploadTargets, admission: !bulkUploadTargets.admission })}
                    />
                    এডমিশন (Admission)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bengali cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                      checked={bulkUploadTargets.ssc}
                      onChange={() => setBulkUploadTargets({ ...bulkUploadTargets, ssc: !bulkUploadTargets.ssc })}
                    />
                    এসএসসি (SSC)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bengali cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                      checked={bulkUploadTargets.class9}
                      onChange={() => setBulkUploadTargets({ ...bulkUploadTargets, class9: !bulkUploadTargets.class9 })}
                    />
                    ৯ম শ্রেণী (Class 9)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bengali cursor-pointer hover:text-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                      checked={bulkUploadTargets.class6_8}
                      onChange={() => setBulkUploadTargets({ ...bulkUploadTargets, class6_8: !bulkUploadTargets.class6_8 })}
                    />
                    ৬ষ্ঠ-৮ম শ্রেণী (Class 6-8)
                  </label>
                </div>
              </div>

              {bulkUploadTargets.admission && (
                <div className="mb-4">
                  <label className="text-sm font-bold mb-1 block font-bengali">বিশ্ববিদ্যালয় / গুচ্ছ (এডমিশন এর জন্য - ঐচ্ছিক)</label>
                  <select
                    className="w-full border rounded-xl p-2 text-sm font-bengali outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10"
                    value={bulkUploadUniversity}
                    onChange={(e) => setBulkUploadUniversity(e.target.value)}
                  >
                    <option value="">কোনো নির্দিষ্ট বিশ্ববিদ্যালয় নেই (ঐচ্ছিক)</option>
                    <option value="ঢাকা বিশ্ববিদ্যালয়">ঢাকা বিশ্ববিদ্যালয় (DU)</option>
                    <option value="রাজশাহী বিশ্ববিদ্যালয়">রাজশাহী বিশ্ববিদ্যালয় (RU)</option>
                    <option value="জাহাঙ্গীরনগর বিশ্ববিদ্যালয়">জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (JU)</option>
                    <option value="চট্টগ্রাম বিশ্ববিদ্যালয়">চট্টগ্রাম বিশ্ববিদ্যালয় (CU)</option>
                    <option value="গুচ্ছ (GST)">গুচ্ছ (GST)</option>
                  </select>
                </div>
              )}

              <textarea 
                className="w-full border rounded-xl p-4 text-sm font-mono h-[300px] outline-none focus:border-primary focus:ring-1 focus:ring-primary whitespace-pre resize-none"
                placeholder="[ { ... }, { ... } ]"
                value={bulkUploadText}
                onChange={(e) => setBulkUploadText(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="p-6 border-t bg-muted flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowBulkUpload(false)} className="font-bengali" disabled={isUploading}>Cancel</Button>
              <Button onClick={handleBulkUploadSubmit} className="font-bengali" disabled={!bulkUploadText.trim() || isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-muted">
              <h3 className="text-xl font-bold font-bengali">{editingExamId ? "পাবলিক পরীক্ষা ইডিট করুন" : "পাবলিক পরীক্ষা তৈরি করুন"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateExamModal(false)} className="h-8 w-8 p-0 rounded-full">✕</Button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">পরীক্ষার নাম (Title)</label>
                <Input 
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="font-bengali bg-card"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">পরীক্ষার আইডি/কোড (ইংরেজি বর্ণে সংক্ষিপ্ত, যেমন: Even-1)</label>
                <Input 
                  placeholder="যেমন: Even-1, Model-5, Bangla-test"
                  value={newExamCustomId}
                  onChange={(e) => setNewExamCustomId(e.target.value)}
                  className="font-mono bg-card"
                />
                <p className="text-xs text-slate-500 mt-1">ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে একটি সংক্ষিপ্ত কোড যুক্ত হবে।</p>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">সময় (Minutes)</label>
                <Input 
                  type="number"
                  value={newExamDuration}
                  onChange={(e) => setNewExamDuration(e.target.value)}
                  className="font-bengali bg-card"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1 block font-bengali font-bengali">শ্রেণি (Target Class)</label>
                  <select
                    value={newExamClass}
                    onChange={(e) => setNewExamClass(e.target.value)}
                    className="w-full h-10 border rounded-xl px-3 bg-card font-bengali select-none outline-none focus:ring-1 focus:ring-primary text-sm focus:border-primary"
                  >
                    <option value="সকল ক্লাস">সকল ক্লাস</option>
                    <option value="৬ষ্ঠ শ্রেণী">৬ষ্ঠ শ্রেণী</option>
                    <option value="৭ম শ্রেণী">৭ম শ্রেণী</option>
                    <option value="৮ম শ্রেণী">৮ম শ্রেণী</option>
                    <option value="নবম শ্রেণী">নবম শ্রেণী</option>
                    <option value="দশম শ্রেণী">দশম শ্রেণী</option>
                    <option value="এইচএসসি">এইচএসসি</option>
                    <option value="এডমিশন">এডমিশন</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block font-bengali font-bengali">পরীক্ষার ধরন (Type)</label>
                  <select
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value)}
                    className="w-full h-10 border rounded-xl px-3 bg-card font-bengali select-none outline-none focus:ring-1 focus:ring-primary text-sm focus:border-primary"
                  >
                    <option value="public">পাবলিক এক্সাম (Live Exam)</option>
                    <option value="live_model_test">লাইভ মডেল টেস্ট (Live Model Test)</option>
                    <option value="model_test">মডেল টেস্ট (Regular Model Test)</option>
                    <option value="event_exam">ইভেন্ট এক্সাম (Event Exam)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block font-bengali font-bengali">Scheduled Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={newExamScheduledDate}
                    onChange={(e) => setNewExamScheduledDate(e.target.value)}
                    className="w-full h-10 border rounded-xl px-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm bg-card"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block font-bengali text-rose-500">Close Schedule (বন্ধ করার সময়)</label>
                  <input 
                    type="datetime-local" 
                    value={newExamCloseDate}
                    onChange={(e) => setNewExamCloseDate(e.target.value)}
                    className="w-full h-10 border border-rose-200 dark:border-rose-900/30 rounded-xl px-3 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono text-sm bg-card"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">প্রশ্নসমূহ (JSON Array - Optional)</label>
                <textarea 
                  className="w-full border rounded-xl p-4 text-sm font-mono h-[250px] outline-none focus:border-primary focus:ring-1 focus:ring-primary whitespace-pre resize-none bg-muted"
                  placeholder="[&#10;  {&#10;    &quot;text&quot;: &quot;Question?&quot;,&#10;    &quot;options&quot;: [{&quot;id&quot;:&quot;A&quot;, &quot;label&quot;:&quot;...&quot;}...],&#10;    &quot;correctOption&quot;: &quot;A&quot;&#10;  }&#10;]"
                  value={newExamQuestionsJSON}
                  onChange={(e) => setNewExamQuestionsJSON(e.target.value)}
                  spellCheck={false}
                />
                <p className="text-xs text-slate-500 mt-2">ফাঁকা রাখলে ডেমো প্রশ্ন আসবে।</p>
              </div>
            </div>
            <div className="p-6 border-t bg-muted flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateExamModal(false)} className="font-bengali">Cancel</Button>
              <Button onClick={createPublicExam} disabled={examsLoading} className="font-bengali">{editingExamId ? "Save Changes" : "Create Exam"}</Button>
            </div>
          </div>
        </div>
      )}
      {showCreateCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-3xl w-full max-w-sm max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-muted">
              <h3 className="text-xl font-bold font-bengali">নতুন কুপন</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateCouponModal(false)} className="h-8 w-8 p-0 rounded-full">✕</Button>
            </div>
            <div className="p-6 flex-1 space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">কুপন কোড (যেমন: PRO100)</label>
                <Input 
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="bg-card font-mono uppercase"
                  placeholder="CODE100"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">কত মাসের জন্য? (যেমন: 1, 3, 6)</label>
                <Input 
                  type="number"
                  value={newCouponMonths}
                  onChange={(e) => setNewCouponMonths(e.target.value)}
                  className="bg-card"
                  min="1"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-muted flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateCouponModal(false)} className="font-bengali">Cancel</Button>
              <Button onClick={createCoupon} className="font-bengali">Save Coupon</Button>
            </div>
          </div>
        </div>
      )}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card p-6 rounded-2xl shadow-xl max-w-sm w-full border animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-bengali mb-3 text-foreground">নিশ্চিত করুন (Confirm)</h3>
            <p className="text-muted-foreground mb-6 font-bengali leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDialog(null)} className="font-bengali">বাতিল (Cancel)</Button>
              <Button variant="destructive" onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="font-bengali">নিশ্চিত (Confirm)</Button>
            </div>
          </div>
        </div>
      )}
      {proGiftUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-card rounded-[24px] overflow-hidden shadow-2xl max-w-md w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b flex justify-between items-center bg-muted/50">
              <h3 className="text-lg font-bold font-bengali text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-orange-500 animate-pulse animate-duration-1000" /> প্রো এক্সেস গিফট (Gift Pro)
              </h3>
              <button 
                onClick={() => setProGiftUser(null)} 
                className="text-slate-400 hover:text-muted-foreground rounded-full p-1.5 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground text-sm font-bengali leading-relaxed">
                ইউজার <strong className="text-slate-900">{proGiftUser.name}</strong> কে প্রো সুবিধা গিফট করছেন। কত মাসের এক্সেস দিতে চান তা সিলেক্ট করুন:
              </p>
              
              <div className="grid grid-cols-4 gap-2">
                {["1", "3", "6", "12"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setGiftMonths(m)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                      giftMonths === m 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                        : "bg-card text-slate-700 hover:bg-muted border-slate-200"
                    }`}
                  >
                    <span className="font-bengali">{m === "12" ? "১ বছর" : `${m} মাস`}</span>
                    <span className="text-[9px] font-normal opacity-85">{m}m</span>
                  </button>
                ))}
              </div>
              
              <div className="relative mt-2">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block font-bengali">কাস্টম মাস সংখ্যা দিন:</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="যেমন: ৩ বা ১২ মাস..."
                  value={giftMonths}
                  onChange={(e) => setGiftMonths(e.target.value)}
                  className="bg-card rounded-xl py-4.5 font-bold text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-muted flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setProGiftUser(null)} 
                className="font-bengali rounded-xl py-4.5"
              >
                বাতিল
              </Button>
              <Button 
                onClick={() => {
                  const months = parseInt(giftMonths);
                  if (isNaN(months) || months < 1) {
                    return;
                  }
                  toggleProStatus(proGiftUser.id, false, months);
                  setProGiftUser(null);
                }} 
                className="bg-gradient-to-br from-[#FFB800] to-[#F59E0B] text-white hover:from-[#E5A600] hover:to-[#D97706] font-bengali rounded-xl py-4.5 font-bold border-0"
              >
                গিফট প্রো কনফার্ম
              </Button>
            </div>
          </div>
        </div>
      )}
      {selectedUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4" onClick={() => setSelectedUserModal(null)}>
          <div className="bg-card rounded-[32px] overflow-hidden shadow-2xl max-w-md w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 pb-4 border-b flex justify-between items-start bg-muted/50">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden font-bold text-slate-400 text-xl">
                   {selectedUserModal.photoURL ? <img src={selectedUserModal.photoURL} alt={selectedUserModal.fullName} className="w-full h-full object-cover" /> : selectedUserModal.fullName?.charAt(0) || <User className="w-8 h-8" />}
                 </div>
                 <div>
                   <h3 className="text-xl font-bold font-bengali text-foreground leading-tight flex items-center gap-2">
                     {selectedUserModal.fullName || 'No Name'}
                     {selectedUserModal.isAdmin && <Crown className="w-4 h-4 text-purple-500" />}
                   </h3>
                   <p className="text-sm font-sans font-bold text-blue-600">{formatEmail(selectedUserModal.email) || selectedUserModal.phoneNumber}</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedUserModal(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold tracking-wider mb-1">POINTS</span>
                  <span className="font-mono text-2xl font-black text-[#0F2744] bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200/50 w-fit">{selectedUserModal.points || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-end max-w-[150px]">
                  {selectedUserModal.isPro && <Badge className="bg-orange-50 text-orange-600 border border-orange-200/50 text-xs px-2.5 py-1 rounded-md"><Crown className="w-3.5 h-3.5 mr-1" /> Pro</Badge>}
                  {selectedUserModal.isTutor && <Badge className="bg-blue-50 text-blue-600 border border-blue-200/50 text-xs px-2.5 py-1 rounded-md"><BookOpen className="w-3.5 h-3.5 mr-1" /> Tutor</Badge>}
                  {selectedUserModal.isAdmin && <Badge className="bg-purple-50 text-purple-650 border border-purple-200/50 text-xs px-2.5 py-1 rounded-md font-bengali"><Crown className="w-3.5 h-3.5 mr-1 text-purple-500 animate-pulse" /> Admin</Badge>}
                  {selectedUserModal.class && <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200/60 text-xs px-2.5 py-1 rounded-md font-bengali">{selectedUserModal.class}</Badge>}
                </div>
              </div>

              <div className="grid gap-3 pt-6 border-t border-slate-100">
                <Button 
                  disabled={selectedUserModal.isAdmin || selectedUserModal.isTutor}
                  variant={selectedUserModal.isPro ? "outline" : "default"} 
                  className={`w-full font-semibold rounded-xl text-sm py-5 transition-all shadow-sm ${selectedUserModal.isAdmin || selectedUserModal.isTutor ? "bg-slate-100 text-slate-400 border-slate-200" : selectedUserModal.isPro ? "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-655 hover:border-red-300" : "bg-gradient-to-br from-[#FFB800] to-[#F59E0B] text-white hover:from-[#E5A600] hover:to-[#D97706] hover:shadow-md border-0"}`}
                  onClick={() => {
                    if (selectedUserModal.isAdmin || selectedUserModal.isTutor) return;
                    if (selectedUserModal.isPro) {
                      setConfirmDialog({
                        isOpen: true,
                        message: `${selectedUserModal.fullName || selectedUserModal.email || 'ইউজার'} এর প্রো সাবস্ক্রিপশন বাতিল করতে চান?`,
                        onConfirm: () => {
                          toggleProStatus(selectedUserModal.id, selectedUserModal.isPro);
                          setSelectedUserModal(null);
                        }
                      });
                    } else {
                      setProGiftUser({ id: selectedUserModal.id, name: selectedUserModal.fullName || selectedUserModal.email || 'User' });
                      setGiftMonths("1");
                    }
                  }}
                >
                  {selectedUserModal.isAdmin || selectedUserModal.isTutor ? <><Crown className="w-4 h-4 mr-2" /> Lifetime Pro (Role Based)</> : selectedUserModal.isPro ? "Revoke Pro Access" : <><Crown className="w-4 h-4 mr-2" /> Gift Pro Subscription</>}
                </Button>
                
                <Button 
                  variant={selectedUserModal.isTutor ? "outline" : "secondary"} 
                  className={`w-full font-semibold rounded-xl text-sm py-5 transition-all shadow-sm ${selectedUserModal.isTutor ? "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-655 hover:border-red-300" : "bg-indigo-50 text-indigo-600 border border-indigo-100/50 hover:bg-indigo-100 hover:text-indigo-700"}`}
                  onClick={() => {
                    toggleTutorStatus(selectedUserModal.id, selectedUserModal.isTutor);
                    setSelectedUserModal(null);
                  }}
                >
                  {selectedUserModal.isTutor ? "Revoke Tutor Role" : <><BookOpen className="w-4 h-4 mr-2" /> Assign Tutor Role</>}
                </Button>

                {selectedUserModal.isTutor && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl py-5 text-sm"
                    onClick={() => {
                      setTutorSubjectModal({ userId: selectedUserModal.id, name: selectedUserModal.fullName || selectedUserModal.email || 'User', subjects: selectedUserModal.tutorSubjects || [] });
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" /> Configure Tutor Subjects
                  </Button>
                )}

                <div className="pt-2">
                   <h4 className="font-bold text-sm text-foreground font-bengali mb-3">লগড ইন ডিভাইসেস</h4>
                   {selectedUserModal.devices && Object.keys(selectedUserModal.devices).length > 0 ? (
                      <div className="space-y-2">
                         {Object.entries(selectedUserModal.devices).map(([deviceId, dev]: [string, any]) => (
                            <div key={deviceId} className="bg-muted border border-slate-200 rounded-lg p-3">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-slate-700">{dev.type || 'অজানা ডিভাইস'}</span>
                                  <span className="text-[10px] text-slate-400 font-sans">
                                     {new Date(dev.lastActive).toLocaleString()}
                                  </span>
                               </div>
                               <p className="text-[10px] text-slate-500 truncate" title={dev.userAgent}>{dev.userAgent}</p>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <p className="text-xs text-slate-400 font-bengali">কোনো ডিভাইসের তথ্য নেই।</p>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <Button 
                    variant={selectedUserModal.isAdmin ? "outline" : "secondary"} 
                     className={`font-semibold rounded-xl text-xs py-5 transition-all shadow-sm ${selectedUserModal.isAdmin ? "text-purple-650 border-purple-200 hover:bg-purple-100" : "bg-purple-50 text-purple-650 border border-purple-100 hover:bg-[#F3E8FF]"}`}
                    onClick={() => {
                      toggleAdminStatus(selectedUserModal.id, selectedUserModal.isAdmin);
                      setSelectedUserModal(null);
                    }}
                  >
                    {selectedUserModal.isAdmin ? "Revoke Admin" : <><User className="w-4 h-4 mr-1.5" /> Make Admin</>}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl text-xs py-5" 
                    onClick={() => {
                      deleteUser(selectedUserModal.id);
                      setSelectedUserModal(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {tutorSubjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-card rounded-[24px] overflow-hidden shadow-2xl max-w-lg w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b flex justify-between items-center bg-muted/50">
              <h3 className="text-lg font-bold font-bengali text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> টিউটর সাবজেক্ট অ্যাক্সেস
              </h3>
              <button 
                onClick={() => setTutorSubjectModal(null)} 
                className="text-slate-400 hover:text-muted-foreground rounded-full p-1.5 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-muted-foreground text-sm font-bengali leading-relaxed mb-4">
                টিউটর <strong className="text-slate-900">{tutorSubjectModal.name}</strong> কোন কোন বিষয় বা টপিকের প্রশ্ন দেখতে ও উত্তর দিতে পারবেন তা সিলেক্ট করুন অথবা নতুন যুক্ত করুন:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from(new Set([...allDynamicSubjects, ...(tutorSubjectModal.subjects || [])].map(normalizeSubjectName))).map(sub => {
                  const isSelected = tutorSubjectModal.subjects?.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        const currentSubs = tutorSubjectModal.subjects || [];
                        const isSelected = tutorSubjectModal.subjects?.includes(sub);
                        const newSubs = isSelected 
                          ? currentSubs.filter(s => s !== sub)
                          : [...currentSubs, sub];
                        setTutorSubjectModal({ ...tutorSubjectModal, subjects: newSubs });
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-bengali transition-colors border ${tutorSubjectModal.subjects?.includes(sub) ? "bg-blue-600 text-white border-blue-600" : "bg-card text-slate-700 hover:bg-muted border-slate-200"}`}
                    >
                      {getSubjectDisplayName(sub)}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="text" 
                  placeholder="নতুন টপিক লিখুন..." 
                  className="font-bengali h-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newTopic = e.currentTarget.value.trim();
                      if (!tutorSubjectModal.subjects?.includes(newTopic)) {
                        setTutorSubjectModal({ 
                          ...tutorSubjectModal, 
                          subjects: [...(tutorSubjectModal.subjects || []), newTopic] 
                        });
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const newTopic = input.value.trim();
                      if (!tutorSubjectModal.subjects?.includes(newTopic)) {
                        setTutorSubjectModal({ 
                          ...tutorSubjectModal, 
                          subjects: [...(tutorSubjectModal.subjects || []), newTopic] 
                        });
                      }
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 border-t bg-muted flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setTutorSubjectModal(null)} 
                className="font-bengali rounded-xl py-4.5"
              >
                বাতিল
              </Button>
              <Button 
                onClick={async () => {
                   try {
                     await updateDoc(doc(db, "users", tutorSubjectModal.userId), { tutorSubjects: tutorSubjectModal.subjects });
                     alert("Tutor subjects updated successfully!");
                     fetchUsers();
                     setTutorSubjectModal(null);
                   } catch(e) {
                     console.error("Failed to update subjects", e);
                     alert("Failed to update subjects.");
                   }
                }} 
                className="bg-blue-600 text-white hover:bg-blue-700 font-bengali rounded-xl py-4.5 font-bold border-0"
              >
                সংরক্ষণ করুন (Save)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vocabulary Modal */}
      {editingVocab && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground font-bengali tracking-tight">শব্দ পরিমার্জন</h2>
                  <p className="text-xs text-slate-500 font-bengali">কাস্টম শব্দকোষ এডিট করুন</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingVocab(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">শব্দ (Word)</label>
                <Input 
                  value={editingVocab.word}
                  onChange={(e) => setEditingVocab({...editingVocab, word: e.target.value})}
                  className="h-12 bg-muted border-slate-200 text-sm font-semibold rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">উচ্চারণ (Pronunciation - ঐচ্ছিক)</label>
                <Input 
                  value={editingVocab.pronunciation || ""}
                  onChange={(e) => setEditingVocab({...editingVocab, pronunciation: e.target.value})}
                  className="h-12 bg-muted border-slate-200 text-sm font-semibold rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">ভাষা (Language)</label>
                  <select className="w-full h-12 bg-muted border border-slate-200 text-sm font-semibold rounded-xl px-3 outline-none focus:ring-2 focus:ring-blue-500/20" value={editingVocab.language || "english"} onChange={(e) => setEditingVocab({...editingVocab, language: e.target.value})}>
                    <option value="english">English</option>
                    <option value="bangla">Bangla</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">ক্যাটাগরি</label>
                  <Input 
                    value={editingVocab.category || ""}
                    onChange={(e) => setEditingVocab({...editingVocab, category: e.target.value})}
                    placeholder="vocabulary"
                    className="h-12 bg-muted border-slate-200 text-sm font-semibold rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">অর্থ (Meaning)</label>
                <Input 
                  value={editingVocab.meaning || ""}
                  onChange={(e) => setEditingVocab({...editingVocab, meaning: e.target.value})}
                  className="h-12 bg-muted border-slate-200 text-sm font-semibold rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">সমার্থক শব্দ (কমা দিয়ে আলাদা করুন)</label>
                <Input 
                  value={editingVocab.synonyms || ""}
                  onChange={(e) => setEditingVocab({...editingVocab, synonyms: e.target.value})}
                  className="h-12 bg-muted border-slate-200 text-sm font-semibold rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">বিপরীত শব্দ (কমা দিয়ে আলাদা করুন)</label>
                <Input 
                  value={editingVocab.antonyms || ""}
                  onChange={(e) => setEditingVocab({...editingVocab, antonyms: e.target.value})}
                  className="h-12 bg-muted border-slate-200 text-sm font-semibold rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 font-bengali uppercase tracking-wider">উদাহরণ (Example)</label>
                <textarea 
                  value={editingVocab.example || ""}
                  onChange={(e) => setEditingVocab({...editingVocab, example: e.target.value})}
                  className="w-full p-3 min-h-[80px] bg-muted border border-slate-200 text-sm font-medium rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="p-5 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-muted/50 shrink-0">
              <Button 
                variant="ghost"
                onClick={() => setEditingVocab(null)} 
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bengali rounded-xl h-11 px-6"
              >
                বাতিল
              </Button>
              <Button 
                onClick={handleUpdateVocabulary} 
                disabled={isSavingVocab}
                className="bg-blue-600 text-white hover:bg-blue-700 font-bengali rounded-xl h-11 px-8 font-bold shadow-md shadow-blue-600/20"
              >
                {isSavingVocab ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
