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
import Dashboard from "./pages/Dashboard";
import QuestionBank from "./pages/QuestionBank";
import PaperView from "./pages/PaperView";
import Notes from "./pages/Notes";
import SubjectNotes from "./pages/SubjectNotes";
import Exam from "./pages/Exam";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AITutor from "./pages/AITutor";
import Memorize from "./pages/Memorize";
import NoteDetails from "./pages/NoteDetails";
import NoteHonesty from "./pages/NoteHonesty";
import Doubts from "./pages/Doubts";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import PaymentCancel from './pages/PaymentCancel';
import MockPaymentPortal from './pages/MockPaymentPortal';
import SubjectFormat from './pages/SubjectFormat';
import SubjectPapers from './pages/SubjectPapers';
import PublicExam from "./pages/PublicExam";
import PublicExamsList from "./pages/PublicExamsList";
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans relative">
        <div className="animate-pulse flex flex-col items-center justify-center mb-8">
          <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] bg-card rounded-[40px] sm:rounded-[48px] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] mb-6 sm:mb-8 border border-border overflow-hidden p-4">
             <img src="/logo.png" alt="Logo" className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] object-contain rounded-3xl" referrerPolicy="no-referrer" />
          </div>
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
      className="min-h-screen bg-background flex flex-col font-sans" 
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
          {user?.phoneNumber || user?.email || 'বিদ্যায়ন'} • {user?.phoneNumber || user?.email || 'বিদ্যায়ন'} • {user?.phoneNumber || user?.email || 'বিদ্যায়ন'}
        </div>
      </div>

        <Outlet />
      </main>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, userData } = useAuth();
  
  const [pwaIcon, setPwaIcon] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Dynamic PWA Header & Icon Injection
    import('firebase/firestore').then(({ doc, getDoc }) => {
      import('./lib/firebase').then(({ db }) => {
        getDoc(doc(db, 'settings', 'general')).then((snap) => {
          if (snap.exists() && snap.data()?.pwaIconUrl) {
            const iconUrl = snap.data().pwaIconUrl;
            setPwaIcon(iconUrl);
            
            // Update apple-touch-icon
            const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (appleIcon) (appleIcon as HTMLLinkElement).href = iconUrl;
            
            // Update shortcuts icons
            const favicons = document.querySelectorAll('link[rel="icon"]');
            favicons.forEach(fav => {
              (fav as HTMLLinkElement).href = iconUrl;
            });
          }
        });
      });
    });
  }, []);

  // Do not show back button on dashboard, exam, paper, and question-bank pages
  const hideGlobalBackButton = location.pathname === "/dashboard" || location.pathname === "/" || location?.pathname?.startsWith("/exam") || location.pathname === "/paper" || location.pathname === "/bank" || location.pathname === "/question-bank" || location.pathname?.startsWith("/notes") || location.pathname === "/leaderboard" || location.pathname === "/profile" || location.pathname === "/admin" || location.pathname === "/tutor" || location.pathname === "/doubts" || location.pathname === "/memorize" || location.pathname === "/public-exams" || location.pathname === "/subscription" || location.pathname === "/mock-payment" || location.pathname.startsWith("/format") || location.pathname.startsWith("/subject-papers");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans relative">
        <div className="animate-pulse flex flex-col items-center justify-center mb-8">
          <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] bg-card rounded-[40px] sm:rounded-[48px] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] mb-6 sm:mb-8 border border-border overflow-hidden p-4">
             <img src="/logo.png" alt="Logo" className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] object-contain rounded-3xl" referrerPolicy="no-referrer" />
          </div>
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

  const isFullScreenPage = location.pathname.startsWith("/notes") || location.pathname.startsWith("/exam") || location.pathname.startsWith("/doubts") || location.pathname.startsWith("/tutor") || location.pathname.startsWith("/bank") || location.pathname.startsWith("/memorize") || location.pathname.startsWith("/mock-payment") || location.pathname.startsWith("/paper") || location.pathname.startsWith("/format") || location.pathname.startsWith("/subject-papers");
  const hideNavbar = location.pathname.startsWith("/exam") || location.pathname.startsWith("/doubts") || location.pathname.startsWith("/tutor") || location.pathname.startsWith("/notes") || location.pathname.startsWith("/bank") || location.pathname.startsWith("/memorize") || location.pathname.startsWith("/mock-payment") || location.pathname.startsWith("/paper") || location.pathname.startsWith("/format") || location.pathname.startsWith("/subject-papers");

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans mb-8">
      {!hideNavbar && <Navbar />}
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
        {!hideNavbar && <WhatsAppSupport />}
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
            <Routes>
          {/* Public Routes without Navbar */}
          <Route path="/" element={<Landing />} />
          <Route path="/public-exam/:id" element={<PublicExam />} />
          <Route path="/Exam/:id" element={<PublicExam />} />
          <Route path="/Quiz/:id" element={<PublicExam />} />
          <Route path="/Qsbank/:id" element={<PublicExam />} />
          <Route path="/Modeltest/:id" element={<PublicExam />} />
          <Route path="/exam/:id" element={<PublicExam />} />
          <Route path="/quiz/:id" element={<PublicExam />} />
          <Route path="/qsbank/:id" element={<PublicExam />} />
          <Route path="/modeltest/:id" element={<PublicExam />} />
          <Route path="/public-exams" element={<PublicExamsList />} />
          <Route path="/Exam" element={<PublicExamsList />} />
          <Route path="/Quiz" element={<PublicExamsList />} />
          <Route path="/Qsbank" element={<PublicExamsList />} />
          <Route path="/Modeltest" element={<PublicExamsList />} />
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
          <Route path="/format" element={<SubjectFormat />} />
          <Route path="/subject-papers" element={<SubjectPapers />} />
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
        </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
