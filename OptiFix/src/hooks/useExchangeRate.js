import { useEffect, useState } from "react";
import { obtenerTipoCambioUsdCrc } from "../services/externalApiService.js";

export function useExchangeRate() {
  const [state, setState] = useState({ rate: null, loading: true, source: "" });
  useEffect(() => {
    let active = true;
    obtenerTipoCambioUsdCrc().then((result) => active && setState({ rate: result.rate, loading: false, source: result.source }));
    return () => { active = false; };
  }, []);
  return state;
}
