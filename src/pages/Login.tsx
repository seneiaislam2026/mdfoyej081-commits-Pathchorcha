import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../lib/AuthContext";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const { signInOrSignUpWithEmail, user, userData, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      const email = user.email?.toLowerCase() || "";
      const phone = user.phoneNumber || "";
      const cleanPhone = phone.replace(/\D/g, '');
      const dEmail = (userData?.email || '').toLowerCase();
      const dPhone = (userData?.phoneNumber || userData?.phone || '').replace(/\D/g, '');
      const isSuper = email === "mdfoyej081@gmail.com" || 
                      email === "seneiaislam@gmail.com" || 
                      email.includes("01309154780") || 
                      email.includes("o13o9154780") ||
                      email.includes("1309154780") ||
                      email.includes("13o9154780") ||
                      cleanPhone.includes("1309154780") ||
                      phone.includes("01309154780") ||
                      phone.includes("o13o9154780") ||
                      dEmail.includes("01309154780") ||
                      dEmail.includes("o13o9154780") ||
                      dEmail.includes("1309154780") ||
                      dEmail.includes("13o9154780") ||
                      dPhone.includes("1309154780") ||
                      userData?.isAdmin === true;
      if (isSuper) {
        navigate("/dashboard");
      } else if (userData?.class) {
        navigate("/dashboard");
      } else if (userData) {
        navigate("/onboarding");
      }
    }
  }, [user, userData, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let loginEmail = username.trim();
      
      const data = await signInOrSignUpWithEmail(loginEmail, password);
      // Check if user is admin
      const email = loginEmail.toLowerCase();
      const dEmail = (data?.email || '').toLowerCase();
      const dPhone = (data?.phoneNumber || data?.phone || '').replace(/\D/g, '');
      const isSuper = email === "mdfoyej081@gmail.com" || 
                      email === "seneiaislam@gmail.com" || 
                      email.includes("01309154780") || 
                      email.includes("o13o9154780") ||
                      email.includes("1309154780") ||
                      email.includes("13o9154780") ||
                      dEmail.includes("01309154780") ||
                      dEmail.includes("o13o9154780") ||
                      dEmail.includes("1309154780") ||
                      dEmail.includes("13o9154780") ||
                      dPhone.includes("1309154780") ||
                      data?.isAdmin === true;
      if (isSuper) {
         navigate("/dashboard");
      } else if (data && data.class) {
         navigate("/dashboard");
      } else {
         navigate("/onboarding");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message) {
        setError(err.message);
      } else {
        setError("লগিন ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-lg border border-muted rounded-[32px] overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-6 bg-muted border-b p-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary font-bold text-3xl shadow-sm">
              P
            </div>
          </div>
          <CardTitle className="text-2xl font-bengali font-bold text-primary tracking-tight uppercase">PATHCHARCHA</CardTitle>
          <CardDescription className="text-sm font-bengali">
            অ্যাডমিন প্যানেলে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড দিয়ে লগিন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-bengali">ইমেইল</Label>
              <Input 
                id="username" 
                type="email" 
                placeholder="admin@example.com" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="font-sans"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bengali">পাসওয়ার্ড</Label>
                <button type="button" onClick={async () => {
                  if (!username.trim()) {
                    setError("পাসওয়ার্ড রিসেট করতে আগে ইমেইল দিন।");
                    return;
                  }
                  try {
                    await sendPasswordResetEmail(auth, username.trim());
                    setError("আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। দয়া করে ইনবক্স চেক করুন।");
                  } catch (e: any) {
                    if (e.code === 'auth/user-not-found') {
                      setError("এই ইমেইলের কোনো একাউন্ট পাওয়া যায়নি।");
                    } else if (e.code === 'auth/invalid-email') {
                      setError("সঠিক ইমেইল অ্যাড্রেস দিন।");
                    } else {
                      setError("পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।");
                    }
                  }
                }} className="text-sm font-bengali text-primary hover:underline font-medium">পাসওয়ার্ড ভুলে গেছেন?</button>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-sans text-lg tracking-widest"
              />
            </div>
            
            {error && <p className="text-sm text-destructive font-medium font-bengali bg-red-50 p-3 rounded-lg border border-red-100 mt-2">{error}</p>}

            <Button disabled={loading} type="submit" className="w-full mt-4 font-bengali text-base bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all h-12">
              {loading ? "লগিন হচ্ছে..." : "লগিন করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
