"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveals its children once, when they first scroll into view.
 *
 * Used on the narrative sections of /product and nowhere else. A page where
 * every element fades up is the commonest tell of a generated layout, and on
 * /pricing it would mean the reader waits on an animation before they can read
 * a number. Motion earns its place in an argument; it does not in a calculator.
 *
 * Unobserves after firing, so nothing re-animates on scroll-up. Under
 * prefers-reduced-motion the CSS makes .rv visible regardless, so content is
 * never gated behind an effect that will not run.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Stagger, in ms. Keep small — this is a sequence, not a performance. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rv ${shown ? "rv-in" : ""} ${className}`}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
