import * as React from "react";

export function useIsMobile(bp = 768) {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" && window.innerWidth < bp,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < bp);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [bp]);

  return isMobile;
}
