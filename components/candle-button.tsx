"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Candle reaction toggle.
 *
 * Deliberately has no count. A candle either burns or it doesn't — someone
 * witnessed the effort, and how many did isn't the point.
 */
export function CandleButton({
  lit,
  onClick,
}: {
  lit: boolean;
  onClick: () => void;
}) {
  const gradId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      whileTap={reduceMotion ? undefined : { scale: 1.18 }}
      transition={{ type: "spring", stiffness: 420, damping: 16 }}
      className="flex cursor-pointer select-none items-center justify-center border-none bg-transparent p-0"
      style={{ width: 44, height: 44 }}
      aria-pressed={lit}
      aria-label={lit ? "Remove candle" : "Light a candle"}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{
          filter: lit
            ? "drop-shadow(0 0 5px rgba(200,75,17,0.58)) drop-shadow(0 0 12px rgba(200,75,17,0.2))"
            : "none",
          transition: "filter 220ms ease-out",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Gradient mapped to outer flame height in user-space coordinates */}
          <linearGradient
            id={gradId}
            x1="0"
            y1="21"
            x2="0"
            y2="2"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#C94E0A" />
            <stop offset="52%" stopColor="#F5A020" />
            <stop offset="100%" stopColor="#FFD96A" />
          </linearGradient>
        </defs>

        {/*
          Outer flame (v3).
          Sharp asymmetric tip at (12, 2): the left approach control point
          (11.5, 2.8) sits 0.5 units out for a gentle arrival, while the right
          departure point (12.3, 2.3) is only 0.3 units away for an abrupt exit.
          The resulting ~77 degree included angle reads as pointed, where v2's
          blunter tip read as a mango.
          Lower third widened afterwards: right belly pushed to (16.2, 13.5),
          lower right held at (15.2, 19.5), base widened to x=13.
        */}
        <path
          d="
            M10 21
            C7.5 21 6.5 19.5 6.5 17.5
            C6.5 14.5 8 12 9.5 10.5
            C10.5 9 11 7 11 5.5
            C11 4 11.5 2.8 12 2
            C12.3 2.3 13.5 5 14.5 7.5
            C15.5 10 16.2 13.5 15.8 16.5
            C15.2 19.5 14 21 13 21
            C12 21 11 21 10 21Z
          "
          fill={lit ? `url(#${gradId})` : "none"}
          stroke={lit ? "none" : "#9A8880"}
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/*
          Inner core. When lit, a thin light stroke stays visible against the
          gradient fill to give depth. No wick, per the v3 spec.
        */}
        <path
          d="
            M11 19.5
            C10 19.5 9.5 18.5 9.5 17
            C9.5 15 10.5 13 11.5 11.5
            C12 10.5 12.5 9 12.5 7
            C13 8 13.5 10 13.5 12.5
            C13.5 15 13 18.5 12.5 19.5
            C12 19.5 11.5 19.5 11 19.5Z
          "
          fill={lit ? "rgba(255,215,110,0.22)" : "none"}
          stroke={lit ? "rgba(255,238,170,0.72)" : "#9A8880"}
          strokeWidth={lit ? 1.0 : 1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}