import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  ArrowRightLeft, 
  Search,
  TrendingUp,
  TrendingDown,
  Globe,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyConverterProps {
  style?: number;
  onClose?: () => void;
  className?: string;
}

const currencies = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1 },
  { code: 'VND', name: 'Việt Nam Đồng', flag: '🇻🇳', rate: 25450 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.92 },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rate: 155.5 },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 0.79 },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rate: 7.23 },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', rate: 1365 },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', rate: 1.35 },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', rate: 36.5 },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.51 },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.37 },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rate: 0.91 },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', rate: 83.5 },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', rate: 91.2 },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', rate: 5.15 },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 18.4 },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rate: 3.67 },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rate: 3.75 },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', rate: 16100 },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', rate: 4.73 },
];

export default function CurrencyConverter({ style = 1, onClose, className }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [search, setSearch] = useState('');

  const convert = (val: string, from: string, to: string) => {
    const fromRate = currencies.find(c => c.code === from)?.rate || 1;
    const toRate = currencies.find(c => c.code === to)?.rate || 1;
    const num = parseFloat(val) || 0;
    return ((num / fromRate) * toRate).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

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
      className={cn("p-4 md:p-6 luxury-shadow z-[10000] w-[min(380px,94vw)] max-h-[95vh] overflow-y-auto flex flex-col border", containerStyle(), className)}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <Coins size={14} className="text-primary" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">Shian FX</h4>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 py-0 px-2 rounded-full hidden md:flex">Live Rates</Badge>
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

      <div className="space-y-4">
        <div className="relative">
          <Input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10 h-16 text-2xl font-black text-white rounded-2xl pl-4 pr-16 focus:ring-primary/50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 uppercase tracking-widest">
            {fromCurrency}
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={swap}
            className="rounded-full bg-primary border-none text-primary-foreground hover:scale-110 transition-transform shadow-lg"
          >
            <ArrowRightLeft size={16} />
          </Button>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Converted Amount</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{toCurrency}</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tighter">
            {convert(amount, fromCurrency, toCurrency)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-2">From</label>
            <select 
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code} className="bg-zinc-900">{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-2">To</label>
            <select 
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code} className="bg-zinc-900">{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white/20">
            <div className="flex items-center gap-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span>Market Open</span>
            </div>
            <span>Updated 1m ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
