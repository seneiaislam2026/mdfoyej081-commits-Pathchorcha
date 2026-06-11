import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';

export default function LocalNotificationSystem() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [inAppNotice, setInAppNotice] = useState<{title: string, body: string, url: string} | null>(null);

  useEffect(() => {
    if (!userData?.uid) return;

    const requestPermission = async () => {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.error("Failed to request notification permission:", e);
        }
      }
    };

    requestPermission();

    const checkUpcomingExams = async () => {
      try {
        const q = query(collection(db, 'public_exams'), where('active', '==', true));
        const snapshot = await getDocs(q);
        
        const now = new Date().getTime();
        const notifiedExams = JSON.parse(localStorage.getItem('notifiedExams') || '{}');
        
        let hasNewNotification = false;

        snapshot.forEach((docSnap) => {
          const exam = { id: docSnap.id, ...docSnap.data() } as any;
          if (exam.scheduledDate) {
            const scheduledTime = new Date(exam.scheduledDate).getTime();
            const timeDiff = scheduledTime - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            // Notify if the exam is starting within 24 hours, and hasn't been notified for '24h' or '1h'
            if (hoursDiff > 0 && hoursDiff <= 24) {
              const notifyType = hoursDiff <= 1 ? '1h' : '24h';
              
              if (notifiedExams[exam.id] !== notifyType && notifiedExams[exam.id] !== '1h') {
                const title = "আসন্ন পরীক্ষা: " + exam.title;
                const body = notifyType === '1h' 
                    ? `লক্ষণীয়! পরীক্ষাটি মাত্র ${Math.ceil(hoursDiff * 60)} মিনিট পর শুরু হবে।` 
                    : "আগামী ২৪ ঘন্টার মধ্যে আপনার একটি পরীক্ষা নির্ধারিত আছে।";
                
                if ("Notification" in window && Notification.permission === "granted") {
                  const notification = new Notification(title, {
                    body,
                    icon: '/icon.png', // Assuming there is an icon
                  });

                  notification.onclick = () => {
                    navigate(`/dashboard`);
                    window.focus();
                  };
                } else {
                  setInAppNotice({ title, body, url: '/dashboard' });
                }
                
                notifiedExams[exam.id] = notifyType;
                hasNewNotification = true;
              }
            } else if (hoursDiff <= 0 && hoursDiff > -24) {  // Within 24 hours after start
                if (notifiedExams[exam.id] !== 'started') {
                    const title = "পরীক্ষা শুরু হয়েছে: " + exam.title;
                    const body = "আপনার নির্ধারিত পরীক্ষাটি শুরু হয়েছে। এখনই অংশগ্রহণ করুন!";
                    
                    if ("Notification" in window && Notification.permission === "granted") {
                        const notification = new Notification(title, {
                            body,
                            icon: '/icon.png'
                        });

                        notification.onclick = () => {
                            navigate(`/public-exam/${exam.id}`);
                            window.focus();
                        };
                    } else {
                        setInAppNotice({ title, body, url: `/public-exam/${exam.id}` });
                    }

                    notifiedExams[exam.id] = 'started';
                    hasNewNotification = true;
                }
            }
          }
        });

        if (hasNewNotification) {
          localStorage.setItem('notifiedExams', JSON.stringify(notifiedExams));
        }

      } catch (error) {
        console.error("Error checking upcoming exams for notifications:", error);
      }
    };

    checkUpcomingExams();

    // Check periodically every 5 minutes
    const interval = setInterval(checkUpcomingExams, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userData?.uid, navigate]);

  if (!inAppNotice) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-4 max-w-sm w-full font-bengali flex items-start gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
       <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
         <Bell className="w-5 h-5" />
       </div>
       <div className="flex-1 cursor-pointer" onClick={() => { navigate(inAppNotice.url); setInAppNotice(null); }}>
         <h4 className="font-bold text-slate-800 text-[15px] mb-1">{inAppNotice.title}</h4>
         <p className="text-slate-500 text-[13px] leading-snug">{inAppNotice.body}</p>
       </div>
       <button onClick={() => setInAppNotice(null)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0">
         <X className="w-4 h-4" />
       </button>
    </div>
  );
}
