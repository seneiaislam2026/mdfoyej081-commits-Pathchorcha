import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TransparentLogo } from "../ui/TransparentLogo";
import {
  Search,
  Bell,
  Menu,
  User,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../lib/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const NavAdminIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="#3B82F6"
    stroke="#0F172A"
    strokeWidth="2"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path
      d="M9 12l2 2 4-4"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const NavBellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="#FBBF24"
    stroke="#0F172A"
    strokeWidth="2"
    strokeLinejoin="round"
  >
    <path d="M18 16v-5c0-3.071-1.64-5.643-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.64 5.357 6 7.929 6 11v5l-2 2v1h16v-1l-2-2z" />
    <path d="M13.73 21a1.999 1.999 0 01-3.46 0" />
  </svg>
);

const NavProfileIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 24v-1.5c0-2 1-3.5 3-4.5a14 14 0 018 0c2 1 3 2.5 3 4.5V24z"
      fill="#2563EB"
      stroke="#0F172A"
      strokeWidth="1.5"
    />
    <circle
      cx="6.5"
      cy="11.5"
      r="1.5"
      fill="#FFC8A2"
      stroke="#0F172A"
      strokeWidth="1.5"
    />
    <circle
      cx="17.5"
      cy="11.5"
      r="1.5"
      fill="#FFC8A2"
      stroke="#0F172A"
      strokeWidth="1.5"
    />
    <rect
      x="7.5"
      y="7"
      width="9"
      height="10"
      rx="4.5"
      fill="#FFC8A2"
      stroke="#0F172A"
      strokeWidth="1.5"
    />
    <path
      d="M7 9C7 5.5 9.5 3 12 3s5 2.5 5 6c0 1-1 1-1 1H8s-1 0-1-1z"
      fill="#1E293B"
      stroke="#0F172A"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="11.5" r="1" fill="#0F172A" />
    <circle cx="14" cy="11.5" r="1" fill="#0F172A" />
    <path
      d="M10.5 14.5q1.5 1.5 3 0"
      stroke="#0F172A"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const NavLogoutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0F172A"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" stroke="#EF4444" strokeWidth="3" />
    <line x1="21" y1="12" x2="10" y2="12" stroke="#EF4444" strokeWidth="3" />
  </svg>
);

