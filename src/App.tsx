import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import React from "react";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import QuestionBank from "./pages/QuestionBank";
import PaperView from "./pages/PaperView";
import Notes from "./pages/Notes";
import Exam from "./pages/Exam";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AITutor from "./pages/AITutor";
import NoteDetails from "./pages/NoteDetails";
import NoteHonesty from "./pages/NoteHonesty";
import Doubts from "./pages/Doubts";
import Subscription from "./pages/Subscription";
import PublicExam from "./pages/PublicExam";
import { ArrowLeft } from "lucide-react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import ReloadPrompt from "./components/ReloadPrompt";

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

// Layout for user pages inside the app (post-authentication)
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Do not show back button on dashboard, exam, paper, and question-bank pages
  const hideGlobalBackButton = location.pathname === "/dashboard" || location.pathname === "/" || location?.pathname?.startsWith("/exam") || location.pathname === "/paper" || location.pathname === "/question-bank" || location.pathname === "/notes" || location.pathname === "/leaderboard" || location.pathname === "/profile" || location.pathname === "/admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (location.pathname.startsWith('/admin')) {
    const userEmail = user.email || "";
    const isAdmin = userEmail.toLowerCase() === "mdfoyej081@gmail.com" || userEmail.toLowerCase() === "seneiaislam@gmail.com";
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans mb-8">
      <Navbar />
      <main className="flex-1 w-full max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-8">
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
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InstallPrompt />
        <ReloadPrompt />
        <Router>
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
          <Route path="/bank" element={<QuestionBank />} />
          <Route path="/paper" element={<PaperView />} />
          <Route path="/notes/sonar-tori" element={<NoteDetails />} />
          <Route path="/notes/sototar-puroshkar" element={<NoteHonesty />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tutor" element={<AITutor />} />
          <Route path="/doubts" element={<Doubts />} />
          <Route path="/subscription" element={<Subscription />} />
        </Route>
        
        {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
