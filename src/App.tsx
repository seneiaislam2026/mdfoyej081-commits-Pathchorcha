import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import React from "react";
import Navbar from "./components/layout/Navbar";
import WhatsAppSupport from "./components/WhatsAppSupport";
import ProApprovedCongrats from "./components/layout/ProApprovedCongrats";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const QuestionBank = React.lazy(() => import("./pages/QuestionBank"));
const PaperView = React.lazy(() => import("./pages/PaperView"));
const Notes = React.lazy(() => import("./pages/Notes"));
const SubjectNotes = React.lazy(() => import("./pages/SubjectNotes"));
const Exam = React.lazy(() => import("./pages/Exam"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Admin = React.lazy(() => import("./pages/Admin"));
const AITutor = React.lazy(() => import("./pages/AITutor"));
const Memorize = React.lazy(() => import("./pages/Memorize"));
const NoteDetails = React.lazy(() => import("./pages/NoteDetails"));
const NoteHonesty = React.lazy(() => import("./pages/NoteHonesty"));
const Doubts = React.lazy(() => import("./pages/Doubts"));
const Subscription = React.lazy(() => import("./pages/Subscription"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const PaymentFail = React.lazy(() => import("./pages/PaymentFail"));
import PaymentCancel from './pages/PaymentCancel';
import MockPaymentPortal from './pages/MockPaymentPortal';
const PublicExam = React.lazy(() => import("./pages/PublicExam"));
import { ArrowLeft } from "lucide-react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { InstallPrompt } from "./components/pwa/InstallPrompt";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 font-mono text-red-500 bg-red-50 min-h-screen">
          <h1 className="text-xl font-bold mb-4">Something went wrong.</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.message}</pre>
          <pre className="whitespace-pre-wrap mt-4 text-sm text-slate-600">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

import LocalNotificationSystem from "./components/layout/LocalNotificationSystem";

// Layout for user pages inside the app (post-authentication)

// Layout for full screen notes
function NoteLayout() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center shadow-md overflow-hidden p-1.5 mb-1.5">
            <img src="/icon.svg" alt="Logo" className="w-[85%] h-[85%] object-contain" />
          </div>
          <span className="font-bengali font-bold text-4xl sm:text-5xl tracking-tight">
            <span className="text-[#0F2744]">শিক্ষা</span>
            <span className="text-[#F4B400]">ঙ্গন</span>
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/notes");
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans" 
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 md:mb-6 font-bengali font-medium px-4 py-2 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          ফিরে যান
        </button>
        
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-[0.03] overflow-hidden">
        <div className="transform -rotate-45 text-4xl sm:text-6xl font-black text-slate-900 whitespace-nowrap">
          {user?.phoneNumber || user?.email || 'শিক্ষাঙ্গন'} • {user?.phoneNumber || user?.email || 'শিক্ষাঙ্গন'} • {user?.phoneNumber || user?.email || 'শিক্ষাঙ্গন'}
        </div>
      </div>

        <Outlet />
        <WhatsAppSupport />
      </main>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, userData } = useAuth();
  
  // Do not show back button on dashboard, exam, paper, and question-bank pages
  const hideGlobalBackButton = location.pathname === "/dashboard" || location.pathname === "/" || location?.pathname?.startsWith("/exam") || location.pathname === "/paper" || location.pathname === "/bank" || location.pathname === "/question-bank" || location.pathname?.startsWith("/notes") || location.pathname === "/leaderboard" || location.pathname === "/profile" || location.pathname === "/admin" || location.pathname === "/tutor" || location.pathname === "/doubts" || location.pathname === "/memorize";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center shadow-md overflow-hidden p-1.5 mb-1.5">
            <img src="/icon.svg" alt="Logo" className="w-[85%] h-[85%] object-contain" />
          </div>
          <span className="font-bengali font-bold text-4xl sm:text-5xl tracking-tight">
            <span className="text-[#0F2744]">শিক্ষা</span>
            <span className="text-[#F4B400]">ঙ্গন</span>
          </span>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/memorize') {
    return <Navigate to="/auth" replace />;
  }

  if (location.pathname.startsWith('/admin')) {
    const userEmail = user.email || "";
    const isAdmin = userEmail.toLowerCase() === "mdfoyej081@gmail.com" || userEmail.toLowerCase() === "seneiaislam@gmail.com" || userData?.isAdmin === true;
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleGoBack = () => {
    // Check if React Router has history state indicating a previous page
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const isFullScreenPage = location.pathname.startsWith("/notes");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans mb-8">
      <Navbar />
      <LocalNotificationSystem />
      <ProApprovedCongrats />
      <main className={isFullScreenPage ? "flex-1 w-full" : "flex-1 w-full max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-8"}>
        {!hideGlobalBackButton && (
          <button 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 md:mb-6 font-bengali font-medium px-4 py-2 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            ফিরে যান
          </button>
        )}
        <Outlet />
        <WhatsAppSupport />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InstallPrompt />
        <Router>
        <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-10"><div className="animate-pulse flex items-center justify-center font-bold text-slate-400">Loading Application...</div></div>}>
          <Routes>
          {/* Public Routes without Navbar */}
          <Route path="/" element={<Landing />} />
          <Route path="/public-exam/:id" element={<PublicExam />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        
        {/* Authenticated Routes with Navbar */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/subject/:subjectName" element={<SubjectNotes />} />
          <Route path="/bank" element={<QuestionBank />} />
          <Route path="/paper" element={<PaperView />} />
          <Route path="/memorize" element={<Memorize />} />
          
          
          <Route path="/exam" element={<Exam />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tutor" element={<AITutor />} />
          <Route path="/doubts" element={<Doubts />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-fail" element={<PaymentFail />} />
          <Route path='/payment-cancel' element={<PaymentCancel />} />
          <Route path='/mock-payment' element={<MockPaymentPortal />} />
        </Route>
        {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      
        </React.Suspense>
        </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
