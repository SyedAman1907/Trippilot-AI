import React from 'react';
import travelBg from '../../assets/images/chatgpt-travel-bg.png';

/**
 * CinematicTravelBackground
 * 
 * Living Cinematic Travel Experience layered over the exact visual asset:
 * "ChatGPT Image Sep 25, 2026, 11_59_53 PM.png"
 * 
 * Strict Z-Index Hierarchy:
 * 0 = Base Image & Cinematic Gradient Overlay
 * 1 = Atmospheric Clouds, Ocean Water Shimmer & Sunset Warmth
 * 2 = Moving Airplane & Luminous Jet Flight Trail
 * 3 = Highway Bus, Moving Cars & Road Light Streaks
 * 4 = Cafe Steam/Glow, Shopping Mall Neon & City Window Twinkles
 * 10 = Application UI (in LandingPage)
 * 100 = Navbar & Modals
 */
export default function CinematicTravelBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* ==============================================================
          LAYER 0: EXACT BASE BACKGROUND IMAGE & CINEMATIC GRADIENT OVERLAY
          ============================================================== */}
      {/* Base Image: 100% visible, cover, centered, uncropped original composition */}
      <img
        src={travelBg}
        alt="TripPilot Cinematic Travel Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      {/* Cinematic Dark Gradient Overlay (Exact formula requested: 90deg, 0.65 -> 0.30 -> 0.60) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(90deg, rgba(3,5,15,0.65), rgba(3,5,15,0.30), rgba(3,5,15,0.60))'
        }}
      />

      {/* ==============================================================
          LAYER 1: ATMOSPHERE (Clouds, Ocean Shimmer, Sunset Horizon Glow)
          Z-Index: 1
          ============================================================== */}
      {/* 1.1 Sunset Horizon Radial Warmth */}
      <div className="absolute top-[16%] left-[20%] right-[20%] h-36 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-400/20 via-rose-500/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* 1.2 Drifting Cloud Layer (60s infinite linear) */}
      <div className="absolute top-[8%] inset-x-0 h-40 pointer-events-none overflow-hidden opacity-25 z-[1]">
        <div className="w-[180%] h-full flex items-center animate-cloud-drift-layer">
          <div className="w-1/2 h-20 bg-gradient-to-r from-transparent via-purple-300/30 via-amber-100/20 to-transparent rounded-full blur-2xl" />
          <div className="w-1/2 h-24 bg-gradient-to-r from-transparent via-rose-300/20 via-amber-200/25 to-transparent rounded-full blur-3xl ml-12" />
        </div>
      </div>

      {/* 1.3 Ocean Water Shimmer across the bay (12s infinite alternate) */}
      <div className="absolute top-[40%] sm:top-[43%] inset-x-0 h-28 pointer-events-none overflow-hidden opacity-35 z-[1] mix-blend-screen">
        <div className="w-full h-full animate-ocean-shimmer bg-gradient-to-r from-transparent via-white/20 via-amber-200/25 via-violet-300/20 to-transparent blur-[1px]" />
      </div>

      {/* ==============================================================
          LAYER 2: MOVING AIRPLANE & LUMINOUS FLIGHT TRAIL
          Z-Index: 2
          Path: LEFT TOP -> RIGHT TOP (20s infinite linear)
          ============================================================== */}
      <div className="absolute top-[6%] sm:top-[8%] left-0 w-full pointer-events-none overflow-hidden h-36 z-[2]">
        <div className="animate-airplane-flight flex items-center">
          {/* Luminous Flight Trail (violet -> pink -> gold) */}
          <div
            className="w-40 sm:w-64 h-[2.5px] rounded-full blur-[0.6px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(239,68,68,.4), rgba(234,179,8,.2))'
            }}
          />
          {/* Sleek semi-transparent foreground airliner */}
          <div className="relative -ml-1 text-white/85 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] flex items-center">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 rotate-45 transform"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            {/* Wingtip Navigation Lights */}
            <span className="absolute -top-1 left-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)] animate-ping [animation-duration:1.2s]" />
            <span className="absolute -bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(253,230,138,1)] animate-ping [animation-duration:1.5s]" />
            {/* Engine Jet Flare */}
            <span className="absolute -left-1 w-5 h-2 bg-gradient-to-r from-amber-300/60 to-transparent blur-[1px]" />
          </div>
        </div>
      </div>

      {/* Background static airplane subtle navigation beacons (Option A visual harmony) */}
      <div className="absolute top-[16%] left-[25%] sm:left-[35%] w-24 h-12 pointer-events-none z-[2] opacity-70">
        <span className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)] animate-ping [animation-duration:2.2s]" />
        <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(253,230,138,1)] animate-ping [animation-duration:2.5s]" />
      </div>

      {/* ==============================================================
          LAYER 3: MOVING BUS, CARS & ROAD LIGHT STREAKS
          Z-Index: 3
          Aligned with the road perspective along bottom of viewport
          ============================================================== */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 pointer-events-none overflow-hidden z-[3]">
        
        {/* Road Ambient Corridor */}
        <div className="absolute bottom-4 inset-x-0 h-6 bg-gradient-to-r from-rose-500/10 via-amber-400/10 to-violet-500/10 blur-sm" />

        {/* Moving Road Light Streaks */}
        <div className="absolute bottom-8 left-0 w-72 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-yellow-100 blur-[1px] animate-road-streak-ltr" />
        <div className="absolute bottom-12 right-0 w-80 h-[2px] bg-gradient-to-l from-transparent via-red-600/70 to-rose-400 blur-[1px] animate-road-streak-rtl" />

        {/* 3.1 Moving Highway Bus (12s infinite linear, Left -> Right along road curve) */}
        <div className="absolute bottom-6 left-0 animate-bus-road">
          <div className="relative flex items-center transform scale-75 sm:scale-90">
            {/* Taillight glow */}
            <div className="w-2.5 h-4 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,1)] mr-0.5 rounded-[1px]" />
            {/* Bus Body with Passenger Windows */}
            <div className="w-24 sm:w-28 h-6 bg-gradient-to-r from-[#170a2b] via-[#2d1252] to-[#170a2b] rounded-t-md border-t border-r border-violet-400/40 flex items-center justify-around px-2 shadow-xl">
              <div className="w-2.5 h-2.5 bg-amber-100/90 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.9)]" />
              <div className="w-2.5 h-2.5 bg-amber-100/90 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.9)]" />
              <div className="w-2.5 h-2.5 bg-amber-100/90 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.9)]" />
              <div className="w-2.5 h-2.5 bg-amber-100/90 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.9)]" />
              <div className="w-2.5 h-2.5 bg-amber-100/90 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.9)]" />
            </div>
            {/* Forward Headlight Beam */}
            <div className="w-16 h-4 bg-gradient-to-r from-amber-100/80 to-transparent blur-[1px]" />
          </div>
        </div>

        {/* 3.2 Car 1: Crimson Sports Car (8s loop, Left -> Right) */}
        <div className="absolute bottom-8 left-0 animate-car-1">
          <div className="relative flex items-center transform scale-75 sm:scale-85">
            <div className="w-4 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] mr-0.5" />
            <div className="w-9 h-3.5 bg-gradient-to-r from-red-700 via-rose-500 to-red-600 rounded-t-md shadow-md relative">
              <div className="absolute top-0.5 left-2 w-4 h-1.5 bg-sky-200/50 rounded-t-[1px]" />
            </div>
            <div className="w-12 h-[3px] bg-gradient-to-r from-amber-200 to-transparent shadow-[0_0_10px_rgba(253,230,138,0.9)]" />
          </div>
        </div>

        {/* 3.3 Car 2: Gold Travel Taxi (11s loop, Left -> Right, delayed) */}
        <div className="absolute bottom-7 left-0 animate-car-2">
          <div className="relative flex items-center transform scale-75 sm:scale-85">
            <div className="w-3.5 h-[2px] bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] mr-0.5" />
            <div className="w-10 h-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-t-sm relative">
              <div className="absolute -top-1 left-4 w-2.5 h-1 bg-amber-100 shadow-[0_0_6px_rgba(253,230,138,1)] rounded-t-[1px]" />
              <div className="absolute top-0.5 left-2 w-5 h-1.5 bg-slate-900/60 rounded-t-[1px]" />
            </div>
            <div className="w-10 h-[3px] bg-gradient-to-r from-amber-100 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.8)]" />
          </div>
        </div>

        {/* 3.4 Car 3: Distant Counter-Lane Cruiser (14s loop, Right -> Left) */}
        <div className="absolute bottom-12 right-0 animate-car-3 hidden sm:block">
          <div className="relative flex items-center flex-row-reverse transform scale-70">
            <div className="w-3.5 h-[2px] bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] ml-0.5" />
            <div className="w-9 h-3.5 bg-gradient-to-l from-violet-600 to-purple-800 rounded-t-md relative">
              <div className="absolute top-0.5 right-2 w-4 h-1.5 bg-sky-200/40 rounded-t-[1px]" />
            </div>
            <div className="w-10 h-[3px] bg-gradient-to-l from-amber-100 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.8)]" />
          </div>
        </div>

      </div>

      {/* ==============================================================
          LAYER 4: AMBIENT EFFECTS (Cafe Steam, Shopping Mall & City Lights)
          Z-Index: 4
          ============================================================== */}
      {/* 4.1 Cafe on Lower Left: Rising Table Steam + Warm Lantern Glow */}
      <div className="absolute bottom-[16%] left-[4%] sm:left-[8%] w-48 sm:w-64 h-32 pointer-events-none z-[4]">
        {/* Warm Cafe Lantern Glow */}
        <div className="absolute bottom-2 left-6 w-28 h-20 rounded-full bg-amber-400/20 blur-xl animate-cafe-warm" />

        {/* Coffee Steam Wisp 1 (4s infinite, bottom -> top, opacity 0 -> 0.5 -> 0) */}
        <div className="absolute bottom-8 left-12 w-6 h-10 overflow-visible">
          <svg className="w-full h-full animate-cafe-steam" viewBox="0 0 24 40" fill="none">
            <path
              d="M6,38 C3,28 10,20 6,10 C4,4 7,1 8,0"
              stroke="rgba(254, 243, 199, 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* Coffee Steam Wisp 2 */}
        <div className="absolute bottom-9 left-20 w-6 h-10 overflow-visible">
          <svg className="w-full h-full animate-cafe-steam [animation-delay:2s]" viewBox="0 0 24 40" fill="none">
            <path
              d="M8,38 C11,28 4,18 9,8 C11,3 8,1 7,0"
              stroke="rgba(254, 243, 199, 0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 4.2 Shopping Mall on Right: Purple Neon Glow + Gold Lighting */}
      <div className="absolute top-[44%] right-[4%] sm:right-[10%] w-72 sm:w-96 h-40 pointer-events-none z-[4]">
        {/* Mall Neon Architectural Canopy Glow (4-6s duration, opacity 0.7 -> 1 -> 0.8) */}
        <div className="absolute bottom-4 right-8 w-36 sm:w-48 h-8 rounded-t-full bg-gradient-to-r from-violet-500/35 via-purple-300/40 to-amber-300/30 blur-[3px] animate-mall-lighting" />
        
        {/* Shopping Center Display Window Lights */}
        <div className="absolute bottom-2 right-14 w-12 h-3 bg-amber-200/50 rounded-[1px] blur-[1px] animate-mall-lighting [animation-delay:1.5s]" />
      </div>

      {/* 4.3 City Skyline: Staggered Window Twinkles (opacity 0.6 -> 1 -> 0.7) */}
      <div className="absolute top-[42%] right-[10%] sm:right-[16%] w-60 h-32 pointer-events-none z-[4]">
        <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-amber-200 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.9)] animate-city-window [animation-delay:0s]" />
        <div className="absolute top-10 right-20 w-1.5 h-1 bg-amber-100 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.8)] animate-city-window [animation-delay:1.4s]" />
        <div className="absolute top-14 right-10 w-1 h-1.5 bg-violet-200 rounded-[1px] shadow-[0_0_4px_rgba(167,139,250,0.8)] animate-city-window [animation-delay:2.6s]" />
        <div className="absolute top-6 right-32 w-1.5 h-1 bg-amber-300 rounded-[1px] shadow-[0_0_4px_rgba(253,230,138,0.9)] animate-city-window [animation-delay:1.9s]" />
        
        {/* Rooftop Red Warning Strobe */}
        <div className="absolute top-0 right-16 w-1 h-1 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)] animate-ping [animation-duration:2s]" />
      </div>
    </div>
  );
}
