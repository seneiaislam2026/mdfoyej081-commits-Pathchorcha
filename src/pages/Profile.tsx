import { useEffect, useState, useRef } from "react";
import {
  UserCircle,
  Target,
  BookOpen,
  Clock,
  LogOut,
  ChevronRight,
  ClipboardList,
  BarChart2,
  Star,
  Database,
  Brain,
  MessageCircle,
  Crown,
  Settings,
  X,
  Camera,
  Edit2,
  Save,
  Trash2,
  Plus,
  Bell,
  Calendar,
  User,
  Shield,
  Check,
  Gift,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  deleteDoc,
  onSnapshot,
  where,
  orderBy,
  getDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

interface RoutineSlot {
  id: string;
  day: string;
  subject: string;
  time: string;
}

export default function Profile() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();

  // State managers
  const [examResults, setExamResults] = useState<any[]>([]);
  const [badgesCount, setBadgesCount] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Modals settings
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showGeneralSettingsModal, setShowGeneralSettingsModal] =
    useState(false);
  const [showClassChangeModal, setShowClassChangeModal] = useState(false);

  // Profile Edit Data States
  const [editName, setEditName] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editClass, setEditClass] = useState("");
  const [editBatch, setEditBatch] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Study Routine Builder States
  const [routineList, setRoutineList] = useState<RoutineSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState("শনিবার");
  const [selectedSubject, setSelectedSubject] = useState("পদার্থবিজ্ঞান");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedTime, setSelectedTime] = useState("সকাল ০৮:০০");
  const [customTime, setCustomTime] = useState("");
  const [routineLoading, setRoutineLoading] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);

  // Class Change
  const [classChangeGroup, setClassChangeGroup] = useState("বিজ্ঞান");
  const [classChangeLoading, setClassChangeLoading] = useState(false);

  useEffect(() => {
    if (userData?.uid) {
      fetchExamResults();
      fetchUserRoutine();
      subscribeNotifications();

      // Load editable profile data fields
      setEditName(userData.fullName || "");
      setEditInstitution(
        userData.institution || "শিক্ষাপ্রতিষ্ঠান যুক্ত করা হয়নি",
      );
      setEditClass(userData.class || "এইচএসসি");
      setEditBatch(userData.batch || userData.class || "Not set");
      setEditQuote(userData.quote || "শিক্ষাই শক্তি, শিক্ষাই মুক্তি");
    }
  }, [userData]);

  const fetchExamResults = async () => {
    if (!userData?.uid) return;
    try {
      const q = query(collection(db, "users", userData.uid, "exam_results"));
      const snap = await getDocs(q);
      const results = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toMillis() || Date.now(),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setExamResults(results);
    } catch (e) {
      console.error("Error fetching exam results:", e);
    }
  };

  const fetchUserRoutine = async () => {
    if (!userData?.uid) return;
    try {
      const routineRef = collection(db, "users", userData.uid, "routine");
      const snap = await getDocs(routineRef);
      const activeRoutine = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as RoutineSlot[];
      setRoutineList(activeRoutine);
    } catch (err) {
      console.warn("Routine loading failed:", err);
    }
  };

  const subscribeNotifications = () => {
    if (!userData?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "in", [userData.uid, "all"]),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnapshot) => {
          list.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });
        setNotifications(list);
      },
      (err) => {
        console.warn("Notifications listener error:", err);
      },
    );

    return unsubscribe;
  };

  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!userData?.class) return;

    const fetchRank = async () => {
      try {
        // Efficiently calculate rank without composite index by querying only the specific class
        // and counting users with strictly greater points.
        const q = query(
          collection(db, "users"),
          where("class", "==", userData.class),
        );
        const snap = await getDocs(q);

        let higherScorers = 0;
        const myPoints = userData.points || 0;

        snap.forEach((d) => {
          const points = d.data().points || 0;
          if (points > myPoints) {
            higherScorers++;
          } else if (points === myPoints && d.id < userData.uid) {
            // Tie-breaker based on UID for consistent ranking
            higherScorers++;
          }
        });

        setUserRank(higherScorers + 1);
      } catch (error) {
        console.error("Failed to calculate user rank", error);
      }
    };
    fetchRank();
  }, [userData]);

  // Convert English number to Bengali Numeral
  const toBn = (num: number | string) =>
    num.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  const avgScore =
    examResults.length > 0
      ? Math.round(
          examResults.reduce(
            (acc, curr) => acc + (curr.score / Math.max(curr.total, 1)) * 100,
            0,
          ) / examResults.length,
        )
      : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Canvas Image Compression & Upload handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Let's hold a nice high definition thumbnail size (150px)
        const size = 150;
        canvas.width = size;
        canvas.height = size;

        if (ctx) {
          // Draw standard circular crop clipping or center-square resize
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, size, size);

          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Get highly compressed JPEG (reduced document payload < 10KB)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);

          try {
            if (userData?.uid) {
              await setDoc(
                doc(db, "users", userData.uid),
                {
                  photoURL: compressedDataUrl,
                  updatedAt: serverTimestamp(),
                },
                { merge: true },
              );
            }
          } catch (err) {
            console.error("Failed to save profile picture:", err);
            alert("প্রোফাইল পিকচার সেভ করতে সমস্যা হয়েছে।");
          } finally {
            setUploadingPhoto(false);
          }
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Save updated personal details
  const savePersonalDetails = async () => {
    if (!userData?.uid) return;
    setProfileSaving(true);
    try {
      await setDoc(
        doc(db, "users", userData.uid),
        {
          fullName: editName,
          institution: editInstitution,
          class: editClass,
          batch: editBatch,
          quote: editQuote,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setShowPersonalInfoModal(false);
    } catch (err) {
      console.error(err);
      alert("তথ্য আপডেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setProfileSaving(false);
    }
  };

  // Routine Manager handlers
  const handleAddRoutineSlot = async () => {
    if (!userData?.uid) return;
    const finalSubject =
      selectedSubject === "অন্যান্য" ? customSubject : selectedSubject;
    const finalTime = selectedTime === "অন্যান্য" ? customTime : selectedTime;

    if (!finalSubject.trim() || !finalTime.trim()) {
      alert("দয়া করে বিষয় এবং সময় সঠিকভাবে লিখুন!");
      return;
    }

    setRoutineLoading(true);
    try {
      const routineCollection = collection(
        db,
        "users",
        userData.uid,
        "routine",
      );
      await addDoc(routineCollection, {
        day: selectedDay,
        subject: finalSubject,
        time: finalTime,
        createdAt: serverTimestamp(),
      });
      // reload lists
      fetchUserRoutine();
      setCustomSubject("");
      setCustomTime("");
    } catch (err) {
      console.error("Failed to save routine slot", err);
    } finally {
      setRoutineLoading(false);
    }
  };

  const handleDeleteRoutineSlot = async (slotId: string) => {
    if (!userData?.uid) return;
    try {
      await deleteDoc(doc(db, "users", userData.uid, "routine", slotId));
      fetchUserRoutine();
    } catch (err) {
      console.error(err);
    }
  };

  // Notification Inbox Helper
  const handleMarkAllNotificationsAsRead = async () => {
    if (!userData?.uid) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        if (!n.read && n.userId !== "all") {
          batch.update(doc(db, "notifications", n.id), { read: true });
        }
      });
      await batch.commit();
    } catch (err) {
      console.warn(err);
    }
  };

  // Class Change logic
  const handleClassChangeRequest = async () => {
    if (!userData?.uid) return;
    setClassChangeLoading(true);
    try {
      await addDoc(collection(db, "class_change_requests"), {
        userId: userData.uid,
        userName: userData.fullName || userData.email,
        currentClass: userData.class || "Unknown",
        requestedClass: classChangeGroup,
        status: "pending",
        timestamp: serverTimestamp(),
      });
      alert(
        "ক্লাস পরিবর্তনের রিকুয়েস্ট পাঠানো হয়েছে। অ্যাডমিন অ্যাপ্রুভ করলে আপনার ক্লাস আপডেট হবে।",
      );
      setShowClassChangeModal(false);
    } catch (e) {
      console.error(e);
      alert("রিকুয়েস্ট পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setClassChangeLoading(false);
    }
  };

  // Days mapping index for sorting study timetable
  const dayWeight: { [key: string]: number } = {
    শনিবার: 1,
    রবিবার: 2,
    সোমবার: 3,
    মঙ্গলবার: 4,
    বুধবার: 5,
    বৃহস্পতিবার: 6,
    শুক্রবার: 7,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 px-4 pt-6">
      {/* Styled Mockup Header Card */}
      <div className="bg-gradient-to-tr from-[#EEF2FF] via-[#F5F3FF] to-[#FDF4FF] rounded-3xl p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(109,40,217,0.06)] border border-indigo-100/60">
        {/* Background decorative vector overlays */}
        <div className="absolute right-[-40px] top-[-30px] w-48 h-48 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 bg-blue-200/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar block with automated camera triggers */}
            <div className="relative shrink-0">
              <div
                id="avatar_container"
                className="w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] rounded-full border-[5px] border-white overflow-hidden shadow-md bg-[#EEF2FF] flex items-center justify-center relative group"
              >
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex flex-col items-center justify-center text-indigo-300">
                    <User className="w-14 h-14" />
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center rounded-full">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Camera Icon Trigger overlay */}
              <label
                id="upload_camera_overlay"
                className="absolute bottom-0 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:p-2.5 border-2 border-white rounded-full cursor-pointer transition-all hover:scale-110 shadow-md flex items-center justify-center"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>

            {/* Profile Info Texts */}
            <div className="space-y-1 sm:max-w-xs">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-black text-foreground font-sans tracking-tight">
                  {(userData?.fullName || "MD FOYEZ RABBI").toUpperCase()}
                </h1>
                <button
                  onClick={() => setShowPersonalInfoModal(true)}
                  className="p-1 hover:bg-card/50 rounded-full text-indigo-500 hover:text-indigo-700 transition-colors"
                  title="তথ্য পরিবর্তন করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-slate-500 font-medium text-sm block col-span-1">
                {userData?.email
                  ? userData.email.includes("@pathchorcha") ||
                    userData.email.includes("@pathchola.com") ||
                    userData.email.includes("@biddayon.com")
                    ? userData.email.split("@")[0]
                    : userData.email
                  : "mdfoyej081@gmail.com"}
              </p>

              {/* Batch/Class Badge Pill */}
              <div className="mt-2.5">
                <span className="text-xs font-bold bg-violet-100 text-violet-700 px-3 py-1 rounded-full border border-violet-200 inline-flex items-center gap-1.5 shadow-3xs font-bengali">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"></span>
                  {userData?.batch || userData?.class || "ক্লাস সেট করা নেই"}
                </span>
              </div>

              {/* Dynamic favorite quotes overlay with double-quotes styling */}
              <div className="pt-2 text-center sm:text-left flex items-start gap-1 justify-center sm:justify-start">
                <span className="text-indigo-400 font-serif text-lg font-bold leading-none">
                  “
                </span>
                <p className="text-indigo-800 font-bengali font-bold text-sm italic py-0.5 leading-relaxed">
                  {userData?.quote || "শিক্ষাই শক্তি, শিক্ষাই মুক্তি"}
                </p>
                <span className="text-indigo-400 font-serif text-lg font-bold leading-none">
                  ”
                </span>
              </div>
            </div>
          </div>

          {/* Elegant Graduation, book stacking illustration on the right */}
          <div className="hidden md:block select-none">
            <svg
              viewBox="0 0 160 120"
              className="w-[125px] h-[95px] text-indigo-600 shrink-0"
            >
              <circle cx="10" cy="50" r="1.5" fill="#C084FC" />
              <circle cx="140" cy="20" r="2" fill="#FBBF24" />
              <circle cx="150" cy="80" r="2.5" fill="#818CF8" />

              <g transform="translate(15, 65)">
                <path
                  d="M-5 -10 Q5 -20 15 -10 Q5 0 -5 -10 Z"
                  fill="#818CF8"
                  opacity="0.6"
                />
                <path d="M5 -15 Q-5 -30 -15 -10 Q-5 0 5 -15 Z" fill="#818CF8" />
                <path
                  d="M0 -5 Q10 -15 0 -25 Q-10 -15 0 -5 Z"
                  fill="#6366F1"
                  opacity="0.8"
                />
                <path d="M-8 0 L8 0 L6 18 L-6 18 Z" fill="#475569" />
              </g>

              <g transform="translate(60, 45)">
                <rect
                  x="0"
                  y="32"
                  width="70"
                  height="15"
                  rx="3"
                  fill="#818CF8"
                  stroke="#1E1B4B"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 32 L5 47 M15 32 L15 47"
                  stroke="#1E1B4B"
                  strokeWidth="1.5"
                />

                <rect
                  x="5"
                  y="18"
                  width="65"
                  height="14"
                  rx="3"
                  fill="#A78BFA"
                  stroke="#1E1B4B"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 18 L10 32 M20 18 L20 32"
                  stroke="#1E1B4B"
                  strokeWidth="1.5"
                />

                <rect
                  x="10"
                  y="5"
                  width="60"
                  height="13"
                  rx="3"
                  fill="#C084FC"
                  stroke="#1E1B4B"
                  strokeWidth="1.5"
                />
                <path
                  d="M15 5 L15 18 M25 5 L25 18"
                  stroke="#1E1B4B"
                  strokeWidth="1.5"
                />

                <g transform="translate(15, -15)">
                  <ellipse
                    cx="25"
                    cy="18"
                    rx="12"
                    ry="4"
                    fill="#312E81"
                    stroke="#1E1B4B"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 18 L13 22 C13 25, 37 25, 37 22 L37 18"
                    fill="#312E81"
                    stroke="#1E1B4B"
                    strokeWidth="1.5"
                  />
                  <polygon points="25,5 47,13 25,21 3,13" fill="#1E1B4B" />
                  <path
                    d="M25,13 L42,16 L43,26"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="43" cy="28" r="2.5" fill="#FBBF24" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Title block with thick styled purple underline */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-[#0F172A] font-bengali font-extrabold text-xl sm:text-2xl tracking-tight">
            আমার অ্যাকাউন্ট
          </h2>
        </div>
        <div className="w-16 h-1 bg-[#7C3AED] rounded-full mt-1.5"></div>
      </div>

      {/* Rounded list cards following mockup design exactly */}
      <div className="space-y-4">
        {/* Option 1: ব্যক্তিগত তথ্য */}
        <div
          id="opt_personal_info"
          onClick={() => setShowPersonalInfoModal(true)}
          className="bg-card rounded-[24px] p-4 flex items-center justify-between border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(109,40,217,0.03)] transition-all duration-300 hover:scale-[1.008] cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
              <User className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-[#1F2937] font-bold font-bengali text-lg leading-tight group-hover:text-[#7C3AED] transition-colors">
                ব্যক্তিগত তথ্য
              </h3>
              <p className="text-[#6B7280] font-bengali text-sm mt-1">
                নাম, ফোন নম্বর, ইমেইল, ব্যাচ ইত্যাদি
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] transition-all group-hover:translate-x-1" />
        </div>

        {/* Option 2: সাবস্ক্রিপশন */}
        <div
          id="opt_subscription"
          onClick={() => navigate("/subscription")}
          className="bg-card rounded-[24px] p-4 flex items-center justify-between border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(109,40,217,0.03)] transition-all duration-300 hover:scale-[1.008] cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
              <Crown className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-[#1F2937] font-bold font-bengali text-lg leading-tight group-hover:text-[#7C3AED] transition-colors">
                সাবস্ক্রিপশন
              </h3>
              <p className="text-[#6B7280] font-bengali text-sm mt-1">
                বর্তমান প্ল্যান, আপগ্রেড, মেয়াদ
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] transition-all group-hover:translate-x-1" />
        </div>

        {/* Option 3: রুটিন তৈরি */}
        <div
          id="opt_routine_planner"
          onClick={() => setShowRoutineModal(true)}
          className="bg-card rounded-[24px] p-4 flex items-center justify-between border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(109,40,217,0.03)] transition-all duration-300 hover:scale-[1.008] cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
              <Calendar className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-[#1F2937] font-bold font-bengali text-lg leading-tight group-hover:text-[#7C3AED] transition-colors">
                রুটিন তৈরি
              </h3>
              <p className="text-[#6B7280] font-bengali text-sm mt-1">
                নিজের পড়ার রুটিন তৈরি ও ম্যানেজ করুন
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] transition-all group-hover:translate-x-1" />
        </div>

        {/* Option 4: নোটিফিকেশন */}
        <div
          id="opt_notifications"
          onClick={() => setShowNotificationModal(true)}
          className="bg-card rounded-[24px] p-4 flex items-center justify-between border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(109,40,217,0.03)] transition-all duration-300 hover:scale-[1.008] cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300 relative">
              <Bell className="w-6 h-6" strokeWidth={2.2} />
              {notifications.filter((u) => !u.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </div>
            <div>
              <h3 className="text-[#1F2937] font-bold font-bengali text-lg leading-tight group-hover:text-[#7C3AED] transition-colors">
                নোটিফিকেশন
              </h3>
              <p className="text-[#6B7280] font-bengali text-sm mt-1">
                সকল আপডেট ও ঘোষণা
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] transition-all group-hover:translate-x-1" />
        </div>

        {/* Option 5: প্রোফাইল ও সেটিংস */}
        <div
          id="opt_settings"
          onClick={() => setShowGeneralSettingsModal(true)}
          className="bg-card rounded-[24px] p-4 flex items-center justify-between border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(109,40,217,0.03)] transition-all duration-300 hover:scale-[1.008] cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
              <Settings className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-[#1F2937] font-bold font-bengali text-lg leading-tight group-hover:text-[#7C3AED] transition-colors">
                প্রোফাইল ও সেটিংস
              </h3>
              <p className="text-[#6B7280] font-bengali text-sm mt-1">
                অ্যাভাটার, পাসওয়ার্ড, অ্যাকাউন্ট সেটিংস
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] transition-all group-hover:translate-x-1" />
        </div>
      </div>

      {/* Collapsible Student Statistics & Analytics Below Menu for HSC Preparation */}
      <div className="bg-card rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2.5">
            <Target className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
            <h2 className="text-xl font-extrabold font-bengali text-[#0F172A] leading-none">
              আমার মক টেস্ট অগ্রগতি
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <ClipboardList className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-xs font-bengali text-slate-500">
              লিডারবোর্ডের র্যাঙ্ক
            </span>
            <span className="font-extrabold text-foreground text-lg mt-1 font-sans">
              {userRank ? toBn(userRank) : "-"}
            </span>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <Star className="w-5 h-5 text-emerald-500 mb-1" />
            <span className="text-xs font-bengali text-slate-500">
              গড় সঠিক উত্তর
            </span>
            <span className="bg-emerald-100/70 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-lg text-sm mt-1 font-sans">
              {toBn(avgScore)}%
            </span>
          </div>
        </div>

        {/* Mini progress line graphs synced from recent exams */}
        <div className="mt-6">
          <h3 className="text-sm font-extrabold font-bengali text-foreground mb-4">
            সর্বশেষ ৭টি টেস্টের ফলাফল গ্রাফ
          </h3>
          <div className="h-28 w-full flex items-end justify-between gap-2.5">
            {examResults.slice(-7).map((res, idx) => {
              const percentage = (res.score / Math.max(res.total, 1)) * 100;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center flex-1 gap-2 group relative h-full justify-end"
                >
                  <div className="absolute top-[-26px] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm font-bengali">
                    {toBn(Math.round(percentage))}%
                  </div>
                  <div className="w-full bg-muted rounded-t-lg h-full flex items-end max-h-[70%]">
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(percentage, 8)}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold font-bengali">
                    টেস্টসূচি {toBn(idx + 1)}
                  </span>
                </div>
              );
            })}
            {examResults.length === 0 && (
              <div className="w-full h-16 flex items-center justify-center text-slate-400 font-bengali text-xs border border-dashed border-slate-200 rounded-xl bg-muted/50">
                কোনো টেস্ট ডাটা এখন পর্যন্ত জমা হয়নি
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: ব্যক্তিগত তথ্য পরিবর্তন এবং যুক্তকরণের ফর্ম */}
      {showPersonalInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold font-bengali text-slate-900">
                ব্যক্তিগত তথ্য এডিট করুন
              </h3>
              <button
                onClick={() => setShowPersonalInfoModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-bengali text-indigo-700 uppercase tracking-wider mb-2">
                  পূর্ণ নাম (Full Name)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl p-3 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-foreground"
                  placeholder="আপনার নাম লিখুন..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-bengali text-indigo-700 uppercase tracking-wider mb-2">
                  উক্তি (Favorite Quote)
                </label>
                <input
                  type="text"
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl p-3 font-bengali focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-foreground"
                  placeholder="যেমন: শিক্ষাই শক্তি, শিক্ষাই মুক্তি"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-bengali text-indigo-700 uppercase tracking-wider mb-2">
                  প্রতিষ্ঠান (Institution)
                </label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl p-3 font-bengali focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-foreground"
                  placeholder="আপনার কলেজ বা স্কুলের নাম..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-bengali text-indigo-700 uppercase tracking-wider mb-2">
                    শ্রেণী/গ্রুপ (Class/Group)
                  </label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl p-3 font-bengali focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-foreground bg-card"
                  >
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
                  <label className="block text-xs font-bold font-bengali text-indigo-700 uppercase tracking-wider mb-2">
                    ব্যাচ badge (Batch Group)
                  </label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl p-3 font-sans font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-foreground"
                    placeholder="e.g. Class 9 / HSC"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPersonalInfoModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold font-bengali hover:bg-slate-200 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={savePersonalDetails}
                  disabled={profileSaving}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold font-bengali hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {profileSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: রুটিন তৈরি ও পড়ার সূচি ম্যানেজার */}
      {showRoutineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-extrabold font-bengali text-slate-900">
                  পড়ার রুটিন তৈরি করুন
                </h3>
              </div>
              <button
                onClick={() => setShowRoutineModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Slot Planner Add form */}
            <div className="bg-muted p-4 rounded-2xl border border-slate-100 space-y-3 mb-6">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider font-bengali">
                নতুন পড়ার স্লট যোগ করুন
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    দিন নির্বাচন
                  </span>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full bg-card border border-slate-200 rounded-xl p-2 font-bengali text-slate-700 text-sm focus:outline-none"
                  >
                    <option value="শনিবার">শনিবার</option>
                    <option value="রবিবার">রবিবার</option>
                    <option value="সোমবার">সোমবার</option>
                    <option value="মঙ্গলবার">মঙ্গলবার</option>
                    <option value="বুধবার">বুধবার</option>
                    <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                    <option value="শুক্রবার">শুক্রবার</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    বিষয় নির্বাচন
                  </span>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-card border border-slate-200 rounded-xl p-2 font-bengali text-slate-700 text-sm focus:outline-none"
                  >
                    <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                    <option value="রসায়ন">রসায়ন</option>
                    <option value="গণিত">গণিত</option>
                    <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
                    <option value="বাংলা">বাংলা</option>
                    <option value="ইংরেজি">ইংরেজি</option>
                    <option value="আইসিটি">আইসিটি</option>
                    <option value="অন্যান্য">অন্যান্য (নিচে লিখুন)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    সময় নির্বাচন
                  </span>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-card border border-slate-200 rounded-xl p-2 font-bengali text-slate-700 text-sm focus:outline-none"
                  >
                    <option value="সকাল ০৮:০০">সকাল ০৮:০০</option>
                    <option value="সকাল ১০:০০">সকাল ১০:০০</option>
                    <option value="দুপুর ১২:০০">দুপুর ১২:০০</option>
                    <option value="বিকাল ০৪:০০">বিকাল ০৪:০০</option>
                    <option value="সন্ধা ০৭:০০">সন্ধা ০৭:০০</option>
                    <option value="রাত ০৯:০০">রাত ০৯:০০</option>
                    <option value="অন্যান্য">অন্যান্য (নিচে লিখুন)</option>
                  </select>
                </div>
              </div>

              {/* Conditional manual input fallbacks slots */}
              {selectedSubject === "অন্যান্য" && (
                <input
                  type="text"
                  placeholder="বিষয়ের নাম লিখুন..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full text-xs font-bengali border bg-card border-slate-200 rounded-xl p-2.5 focus:outline-none"
                />
              )}

              {selectedTime === "অন্যান্য" && (
                <input
                  type="text"
                  placeholder="পড়ার সময় লিখুন (যেমন: রাত ১০:৩০)..."
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full text-xs font-bengali border bg-card border-slate-200 rounded-xl p-2.5 focus:outline-none"
                />
              )}

              <button
                onClick={handleAddRoutineSlot}
                disabled={routineLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold font-bengali text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {routineLoading
                  ? "যুক্ত করা হচ্ছে..."
                  : "রুটিন স্লট যুক্ত করুন"}
              </button>
            </div>

            {/* Timetable schedule display */}
            <div>
              <h4 className="font-extrabold text-sm text-foreground font-bengali mb-3">
                আমার পড়ার রুটিন তালিকা
              </h4>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {[
                  "শনিবার",
                  "রবিবার",
                  "সোমবার",
                  "মঙ্গলবার",
                  "বুধবার",
                  "বৃহস্পতিবার",
                  "শুক্রবার",
                ].map((dayName) => {
                  const daySlots = routineList.filter((r) => r.day === dayName);
                  if (daySlots.length === 0) return null;

                  return (
                    <div
                      key={dayName}
                      className="border border-slate-100 rounded-2xl p-3 bg-muted/20"
                    >
                      <h5 className="font-extrabold text-sm text-indigo-700 font-bengali mb-2 border-b border-indigo-100/30 pb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        {dayName}
                      </h5>
                      <div className="space-y-1.5">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="bg-card p-2.5 rounded-xl border border-slate-100 flex items-center justify-between"
                          >
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-sm font-extrabold font-bengali text-foreground">
                                {slot.subject}
                              </span>
                              <span className="text-[11px] text-slate-500 font-bengali">
                                {slot.time}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteRoutineSlot(slot.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {routineList.length === 0 && (
                  <div className="text-center py-12 bg-muted border border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-bengali">
                    কোনো রুটিন স্লট যোগ করা হয়নি এখনও। উপরে বিষয় যোগ করুন!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: নোটিফিকেশন সেন্টার ইনবক্স */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500 animate-swing" />
                <h3 className="text-xl font-bold font-bengali text-slate-900">
                  নোটিফিকেশন সেন্টার
                </h3>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center bg-muted/50 p-2.5 rounded-xl border border-slate-100 mb-4">
              <span className="text-xs font-medium text-slate-500 font-bengali">
                মোট unread: {toBn(notifications.filter((u) => !u.read).length)}
                টি নোটিফিকেশন
              </span>
              {notifications.filter((u) => !u.read).length > 0 && (
                <button
                  onClick={handleMarkAllNotificationsAsRead}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors border-0 bg-transparent flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  সবগুলো পঠিত মার্ক করুন
                </button>
              )}
            </div>

            {/* Lists */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {notifications.map((noti) => (
                <div
                  key={noti.id}
                  onClick={() => {
                    if (!noti.read) {
                      updateDoc(doc(db, "notifications", noti.id), {
                        read: true,
                      });
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${!noti.read ? "bg-amber-50/15 border-amber-100" : "bg-card border-slate-100 hover:bg-muted"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${noti.type === "pro_approval" ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2.5 mb-1">
                      <p className="text-[14px] text-foreground font-extrabold leading-tight break-words flex items-center gap-1.5">
                        {noti.title}
                        {!noti.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 animate-pulse"></span>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-bengali break-words">
                      {noti.message}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-16 text-slate-400 font-bengali text-xs">
                  কোনো নোটিফিকেশন পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: প্রোফাইল ও সেটিংস মোডাল */}
      {showGeneralSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold font-bengali text-slate-900">
                  অ্যাকাউন্ট সেটিংস
                </h3>
                <button
                  onClick={() => setShowGeneralSettingsModal(false)}
                  className="w-[34px] h-[34px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-full text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                {/* Class / Group change request */}
                <button
                  onClick={() => {
                    setShowGeneralSettingsModal(false);
                    setShowClassChangeModal(true);
                  }}
                  className="w-full flex items-center justify-between bg-muted hover:bg-slate-100 border border-slate-100 p-3.5 rounded-2xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-foreground text-sm font-bengali">
                        গ্রুপ ও ক্লাস পরিবর্তন করুন
                      </div>
                      <div className="text-[11px] text-slate-400 font-bengali mt-0.5">
                        আপনার বর্তমান গ্রুপ পরিবর্তন রিকুয়েস্ট দিন
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Sign out */}
                <button
                  onClick={() => {
                    setShowGeneralSettingsModal(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-between hover:bg-red-50 border border-transparent hover:border-red-100 p-3.5 rounded-2xl transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-full bg-red-50 group-hover:bg-red-100/50 flex items-center justify-center shrink-0 text-red-500 transition-colors">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-[#EF4444] text-sm font-bengali">
                        অ্যাকাউন্ট লগ আউট
                      </div>
                      <div className="text-[11px] text-red-400 font-bengali mt-0.5">
                        নিরাপদে আপনার সেশন বন্ধ করুন
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Change Group Request Modal */}
      {showClassChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold font-bengali text-slate-900 mb-2">
              গ্রুপ পরিবর্তন রিকুয়েস্ট
            </h3>
            <p className="text-xs font-bengali text-slate-500 mb-4 leading-relaxed">
              আপনি কোন ক্লাসে বা গ্রুপে যেতে চান? অ্যাডমিন অ্যাপ্রুভ করলে আপনার
              রিকুয়েস্ট কার্যকর হবে।
            </p>
            <div className="space-y-2 mb-5 max-h-[250px] overflow-y-auto pr-1">
              {[
                "বিজ্ঞান",
                "মানবিক",
                "বাণিজ্য",
                "এইচএসসি বিজ্ঞান",
                "এইচএসসি মানবিক",
                "এইচএসসি বাণিজ্য",
                "এইচএসসি",
                "এডমিশন",
              ].map((grp) => (
                <label
                  key={grp}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${classChangeGroup === grp ? "bg-indigo-50 border-indigo-200" : "bg-card border-slate-100 hover:bg-muted"}`}
                >
                  <input
                    type="radio"
                    name="group"
                    value={grp}
                    checked={classChangeGroup === grp}
                    onChange={(e) => setClassChangeGroup(e.target.value)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span
                    className={`font-bengali text-sm font-bold ${classChangeGroup === grp ? "text-indigo-800" : "text-slate-700"}`}
                  >
                    {grp}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClassChangeModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold font-bengali hover:bg-slate-200 transition-colors text-sm"
              >
                বাতিল
              </button>
              <button
                onClick={handleClassChangeRequest}
                disabled={classChangeLoading}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold font-bengali hover:shadow-md transition-all text-sm disabled:opacity-50"
              >
                {classChangeLoading ? "পাঠানো হচ্ছে..." : "রিকুয়েস্ট দিন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
