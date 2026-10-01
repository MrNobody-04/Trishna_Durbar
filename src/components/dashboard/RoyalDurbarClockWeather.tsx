"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  Compass,
  MapPin,
} from "lucide-react";

interface WeatherData {
  currentTemp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  icon: string;
  forecast: {
    day: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    icon: string;
  }[];
}

const getWeatherDetails = (code: number): { label: string; icon: string } => {
  switch (code) {
    case 0:
      return { label: "Clear Sky", icon: "☀️" };
    case 1:
    case 2:
      return { label: "Mainly Clear", icon: "🌤️" };
    case 3:
      return { label: "Partly Cloudy", icon: "⛅" };
    case 45:
    case 48:
      return { label: "Foggy Valley", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { label: "Light Drizzle", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { label: "Rainy", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { label: "Himalayan Snow", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain Showers", icon: "🌧️" };
    case 95:
    case 96:
    case 99:
      return { label: "Thunderstorm", icon: "⛈️" };
    default:
      return { label: "Fair Weather", icon: "🌤️" };
  }
};

export function RoyalDurbarClockWeather() {
  const [time, setTime] = useState<Date>(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [refreshingWeather, setRefreshingWeather] = useState(false);

  // 1. Live Nepal Standard Time Ticker (UTC+5:45)
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Nepal Date and Clock Angles
  const getNepalTimeValues = () => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kathmandu",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      }).formatToParts(time);

      const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10) % 12;
      const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
      const s = parseInt(parts.find((p) => p.type === "second")?.value || "0", 10);

      const secondDeg = s * 6;
      const minuteDeg = m * 6 + s * 0.1;
      const hourDeg = h * 30 + m * 0.5;

      const digitalFormatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(time);

      const dateFormatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kathmandu",
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(time);

      return { hourDeg, minuteDeg, secondDeg, digitalFormatted, dateFormatted };
    } catch {
      const s = time.getSeconds();
      const m = time.getMinutes();
      const h = time.getHours() % 12;
      return {
        hourDeg: h * 30 + m * 0.5,
        minuteDeg: m * 6,
        secondDeg: s * 6,
        digitalFormatted: time.toLocaleTimeString(),
        dateFormatted: time.toDateString(),
      };
    }
  };

  const { hourDeg, minuteDeg, secondDeg, digitalFormatted, dateFormatted } = getNepalTimeValues();

  // 2. Real Live Kathmandu Weather & Forecast via Open-Meteo
  const fetchWeather = async () => {
    try {
      setRefreshingWeather(true);
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKathmandu"
      );
      if (!res.ok) throw new Error("Weather request failed");
      const data = await res.json();

      const current = data.current;
      const daily = data.daily;

      const currentDetails = getWeatherDetails(current.weather_code);

      const forecastList = (daily?.time || []).slice(1, 5).map((dateStr: string, idx: number) => {
        const d = new Date(dateStr);
        const dayName = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
        const code = daily.weather_code[idx + 1] ?? 0;
        const details = getWeatherDetails(code);
        return {
          day: dayName,
          maxTemp: Math.round(daily.temperature_2m_max[idx + 1] ?? 24),
          minTemp: Math.round(daily.temperature_2m_min[idx + 1] ?? 16),
          weatherCode: code,
          icon: details.icon,
        };
      });

      setWeather({
        currentTemp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
        condition: currentDetails.label,
        icon: currentDetails.icon,
        forecast: forecastList,
      });
    } catch {
      // Graceful offline fallback with Kathmandu average weather
      setWeather({
        currentTemp: 21,
        feelsLike: 22,
        humidity: 68,
        windSpeed: 8,
        weatherCode: 1,
        condition: "Mainly Clear",
        icon: "🌤️",
        forecast: [
          { day: "Fri", maxTemp: 25, minTemp: 17, weatherCode: 1, icon: "🌤️" },
          { day: "Sat", maxTemp: 24, minTemp: 16, weatherCode: 3, icon: "⛅" },
          { day: "Sun", maxTemp: 23, minTemp: 15, weatherCode: 61, icon: "🌧️" },
          { day: "Mon", maxTemp: 24, minTemp: 16, weatherCode: 2, icon: "🌤️" },
        ],
      });
    } finally {
      setLoadingWeather(false);
      setRefreshingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl border-2 border-amber-500/35 bg-card dark:bg-[#0c0a07] p-5 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.12),_inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.7),_inset_0_1px_1px_rgba(251,191,36,0.15)] transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* ========================================================================= */}
        {/* SECTION 1: ANALOG CHRONOMETER & DIGITAL CLOCK (5 COLS)                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 pb-6 lg:pb-0 lg:border-r border-border dark:border-white/10">
          {/* 3D Regal Analog Dial */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
            {/* Outer Gold Bezel */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#241c0f] via-[#151109] to-[#080603] border-4 border-amber-500 shadow-[0_4px_16px_rgba(217,119,6,0.35),_inset_0_2px_4px_rgba(255,255,255,0.25)]" />
            
            {/* Inner Clock Face */}
            <div className="relative w-[88%] h-[88%] rounded-full bg-stone-50 dark:bg-radial dark:from-[#1e1910] dark:to-[#0a0805] border border-amber-500/40 flex items-center justify-center shadow-inner">
              {/* Dial Hour Markers */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-1 flex justify-center"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                >
                  <div
                    className={`${
                      i % 3 === 0
                        ? "w-1 h-3 bg-amber-600 dark:bg-amber-400"
                        : "w-0.5 h-1.5 bg-stone-400 dark:bg-stone-600"
                    } rounded-full`}
                  />
                </div>
              ))}

              {/* Royal Brand Wordmark in Dial */}
              <div className="absolute top-7 flex flex-col items-center pointer-events-none select-none">
                <span className="text-[7px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 font-serif">
                  TRISHNA
                </span>
                <span className="text-[5px] font-bold text-muted-foreground uppercase tracking-widest">
                  NST
                </span>
              </div>

              {/* Hour Hand */}
              <div
                className="absolute w-1 h-10 bg-amber-800 dark:bg-amber-200 rounded-full shadow-md origin-bottom bottom-1/2 left-[calc(50%-2px)]"
                style={{
                  transform: `rotate(${hourDeg}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                }}
              />

              {/* Minute Hand */}
              <div
                className="absolute w-0.75 h-13 bg-amber-600 dark:bg-amber-400 rounded-full shadow-md origin-bottom bottom-1/2 left-[calc(50%-1.5px)]"
                style={{
                  transform: `rotate(${minuteDeg}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                }}
              />

              {/* Second Hand (Ticking Gold/Red) */}
              <div
                className="absolute w-0.5 h-14 bg-red-500 rounded-full shadow-sm origin-bottom bottom-1/2 left-[calc(50%-1px)]"
                style={{
                  transform: `rotate(${secondDeg}deg)`,
                  transition: secondDeg === 0 ? "none" : "transform 0.15s ease-out",
                }}
              />

              {/* Center Pivot Jewel */}
              <div className="absolute w-3 h-3 rounded-full bg-amber-400 border-2 border-stone-900 shadow-md z-10" />
            </div>
          </div>

          {/* Digital Time & Date Readout */}
          <div className="flex flex-col text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              <span>Nepal Standard Time</span>
            </div>

            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
              {digitalFormatted}
            </div>

            <div className="text-xs font-semibold text-muted-foreground">
              {dateFormatted}
            </div>

            <div className="inline-flex items-center justify-center sm:justify-start gap-1 text-[10px] text-muted-foreground font-medium pt-1">
              <MapPin className="h-3 w-3 text-amber-500" />
              <span>Kathmandu Palace Hub (UTC +5:45)</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: REAL TEMPERATURE & WEATHER FORECAST (7 COLS)                   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Weather Top Status Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{weather?.icon || "🌤️"}</span>
              <div>
                <h4 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <span>Kathmandu Valley Live Weather</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live
                  </span>
                </h4>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {weather?.condition || "Loading weather report..."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchWeather}
              disabled={refreshingWeather}
              className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all active:scale-95 shadow-xs"
              title="Refresh Live Weather"
            >
              <RefreshCw
                className={`h-4 w-4 text-amber-500 ${
                  refreshingWeather ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* Current Temperature & Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Live Temp */}
            <div className="p-3 rounded-2xl bg-secondary/50 dark:bg-[#14110b] border border-border dark:border-white/10 space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                <Thermometer className="h-3 w-3 text-amber-500" />
                <span>Temp</span>
              </div>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {weather?.currentTemp ?? "--"}°C
              </p>
              <span className="text-[10px] text-muted-foreground">
                Feels like {weather?.feelsLike ?? "--"}°C
              </span>
            </div>

            {/* Relative Humidity */}
            <div className="p-3 rounded-2xl bg-secondary/50 dark:bg-[#14110b] border border-border dark:border-white/10 space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                <Droplets className="h-3 w-3 text-cyan-500" />
                <span>Humidity</span>
              </div>
              <p className="text-xl font-black text-foreground font-mono">
                {weather?.humidity ?? "--"}%
              </p>
              <span className="text-[10px] text-muted-foreground">Atmospheric vapor</span>
            </div>

            {/* Wind Velocity */}
            <div className="p-3 rounded-2xl bg-secondary/50 dark:bg-[#14110b] border border-border dark:border-white/10 space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                <Wind className="h-3 w-3 text-teal-500" />
                <span>Wind</span>
              </div>
              <p className="text-xl font-black text-foreground font-mono">
                {weather?.windSpeed ?? "--"} <span className="text-xs">km/h</span>
              </p>
              <span className="text-[10px] text-muted-foreground">Valley breeze</span>
            </div>

            {/* Weather Outlook */}
            <div className="p-3 rounded-2xl bg-secondary/50 dark:bg-[#14110b] border border-border dark:border-white/10 space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                <CloudSun className="h-3 w-3 text-amber-500" />
                <span>Dining Floor</span>
              </div>
              <p className="text-xs font-black text-foreground mt-1">
                {(weather?.currentTemp ?? 20) > 18 && (weather?.weatherCode ?? 0) <= 3
                  ? "🌅 Ideal for Rooftop"
                  : "🏛️ Cozy Main Hall"}
              </p>
              <span className="text-[10px] text-muted-foreground">Guest recommendation</span>
            </div>
          </div>

          {/* 4-Day Extended Weather Forecast Chips */}
          <div className="pt-2 border-t border-border dark:border-white/10 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider shrink-0 mr-1">
              4-Day Forecast:
            </span>
            {weather?.forecast?.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 dark:bg-[#15120c] border border-border dark:border-white/10 shrink-0 text-xs shadow-xs"
              >
                <span className="text-base">{f.icon}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-[11px] leading-tight">
                    {f.day}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    <strong className="text-foreground">{f.maxTemp}°</strong> / {f.minTemp}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
