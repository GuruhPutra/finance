import React, { useState, useEffect } from "react";

/**
 * PWA Install Prompt
 * Menangkap event `beforeinstallprompt` dari browser dan menampilkan
 * popup custom yang mengajak user menginstall aplikasi.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Jika sudah pernah dismiss, jangan tampilkan lagi dalam sesi ini
    const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tunda 3 detik sebelum muncul agar tidak langsung mengganggu
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Deteksi jika sudah terinstall
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setVisible(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setInstalled(true);
      setVisible(false);
    } else {
      handleDismiss();
    }
  }

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  }

  if (!visible || dismissed) return null;

  return (
    <>
      {/* Backdrop blur */}
      <div className="pwa-backdrop" onClick={handleDismiss} />

      {/* Install Card */}
      <div className="pwa-prompt animate-slide-up-from-bottom">
        {/* Close button */}
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Tutup">
          ✕
        </button>

        {/* App Icon */}
        <div className="pwa-icon-wrap">
          <img src="/finance/icon-512.png" alt="FinanceOS" className="pwa-icon-img" />
          <div className="pwa-icon-badge">💹</div>
        </div>

        {/* Text */}
        <div className="pwa-text">
          <h2 className="pwa-title">Install FinanceOS</h2>
          <p className="pwa-subtitle">
            Tambahkan ke layar utama untuk akses cepat — tampil seperti aplikasi Android, tanpa browser!
          </p>
        </div>

        {/* Feature highlights */}
        <div className="pwa-features">
          <div className="pwa-feature">
            <span className="pwa-feature-icon">⚡</span>
            <span>Akses instan dari homescreen</span>
          </div>
          <div className="pwa-feature">
            <span className="pwa-feature-icon">📴</span>
            <span>Bisa digunakan offline</span>
          </div>
          <div className="pwa-feature">
            <span className="pwa-feature-icon">🔒</span>
            <span>Aman & tanpa iklan</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pwa-actions">
          <button
            className="btn btn-primary btn-lg pwa-install-btn"
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? (
              <><span className="loading-spin">⟳</span> Menginstall...</>
            ) : (
              <>📲 Install Sekarang</>
            )}
          </button>
          <button className="pwa-later-btn" onClick={handleDismiss}>
            Nanti saja
          </button>
        </div>
      </div>
    </>
  );
}
