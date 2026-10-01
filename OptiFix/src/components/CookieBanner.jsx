import React, { useState } from "react";
import LegalModal from "./LegalModal.jsx";

const CONSENT_KEY = "optifix_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem(CONSENT_KEY) !== "accepted");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const acceptCookies = () => { localStorage.setItem(CONSENT_KEY, "accepted"); setVisible(false); };
  if (!visible) return null;
  return <>
    <aside className="cookie-banner" role="region" aria-label="Aviso de cookies">
      <p>Usamos cookies y almacenamiento local para recordar tus preferencias y mejorar tu experiencia en OptiFix.</p>
      <div className="cookie-banner-actions"><button type="button" className="cookie-read-more" onClick={() => setShowPrivacy(true)}>Leer más</button><button type="button" onClick={acceptCookies}>Aceptar</button></div>
    </aside>
    {showPrivacy && <LegalModal type="privacy" onClose={() => setShowPrivacy(false)} />}
  </>;
}
