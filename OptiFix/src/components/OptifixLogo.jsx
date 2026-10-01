import React from "react";

export default function OptifixLogo({ size = 72, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo OptiFix"
      role="img"
    >
      <defs><linearGradient id="optifixLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0284c7" /><stop offset="100%" stopColor="#0369a1" /></linearGradient></defs>
      <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#optifixLogoGrad)" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="#fff" strokeWidth="3.5" opacity=".95" />
      <circle cx="50" cy="50" r="16" fill="#0b192c" />
      <rect x="46.5" y="17" width="7" height="7" rx="1.5" fill="#fff" /><rect x="46.5" y="76" width="7" height="7" rx="1.5" fill="#fff" />
      <rect x="17" y="46.5" width="7" height="7" rx="1.5" fill="#fff" /><rect x="76" y="46.5" width="7" height="7" rx="1.5" fill="#fff" />
      <path d="M44 50.5 48 54.5 57 44" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="66" cy="34" r="3.5" fill="#f97316" />
    </svg>
  );
}

/**
 * Versión horizontal del logo de referencia.
 */
export function OptifixBrand({ size = 88, textSize = 64, taglineSize = 26, showTagline = true }) {
  return (
    <svg width={size * 4.5} height={size} viewBox="0 0 450 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logo OptiFix">
      <defs><linearGradient id="optifixBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0284c7" /><stop offset="100%" stopColor="#0369a1" /></linearGradient></defs>
      <g transform="translate(10, 10)">
        <rect width="80" height="80" rx="20" fill="url(#optifixBrandGrad)" />
        <circle cx="40" cy="40" r="28" fill="none" stroke="#fff" strokeWidth="3.5" opacity=".95" />
        <circle cx="40" cy="40" r="16" fill="#0b192c" />
        <rect x="36.5" y="7" width="7" height="7" rx="1.5" fill="#fff" /><rect x="36.5" y="66" width="7" height="7" rx="1.5" fill="#fff" />
        <rect x="7" y="36.5" width="7" height="7" rx="1.5" fill="#fff" /><rect x="66" y="36.5" width="7" height="7" rx="1.5" fill="#fff" />
        <path d="M34 40.5 38 44.5 47 34" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="56" cy="24" r="3.5" fill="#f97316" />
      </g>
      <text x="110" y="58" fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="46" fontWeight="800" letterSpacing="-0.03em" fill="#0f172a">Opti<tspan fill="#0284c7">Fix</tspan></text>
      {showTagline && <text x="112" y="82" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontSize={taglineSize} fontWeight="500" letterSpacing="0.05em" fill="#64748b">TALLER & ERP</text>}
    </svg>
  );
}
