import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Handle hasil redirect Google login (untuk mobile/popup-blocked)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err) => {
        if (err.code && err.code !== "auth/no-auth-event") {
          setAuthError(getFriendlyError(err.code));
        }
      });

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(getFriendlyError(err.code));
      throw err;
    }
  };

  const register = async (email, password, displayName) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      // Sign out immediately so the user must log in manually after registration
      await signOut(auth);
    } catch (err) {
      setAuthError(getFriendlyError(err.code));
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      // Coba popup dulu (desktop)
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (err) {
      // Jika popup di-block (mobile / browser tertentu), pakai redirect
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request" ||
        err.code === "auth/operation-not-supported-in-this-environment"
      ) {
        if (err.code === "auth/popup-closed-by-user" ||
            err.code === "auth/cancelled-popup-request") {
          // User menutup popup sendiri — tidak perlu error
          return;
        }
        // Popup di-block → pakai redirect
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setAuthError(getFriendlyError(err.code));
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const clearError = () => setAuthError(null);

  const value = {
    user,
    authLoading,
    authError,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function getFriendlyError(code) {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau password salah. Silakan coba lagi.";
    case "auth/email-already-in-use":
      return "Email sudah terdaftar. Silakan login atau gunakan email lain.";
    case "auth/weak-password":
      return "Password terlalu lemah. Gunakan minimal 6 karakter.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Silakan coba beberapa saat lagi.";
    case "auth/network-request-failed":
      return "Gagal terhubung. Periksa koneksi internet Anda.";
    case "auth/unauthorized-domain":
      return "Domain ini belum diotorisasi. Hubungi administrator.";
    case "auth/internal-error":
      return "Terjadi kesalahan internal. Silakan coba lagi.";
    default:
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
}
