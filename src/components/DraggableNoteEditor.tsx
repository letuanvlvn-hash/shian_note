import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, GripHorizontal, Maximize2, Minimize2, Mic, MicOff, Table as TableIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '../types';
import { cn } from '@/lib/utils';
import SpreadsheetEditor from './SpreadsheetEditor';

interface DraggableNoteEditorProps {
  note: Note;
  onClose: () => void;
  onSave: (updatedNote: Note) => Promise<void>;
  zIndex: number;
  onFocus: () => void;
  initialPosition?: { x: number; y: number };
}

export default function DraggableNoteEditor({ 
  note, 
  onClose, 
  onSave, 
  zIndex, 
  onFocus,
  initialPosition = { x: 100, y: 100 }
}: DraggableNoteEditorProps) {
  const [editingNote, setEditingNote] = useState<Note>({ ...note });
  const [isSaving, setIsSaving] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState({ 
    width: note.type === 'sheet' ? 600 : 450, 
    height: note.type === 'sheet' ? 500 : 550 
  });
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop();
        }, 3000);

        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalTranscript) {
          setEditingNote(prev => ({
            ...prev,
            content: prev.content + (prev.content ? ' ' : '') + finalTranscript
          }));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
      
      silenceTimerRef.current = setTimeout(() => {
        recognitionRef.current?.stop();
      }, 5000); 
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editingNote);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragListener={!isMinimized}
      initial={{ opacity: 0, scale: 0.9, x: initialPosition.x, y: initialPosition.y }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        height: isMinimized ? '48px' : size.height,
        width: isMinimized ? '250px' : size.width
      }}
      onMouseDown={onFocus}
      style={{ zIndex, position: 'fixed', top: 0, left: 0 }}
      className={cn(
        "border border-white/10 rounded-2xl luxury-shadow overflow-hidden flex flex-col pointer-events-auto backdrop-blur-2xl",
        isMinimized ? "bg-zinc-900/95" : "bg-zinc-950"
      )}
    >
      {/* Header / Drag Handle */}
      <div 
        className="h-12 px-4 flex items-center justify-between border-b border-white/5 cursor-move bg-white/10 hover:bg-white/20 transition-colors shrink-0"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <GripHorizontal size={14} className="text-muted-foreground shrink-0" />
          <span className="text-[10px] uppercase tracking-widest font-bold truncate opacity-80 flex items-center gap-2">
            {editingNote.type === 'sheet' ? <TableIcon size={12} /> : <FileText size={12} />}
            {isMinimized ? editingNote.title : `Chỉnh sửa ${editingNote.type === 'sheet' ? 'bảng tính' : 'ghi chú'}`}
          </span>
        </div>
        
        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-lg hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-lg hover:bg-red-500/20 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 space-y-4 flex-1 flex flex-col overflow-hidden"
          >
            <div className="space-y-1.5 shrink-0">
              <label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Tiêu đề</label>
              <Input 
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="bg-white/[0.02] border-white/5 focus:border-white/20 h-10 text-base font-serif italic"
              />
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                  {editingNote.type === 'sheet' ? 'Dữ liệu bảng' : 'Nội dung'}
                </label>
                {editingNote.type !== 'sheet' && (
                  <div className="flex items-center gap-3">
                    <AnimatePresence>
                      {interimTranscript && (
                        <motion.span 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] text-primary/70 font-medium italic truncate max-w-[150px]"
                        >
                          "{interimTranscript}..."
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleListening}
                      className={cn(
                        "h-6 px-2 text-[8px] uppercase tracking-widest font-bold gap-1.5 rounded-full transition-all",
                        isListening ? "bg-primary/20 text-primary animate-pulse" : "hover:bg-white/5 text-muted-foreground"
                      )}
                    >
                      {isListening ? <Mic size={10} /> : <MicOff size={10} />}
                      {isListening ? 'Đang nghe...' : 'Nhập bằng giọng nói'}
                    </Button>
                  </div>
                )}
              </div>
              
              {editingNote.type === 'sheet' ? (
                <SpreadsheetEditor 
                  data={editingNote.data} 
                  onChange={(newData) => setEditingNote({...editingNote, data: newData})} 
                />
              ) : (
                <Textarea 
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="bg-white/[0.02] border-white/5 focus:border-white/20 flex-1 resize-none text-sm leading-relaxed"
                />
              )}
            </div>

            <div className="flex gap-4 shrink-0">
              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Danh mục</label>
                <Input 
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                  className="bg-white/[0.02] border-white/5 h-9 text-[10px]"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Ngày</label>
                <Input 
                  value={editingNote.date}
                  readOnly
                  className="bg-white/[0.02] border-white/5 h-9 text-[10px] opacity-50"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 shrink-0">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-white text-black hover:bg-zinc-200 rounded-xl px-6 h-10 text-[10px] uppercase tracking-widest font-bold luxury-shadow"
              >
                {isSaving ? 'Đang lưu...' : (
                  <span className="flex items-center gap-2">
                    <Save size={14} /> Lưu thay đổi
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resize Handle */}
      {!isMinimized && (
        <motion.div
          drag
          dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={(_, info) => {
            setSize(prev => ({
              width: Math.max(300, prev.width + info.delta.x),
              height: Math.max(300, prev.height + info.delta.y)
            }));
          }}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center group/resize"
        >
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full group-hover/resize:bg-white/50 transition-colors" />
        </motion.div>
      )}
    </motion.div>
  );
}
