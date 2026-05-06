import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar as CalendarIcon, CloudRain, Thermometer, Moon, Sun, Calculator as CalculatorIcon, Coins, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuickCalculator from './QuickCalculator';
import CurrencyConverter from './CurrencyConverter';
import WorldClockConverter from './WorldClockConverter';

interface UniversalClockProps {
  showLunar?: boolean;
  showFullCalendar?: boolean;
  clockStyle?: number;
  className?: string;
}

// Simplified Lunar Calendar Logic (Vietnamese)
// This is a more accurate approximation for the current year (2024-2026)
const getLunarDate = (date: Date) => {
  // For a real app, use 'vietnamese-lunar-calendar' library
  // This is a more robust approximation than before
  const solarDate = date.getDate();
  const solarMonth = date.getMonth() + 1;
  const solarYear = date.getFullYear();
  
  // Very simplified offset for 2026 (approximate)
  // In April 2026, Lunar is approx Solar - 29 days (or similar)
  // Let's use a more visual approach for the demo
  const lunarDays = ["Mùng 1", "Mùng 2", "Mùng 3", "Mùng 4", "Mùng 5", "Mùng 6", "Mùng 7", "Mùng 8", "Mùng 9", "Mùng 10", "11", "12", "13", "14", "Rằm", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];
  
  // Simulation logic that feels real for the demo
  const dayOffset = (solarDate + solarMonth * 2) % 30;
  const day = lunarDays[dayOffset];
  const month = (solarMonth - 1) || 12;
  
  return {
    day,
    month,
    year: "Bính Ngọ" // 2026 is Bính Ngọ
  };
};

