"use client";

import { useEffect, useState } from "react";

export default function StarField() {
  const [stars, setStars] = useState<{ x: number; y: number; r: number }[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 40 }).map(() => ({
        x: Math.random() * 500,
        y: Math.random() * 700,
        r: Math.random() * 1.5 + 0.5,
      }))
    );
  }, []);

  return (
    <div className="left-paths">
      <svg width="100%" height="100%" viewBox="0 0 500 750" fill="none" xmlns="http://www.w3.org/2000/svg">
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="white"
            style={{
              opacity: 0.4,
              animation: `blink ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
