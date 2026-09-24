import { Link } from "react-router-dom";
import Icono from "./icons.jsx";

export default function Logo({ showTagline = false }) {
  return (
    <Link to="/" className="logo" aria-label="OPTIFIX — Ventanilla Única Digital">
      <span className="logo-mark">
        <Icono nombre="shield-check" size={20} />
      </span>
      <span>
        OPTIFIX
        {showTagline && <small>Ventanilla Única Digital</small>}
      </span>
    </Link>
  );
}