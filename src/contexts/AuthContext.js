import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export const SUPER_ADMIN = "vjysupermacy@gmail.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const adminDoc = await getDoc(doc(db, "admins", u.email));
        setIsAdmin(adminDoc.exists() || u.email === SUPER_ADMIN);
        // Auto-create super admin entry
        if (u.email === SUPER_ADMIN) {
          await setDoc(doc(db, "admins", u.email), {
            email: u.email,
            name: u.displayName,
            addedAt: new Date().toISOString(),
            isSuperAdmin: true
          }, { merge: true });
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, loginWithGoogle, logout, SUPER_ADMIN }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