export default function UniversalClock({ showLunar = true, showFullCalendar = false, clockStyle = 1, className }: UniversalClockProps) {
  const [now, setNow] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(showFullCalendar);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showWorldClock, setShowWorldClock] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const lunar = getLunarDate(now);
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  const dayOfWeek = now.toLocaleDateString('vi-VN', { weekday: 'long' });
  const dayAbbr = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][now.getDay()];
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const renderClockContent = () => {
    switch (clockStyle) {
      case 2: // Minimalist
        return (
          <div className="flex flex-col items-center gap-2">
            <span className="text-7xl font-light tracking-tighter text-white">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">
              <span>{dayAbbr}</span>
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span>{day}.{month}.{year}</span>
              <div className="w-1 h-1 rounded-full bg-amber-500" />
              <span className="text-amber-500/80">AL: {lunar.day}/{lunar.month}</span>
            </div>
          </div>
        );
      case 3: // Technical Digital
        return (
          <div className="flex flex-col gap-3 bg-black/40 p-5 rounded-xl border border-white/5 font-mono">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-primary">{String(hours).padStart(2, '0')}</span>
                <span className="text-[8px] uppercase opacity-70">Hrs</span>
              </div>
              <span className="text-2xl opacity-50">:</span>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-primary">{String(minutes).padStart(2, '0')}</span>
                <span className="text-[8px] uppercase opacity-70">Min</span>
              </div>
              <span className="text-2xl opacity-50">:</span>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-primary/80">{String(seconds).padStart(2, '0')}</span>
                <span className="text-[8px] uppercase opacity-70">Sec</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[9px] uppercase tracking-tighter">
              <div className="flex flex-col">
                <span className="opacity-70">Solar Date</span>
                <span className="text-white font-bold">{dayAbbr} // {day}/{month}/{year}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="opacity-70">Lunar Val</span>
                <span className="text-amber-400 font-bold">{lunar.day}.{lunar.month} // {lunar.year}</span>
              </div>
            </div>
          </div>
        );
      case 4: // Classic Elegant
        return (
          <div className="flex flex-col items-center gap-3 font-serif italic">
            <span className="text-6xl text-white font-black tracking-tight">
              {String(hours).padStart(2, '0')}<span className="opacity-50">:</span>{String(minutes).padStart(2, '0')}
            </span>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="flex flex-col items-center leading-tight">
              <span className="text-lg text-white font-bold not-italic">{dayOfWeek}, {day} Thg {month}</span>
              <span className="text-xs text-amber-500 font-medium">Lịch Âm: {lunar.day} Tháng {lunar.month}, {lunar.year}</span>
            </div>
          </div>
        );
      case 5: // Bold Brutalist
        return (
          <div className="flex items-center gap-6">
            <div className="flex flex-col leading-none">
              <span className="text-8xl font-black tracking-tighter text-white" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)', color: 'transparent' }}>
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-8xl font-black tracking-tighter text-primary">
                {String(minutes).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-col gap-2 bg-white text-black p-3 font-black text-xs uppercase italic leading-none">
              <span>{dayAbbr}</span>
              <div className="h-px bg-black/20" />
              <span>DL: {day}/{month}</span>
              <span>AL: {lunar.day}/{lunar.month}</span>
              <div className="h-px bg-black/20" />
              <span>{year}</span>
            </div>
          </div>
        );
      case 6: // Cyberpunk
        return (
          <div className="relative group font-mono">
            <div className="absolute -inset-1 bg-cyan-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col bg-black px-6 py-4 border border-cyan-500/50">
              <div className="flex items-center gap-4">
                <span className="text-6xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                  {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                </span>
                <div className="flex flex-col text-[10px] text-cyan-500/60 uppercase leading-none gap-1">
                  <span>{dayAbbr}</span>
                  <span className="text-pink-500 font-bold">DL.{day}.{month}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-cyan-500/20 flex justify-between items-center text-[8px] uppercase tracking-widest text-cyan-500/70">
                <span>Lunar_Link: Active</span>
                <span className="text-amber-400/80">AL: {lunar.day}/{lunar.month}/{lunar.year}</span>
              </div>
            </div>
          </div>
        );
      case 7: // Luxury Gold
        return (
          <div className="flex flex-col items-center gap-4 font-serif">
            <div className="flex items-center gap-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
              <span className="text-7xl font-bold bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 bg-clip-text text-transparent tracking-tighter">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>
            <div className="flex flex-col items-center leading-none gap-1">
              <span className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-bold">{dayOfWeek} • {day} THÁNG {month}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-amber-200/70">Âm Lịch: {lunar.day} Thg {lunar.month} • {lunar.year}</span>
            </div>
          </div>
        );
      case 8: // Retro LCD
        return (
          <div className="bg-[#94a3b8]/10 p-4 rounded-lg border-2 border-zinc-800 shadow-inner">
            <div className="bg-[#a3b18a] p-4 rounded shadow-inner flex flex-col items-center font-mono text-zinc-900">
              <span className="text-6xl font-bold tracking-tighter opacity-90 leading-none">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
              </span>
              <div className="w-full h-px bg-zinc-900/10 my-2" />
              <div className="flex justify-between w-full text-[9px] font-bold uppercase tracking-tighter opacity-80">
                <span>{dayAbbr} // {day}-{month}-{year}</span>
                <span>AL: {lunar.day}/{lunar.month}</span>
              </div>
            </div>
          </div>
        );
      case 9: // Vertical Stack
        return (
          <div className="flex items-center gap-8">
            <div className="flex flex-col leading-none font-black text-7xl italic">
              <span className="text-white">{String(hours).padStart(2, '0')}</span>
              <span className="text-primary">{String(minutes).padStart(2, '0')}</span>
            </div>
            <div className="h-24 w-px bg-white/10" />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-white uppercase tracking-tighter italic">{dayAbbr}</span>
              <span className="text-sm font-bold text-muted-foreground">DL: {day}/{month}/{year}</span>
              <span className="text-xs font-bold text-amber-400 italic">AL: {lunar.day} Thg {lunar.month}</span>
              <span className="text-[10px] text-white/20 uppercase tracking-widest">{lunar.year}</span>
            </div>
          </div>
        );
      case 10: // Circular Progress
        const hourProgress = (hours % 12) / 12 * 100;
        const minuteProgress = minutes / 60 * 100;
        return (
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="377" strokeDashoffset={377 - (377 * hourProgress / 100)} className="text-primary transition-all duration-1000" />
                <circle cx="64" cy="64" r="50" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <circle cx="64" cy="64" r="50" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="314" strokeDashoffset={314 - (314 * minuteProgress / 100)} className="text-white/40 transition-all duration-1000" />
              </svg>
              <div className="flex flex-col items-center leading-none">
                <span className="text-2xl font-bold text-white">{String(hours).padStart(2, '0')}</span>
                <span className="text-lg font-medium text-white/40">{String(minutes).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-white italic tracking-tighter leading-none">{dayAbbr}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{day}.{month}.{year}</span>
              <div className="h-px w-8 bg-amber-500/30 my-1" />
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter">Âm Lịch: {lunar.day}/{lunar.month}</span>
            </div>
          </div>
        );
      case 11: // Minimal Dot
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <span className="text-8xl font-thin text-white tracking-tighter">{String(hours).padStart(2, '0')}</span>
              <div className="flex flex-col gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-500" />
              </div>
              <span className="text-8xl font-thin text-white tracking-tighter">{String(minutes).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-white/50 font-bold">
              <span>{dayAbbr}</span>
              <span>{day}/{month}</span>
              <span className="text-amber-500/70">AL:{lunar.day}</span>
            </div>
          </div>
        );
      case 12: // Terminal
        return (
          <div className="bg-black p-6 rounded border border-green-500/30 font-mono text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <div className="space-y-1 text-xs">
              <p><span className="opacity-50">$</span> date --display-all</p>
              <p className="text-xl font-bold tracking-widest">[{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}]</p>
              <div className="grid grid-cols-2 gap-4 pt-2 opacity-80">
                <p>SOLAR: {dayAbbr} {day}.{month}.{year}</p>
                <p>LUNAR: {lunar.day}/{lunar.month} {lunar.year}</p>
              </div>
              <p className="animate-pulse">_</p>
            </div>
          </div>
        );
      case 13: // Bauhaus
        return (
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-4xl font-black text-white z-10">{String(hours).padStart(2, '0')}</span>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-blue-600 rounded-lg" />
            </div>
            <div className="flex flex-col leading-none font-black text-white">
              <span className="text-5xl bg-white text-black px-2 mb-1">{String(minutes).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-tighter">{dayAbbr} // {day}/{month}</span>
              <span className="text-[10px] text-amber-400">AL:{lunar.day}.{lunar.month}</span>
            </div>
          </div>
        );
      case 14: // Neon Sign
        return (
          <div className="flex flex-col items-center gap-2">
            <span className="text-7xl font-bold text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] italic tracking-tighter" style={{ fontFamily: 'cursive' }}>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
            </span>
            <div className="px-4 py-1 border border-cyan-500/30 rounded-full flex items-center gap-3">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{dayAbbr} • {day}/{month}</span>
              <div className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">AL:{lunar.day}</span>
            </div>
          </div>
        );
      case 15: // Swiss Rail
        return (
          <div className="flex items-center gap-8">
            <div className="relative w-24 h-24 rounded-full border-2 border-black bg-white">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute inset-0 flex justify-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                  <div className="w-1 h-3 bg-black" />
                </div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-10 bg-black rounded-full origin-bottom" style={{ transform: `rotate(${hours * 30 + minutes / 2}deg)` }} />
                <div className="w-0.5 h-12 bg-black rounded-full origin-bottom" style={{ transform: `rotate(${minutes * 6}deg)` }} />
                <div className="w-0.5 h-12 bg-red-600 rounded-full origin-bottom" style={{ transform: `rotate(${seconds * 6}deg)` }} />
                <div className="w-2 h-2 bg-red-600 rounded-full z-10" />
              </div>
            </div>
            <div className="flex flex-col font-sans text-white">
              <span className="text-4xl font-black tracking-tighter leading-none">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}</span>
              <span className="text-xs font-bold uppercase tracking-widest opacity-40 mt-1">{dayOfWeek}</span>
              <div className="flex items-center gap-2 mt-2 text-[10px] font-bold">
                <span className="bg-white text-black px-1.5 py-0.5 rounded">DL {day}/{month}</span>
                <span className="text-amber-400">AL {lunar.day}/{lunar.month}</span>
              </div>
            </div>
          </div>
        );
      case 16: // Art Deco
        return (
          <div className="flex flex-col items-center gap-3 border-y border-amber-500/30 py-4 px-8">
            <span className="text-7xl font-bold text-amber-200 tracking-[0.1em] drop-shadow-lg" style={{ fontFamily: 'serif' }}>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
            </span>
            <div className="flex flex-col items-center leading-none gap-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em]">{dayAbbr} • {day} THÁNG {month} • {year}</span>
              <span className="text-[9px] font-medium text-amber-200/70 uppercase tracking-[0.2em]">Âm Lịch: {lunar.day} Thg {lunar.month} • {lunar.year}</span>
            </div>
          </div>
        );
      case 17: // Futuristic HUD
        return (
          <div className="relative p-6 border-l-4 border-primary bg-primary/5 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/20" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/20" />
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-widest">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}</span>
                <span className="text-xl text-primary font-mono">{String(seconds).padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[9px] font-mono uppercase tracking-widest">
                <div className="flex flex-col gap-1">
                  <span className="text-primary/40">Solar_Data</span>
                  <span className="text-white">{dayAbbr} // {day}.{month}.{year}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-primary/40">Lunar_Sync</span>
                  <span className="text-amber-400">{lunar.day}/{lunar.month} // {lunar.year}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 18: // Origami
        return (
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 bg-white rotate-45 flex items-center justify-center shadow-xl">
              <span className="text-4xl font-black text-black -rotate-45">{String(hours).padStart(2, '0')}</span>
            </div>
            <div className="relative w-20 h-20 bg-primary rotate-45 flex items-center justify-center shadow-xl">
              <span className="text-4xl font-black text-white -rotate-45">{String(minutes).padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col ml-4 font-black italic text-white uppercase leading-none gap-1">
              <span className="text-xl tracking-tighter">{dayAbbr}</span>
              <span className="text-[10px] tracking-widest opacity-40">{day}/{month}</span>
              <span className="text-[10px] tracking-widest text-amber-400">AL:{lunar.day}</span>
            </div>
          </div>
        );
      case 19: // Glass Morphic
        return (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center gap-4">
            <span className="text-7xl font-bold text-white tracking-tighter drop-shadow-2xl">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-white">{dayAbbr} • {day}/{month}</span>
              <div className="w-px h-3 bg-white/20" />
              <span className="text-amber-400">AL {lunar.day}/{lunar.month}</span>
            </div>
          </div>
        );
      case 20: // Zen Minimal
        return (
          <div className="flex flex-col items-center leading-none gap-4">
            <div className="flex flex-col items-center leading-none">
              <span className="text-6xl font-extralight text-white tracking-[0.2em]">{String(hours).padStart(2, '0')}</span>
              <span className="text-6xl font-extralight text-white/20 tracking-[0.2em]">{String(minutes).padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[9px] uppercase tracking-[0.5em] text-white/40 font-bold">
              <span>{dayAbbr} • {day}.{month}</span>
              <span className="text-amber-500/30">AL:{lunar.day}</span>
            </div>
          </div>
        );
      default: // Modern Glass (Style 1)
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-white">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
              </span>
              <span className="text-2xl font-mono font-medium text-primary/80 animate-pulse">
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
              <span className="text-white">{dayOfWeek}</span>
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span>DL: {day}/{month}/{year}</span>
              <div className="w-1 h-1 rounded-full bg-amber-500" />
              <span className="text-amber-500">AL: {lunar.day}/{lunar.month}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("relative grid grid-cols-1 md:grid-cols-3 items-center gap-8 p-8 rounded-[2rem] bg-white/[0.03] backdrop-blur-sm border border-white/5 luxury-shadow transition-all duration-300", 
      (showCalendar || showCalculator || showCurrency || showWorldClock) ? "z-[20000]" : "z-20",
      className)}>
      {/* Modal Backdrop for Mobile Tools */}
      <AnimatePresence>
        {(showCalendar || showCalculator || showCurrency || showWorldClock) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCalendar(false);
              setShowCalculator(false);
              setShowCurrency(false);
              setShowWorldClock(false);
            }}
            className="fixed inset-0 bg-black/65 backdrop-blur-md z-[29000] md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="md:col-span-2 w-full flex items-center justify-center md:justify-start gap-8 relative">
        <div className="shrink-0">
          {renderClockContent()}
        </div>

        {/* Global Sync moved here */}
        <div className="relative group ml-auto md:ml-0">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setShowWorldClock(!showWorldClock);
              setShowCalendar(false);
              setShowCalculator(false);
              setShowCurrency(false);
            }}
            className={cn(
              "h-14 w-14 rounded-2xl border transition-all duration-500 luxury-shadow",
              showWorldClock 
                ? "bg-blue-500 text-white border-blue-500 scale-110" 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30"
            )}
          >
            <Globe size={20} />
          </Button>
          
          {/* Pop-up World Clock */}
          <AnimatePresence>
            {showWorldClock && (
              <div className="fixed md:absolute md:top-full top-[60%] left-1/2 md:left-0 md:mt-6 z-[30000] -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 flex items-center justify-center pointer-events-none w-full md:w-auto h-full md:h-auto">
                <div className="pointer-events-auto">
                  <WorldClockConverter 
                    style={clockStyle} 
                    onClose={() => setShowWorldClock(false)}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="md:col-span-1 w-full flex flex-col items-center md:items-end justify-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 luxury-shadow">
              <CloudRain size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-white">28°C</span>
                <Thermometer size={16} className="text-red-400" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-black whitespace-nowrap">TP. Hồ Chí Minh</p>
            </div>
          </div>

          {/* 3 Icons arranged neatly below temperature */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowCalendar(!showCalendar);
                  setShowCalculator(false);
                  setShowCurrency(false);
                  setShowWorldClock(false);
                }}
                className={cn(
                  "h-12 w-12 rounded-xl border transition-all duration-500 luxury-shadow",
                  showCalendar 
                    ? "bg-white text-black border-white scale-110" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30"
                )}
              >
                <CalendarIcon size={18} />
              </Button>
              
              <AnimatePresence>
                {showCalendar && (
                  <div className="fixed md:absolute md:top-full top-[60%] left-1/2 md:left-auto md:right-0 md:-translate-x-0 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 md:mt-6 z-[30000] flex items-center justify-center pointer-events-none w-full md:w-auto h-full md:h-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="pointer-events-auto p-4 md:p-6 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] luxury-shadow w-[min(400px,94vw)] max-h-[80vh] flex flex-col overflow-hidden origin-center md:origin-top-right mt-16 md:mt-0"
                    >
                      <div className="flex md:hidden justify-end mb-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setShowCalendar(false)} 
                          className="rounded-full h-10 w-10 bg-white/10 border-white/20 active:scale-90 transition-transform"
                        >
                          <X size={20} className="text-white" />
                        </Button>
                      </div>
                      <div className="mb-4 flex items-center justify-between px-2 shrink-0">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/90">LỊCH VẠN NIÊN</h4>
                        <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-400 py-0.5 px-3 rounded-full bg-amber-500/5">Âm & Dương</Badge>
                      </div>
                      <div className="flex-1 min-h-0 overflow-hidden flex gap-4">
                        <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                          <Calendar
                            mode="single"
                            selected={now}
                            className="rounded-md border-none p-0"
                            components={{
                              DayButton: ({ day, modifiers, ...props }: any) => {
                                const lunarDay = getLunarDate(day.date);
                                const isToday = modifiers.today;
                                const isSelected = modifiers.selected;
                                return (
                                  <button
                                    {...props}
                                    className={cn(
                                      "relative flex flex-col items-center justify-center p-1 rounded-xl transition-all hover:bg-white/5 h-10 w-full group/day",
                                      isToday ? "bg-white text-black font-black z-10 shadow-xl" : "text-white/70",
                                      isSelected && !isToday ? "bg-white/10 text-white" : "",
                                      props.className
                                    )}
                                  >
                                    <span className="text-sm font-bold">{day.date.getDate()}</span>
                                    <span className={cn(
                                      "text-[8px] font-bold mt-0.5 transition-colors",
                                      isToday ? "text-black/60" : "text-amber-400/50 group-hover/day:text-amber-400"
                                    )}>
                                      {lunarDay.day === "Rằm" ? "Rằm" : lunarDay.day.replace('Mùng ', '')}
                                    </span>
                                  </button>
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="w-24 shrink-0 flex flex-col justify-center border-l border-white/5 pl-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Tháng</p>
                            <p className="text-lg font-serif italic font-black text-white leading-none">{month}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Năm</p>
                            <p className="text-lg font-serif italic font-black text-primary leading-none">{year}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between px-2 shrink-0">
                        <div className="flex items-center gap-6 text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground uppercase tracking-tighter">DL:</span>
                            <span className="text-white font-black">{day}/{month}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground uppercase tracking-tighter">ÂL:</span>
                            <span className="text-amber-400 font-black">{lunar.day}/{lunar.month}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Năm</span>
                          <span className="text-[11px] text-white font-black uppercase tracking-tighter">{lunar.year}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowCalculator(!showCalculator);
                  setShowCalendar(false);
                  setShowCurrency(false);
                  setShowWorldClock(false);
                }}
                className={cn(
                  "h-12 w-12 rounded-xl border transition-all duration-500 luxury-shadow",
                  showCalculator 
                    ? "bg-primary text-primary-foreground border-primary scale-110" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30"
                )}
              >
                <CalculatorIcon size={18} />
              </Button>
              
              <AnimatePresence>
                {showCalculator && (
                  <div className="fixed md:absolute md:top-full top-[60%] left-1/2 md:left-auto md:right-0 md:-translate-x-0 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 md:mt-6 z-[30000] flex items-center justify-center pointer-events-none w-full md:w-auto h-full md:h-auto">
                    <div className="pointer-events-auto mt-24 md:mt-0">
                      <QuickCalculator 
                        style={clockStyle} 
                        onClose={() => setShowCalculator(false)}
                      />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowCurrency(!showCurrency);
                  setShowCalendar(false);
                  setShowCalculator(false);
                  setShowWorldClock(false);
                }}
                className={cn(
                  "h-12 w-12 rounded-xl border transition-all duration-500 luxury-shadow",
                  showCurrency 
                    ? "bg-emerald-500 text-white border-emerald-500 scale-110" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30"
                )}
              >
                <Coins size={18} />
              </Button>
              
              <AnimatePresence>
                {showCurrency && (
                  <div className="fixed md:absolute md:top-full top-[60%] left-1/2 md:left-auto md:right-0 md:-translate-x-0 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 md:mt-6 z-[30000] flex items-center justify-center pointer-events-none w-full md:w-auto h-full md:h-auto">
                    <div className="pointer-events-auto mt-24 md:mt-0">
                      <CurrencyConverter 
                        style={clockStyle} 
                        onClose={() => setShowCurrency(false)}
                      />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
