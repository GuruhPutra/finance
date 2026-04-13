import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register, loginWithGoogle, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Halaman tujuan sebelum diarahkan ke login (jika ada)
  const from = location.state?.from?.pathname || "/";
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearError();
    setLocalError(null);
    setSuccessMsg(null);
  }, [mode]);

  const error = localError || authError;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setLocalError(null);
    clearError();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    if (mode === "register") {
      if (!form.name.trim()) return setLocalError("Nama tidak boleh kosong.");
      if (form.password !== form.confirmPassword) return setLocalError("Password tidak cocok.");
      if (form.password.length < 6) return setLocalError("Password minimal 6 karakter.");
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        // Arahkan ke halaman yang dituju sebelumnya, atau dashboard
        navigate(from, { replace: true });
      } else {
        const registeredEmail = form.email;
        await register(form.email, form.password, form.name.trim());
        // Registration succeeded — switch to login tab with a success message
        setSuccessMsg("Akun berhasil dibuat! Silakan masuk dengan email dan password Anda.");
        setForm({ name: "", email: registeredEmail, password: "", confirmPassword: "" });
        setMode("login");
      }
    } catch {
      // error shown via authError
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch {
      // error shown via authError
    } finally {
      setGoogleLoading(false);
    }
  }

  function switchMode() {
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setMode((m) => (m === "login" ? "register" : "login"));
  }

  return (
    <div className="login-shell">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-card animate-fade">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <span>💹</span>
          </div>
          <h1 className="login-title">FinanceOS</h1>
          <p className="login-subtitle">Smart Personal Finance Manager</p>
        </div>

        {/* Mode Tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab${mode === "login" ? " active" : ""}`}
            onClick={() => setMode("login")}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`login-tab${mode === "register" ? " active" : ""}`}
            onClick={() => setMode("register")}
          >
            Daftar
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="login-success animate-slide-up">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="login-error animate-slide-up">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                id="login-name"
                className="form-input"
                name="name"
                type="text"
                placeholder="Masukkan nama Anda"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              className="form-input"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                className="form-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Konfirmasi Password</label>
              <input
                id="login-confirm"
                className="form-input"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spin">⟳</span>
                {mode === "login" ? "Masuk..." : "Mendaftar..."}
              </>
            ) : (
              <>{mode === "login" ? "🚀 Masuk" : "✨ Buat Akun"}</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>atau lanjutkan dengan</span>
        </div>

        {/* Google Login */}
        <button
          id="login-google"
          type="button"
          className="btn btn-secondary btn-lg w-full login-google-btn"
          onClick={handleGoogle}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <>
              <span className="loading-spin">⟳</span> Menghubungkan...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Lanjutkan dengan Google
            </>
          )}
        </button>

        {/* Switch mode */}
        <p className="login-switch">
          {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button type="button" className="login-switch-btn" onClick={switchMode}>
            {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
          </button>
        </p>
      </div>
    </div>
  );
}
