import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { User, GoogleAuthProvider, signInWithPopup, signOut as _signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  institution?: string;
  class?: string;
  group?: string;
  points?: number;
  progress?: {
    totalSolved: number;
    accuracy: number;
    streak: number;
  };
  isPro?: boolean;
  proUntil?: any;
  isTutor?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserData|null>;
  signInOrSignUpWithEmail: (email: string, password: string) => Promise<UserData|null>;
  setupRecaptcha: (containerId: string) => any;
  signInWithPhone: (phoneNumber: string, appVerifier: any) => Promise<ConfirmationResult>;
  verifyPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<UserData|null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => null,
  signInOrSignUpWithEmail: async () => null,
  setupRecaptcha: () => null,
  signInWithPhone: async () => ({} as ConfirmationResult),
  verifyPhoneCode: async () => null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    // Ensure persistence is set to LOCAL to prevent frequent logouts in PWA
    setPersistence(auth, browserLocalPersistence).then(() => {
      unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          // Optimistically set basic data that does not require network
          setUserData({
             uid: currentUser.uid,
             email: currentUser.email || '',
             fullName: currentUser.displayName || 'Student',
             isPro: false,
          } as UserData);

          try {
            // Fetch or create user document
            const userRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data() as UserData;
              const userEmail = currentUser.email?.toLowerCase() || '';
              const isAdmin = userEmail === "mdfoyej081@gmail.com" || userEmail === "seneiaislam@gmail.com";
              
              if (isAdmin || data.isTutor) {
                data.isPro = true;
              }

              // Check if custom subscription hasn't expired
              if (data.proUntil && new Date(data.proUntil.toMillis ? data.proUntil.toMillis() : data.proUntil).getTime() < Date.now()) {
                // Only expire if not an admin/tutor
                if (!isAdmin && !data.isTutor) {
                  data.isPro = false;
                }
              }

              setUserData(data);
            }
          } catch (e) {
             console.warn("Could not fetch user document (offline), using cached basic data", e);
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      });
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<UserData | null> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // Create user document for first time users
      const newUserData: UserData = {
        uid: result.user.uid,
        email: result.user.email || '',
        fullName: result.user.displayName || '',
        points: 0,
        progress: { totalSolved: 0, accuracy: 0, streak: 0 },
        isPro: false
      };
      
      await setDoc(userRef, {
        ...newUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setUserData(newUserData);
      return newUserData;
    } else {
      const data = docSnap.data() as UserData;
      setUserData(data);
      return data;
    }
  };

  const signInOrSignUpWithEmail = async (email: string, password: string): Promise<UserData | null> => {
    let result;
    try {
      result = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        try {
          result = await createUserWithEmailAndPassword(auth, email, password);
        } catch (signupError: any) {
          if (signupError.code === 'auth/email-already-in-use') {
            throw new Error("ভুল পাসওয়ার্ড দেওয়া হয়েছে। দয়া করে সঠিক পাসওয়ার্ড দিন।");
          } else if (signupError.code === 'auth/weak-password') {
            throw new Error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
          } else if (signupError.code === 'auth/invalid-email') {
            throw new Error("ইমেইল অ্যাড্রেসটি সঠিক নয়।");
          } else if (signupError.code === 'auth/too-many-requests') {
            throw new Error("অনেক বেশি চেষ্টা করা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
          }
          throw signupError;
        }
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("ইমেইল অ্যাড্রেসটি সঠিক নয়।");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("অনেক বেশি চেষ্টা করা হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
      } else {
        throw error;
      }
    }
    
    const userRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      const newUserData: UserData = {
        uid: result.user.uid,
        email: result.user.email || email,
        fullName: '',
        points: 0,
        progress: { totalSolved: 0, accuracy: 0, streak: 0 },
        isPro: false
      };
      
      await setDoc(userRef, {
        ...newUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setUserData(newUserData);
      return newUserData;
    } else {
      const data = docSnap.data() as UserData;
      setUserData(data);
      return data;
    }
  };

  const setupRecaptcha = (containerId: string) => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible'
      });
    }
    return (window as any).recaptchaVerifier;
  };

  const signInWithPhone = async (phoneNumber: string, appVerifier: any): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string): Promise<UserData | null> => {
    const result = await confirmationResult.confirm(code);
    
    const userRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      const newUserData: UserData = {
        uid: result.user.uid,
        email: result.user.phoneNumber || '',
        fullName: '',
        points: 0,
        progress: { totalSolved: 0, accuracy: 0, streak: 0 },
        isPro: false
      };
      
      await setDoc(userRef, {
        ...newUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setUserData(newUserData);
      return newUserData;
    } else {
      const data = docSnap.data() as UserData;
      setUserData(data);
      return data;
    }
  };

  const signOut = async () => {
    await _signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signInOrSignUpWithEmail, setupRecaptcha, signInWithPhone, verifyPhoneCode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
