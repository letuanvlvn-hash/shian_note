import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Clock, 
  MapPin,
  Search,
  Zap,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface WorldClockConverterProps {
  style?: number;
  onClose?: () => void;
  className?: string;
}

const timeZones = [
  { city: 'Hồ Chí Minh', country: 'Vietnam', zone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳' },
  { city: 'New York', country: 'USA', zone: 'America/New_York', flag: '🇺🇸' },
  { city: 'London', country: 'UK', zone: 'Europe/London', flag: '🇬🇧' },
  { city: 'Tokyo', country: 'Japan', zone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: 'Paris', country: 'France', zone: 'Europe/Paris', flag: '🇫🇷' },
  { city: 'Beijing', country: 'China', zone: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: 'Seoul', country: 'South Korea', zone: 'Asia/Seoul', flag: '🇰🇷' },
  { city: 'Singapore', country: 'Singapore', zone: 'Asia/Singapore', flag: '🇸🇬' },
  { city: 'Bangkok', country: 'Thailand', zone: 'Asia/Bangkok', flag: '🇹🇭' },
  { city: 'Sydney', country: 'Australia', zone: 'Australia/Sydney', flag: '🇦🇺' },
  { city: 'Dubai', country: 'UAE', zone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'Moscow', country: 'Russia', zone: 'Europe/Moscow', flag: '🇷🇺' },
  { city: 'Berlin', country: 'Germany', zone: 'Europe/Berlin', flag: '🇩🇪' },
  { city: 'Rome', country: 'Italy', zone: 'Europe/Rome', flag: '🇮🇹' },
  { city: 'Hong Kong', country: 'China', zone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { city: 'Mumbai', country: 'India', zone: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'Toronto', country: 'Canada', zone: 'America/Toronto', flag: '🇨🇦' },
  { city: 'Zurich', country: 'Switzerland', zone: 'Europe/Zurich', flag: '🇨🇭' },
  { city: 'Istanbul', country: 'Turkey', zone: 'Europe/Istanbul', flag: '🇹🇷' },
  { city: 'Los Angeles', country: 'USA', zone: 'America/Los_Angeles', flag: '🇺🇸' },
];

export default function WorldClockConverter({ style = 1, onClose, className }: WorldClockConverterProps) {
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, zone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatDate = (date: Date, zone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    }).format(date);
  };

  const filteredZones = timeZones.filter(tz => 
    tz.city.toLowerCase().includes(search.toLowerCase()) || 
    tz.country.toLowerCase().includes(search.toLowerCase())
  );

  const containerStyle = () => {
    switch (style) {
      case 3: return "bg-black border-cyan-500 rounded-none font-mono";
      case 4: return "bg-[#0a0a0a] border-amber-500/30 rounded-[3rem] font-serif";
      case 6: return "bg-white/5 backdrop-blur-3xl border-white/10 rounded-[2.5rem]";
      default: return "bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className={cn("p-4 md:p-6 luxury-shadow z-[10000] w-[min(420px,94vw)] h-[80vh] md:h-[500px] flex flex-col border", containerStyle(), className)}
    >
      <div className="flex items-center justify-between mb-6 px-2 shrink-0">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-primary" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">Global Sync</h4>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 py-0 px-2 rounded-full hidden md:flex">20 Regions</Badge>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClose} 
            className="md:hidden rounded-full h-10 w-10 bg-white/10 border-white/20 active:scale-90 transition-transform"
            aria-label="Close"
          >
            <X size={20} className="text-white" />
          </Button>
        </div>
      </div>

      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
        <Input 
          placeholder="Search city or country..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border-white/10 pl-10 h-10 rounded-xl text-xs text-white placeholder:text-white/10"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {filteredZones.map((tz) => (
          <div 
            key={tz.zone}
            className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{tz.flag}</div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider">{tz.city}</span>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{tz.country}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-black text-white tracking-tighter leading-none">
                {formatTime(now, tz.zone)}
              </span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">
                {formatDate(now, tz.zone)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/20">
          <Zap size={10} className="text-amber-500" />
          <span>Real-time Precision</span>
        </div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-white/20">
          UTC {new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).format(now).split(', ')[1]}
        </div>
      </div>
    </motion.div>
  );
}
