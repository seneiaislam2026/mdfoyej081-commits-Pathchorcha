import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileQuestion, BookOpen, Layers, Target, BarChart, Settings, Plus, Upload, MoreVertical, LogOut, Check, Gift, Crown, Trophy, Link as LinkIcon, Copy, MessageCircleQuestion, AlertCircle, User } from "lucide-react";
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
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

const menuItems = [
  { id: "dashboard", label: "ড্যাশবোর্ড (Dashboard)", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
  { id: "students", label: "শিক্ষার্থী (Students)", icon: <Users className="w-5 h-5 mr-3" /> },
  { id: "questions", label: "প্রশ্ন ব্যাংক (Questions)", icon: <FileQuestion className="w-5 h-5 mr-3" /> },
  { id: "subjects", label: "বিষয় (Subjects)", icon: <BookOpen className="w-5 h-5 mr-3" /> },
  { id: "chapters", label: "অধ্যায় (Chapters)", icon: <Layers className="w-5 h-5 mr-3" /> },
  { id: "exams", label: "পাবলিক পরীক্ষা (Exams)", icon: <Target className="w-5 h-5 mr-3" /> },
  { id: "leaderboard", label: "লিডারবোর্ড (Leaderboard)", icon: <Trophy className="w-5 h-5 mr-3" /> },
  { id: "doubts", label: "শিক্ষার্থীর প্রশ্ন (Doubts)", icon: <MessageCircleQuestion className="w-5 h-5 mr-3" /> },
  { id: "reports", label: "রিপোর্টকৃত প্রশ্ন (Reports)", icon: <AlertCircle className="w-5 h-5 mr-3" /> },
  { id: "analytics", label: "অ্যানালিটিক্স (Analytics)", icon: <BarChart className="w-5 h-5 mr-3" /> },
  { id: "settings", label: "সেটিংস (Settings)", icon: <Settings className="w-5 h-5 mr-3" /> },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("students");
  const [users, setUsers] = useState<any[]>([]);
  const [publicExams, setPublicExams] = useState<any[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsData, setSettingsData] = useState<any>({
    maintenanceMode: false,
    alertBannerActive: false,
    alertBannerMessage: "",
  });
  const [pendingDoubts, setPendingDoubts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponMonths, setNewCouponMonths] = useState("1");
  const [bulkUploadText, setBulkUploadText] = useState("");
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("Weekly Public Exam");
  const [newExamDuration, setNewExamDuration] = useState("25");
  const [newExamQuestionsJSON, setNewExamQuestionsJSON] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState("All Subjects");
  const [selectedBankTitle, setSelectedBankTitle] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "students") {
      fetchUsers();
    } else if (activeTab === "settings") {
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
    } else if (activeTab === "questions") {
      fetchQuestions();
    } else if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const q = query(collection(db, "questions"), limit(200));
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

  const handleUpdateQuestion = async () => {
    if (!editQuestion) return;
    try {
      const { id, ...data } = editQuestion;
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
    try {
      const parsed = JSON.parse(bulkUploadText);
      let targetArray: any[] = [];
      let rootTitle = '';
      if (Array.isArray(parsed)) {
        targetArray = parsed;
      } else if (parsed && Array.isArray(parsed.questions)) {
        targetArray = parsed.questions;
        rootTitle = parsed.title || '';
      }

      if (targetArray.length > 0) {
        const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
        let count = 0;
        for (const q of targetArray) {
           const finalSubject = q.subject || (questionSubjectFilter !== "All Subjects" ? questionSubjectFilter : '');
           const finalTitle = rootTitle || q.title || (selectedBankTitle && selectedBankTitle !== 'Uncategorized' ? selectedBankTitle : '');
           await addDoc(collection(db, "questions"), {
             ...q,
             subject: finalSubject,
             title: finalTitle,
             createdAt: serverTimestamp()
           });
           count++;
        }
        alert(`Successfully added ${count} questions to Firestore.`);
        setBulkUploadText("");
        setShowBulkUpload(false);
        fetchQuestions();
      } else {
        alert("JSON does not contain any valid array of questions.");
      }
    } catch (err) {
      console.error("Bulk upload error", err);
      alert("Invalid JSON format or upload failed.");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে প্রশ্নটি ডিলিট করতে চান?")) return;
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
    if (!window.confirm("আপনি কি নিশ্চিত?")) return;
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
    if (!window.confirm("আপনি কি নিশ্চিত?")) return;
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
        answeredBy: "Admin"
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
      querySnapshot.forEach((doc) => {
        examsData.push({ id: doc.id, ...doc.data() });
      });
      // Sort by creation time manually or order in query
      setPublicExams(examsData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setExamsLoading(false);
    }
  };

  const resetLeaderboard = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি লিডারবোর্ড রিসেট করতে চান? সব শিক্ষার্থীর পয়েন্ট ০ হয়ে যাবে।")) return;
    
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

    setExamsLoading(true);
    try {
      await addDoc(collection(db, "public_exams"), {
        title: newExamTitle,
        duration,
        active: true,
        questions: parsedQuestions,
        createdAt: serverTimestamp()
      });
      fetchPublicExams();
      setShowCreateExamModal(false);
      setNewExamQuestionsJSON("");
      setNewExamTitle("Weekly Public Exam");
      setNewExamDuration("25");
      alert("Public exam created successfully.");
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create public exam.");
    } finally {
      setExamsLoading(false);
    }
  };

  const copyExamLink = (id: string) => {
    const url = window.location.origin + "/public-exam/" + id;
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
        setSettingsData(docSnap.data());
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
      if (!currentStatus) {
        const monthsStr = window.prompt("কত মাসের জন্য সাবস্ক্রিপশন দিতে চান? (উদাহরন: 1, 3, 6)", "1");
        if (!monthsStr || isNaN(parseInt(monthsStr))) return;
        const months = parseInt(monthsStr);
        const { Timestamp } = await import("firebase/firestore");
        const proUntilMillis = Date.now() + months * 30 * 24 * 60 * 60 * 1000;
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

  const toggleTutorStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { isTutor: !currentStatus });
      fetchUsers(); // Refresh
    } catch (error) {
      console.error("Error updating tutor status:", error);
      alert("Failed to update user.");
    }
  };

  const groupedBanks = questions.reduce((acc, q) => {
    const title = q.title || "Uncategorized";
    if (!acc[title]) acc[title] = [];
    acc[title].push(q);
    return acc;
  }, {} as Record<string, any[]>);

  const activeBankQuestions = selectedBankTitle ? (groupedBanks[selectedBankTitle] || []) : [];

  const filteredQuestions = activeBankQuestions.filter(q => {
    const matchesSearch = questionSearch ? (q.text?.toLowerCase().includes(questionSearch.toLowerCase()) || q.title?.toLowerCase().includes(questionSearch.toLowerCase())) : true;
    const matchesSubject = questionSubjectFilter !== "All Subjects" ? q.subject === questionSubjectFilter : true;
    return matchesSearch && matchesSubject;
  });

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
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-bengali">Dashboard Overview</h3>
              <p className="text-muted-foreground">Welcome to the PathCharcha Admin Dashboard.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Students", value: users.length || "120", icon: <Users className="w-5 h-5 text-blue-500" /> },
                { label: "Total Questions", value: "2,450", icon: <FileQuestion className="w-5 h-5 text-purple-500" /> },
                { label: "Active Exams", value: "12", icon: <Target className="w-5 h-5 text-red-500" /> },
                { label: "Subjects", value: "15", icon: <BookOpen className="w-5 h-5 text-green-500" /> },
              ].map((stat, idx) => (
                <Card key={idx} className="border border-muted shadow-sm rounded-2xl">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      {stat.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
               <CardHeader className="bg-slate-50/50 border-b pb-4 p-6">
                 <CardTitle className="text-lg">Recent Activity</CardTitle>
               </CardHeader>
               <CardContent className="p-6 text-center text-muted-foreground">
                 Activity log will be displayed here.
               </CardContent>
            </Card>
          </div>
        ) : activeTab === "questions" ? (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">
                  {selectedBankTitle ? selectedBankTitle : "প্রশ্ন ব্যাংক ম্যানেজমেন্ট"}
                </h3>
                <p className="text-muted-foreground">{selectedBankTitle ? "এই ব্যাংকের সকল প্রশ্ন" : "যে ব্যাংক বা ফাইল আপলোড করেছেন তা নির্বাচন করুন।"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedBankTitle ? (
                  <>
                    <Button variant="outline" className="bg-white border-primary/20 text-slate-600 font-bengali" onClick={() => setSelectedBankTitle(null)}>
                      ← ফিরে যান
                    </Button>
                    <Button variant="outline" className="bg-white border-primary/20 text-primary font-bengali" onClick={() => setShowBulkUpload(true)}>
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
                    <Button variant="outline" className="bg-white border-primary/20 text-indigo-600" onClick={async () => {
                      alert("Please use Bulk Upload JSON for newer exams.");
                    }}>
                      ঢাবি সি ইউনিট ফাইল আপলোড
                    </Button>
                    <Button variant="outline" className="bg-white border-primary/20 text-primary font-bengali" onClick={() => setShowBulkUpload(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      নতুন ব্যাংক যুক্ত করুন (Bulk Upload JSON)
                    </Button>
                  </>
                )}
              </div>
            </div>

            {selectedBankTitle ? (
              <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4 p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input 
                      placeholder="Search questions..." 
                      className="w-full sm:max-w-xs bg-white" 
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background sm:max-w-[150px]"
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
              <CardContent className="p-4 sm:p-6 bg-slate-50/50">
                {questionsLoading ? (
                  <div className="text-center p-10 font-bengali">লোড হচ্ছে...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredQuestions.map((q) => (
                      <div key={q.id} className="group bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative flex flex-col gap-4">
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-[11px] text-slate-400 shrink-0 truncate max-w-[80px]" title={q.id}>#{q.id.slice(0, 6)}</span>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {q.university && <Badge variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-200/60 text-[10px] px-2">{q.university}</Badge>}
                            {q.subject && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200/60 text-[10px] px-2">{q.subject}</Badge>}
                          </div>
                        </div>
                        
                        <p className="font-bengali text-base text-slate-800 flex-1 whitespace-pre-wrap font-medium leading-relaxed">
                          {q.text}
                        </p>
                        
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {q.options.map((opt: any) => (
                              <div key={opt.id} className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm font-bengali transition-colors ${q.correctOption === opt.id ? 'bg-green-50/80 border-green-200 text-green-900 shadow-sm' : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100/80'}`}>
                                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[11px] shrink-0 font-bold ${q.correctOption === opt.id ? 'bg-green-200 text-green-800' : 'bg-white border shadow-sm text-slate-500'}`}>
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(groupedBanks).map(([title, qs]) => (
                  <Card key={title} className="border-slate-200 border-2 hover:border-primary/50 shadow-sm hover:shadow-md cursor-pointer transition-all rounded-[24px]" onClick={() => setSelectedBankTitle(title)}>
                    <CardContent className="p-6">
                      <div className="bg-primary/10 w-12 h-12 rounded-[16px] flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg font-bengali text-slate-800 line-clamp-2 mb-2 leading-tight">{title}</h4>
                      <p className="text-sm font-bengali text-slate-500 font-medium">{qs.length} টি প্রশ্ন যুক্ত আছে</p>
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

            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4 p-6 flex flex-row justify-between items-center whitespace-nowrap">
                <CardTitle className="text-lg">সব ইউজার</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {users.map((u) => (
                    <div key={u.id} className="group bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col gap-4">
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden font-bold text-slate-400">
                             {u.photoURL ? <img src={u.photoURL} alt={u.fullName} className="w-full h-full object-cover" /> : u.fullName?.charAt(0) || <User className="w-6 h-6" />}
                           </div>
                           <div>
                             <h4 className="font-bengali font-bold text-slate-800 text-lg leading-tight group-hover:text-primary transition-colors">{u.fullName || 'No Name'}</h4>
                             <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-xs">{u.email || u.phoneNumber}</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                         <div className="flex flex-wrap gap-2">
                           {u.isPro ? (
                             <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200/50 flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full shadow-sm text-xs font-semibold">
                               <Crown className="w-3.5 h-3.5" /> Pro
                             </Badge>
                           ) : (
                             <Badge variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-200/60 px-2.5 py-0.5 rounded-full text-xs font-medium">Free</Badge>
                           )}
                           {u.isTutor && (
                             <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/50 flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full shadow-sm text-xs font-semibold">
                               <BookOpen className="w-3.5 h-3.5" /> Tutor
                             </Badge>
                           )}
                           {u.class && <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200/60 text-xs px-2.5 py-0.5 rounded-full font-bengali font-medium">{u.class}</Badge>}
                         </div>
                         <div className="flex gap-1.5 items-center">
                            <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">{u.points || 0} <span className="text-[10px] text-slate-500 font-normal">pts</span></span>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100/80">
                        <Button 
                          variant={u.isPro ? "outline" : "default"} 
                          className={`flex-1 font-semibold rounded-xl text-sm py-5 transition-all shadow-sm ${u.isPro ? "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300" : "bg-gradient-to-br from-[#FFB800] to-[#F59E0B] text-white hover:from-[#E5A600] hover:to-[#D97706] hover:shadow-md border-0"}`}
                          onClick={() => toggleProStatus(u.id, u.isPro)}
                        >
                          {u.isPro ? "Revoke Pro" : <><Crown className="w-4 h-4 mr-1.5" /> Gift Pro</>}
                        </Button>
                        <Button 
                          variant={u.isTutor ? "outline" : "secondary"} 
                          className={`flex-1 font-semibold rounded-xl text-sm py-5 transition-all shadow-sm ${u.isTutor ? "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300" : "bg-indigo-50 text-indigo-600 border border-indigo-100/50 hover:bg-indigo-100 hover:text-indigo-700"}`}
                          onClick={() => toggleTutorStatus(u.id, u.isTutor)}
                        >
                          {u.isTutor ? "Revoke Tutor" : <><BookOpen className="w-4 h-4 mr-1.5" /> Make Tutor</>}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && !loading && (
                    <div className="col-span-full text-center py-6 text-muted-foreground bg-white border rounded-2xl">
                      No users found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "exams" ? (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold font-bengali">Public Exams Management</h3>
                <p className="text-muted-foreground">পাবলিক পরীক্ষার লিংক তৈরি এবং শেয়ার করুন</p>
              </div>
              <Button onClick={() => setShowCreateExamModal(true)} disabled={examsLoading} className="font-bengali">
                <Plus className="w-4 h-4 mr-2" /> 
                নতুন লিংক তৈরি করুন
              </Button>
            </div>
            
            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4 p-6">
                <CardTitle className="text-lg">সকল পাবলিক পরীক্ষা</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicExams.map((exam) => (
                    <div key={exam.id} className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-800 font-bengali flex-1">{exam.title}</h4>
                        {exam.active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 shrink-0">সক্রিয় (Active)</Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">বন্ধ (Inactive)</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-500 font-medium">সময়: {exam.duration} Minutes</p>
                      
                      <div className="mt-1 pt-3 border-t">
                        <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => copyExamLink(exam.id)}>
                          <LinkIcon className="w-4 h-4 mr-2" /> লিংক কপি করুন
                        </Button>
                      </div>
                    </div>
                  ))}
                  {publicExams.length === 0 && !examsLoading && (
                    <div className="col-span-full text-center py-6 text-muted-foreground bg-white border rounded-2xl">
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
                          <span className="font-bold text-slate-800">{doubt.userName}</span>
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
              <CardHeader className="bg-slate-50/50 border-b pb-4 p-6 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">সকল রিপোর্ট</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>Refresh</Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-slate-800">{report.user}</p>
                          <p className="text-xs text-muted-foreground">{report.date}</p>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[10px] shrink-0">{report.questionId}</Badge>
                      </div>
                      
                      <p className="font-bengali text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm flex-1">
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
                    <div className="col-span-full text-center py-6 text-muted-foreground bg-white border rounded-2xl">
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
                            <TableCell className="font-bold text-slate-800 font-bengali">{sub.name}</TableCell>
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
               <CardHeader className="bg-slate-50/50 border-b pb-4 p-6 flex flex-row justify-between items-center">
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                   </div>
                 )}
               </CardContent>
            </Card>

            <Card className="border border-muted shadow-sm rounded-[32px] overflow-hidden mt-6">
                <CardHeader className="bg-slate-50/50 border-b pb-4 p-6 flex flex-row justify-between items-center">
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
                            <TableCell className="font-mono font-bold text-slate-800">{c.code}</TableCell>
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
                       <p className="text-3xl font-bold text-slate-800">{analyticsData.usersCount}</p>
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
                       <p className="text-3xl font-bold text-slate-800">{analyticsData.questionsCount}</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                   <CardContent className="p-6 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                       <Target className="w-6 h-6 text-purple-600" />
                     </div>
                     <div>
                       <p className="text-sm text-slate-500 font-medium">Public Exams</p>
                       <p className="text-3xl font-bold text-slate-800">{analyticsData.examsCount}</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                   <CardContent className="p-6 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                       <BookOpen className="w-6 h-6 text-orange-600" />
                     </div>
                     <div>
                       <p className="text-sm text-slate-500 font-medium">Total Subjects</p>
                       <p className="text-3xl font-bold text-slate-800">{analyticsData.subjectsCount}</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                   <CardContent className="p-6 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                       <MessageCircleQuestion className="w-6 h-6 text-red-600" />
                     </div>
                     <div>
                       <p className="text-sm text-slate-500 font-medium">Pending Doubts</p>
                       <p className="text-3xl font-bold text-slate-800">{analyticsData.doubtsCount}</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden">
                   <CardContent className="p-6 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                       <AlertCircle className="w-6 h-6 text-yellow-600" />
                     </div>
                     <div>
                       <p className="text-sm text-slate-500 font-medium">Reports</p>
                       <p className="text-3xl font-bold text-slate-800">{analyticsData.reportsCount}</p>
                     </div>
                   </CardContent>
                 </Card>
               </div>
            )}
            
            {analyticsData && (
               <Card className="border border-muted shadow-sm rounded-2xl overflow-hidden mt-6">
                 <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg">System Insights</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="text-sm text-slate-600 space-y-2">
                       <p>• Question ratio per exam is approximately {((analyticsData.questionsCount || 1) / (analyticsData.examsCount || 1)).toFixed(1)}.</p>
                       <p>• {analyticsData.doubtsCount} student doubts remain unresolved.</p>
                       <p>• Total {analyticsData.usersCount} students are currently active on PathCharcha.</p>
                    </div>
                 </CardContent>
               </Card>
            )}
          </div>
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
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
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
                  <Input 
                    value={editQuestion.subject || ""} 
                    onChange={(e) => setEditQuestion({ ...editQuestion, subject: e.target.value })} 
                    className="font-bengali"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">ব্যাংকের নাম / Title (ex: ঢাবি সি ২০২৫-২০২৬)</label>
                <Input 
                  value={editQuestion.title || ""} 
                  onChange={(e) => setEditQuestion({ ...editQuestion, title: e.target.value })} 
                  className="font-bengali"
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block font-bengali">অপশনসমূহ (Options)</label>
                <div className="space-y-3">
                  {editQuestion.options?.map((opt: any, idx: number) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded shrink-0 bg-slate-100 flex items-center justify-center font-bold text-sm">
                        {opt.id}
                      </div>
                      <Input 
                        value={opt.label || ""} 
                        onChange={(e) => {
                          const newOpts = editQuestion.options.map((o: any, i: number) => 
                            i === idx ? { ...o, label: e.target.value } : o
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
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 sticky bottom-0">
              <Button variant="outline" onClick={() => setEditQuestion(null)} className="font-bengali">বাতিল</Button>
              <Button onClick={handleUpdateQuestion} className="font-bengali">সংরক্ষণ করুন</Button>
            </div>
          </div>
        </div>
      )}

      {showBulkUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold font-bengali">Bulk Upload JSON</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkUpload(false)} className="h-8 w-8 p-0 rounded-full">✕</Button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4">Paste your array of questions in JSON format here.</p>
              <textarea 
                className="w-full border rounded-xl p-4 text-sm font-mono h-[400px] outline-none focus:border-primary focus:ring-1 focus:ring-primary whitespace-pre resize-none"
                placeholder="[ { ... }, { ... } ]"
                value={bulkUploadText}
                onChange={(e) => setBulkUploadText(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowBulkUpload(false)} className="font-bengali">Cancel</Button>
              <Button onClick={handleBulkUploadSubmit} className="font-bengali" disabled={!bulkUploadText.trim()}>Upload</Button>
            </div>
          </div>
        </div>
      )}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold font-bengali">পাবলিক পরীক্ষা তৈরি করুন</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateExamModal(false)} className="h-8 w-8 p-0 rounded-full">✕</Button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">পরীক্ষার নাম (Title)</label>
                <Input 
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="font-bengali bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">সময় (Minutes)</label>
                <Input 
                  type="number"
                  value={newExamDuration}
                  onChange={(e) => setNewExamDuration(e.target.value)}
                  className="font-bengali bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">প্রশ্নসমূহ (JSON Array - Optional)</label>
                <textarea 
                  className="w-full border rounded-xl p-4 text-sm font-mono h-[250px] outline-none focus:border-primary focus:ring-1 focus:ring-primary whitespace-pre resize-none bg-slate-50"
                  placeholder="[&#10;  {&#10;    &quot;text&quot;: &quot;Question?&quot;,&#10;    &quot;options&quot;: [{&quot;id&quot;:&quot;A&quot;, &quot;label&quot;:&quot;...&quot;}...],&#10;    &quot;correctOption&quot;: &quot;A&quot;&#10;  }&#10;]"
                  value={newExamQuestionsJSON}
                  onChange={(e) => setNewExamQuestionsJSON(e.target.value)}
                  spellCheck={false}
                />
                <p className="text-xs text-slate-500 mt-2">ফাঁকা রাখলে ডেমো প্রশ্ন আসবে।</p>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateExamModal(false)} className="font-bengali">Cancel</Button>
              <Button onClick={createPublicExam} disabled={examsLoading} className="font-bengali">Create Exam</Button>
            </div>
          </div>
        </div>
      )}
      {showCreateCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold font-bengali">নতুন কুপন</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateCouponModal(false)} className="h-8 w-8 p-0 rounded-full">✕</Button>
            </div>
            <div className="p-6 flex-1 space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">কুপন কোড (যেমন: PRO100)</label>
                <Input 
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="bg-white font-mono uppercase"
                  placeholder="CODE100"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block font-bengali">কত মাসের জন্য? (যেমন: 1, 3, 6)</label>
                <Input 
                  type="number"
                  value={newCouponMonths}
                  onChange={(e) => setNewCouponMonths(e.target.value)}
                  className="bg-white"
                  min="1"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateCouponModal(false)} className="font-bengali">Cancel</Button>
              <Button onClick={createCoupon} className="font-bengali">Save Coupon</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
