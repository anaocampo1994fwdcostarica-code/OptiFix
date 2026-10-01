import React from "react";
import OptifixLogo from "./OptifixLogo.jsx";

/* Identidad visual oficial de OptiFix. */
export default function Logo({ iconSize = 34, className = "", showText = true }) {
  return <div className={`inline-flex items-center gap-2 ${className}`} aria-label="OptiFix">
    <OptifixLogo size={iconSize} />
    {showText && <span className="logo-wordmark">Opti<span>Fix</span></span>}
  </div>;
}
