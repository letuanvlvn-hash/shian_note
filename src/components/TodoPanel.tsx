import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Mic, 
  MicOff, 
  X, 
  Pin, 
  PinOff,
  Trash2,
  ListTodo,
  Clock,
  Type,
  Palette,
  Send,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TodoItem } from '../types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { googleSheetsService } from '../services/googleSheetsService';

interface TodoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  todos: TodoItem[];
  onSync: (todos: TodoItem[]) => Promise<void>;
  appointments: any[];
}

export default function TodoPanel({ isOpen, onClose, isPinned, onTogglePin, todos, onSync, appointments }: TodoPanelProps) {
  const [input, setInput] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [currentStyle, setCurrentStyle] = useState({
    fontSize: 'text-xs',
    fontFamily: 'font-sans',
    color: 'text-white'
  });

  const recognitionRef = useRef<any>(null);

  // Sync today's appointments from Calendar
  useEffect(() => {
    const syncAppointments = () => {
      if (!appointments || appointments.length === 0) return;

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      const todayApps = appointments.filter((app: any) => app.date === today);
      
      const existingTexts = new Set(todos.map(t => t.text));
      const newFromApps = todayApps
        .filter((app: any) => !existingTexts.has(`[Lịch hẹn] ${app.title}`))
        .map((app: any) => ({
          id: `app-${app.id}`,
          text: `[Lịch hẹn] ${app.title}`,
          completed: false,
          createdAt: new Date().toISOString(),
          dueTime: app.time,
          style: { color: 'text-amber-400', fontFamily: 'font-serif', fontSize: 'text-xs' }
        }));
      
      if (newFromApps.length > 0) {
        onSync([...newFromApps, ...todos]);
      }
    };

    syncAppointments();
  }, [appointments, todos, onSync]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Voice input only populates the field, allows user to edit before sending
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueTime: dueTime || undefined,
      style: { ...currentStyle }
    };
    await onSync([newTodo, ...todos]);
    setInput('');
    setDueTime('');
  };

  const toggleTodo = async (id: string) => {
    const newTodos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    await onSync(newTodos);
  };

  const deleteTodo = async (id: string) => {
    const newTodos = todos.filter(t => t.id !== id);
    await onSync(newTodos);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 310 }}
          animate={{ x: 0 }}
          exit={{ x: 310 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            "fixed top-0 right-0 h-full bg-card/95 backdrop-blur-3xl border-l border-white/5 z-[60] flex flex-col luxury-shadow",
            "w-full sm:w-[310px]"
          )}
        >
          <div className="p-8 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5">
                <ListTodo size={18} className="text-primary" />
              </div>
              <h3 className="text-lg font-serif font-bold italic tracking-tight">Ghi chú - Cần làm</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onTogglePin}
                className={cn("rounded-full h-8 w-8", isPinned && "text-primary bg-white/5")}
              >
                {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
              </Button>
              {!isPinned && (
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleTodo(todo.id)}
                      className={cn(
                        "transition-colors",
                        todo.completed ? "text-green-400" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      {todo.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className={cn(
                        "font-medium transition-all",
                        todo.style?.fontSize || 'text-xs',
                        todo.style?.fontFamily || 'font-sans',
                        todo.style?.color || 'text-white',
                        todo.completed && "line-through opacity-40"
                      )}>
                        {todo.text}
                      </span>
                      {todo.dueTime && (
                        <div className="flex items-center gap-1.5 text-[9px] text-primary/60 font-bold uppercase tracking-widest">
                          <Clock size={10} />
                          {todo.dueTime}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full transition-all"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {todos.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                    <ListTodo size={20} className="text-muted-foreground opacity-20" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Danh sách trống</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-4">
            {/* Input Section */}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Nội dung công việc..."
                  className={cn(
                    "h-12 pl-4 pr-12 bg-zinc-900/40 border-white/5 focus:border-white/20 rounded-2xl transition-all",
                    currentStyle.fontSize,
                    currentStyle.fontFamily,
                    currentStyle.color
                  )}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleListening}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl transition-all",
                    isListening ? "text-red-400 bg-red-400/10 animate-pulse" : "text-muted-foreground hover:text-white"
                  )}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="h-10 pl-9 bg-zinc-900/40 border-white/5 rounded-xl text-[10px] uppercase font-bold tracking-widest"
                  />
                </div>
                
                <Popover>
                  <PopoverTrigger className={cn(
                    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                    "h-10 px-3 border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/5 text-muted-foreground"
                  )}>
                    <Palette size={14} />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-zinc-900/95 backdrop-blur-xl border-white/10 p-4 rounded-2xl luxury-shadow">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Cỡ chữ</label>
                        <div className="flex gap-1">
                          {['text-[10px]', 'text-xs', 'text-sm', 'text-base'].map(s => (
                            <button
                              key={s}
                              onClick={() => setCurrentStyle(prev => ({ ...prev, fontSize: s }))}
                              className={cn(
                                "flex-1 h-7 rounded-md text-[9px] font-bold uppercase transition-all",
                                currentStyle.fontSize === s ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"
                              )}
                            >
                              {s.split('-').pop()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Phông chữ</label>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { id: 'font-sans', label: 'Modern' },
                            { id: 'font-serif', label: 'Classic' },
                            { id: 'font-mono', label: 'Technical' }
                          ].map(f => (
                            <button
                              key={f.id}
                              onClick={() => setCurrentStyle(prev => ({ ...prev, fontFamily: f.id }))}
                              className={cn(
                                "h-7 rounded-md text-[9px] font-bold uppercase transition-all",
                                currentStyle.fontFamily === f.id ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"
                              )}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Màu sắc</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { text: 'text-white', bg: 'bg-white' },
                            { text: 'text-red-500', bg: 'bg-red-500' },
                            { text: 'text-emerald-500', bg: 'bg-emerald-500' },
                            { text: 'text-blue-500', bg: 'bg-blue-500' },
                            { text: 'text-amber-500', bg: 'bg-amber-500' },
                            { text: 'text-purple-500', bg: 'bg-purple-500' },
                            { text: 'text-pink-500', bg: 'bg-pink-500' },
                            { text: 'text-cyan-400', bg: 'bg-cyan-400' },
                            { text: 'text-orange-500', bg: 'bg-orange-500' },
                            { text: 'text-lime-400', bg: 'bg-lime-400' }
                          ].map(c => (
                            <button
                              key={c.text}
                              onClick={() => setCurrentStyle(prev => ({ ...prev, color: c.text }))}
                              className={cn(
                                "w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110",
                                c.bg,
                                currentStyle.color === c.text && "ring-2 ring-white ring-offset-2 ring-offset-black"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button 
                  onClick={addTodo}
                  disabled={!input.trim()}
                  className="h-10 px-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  <Send size={14} className="mr-2" />
                  Thêm
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[9px] text-muted-foreground font-medium italic px-1">
              <span>Nhấn Enter để lưu</span>
              <button 
                onClick={() => { setInput(''); setDueTime(''); }}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <RotateCcw size={10} /> Làm mới
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
