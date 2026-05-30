import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, User, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../lib/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, signOut } = useAuth();

  const isAdminPath = location.pathname.startsWith("/admin");
  const isLogin = location.pathname === "/login";
  
  // Get email to determine admin status
  const userEmail = userData?.email || localStorage.getItem("userEmail") || "";
  const isAdmin = userEmail.toLowerCase() === "mdfoyej081@gmail.com" || userEmail.toLowerCase() === "seneiaislam@gmail.com";

  if (isLogin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
      <div className="container mx-auto max-w-[1200px] px-4 flex h-[88px] items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="font-bengali font-bold text-[32px] tracking-tight">
              <span className="text-primary">পাঠ</span>
              <span className="text-secondary">চর্চা</span>
            </span>
          </Link>
        </div>

        {!isAdminPath && (
          <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl px-8">
            <div className="relative w-[500px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
              <input
                type="search"
                placeholder="যা খুঁজছেন লিখুন..."
                className="w-full bg-white border border-slate-200 rounded-full pl-12 pr-12 py-[10px] text-[15px] font-bengali focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 shadow-sm transition-all"
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
              <Button size="sm" className="bg-gradient-to-r from-[#ffa726] to-[#e65100] hover:from-[#f57c00] hover:to-[#d84315] text-white rounded-full font-bengali border-0 shadow-md shadow-orange-500/20 text-xs px-4">
                👑 আপগ্রেড করুন
              </Button>
            </Link>
          )}

          {isAdmin && !isAdminPath && (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="bg-primary/5 text-primary border-primary/20 font-bengali px-2 md:px-4">
                <ShieldCheck className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">এডমিন প্যানেল</span>
              </Button>
            </Link>
          )}
          <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors ml-1">
            <Bell className="h-5 w-5 md:h-6 md:w-6 text-slate-700" strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-[10px] h-[10px] bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <Link to="/profile">
            <div className="cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors border border-gray-200 ml-1">
              <User className="h-[22px] w-[22px] text-slate-600" />
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-slate-600 hover:text-red-600 hover:bg-red-50" title="লগ আউট">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
