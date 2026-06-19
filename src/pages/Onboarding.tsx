import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, GraduationCap, ArrowLeft, Trophy, TestTube2, Calculator, Users } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

type OnboardingStep = "name" | "class" | "subclass" | "group" | "welcome";

const AdmissionIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

const classes = [
  { id: "c68", label: "৬ষ্ঠ থেকে ৮ম শ্রেণী", icon: <Book className="w-8 h-8 text-indigo-500" /> },
  { id: "c9", label: "নবম শ্রেণী (Class 9)", icon: <Book className="w-8 h-8 text-blue-500" /> },
  { id: "c10", label: "দশম শ্রেণী / SSC", icon: <GraduationCap className="w-8 h-8 text-green-500" /> },
  { id: "hsc", label: "এইচএসসি (HSC)", icon: <Trophy className="w-8 h-8 text-orange-500" /> },
  { id: "admission", label: "এডমিশন", icon: <AdmissionIcon className="w-8 h-8 text-red-500" /> },
];

const subClasses68 = [
  { id: "c6", label: "৬ষ্ঠ শ্রেণী", icon: <Book className="w-8 h-8 text-teal-500" /> },
  { id: "c7", label: "৭ম শ্রেণী", icon: <Book className="w-8 h-8 text-cyan-500" /> },
  { id: "c8", label: "৮ম শ্রেণী", icon: <Book className="w-8 h-8 text-sky-500" /> },
];

