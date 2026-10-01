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
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-16 w-16",
    xl: "h-22 w-22",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 👑 3D Handcrafted 24K Gold Heraldic Royal Crest */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} rounded-2xl bg-gradient-to-b from-[#18130c] via-[#0d0a07] to-[#040302] border-2 border-amber-500/70 shadow-[0_4px_16px_rgba(217,119,6,0.35),_inset_0_1px_1px_rgba(255,255,255,0.25)] group transition-all duration-300 hover:scale-105 hover:border-amber-400`}
      >
        {/* Ambient Palace Gold Halo */}
        <div className="absolute inset-0 rounded-2xl bg-radial from-amber-400/25 via-transparent to-transparent opacity-90 pointer-events-none" />

        {/* Heraldic Royal Durbar SVG Crest */}
        <svg
          viewBox="0 0 140 140"
          className="relative z-10 w-[88%] h-[88%] drop-shadow-[0_2px_8px_rgba(245,158,11,0.55)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 24K Imperial Gold Gradient */}
            <linearGradient id="durbarGold24k" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="18%" stopColor="#FDE68A" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="75%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Specular Chiseled Shine */}
            <linearGradient id="chiseledShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FEF08A" />
              <stop offset="65%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            {/* Shield Body Gradient */}
            <radialGradient id="shieldObsidian" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#251d13" />
              <stop offset="60%" stopColor="#0f0c08" />
              <stop offset="100%" stopColor="#040302" />
            </radialGradient>

            {/* Crown Ruby Cabochon */}
            <radialGradient id="crownRuby" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFA4B6" />
              <stop offset="40%" stopColor="#E11D48" />
              <stop offset="85%" stopColor="#881337" />
              <stop offset="100%" stopColor="#4C0519" />
            </radialGradient>

            {/* Crown Emerald Jewel */}
            <radialGradient id="crownEmerald" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="45%" stopColor="#10B981" />
              <stop offset="85%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>
          </defs>

          {/* ============================================================== */}
          {/* 1. NEPALI ROYAL DURBAR CROWN (SHREEPECH / GAJUR PINNACLE)      */}
          {/* ============================================================== */}
          {/* Gajur Pinnacle Spire */}
          <path
            d="M70 4 L73.5 14 L66.5 14 Z"
            fill="url(#chiseledShine)"
          />
          <circle cx="70" cy="15" r="2.4" fill="url(#durbarGold24k)" />

          {/* Royal Crown Eaves / Arches */}
          <path
            d="M48 27 C54 22, 63 19, 70 19 C77 19, 86 22, 92 27 L90 31 C84 27, 77 24, 70 24 C63 24, 56 27, 50 31 Z"
            fill="url(#durbarGold24k)"
          />

          {/* Crown Jewels (Ruby Center + Emerald Accents + Pearls) */}
          <circle cx="70" cy="22" r="3.2" fill="url(#crownRuby)" stroke="url(#chiseledShine)" strokeWidth="0.8" />
          <circle cx="58" cy="24.5" r="2.2" fill="url(#crownEmerald)" stroke="url(#durbarGold24k)" strokeWidth="0.6" />
          <circle cx="82" cy="24.5" r="2.2" fill="url(#crownEmerald)" stroke="url(#durbarGold24k)" strokeWidth="0.6" />
          <circle cx="48" cy="27" r="1.8" fill="url(#chiseledShine)" />
          <circle cx="92" cy="27" r="1.8" fill="url(#chiseledShine)" />

          {/* ============================================================== */}
          {/* 2. DURBAR HERALDIC SHIELD (OUTER 3D GOLD RIM + INNER OBSIDIAN) */}
          {/* ============================================================== */}
          {/* Outer Shield Gold Border */}
          <path
            d="M26 31 Q70 26 114 31 C112 73 98 103 70 119 C42 103 28 73 26 31 Z"
            fill="url(#durbarGold24k)"
            stroke="url(#chiseledShine)"
            strokeWidth="1.2"
          />

          {/* Inner Recessed Obsidian Field */}
          <path
            d="M31 35 Q70 31 109 35 C107 72 94 99 70 113 C46 99 33 72 31 35 Z"
            fill="url(#shieldObsidian)"
            stroke="url(#durbarGold24k)"
            strokeWidth="1"
          />

          {/* Fine Inner Shield Golden Filigree Trim */}
          <path
            d="M36 39 Q70 36 104 39 C102 70 91 94 70 107 C49 94 38 70 36 39 Z"
            fill="none"
            stroke="url(#durbarGold24k)"
            strokeWidth="0.75"
            strokeDasharray="2 1.5"
            opacity="0.7"
          />

          {/* ============================================================== */}
          {/* 3. FLANKING NEPALI LOTUS MOTIFS (कमल पुष्प)                   */}
          {/* ============================================================== */}
          {/* Left Floral Lotus Branch */}
          <path
            d="M38 60 C35 66 38 74 42 78 C39 74 38 68 41 62 Z"
            fill="url(#durbarGold24k)"
            opacity="0.85"
          />
          <path
            d="M37 72 C35 79 39 86 44 90 C40 86 39 79 41 74 Z"
            fill="url(#durbarGold24k)"
            opacity="0.75"
          />

          {/* Right Floral Lotus Branch */}
          <path
            d="M102 60 C105 66 102 74 98 78 C101 74 102 68 99 62 Z"
            fill="url(#durbarGold24k)"
            opacity="0.85"
          />
          <path
            d="M103 72 C105 79 101 86 96 90 C100 86 101 79 99 74 Z"
            fill="url(#durbarGold24k)"
            opacity="0.75"
          />

          {/* ============================================================== */}
          {/* 4. CHISELED IMPERIAL "TD" INTERLOCKING MONOGRAM                 */}
          {/* ============================================================== */}
          {/* LETTER "T" Top Crossbar with Classical Serif Flairs */}
          <path
            d="M48 48 L92 48 L92 53.5 L86 53.5 C83 53.5 81 54 81 56 L81 57 L74 57 L74 56 C74 54 72 53.5 69 53.5 L63 53.5 C60 53.5 58 54 58 56 L58 57 L51 57 L51 53.5 C49 53.5 48 53.5 48 48 Z"
            fill="url(#chiseledShine)"
          />
          {/* LETTER "T" Vertical Stem & Sculpted Base */}
          <path
            d="M66 54 L74 54 L74 88 L79 88 L79 92 L61 92 L61 88 L66 88 Z"
            fill="url(#chiseledShine)"
          />

          {/* LETTER "D" Intertwined Majestic Arch */}
          <path
            d="M56 53 C64 51, 86 52, 90 68 C93 80, 84 90, 71 90 L61 90 L61 85 L69 85 C78 85, 84 79, 82 70 C80 61, 72 57, 62 57 L56 57 Z"
            fill="url(#durbarGold24k)"
            stroke="url(#chiseledShine)"
            strokeWidth="0.8"
          />

          {/* Monogram Highlight Bevels */}
          <path
            d="M68 56 L72 56 L72 87 L68 87 Z"
            fill="#FFFBEB"
            opacity="0.4"
          />

          {/* ============================================================== */}
          {/* 5. ROYAL THREE STARS OF EXCELLENCE (तृष्णा दरबार)               */}
          {/* ============================================================== */}
          {/* Center Main Star */}
          <polygon
            points="70,98 71.8,102.5 76.5,102.5 72.8,105.2 74.2,109.8 70,107 65.8,109.8 67.2,105.2 63.5,102.5 68.2,102.5"
            fill="url(#chiseledShine)"
          />
          {/* Left Star */}
          <polygon
            points="58,99 59.4,102.5 63,102.5 60.1,104.6 61.2,108.2 58,106 54.8,108.2 55.9,104.6 53,102.5 56.6,102.5"
            fill="url(#durbarGold24k)"
          />
          {/* Right Star */}
          <polygon
            points="82,99 83.4,102.5 87,102.5 84.1,104.6 85.2,108.2 82,106 78.8,108.2 79.9,104.6 77,102.5 80.6,102.5"
            fill="url(#durbarGold24k)"
          />

          {/* ============================================================== */}
          {/* 6. BOTTOM ROYAL BASE PEDESTAL & RIBBON SCROLL                  */}
          {/* ============================================================== */}
          <path
            d="M38 120 Q70 126 102 120 L105 127 Q70 133 35 127 Z"
            fill="url(#chiseledShine)"
            stroke="url(#durbarGold24k)"
            strokeWidth="0.8"
          />
          {/* Small diamond studs on banner */}
          <polygon points="70,123.5 72.5,126 70,128.5 67.5,126" fill="#78350F" />
          <polygon points="54,122.5 56,124.5 54,126.5 52,124.5" fill="#78350F" />
          <polygon points="86,122.5 88,124.5 86,126.5 84,124.5" fill="#78350F" />
        </svg>

        {/* Glossy Upper Edge Light Glint */}
        <div className="absolute inset-x-2 top-0.5 h-[40%] rounded-t-xl bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
      </div>

      {/* 👑 Bespoke Royal Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-[0.14em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-200 dark:via-amber-400 dark:to-yellow-300 drop-shadow-[0_1px_2px_rgba(217,119,6,0.3)] font-serif ${
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
            <span className="hidden md:inline-flex text-[9px] font-black tracking-widest text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/40 uppercase shadow-xs">
              RESTRO & BAR
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-800/90 dark:text-amber-400/90 tracking-wide font-sans">
            तृष्णा दरबार • शाही स्वाद र आतिथ्य
          </span>
        </div>
      )}
    </div>
  );
}
