import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator as CalculatorIcon, 
  X, 
  Divide, 
  Minus, 
  Plus, 
  Equal, 
  Delete,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickCalculatorProps {
  style?: number;
  onClose?: () => void;
  className?: string;
}

export default function QuickCalculator({ style = 1, onClose, className }: QuickCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = useCallback((num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(prev => prev === '0' ? num : prev + num);
    }
  }, [isNewNumber]);

  const handleOperator = useCallback((op: string) => {
    setEquation(display + ' ' + op + ' ');
    setIsNewNumber(true);
  }, [display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  }, []);

  const handleCalculate = useCallback(() => {
    try {
      // Use Function constructor instead of eval for slightly better safety/performance
      // though in this controlled environment eval is usually fine for simple math
      const result = new Function(`return ${equation}${display}`)();
      setDisplay(String(Number(result.toFixed(8))));
      setEquation('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setEquation('');
      setIsNewNumber(true);
    }
  }, [equation, display]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for calculator keys to avoid page scrolling etc.
      const calculatorKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', 'Enter', '=', 'Backspace', 'Escape', 'c', 'C'];
      if (calculatorKeys.includes(e.key)) {
        e.preventDefault();
      }

      if (/[0-9.]/.test(e.key)) {
        handleNumber(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        handleCalculate();
      } else if (e.key === 'Backspace') {
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, handleCalculate, handleClear]);

  const renderCalculator = () => {
    const buttons = [
      'C', 'DEL', '/',
      '7', '8', '9', '*',
      '4', '5', '6', '-',
      '1', '2', '3', '+',
      '0', '.', '='
    ];

    const getButtonStyle = (btn: string) => {
      switch (style) {
        case 2: return "bg-white/5 border-white/5 hover:bg-white/10 text-white rounded-xl";
        case 3: return "bg-black border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 rounded-none font-mono";
        case 4: return "bg-amber-900/20 border-amber-500/30 text-amber-200 hover:bg-amber-500/20 rounded-full font-serif italic";
        case 5: return "bg-white border-2 border-black text-black hover:bg-black hover:text-white rounded-none font-black italic";
        case 6: return "bg-white/10 backdrop-blur-md border-white/20 text-white rounded-2xl hover:bg-white/20";
        case 7: return "bg-[#a3b18a] border-zinc-800/20 text-zinc-900 hover:bg-[#94a3b8] rounded-md font-mono";
        case 8: return btn === '=' ? "bg-red-600 text-white rounded-full" : "bg-blue-600/20 border-blue-600 text-blue-400 rounded-none";
        case 9: return "bg-black border-pink-500/50 text-pink-400 hover:shadow-[0_0_10px_rgba(236,72,153,0.5)] rounded-lg";
        case 10: return "bg-black border-green-500/30 text-green-500 hover:bg-green-500/10 rounded-none font-mono";
        case 11: return "bg-zinc-100 border-zinc-300 text-zinc-900 hover:bg-zinc-200 rounded-lg shadow-sm";
        case 12: return "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 rounded-sm font-serif";
        case 13: return "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-md";
        case 14: return "bg-white/5 border-white/10 text-white hover:bg-primary/20 hover:border-primary/50 rounded-xl transition-all duration-300";
        case 15: return "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white rounded-full";
        case 16: return "bg-yellow-400 border-black text-black hover:bg-black hover:text-yellow-400 rounded-none font-black";
        case 17: return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 rounded-3xl";
        case 18: return "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20 rounded-lg italic";
        case 19: return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl font-mono";
        case 20: return "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-2xl";
        default: return "bg-white/5 border-white/10 hover:bg-white/20 text-white rounded-2xl";
      }
    };

    const containerStyle = () => {
      switch (style) {
        case 2: return "bg-zinc-950 border-white/5 rounded-[2rem]";
        case 3: return "bg-black border-cyan-500 rounded-none";
        case 4: return "bg-[#0a0a0a] border-amber-500/30 rounded-[3rem] font-serif";
        case 5: return "bg-white border-4 border-black rounded-none";
        case 6: return "bg-white/5 backdrop-blur-3xl border-white/10 rounded-[2.5rem]";
        case 7: return "bg-[#94a3b8] border-zinc-800 rounded-xl";
        case 8: return "bg-zinc-100 border-black rounded-none";
        case 9: return "bg-black border-pink-500/30 rounded-2xl";
        case 10: return "bg-black border-green-500/50 rounded-lg font-mono";
        case 11: return "bg-zinc-50 border-zinc-200 rounded-2xl shadow-xl";
        case 12: return "bg-amber-50 border-amber-200 rounded-sm font-serif";
        case 13: return "bg-slate-950 border-slate-800 rounded-md";
        case 14: return "bg-black/80 border-primary/30 rounded-3xl";
        case 15: return "bg-zinc-950 border-zinc-900 rounded-full p-10";
        case 16: return "bg-yellow-400 border-4 border-black rounded-none";
        case 17: return "bg-indigo-950/50 border-indigo-500/30 rounded-[2rem]";
        case 18: return "bg-orange-950/50 border-orange-500/30 rounded-xl";
        case 19: return "bg-emerald-950/50 border-emerald-500/30 rounded-2xl";
        case 20: return "bg-rose-950/50 border-rose-500/30 rounded-3xl";
        default: return "bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem]";
      }
    };

    const displayAreaStyle = () => {
      switch (style) {
        case 7: return "bg-[#a3b18a] p-4 rounded-lg border-2 border-zinc-800/20 shadow-inner mb-4 text-right";
        case 10: return "bg-black border-b border-green-500/30 p-4 mb-4 text-right text-green-500";
        default: return "bg-white/5 p-6 rounded-3xl mb-6 text-right";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={cn("p-4 md:p-6 luxury-shadow z-[10000] w-[min(320px,94vw)] max-h-[95vh] overflow-y-auto flex flex-col border", containerStyle(), className)}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <CalculatorIcon size={14} className="text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">Shian Calc</h4>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 py-0 px-2 rounded-full hidden md:flex">Style {style}</Badge>
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

        <div className={displayAreaStyle()}>
          <div className="text-[10px] opacity-40 h-4 overflow-hidden truncate">{equation}</div>
          <div className="text-4xl font-black tracking-tighter text-white truncate">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button 
            className={cn("col-span-2 h-12", getButtonStyle('C'))}
            onClick={handleClear}
          >
            CLEAR
          </Button>
          <Button 
            className={cn("h-12", getButtonStyle('DEL'))}
            onClick={() => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0')}
          >
            <Delete size={16} />
          </Button>
          <Button 
            className={cn("h-12", getButtonStyle('/'))}
            onClick={() => handleOperator('/')}
          >
            <Divide size={16} />
          </Button>

          {['7', '8', '9'].map(n => (
            <Button key={n} className={cn("h-12", getButtonStyle(n))} onClick={() => handleNumber(n)}>{n}</Button>
          ))}
          <Button className={cn("h-12", getButtonStyle('*'))} onClick={() => handleOperator('*')}><X size={16} /></Button>

          {['4', '5', '6'].map(n => (
            <Button key={n} className={cn("h-12", getButtonStyle(n))} onClick={() => handleNumber(n)}>{n}</Button>
          ))}
          <Button className={cn("h-12", getButtonStyle('-'))} onClick={() => handleOperator('-')}><Minus size={16} /></Button>

          {['1', '2', '3'].map(n => (
            <Button key={n} className={cn("h-12", getButtonStyle(n))} onClick={() => handleNumber(n)}>{n}</Button>
          ))}
          <Button className={cn("h-12", getButtonStyle('+'))} onClick={() => handleOperator('+')}><Plus size={16} /></Button>

          <Button className={cn("col-span-2 h-12", getButtonStyle('0'))} onClick={() => handleNumber('0')}>0</Button>
          <Button className={cn("h-12", getButtonStyle('.'))} onClick={() => handleNumber('.')}>.</Button>
          <Button className={cn("h-12 bg-primary text-primary-foreground hover:bg-primary/90", getButtonStyle('='))} onClick={handleCalculate}><Equal size={16} /></Button>
        </div>
      </motion.div>
    );
  };

  return renderCalculator();
}

// Helper to define 20 styles
export const calculatorStyles = [
  { id: 1, name: 'Modern Glass' },
  { id: 2, name: 'Minimalist' },
  { id: 3, name: 'Cyberpunk' },
  { id: 4, name: 'Luxury Gold' },
  { id: 5, name: 'Bold Brutalist' },
  { id: 6, name: 'Glass Morphic' },
  { id: 7, name: 'Retro LCD' },
  { id: 8, name: 'Bauhaus' },
  { id: 9, name: 'Neon Sign' },
  { id: 10, name: 'Terminal' },
  { id: 11, name: 'Swiss Rail' },
  { id: 12, name: 'Art Deco' },
  { id: 13, name: 'Futuristic HUD' },
  { id: 14, name: 'Origami' },
  { id: 15, name: 'Zen Minimal' },
  { id: 16, name: 'Pop Art' },
  { id: 17, name: 'Material You' },
  { id: 18, name: 'Skeuomorphic' },
  { id: 19, name: 'Monochrome' },
  { id: 20, name: 'Vibrant' }
];