const groups = [
  { id: "arts", label: "মানবিক", icon: <Users className="w-10 h-10 mb-3 text-green-500" /> },
  { id: "commerce", label: "ব্যবসায় শিক্ষা", icon: <Calculator className="w-10 h-10 mb-3 text-secondary" /> },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("name");
  const { user, userData, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;
    // If user already has a class, they shouldn't be here.
    if (userData?.class) {
      navigate("/dashboard", { replace: true });
    } else if (userData?.fullName && userData.fullName !== "Student" && userData.fullName !== "") {
      // If we already have a name but no class yet, set states and skip the name step
      setName(userData.fullName);
      if (userData.institution) setInstitution(userData.institution);
      setStep("class");
    }
  }, [userData, navigate, loading]);

  const [name, setName] = useState(() => {
    const val = userData?.fullName || "";
    return val === "Student" ? "" : val;
  });
  const [institution, setInstitution] = useState(userData?.institution || "");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex flex-col items-center justify-center font-sans relative">
        <div className="animate-pulse flex flex-col items-center justify-center mb-8">
          <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] bg-card rounded-[40px] sm:rounded-[48px] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] mb-6 sm:mb-8 border border-slate-50">
             <span className="font-bengali font-extrabold text-[42px] sm:text-[52px] tracking-tight">
               <span className="text-[#0F2744]">শিক্ষা</span>
               <span className="text-[#ff9800]">ঙ্গন</span>
             </span>
          </div>
          <div>
            <span className="font-['Caveat'] text-[64px] sm:text-[76px] font-bold tracking-tight">
              <span className="text-[#0F2744]">Shikkha</span>
              <span className="text-[#ff9800]">ngon</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    if (user) {
      setSaving(true);
      try {
        const classLabel = classes.find((c) => c.id === selectedClass)?.label || subClasses68.find((c) => c.id === selectedClass)?.label || '';
        const updateData: any = { 
          fullName: name,
          institution: institution,
          class: classLabel,
          updatedAt: serverTimestamp()
        };
        if (selectedGroup) {
          updateData.group = groups.find((g) => g.id === selectedGroup)?.label || '';
        }
        await setDoc(doc(db, "users", user.uid), updateData, { merge: true });
        if (userData) {
          userData.fullName = name;
          userData.institution = institution;
          userData.class = classLabel;
          if (updateData.group) userData.group = updateData.group;
        }
      } catch (error) {
        console.error("Failed to update user profile", error);
      } finally {
        setSaving(false);
      }
    }
    navigate("/dashboard");
  };

  const handleClassSelection = (clsId: string) => {
    if (clsId === "c68") {
      setStep("subclass");
    } else {
      setSelectedClass(clsId);
      // Move to group selection if Class 9, 10, HSC, or admission
      if (["c9", "c10", "hsc", "admission"].includes(clsId)) {
        setStep("group");
      } else {
        setStep("welcome");
      }
    }
  };

  const handleSubClassSelection = (subClsId: string) => {
    setSelectedClass(subClsId);
    setStep("welcome");
  };

  const handleGroupSelection = (grpId: string) => {
    setSelectedGroup(grpId);
    setStep("welcome");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary rounded-b-[60px] md:rounded-b-[100px] z-0 shadow-lg"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary rounded-full opacity-20 blur-3xl z-0"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col pt-8">
        {step !== "welcome" && (
           <h1 className="text-3xl md:text-5xl font-bengali font-bold text-white text-center mb-12 tracking-tight">
             তোমার সম্পর্কে একটু জানতে চাই
           </h1>
        )}

        <AnimatePresence mode="wait">
          {step === "name" && (
            <motion.div 
              key="name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card p-8 md:p-12 rounded-[32px] shadow-xl border border-slate-100 max-w-xl w-full mx-auto"
            >
              <h2 className="text-2xl font-bengali font-bold text-foreground mb-8 text-center flex flex-col gap-2">
                <span>তোমার নাম কী?</span>
                <span className="text-lg text-slate-500 font-medium">এবং তোমার শিক্ষাপ্রতিষ্ঠানের নাম (ঐচ্ছিক)</span>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="তোমার নাম বাংলায় লেখো" 
                    className="w-full h-14 rounded-2xl bg-muted border-slate-200 focus:bg-card focus:border-primary px-4 font-bengali shadow-sm outline-none border-2 transition-all"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="শিক্ষাপ্রতিষ্ঠানের নাম (ঐচ্ছিক)" 
                    className="w-full h-14 rounded-2xl bg-muted border-slate-200 focus:bg-card focus:border-primary px-4 font-bengali shadow-sm outline-none border-2 transition-all"
                  />
                </div>
                
                <Button 
                  onClick={() => name.trim() && setStep("class")}
                  disabled={!name.trim()}
                  className="w-full h-14 bg-primary hover:bg-primary/95 text-white rounded-full font-bengali font-bold text-lg shadow-md transition duration-200"
                >
                  পরবর্তী ধাপ <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "class" && (
            <motion.div 
              key="class"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card p-8 md:p-12 rounded-[32px] shadow-xl border border-slate-100 max-w-2xl w-full mx-auto"
            >
              <h2 className="text-2xl font-bengali font-bold text-foreground mb-8 text-center">তুমি কোন ক্লাসে পড়ো?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((c) => (
                  <motion.div
                    key={c.id}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleClassSelection(c.id)}
                    className={`cursor-pointer p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      selectedClass === c.id 
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm" 
                        : "border-slate-100 bg-card hover:border-primary/30 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-3 rounded-xl">
                        {c.icon}
                      </div>
                      <span className="font-bengali font-semibold text-lg text-foreground">{c.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "subclass" && (
            <motion.div 
              key="subclass"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card p-8 md:p-12 rounded-[32px] shadow-xl border border-slate-100 max-w-2xl w-full mx-auto"
            >
              <div className="flex items-center mb-8 relative">
                <button onClick={() => setStep("class")} className="absolute left-0 p-2 text-slate-400 hover:text-primary transition-colors bg-muted rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bengali font-bold text-foreground text-center w-full">নির্দিষ্ট ক্লাস নির্বাচন করো</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subClasses68.map((c) => (
                  <motion.div
                    key={c.id}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubClassSelection(c.id)}
                    className={`cursor-pointer p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                      selectedClass === c.id 
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm" 
                        : "border-slate-100 bg-card hover:border-primary/30 shadow-sm"
                    }`}
                  >
                    <div className="bg-muted p-4 rounded-full mb-3">
                      {c.icon}
                    </div>
                    <span className="font-bengali font-semibold text-lg text-foreground">{c.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "group" && (
            <motion.div 
              key="group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card p-8 md:p-12 rounded-[32px] shadow-xl border border-slate-100 max-w-3xl w-full mx-auto"
            >
              <div className="flex items-center mb-8 relative">
                <button onClick={() => setStep("class")} className="absolute left-0 p-2 text-slate-400 hover:text-primary transition-colors bg-muted rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bengali font-bold text-foreground text-center w-full">তোমার বিভাগ নির্বাচন করো</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {groups.map((g) => (
                  <motion.div
                    key={g.id}
                    whileHover={{ scale: 1.03, translateY: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGroupSelection(g.id)}
                    className={`cursor-pointer p-8 rounded-3xl border-2 flex flex-col items-center text-center transition-all ${
                      selectedGroup === g.id 
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-md" 
                        : "border-slate-100 bg-card hover:border-primary/30 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="bg-muted p-4 rounded-2xl mb-4">
                      {g.icon}
                    </div>
                    <span className="font-bengali font-bold text-xl text-foreground">{g.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "welcome" && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="bg-card p-12 rounded-[40px] shadow-2xl border border-slate-100 max-w-lg w-full mx-auto text-center relative overflow-hidden"
            >
              {/* Confetti / Decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
              
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-blue-800 rounded-3xl flex items-center justify-center p-0.5 shadow-lg shadow-primary/20 mb-8 transform -rotate-12 hover:rotate-0 transition-transform"
              >
                <div className="w-full h-full border-2 border-white/30 rounded-[22px] flex items-center justify-center bg-transparent relative overflow-hidden">
                   <span className="font-bengali font-bold text-4xl text-white tracking-tight">শি<span className="text-secondary">ক্ষা</span></span>
                </div>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bengali font-bold text-slate-900 mb-4 tracking-tight">
                স্বাগতম <span className="text-primary">Biddayon</span> পরিবারে
              </h2>
              
              <div className="inline-flex gap-2 mb-8 bg-muted px-6 py-3 rounded-full border border-slate-100 shadow-sm font-bengali">
                {selectedClass && <span className="font-medium text-slate-700">{classes.find(c => c.id === selectedClass)?.label}</span>}
                {selectedGroup && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="font-medium text-slate-700">{groups.find(g => g.id === selectedGroup)?.label}</span>
                  </>
                )}
              </div>

              <p className="text-slate-500 font-bengali text-lg mb-10 leading-relaxed font-medium px-4">
                তোমার প্রোফাইল প্রস্তুত। চলো শুরু করি তোমার সাফল্যের যাত্রা!
              </p>

              <Button 
                disabled={saving}
                onClick={handleComplete}
                className="w-full h-14 bg-primary hover:bg-primary/95 text-white rounded-full font-bengali font-bold text-lg shadow-[0_4px_14px_0_rgb(15,39,68,0.39)] hover:shadow-[0_6px_20px_rgba(15,39,68,0.23)] hover:transform hover:-translate-y-0.5 transition duration-200"
              >
                ড্যাশবোর্ডে চলো <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
