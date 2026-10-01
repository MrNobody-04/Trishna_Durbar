"use client";

import React from "react";

interface RoyalDurbarLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function RoyalDurbarLogo({
  className = "",
  size = "md",
  showText = true,
}: RoyalDurbarLogoProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Radiant 24K Gold Durbar Royal Crest */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} rounded-2xl bg-gradient-to-b from-stone-900 via-neutral-950 to-black dark:from-[#1c1810] dark:via-[#0d0b07] dark:to-[#030303] border-2 border-amber-500/60 shadow-lg shadow-amber-500/25 group transition-transform duration-300 hover:scale-105`}
      >
        {/* Radiant Ambient Gold Glow */}
        <div className="absolute inset-0 rounded-2xl bg-radial from-amber-400/30 via-transparent to-transparent opacity-90 pointer-events-none" />

        {/* Precision Ornate Durbar Royal Crest SVG */}
        <svg
          viewBox="0 0 100 100"
          className="relative z-10 w-[82%] h-[82%] drop-shadow-[0_2px_10px_rgba(245,158,11,0.65)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="imperialGold24k" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9D2" />
              <stop offset="20%" stopColor="#FFE169" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="75%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
            <linearGradient id="brightShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="rubyCrownJewel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4D6D" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Durbar Palace Pagoda Pinnacle Spire (Gajur) */}
          <path
            d="M50 3 L53.5 13 L46.5 13 Z"
            fill="url(#brightShine)"
          />
          <circle cx="50" cy="14" r="2.5" fill="url(#imperialGold24k)" />

          {/* Palace Multi-tier Pagoda Curved Eaves (Traditional Nepali Architecture) */}
          <path
            d="M50 15 C38 17.5, 29 21.5, 20 25 C25 27, 34 26, 50 25 C66 26, 75 27, 80 25 C71 21.5, 62 17.5, 50 15 Z"
            fill="url(#brightShine)"
          />
          <path
            d="M50 23.5 C39 25.5, 30 29, 14 33.5 C21 35.5, 32 34.5, 50 33.5 C68 34.5, 79 35.5, 86 33.5 C70 29, 61 25.5, 50 23.5 Z"
            fill="url(#imperialGold24k)"
          />

          {/* Royal Crown Arch */}
          <path
            d="M25 39 C25 39, 34 47.5, 50 47.5 C66 47.5, 75 39, 75 39 L73 59 C73 66, 63 71, 50 71 C37 71, 27 66, 27 59 Z"
            fill="url(#imperialGold24k)"
            stroke="url(#brightShine)"
            strokeWidth="0.8"
          />

          {/* Ornate Royal Crown Spikes & Radiant Jewels */}
          <circle cx="27" cy="38" r="2.6" fill="url(#brightShine)" />
          <circle cx="38" cy="34.5" r="2.4" fill="url(#brightShine)" />
          <circle cx="50" cy="31" r="3.4" fill="url(#rubyCrownJewel)" stroke="url(#brightShine)" strokeWidth="1" />
          <circle cx="62" cy="34.5" r="2.4" fill="url(#brightShine)" />
          <circle cx="73" cy="38" r="2.6" fill="url(#brightShine)" />

          {/* Durbar Palace Gateway Arch (Darbar Torana) */}
          <path
            d="M35 50 C35 42, 65 42, 65 50 L65 79 L35 79 Z"
            fill="#060606"
            stroke="url(#brightShine)"
            strokeWidth="1.6"
          />
          {/* Inner Golden Sanctuary Arch */}
          <path
            d="M41 55 C41 48, 59 48, 59 55 L59 79 L41 79 Z"
            fill="url(#portalGlow)"
            stroke="url(#imperialGold24k)"
            strokeWidth="1"
          />

          {/* Royal Pedestal Base Plinth */}
          <path
            d="M18 79 L82 79 L78 86.5 L22 86.5 Z"
            fill="url(#imperialGold24k)"
          />
          <path
            d="M14 86.5 L86 86.5 L82.5 93 L17.5 93 Z"
            fill="url(#brightShine)"
          />

          {/* Emblem 8-Pointed Star of Durbar Royalty */}
          <polygon
            points="50,59 52,64 57.5,64 53,67.5 55,73 50,69.5 45,73 47,67.5 42.5,64 48,64"
            fill="url(#brightShine)"
          />
        </svg>

        {/* Top Glare Reflection */}
        <div className="absolute inset-x-1.5 top-1 h-[45%] rounded-t-xl bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />
      </div>

      {/* High-Definition Royal Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-500 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)] ${
                size === "sm"
                  ? "text-sm"
                  : size === "lg"
                  ? "text-2xl"
                  : size === "xl"
                  ? "text-3xl"
                  : "text-base sm:text-lg"
              }`}
            >
              TRISHNA DURBAR
            </span>
            <span className="hidden md:inline-flex text-[9px] font-black tracking-widest text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/40 uppercase shadow-xs">
              ROYAL RESTAURANT
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-700/90 dark:text-amber-400/90 tracking-wide">
            तृष्णा दरबार रेष्टुरेन्ट एण्ड बार
          </span>
        </div>
      )}
    </div>
  );
}