const IconButtonWrapper = ({ children, badge, onClick, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className="relative w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] flex items-center justify-center rounded-[12px] sm:rounded-[14px] border border-[#DEE5ED]/60 dark:border-border bg-card hover:bg-muted transition-all duration-200 cursor-pointer group shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:ml-1 focus:outline-none"
  >
    <div className="group-hover:scale-110 transition-transform duration-200 ease-out flex items-center justify-center">
      {children}
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-[6px] -right-[6px] min-w-[20px] h-[20px] bg-[#EF4444] border-[2.5px] border-white text-white rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold z-10 font-sans shadow-sm ring-1 ring-black/5">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
);

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, signOut, previewClass, setPreviewClass } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<any>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!userData?.uid) {
      setNotifications([]);
      return;
    }

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

    return () => unsubscribe();
  }, [userData?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        if (!n.read && n.userId !== "all") {
          batch.update(doc(db, "notifications", n.id), { read: true });
        }
      });
      await batch.commit();
      setShowNotifications(false);
    } catch (e) {
      console.error("Error marking read:", e);
      setShowNotifications(false);
    }
  };

  const formatBNTime = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp.seconds * 1000);
      return (
        date.toLocaleDateString("bn-BD", { month: "long", day: "numeric" }) +
        " | " +
        date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })
      );
    } catch (e) {
      return "";
    }
  };

  const isAdminPath = location.pathname.startsWith("/admin");
  const isLogin = location.pathname === "/login";

  // Get email to determine admin status
  const userEmail = userData?.email || localStorage.getItem("userEmail") || "";
  const isAdmin =
    userEmail.toLowerCase() === "mdfoyej081@gmail.com" ||
    userEmail.toLowerCase() === "seneiaislam@gmail.com" ||
    userData?.isAdmin === true;

  if (isLogin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {settings?.alertBannerActive && (
        <div className="bg-gradient-to-r from-[#ffa726] to-[#e65100] text-white text-center py-2.5 px-4 text-xs sm:text-sm font-semibold font-bengali flex items-center justify-center gap-2 select-none relative z-[51] shadow-xs">
          <span className="animate-bounce">📢</span>
          <span>{settings.alertBannerMessage}</span>
          {settings.discountPercentage > 0 && (
            <span className="bg-card/25 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold font-sans shrink-0">
              SAVE {settings.discountPercentage}%
            </span>
          )}
        </div>
      )}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-slate-100 dark:border-border">
        <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-10 flex min-h-[74px] sm:min-h-[86px] py-0.5 flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center group py-0 h-[64px] sm:h-[76px]">
              <TransparentLogo
                src={settings?.pwaIconUrl || "https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg"}
                alt="বিদ্যায়ন"
                className="pwa-trigger h-[74px] sm:h-[88px] -my-1 sm:-my-1.5 w-auto object-contain group-hover:scale-105 transition-all duration-300 mr-4 sm:mr-8 block relative z-[1]"
              />
            </Link>
          </div>

          {!isAdminPath && (
            <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl px-8">
              <div className="relative w-[500px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                <input
                  type="search"
                  placeholder="যা খুঁজছেন লিখুন..."
                  className="w-full bg-card border border-slate-200 dark:border-border rounded-full pl-12 pr-12 py-[10px] text-[15px] font-bengali focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 shadow-sm transition-all text-foreground"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-5">
            {userData?.isPro ? (
              <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-[#ffa726] to-[#e65100] text-white px-3 py-1 rounded-full text-xs font-bold font-bengali shadow-sm border border-orange-400">
                <span className="text-sm">👑</span> প্রো মেম্বার
              </div>
            ) : (
              <Link to="/subscription" className="hidden md:block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#ffa726] to-[#e65100] hover:from-[#f57c00] hover:to-[#d84315] text-white rounded-full font-bengali border-0 shadow-md shadow-orange-500/20 text-xs px-4"
                >
                  👑 আপগ্রেড করুন
                </Button>
              </Link>
            )}

            {isAdmin && !isAdminPath && (
              <div className="hidden lg:flex bg-amber-50 border border-amber-200 rounded-full items-center px-3 py-1 gap-2 shadow-sm mr-2">
                <span className="text-amber-700 text-xs font-semibold whitespace-nowrap">
                  View As:
                </span>
                <select
                  className="bg-transparent border-0 text-xs font-bengali text-amber-900 outline-none appearance-none cursor-pointer pr-4 bg-no-repeat"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b45309'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: "right center",
                    backgroundSize: "0.8em 0.8em",
                  }}
                  value={previewClass || userData?.class || "Admin"}
                  onChange={(e) =>
                    setPreviewClass(
                      e.target.value === "Admin" ? null : e.target.value,
                    )
                  }
                >
                  <option value="Admin">Admin (All)</option>
                  <option value="৬ষ্ঠ শ্রেণী">৬ষ্ঠ শ্রেণী</option>
                  <option value="৭ম শ্রেণী">৭ম শ্রেণী</option>
                  <option value="৮ম শ্রেণী">৮ম শ্রেণী</option>
                  <option value="নবম শ্রেণী">নবম শ্রেণী</option>
                  <option value="দশম শ্রেণী">দশম শ্রেণী</option>
                  <option value="এইচএসসি">এইচএসসি</option>
                  <option value="এডমিশন">এডমিশন</option>
                </select>
              </div>
            )}

            {isAdmin && !isAdminPath && (
              <Link to="/admin">
                <IconButtonWrapper title="এডমিন প্যানেল">
                  <NavAdminIcon />
                </IconButtonWrapper>
              </Link>
            )}

            <div className="relative" ref={notificationRef}>
              <IconButtonWrapper
                onClick={() => setShowNotifications(!showNotifications)}
                badge={unreadCount}
                title="নোটিফিকেশন"
              >
                <NavBellIcon />
              </IconButtonWrapper>

              {showNotifications && (
                <div className="absolute right-[-10px] sm:right-0 origin-top-right mt-3 w-[280px] sm:w-[320px] max-w-[calc(100vw-16px)] bg-card rounded-2xl shadow-xl border border-slate-100 dark:border-border z-50 overflow-hidden font-bengali">
                  <div className="p-4 border-b border-slate-100 dark:border-border flex justify-between items-center bg-muted/50">
                    <h3 className="font-bold text-foreground text-sm">
                      নোটিফিকেশন
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount}টি বাকি
                      </span>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 font-medium leading-normal">
                        কোনো নোটিফিকেশন পাওয়া যায়নি।
                      </div>
                    ) : (
                      notifications.map((noti) => (
                        <div
                          key={noti.id}
                          className={`p-4 border-b border-slate-50 dark:border-border hover:bg-muted/80 transition-colors cursor-pointer group ${!noti.read ? "bg-amber-50/20 dark:bg-amber-900/10" : ""}`}
                          onClick={() => {
                            if (!noti.read) {
                              updateDoc(doc(db, "notifications", noti.id), {
                                read: true,
                              });
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform ${
                                noti.type === "pro_approval"
                                  ? "bg-amber-100 text-amber-600"
                                  : noti.type === "alert"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-bold leading-tight mb-1 flex items-center gap-1.5 break-words">
                                {noti.title}
                                {!noti.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 leading-snug break-words">
                                {noti.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                                {formatBNTime(noti.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className="p-3 text-center border-t border-slate-100 dark:border-border bg-muted/30">
                      <button
                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full py-1 border-0 bg-transparent cursor-pointer"
                        onClick={handleMarkAllAsRead}
                      >
                        সবগুলো পঠিত হিসেবে চিহ্নিত করুন
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/profile">
              <IconButtonWrapper title="প্রোফাইল">
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-[22px] h-[22px] text-slate-700 stroke-[2px]" />
                )}
              </IconButtonWrapper>
            </Link>

            <IconButtonWrapper
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="ডার্ক থিম টোগল"
            >
              {isDarkMode ? (
                <Sun className="w-[20px] h-[20px] text-amber-500" />
              ) : (
                <Moon className="w-[20px] h-[20px] text-slate-700" />
              )}
            </IconButtonWrapper>

            <IconButtonWrapper onClick={handleSignOut} title="লগ আউট">
              <NavLogoutIcon />
            </IconButtonWrapper>
          </div>
        </div>
      </header>
    </>
  );
}
