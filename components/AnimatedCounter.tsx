"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  // Seed with the server-rendered target so the very first paint (and hydration)
  // already shows the real number instead of flashing "0" while the count-up
  // animation ramps up.
  const [count, setCount] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current || target <= 0) return;
    const from = prevTarget.current;
    prevTarget.current = target;

    let raf: number;
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + eased * (target - from)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}
