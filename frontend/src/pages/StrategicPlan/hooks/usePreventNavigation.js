import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useConfirmNavigation(message, when) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastLocation = useRef(location);

  useEffect(() => {
    if (!when) return;

    const unblock = navigate.block || (() => {}); 
    lastLocation.current = location;
  }, [location, when, navigate]);

  useEffect(() => {
    if (!when) return;

    const handleBeforeRouteChange = (e) => {
      const next = window.location.pathname + window.location.search;
      const current = lastLocation.current.pathname + lastLocation.current.search;

      if (next !== current) {
        if (!window.confirm(message)) {
          e.preventDefault();
          window.history.pushState(null, "", current);
        } else {
          lastLocation.current = location;
        }
      }
    };

    window.addEventListener("popstate", handleBeforeRouteChange);
    return () => window.removeEventListener("popstate", handleBeforeRouteChange);
  }, [when, message, location]);
}
