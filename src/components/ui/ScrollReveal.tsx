"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section";
  style?: React.CSSProperties;
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  className = "", 
  as = "div",
  style = {}
}: ScrollRevealProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      { threshold: 0.1 }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  const Component = as;

  return (
    <Component
      ref={ref as any}
      className={`${hasEntered ? "reveal-visible" : "reveal-hidden"} ${className}`}
      style={{ ...style, animationDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}
