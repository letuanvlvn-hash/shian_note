import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, MoreVertical, Trash2, Edit3, Tag, Save, X as CloseIcon, Layers, Table as TableIcon, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Note } from '../types';
import DraggableNoteEditor from './DraggableNoteEditor';

interface ActiveEditor {
  note: Note;
  zIndex: number;
  position: { x: number; y: number };
}

interface NotesViewProps {
  notes: Note[];
  onSync: (notes: Note[]) => Promise<void>;
}

export default function NotesView({ notes, onSync }: NotesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(100);

  const addNote = (type: 'note' | 'sheet' = 'note') => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: type === 'sheet' ? 'Bảng tính mới' : 'Ghi chú mới',
      content: '',
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: 'Cá nhân',
      type: type,
      data: type === 'sheet' ? [['', '', ''], ['', '', ''], ['', '', '']] : undefined
    };
    
    const offset = activeEditors.length * 30;
    setActiveEditors(prev => [
      ...prev, 
      { 
        note: newNote, 
        zIndex: maxZIndex + 1,
        position: { x: 100 + offset, y: 100 + offset }
      }
    ]);
    setMaxZIndex(prev => prev + 1);
  };

  const saveNote = async (updatedNote: Note) => {
    try {
      const newNotes = notes.find(n => n.id === updatedNote.id)
        ? notes.map(n => n.id === updatedNote.id ? updatedNote : n)
        : [updatedNote, ...notes];
      
      await onSync(newNotes);
      // We don't necessarily close the editor on save now, 
      // but we update the local state of the editor in the array if needed
      setActiveEditors(prev => prev.map(ed => ed.note.id === updatedNote.id ? { ...ed, note: updatedNote } : ed));
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const deleteNote = async (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    await onSync(newNotes);
    // Also close editor if open
    setActiveEditors(prev => prev.filter(ed => ed.note.id !== id));
  };

  const editNote = (note: Note) => {
    // Check if already open
    const existing = activeEditors.find(ed => ed.note.id === note.id);
    if (existing) {
      focusEditor(note.id);
      return;
    }

    const offset = (activeEditors.length % 5) * 40;
    setActiveEditors(prev => [
      ...prev, 
      { 
        note: { ...note }, 
        zIndex: maxZIndex + 1,
        position: { x: 150 + offset, y: 150 + offset }
      }
    ]);
    setMaxZIndex(prev => prev + 1);
  };

  const closeEditor = (id: string) => {
    setActiveEditors(prev => prev.filter(ed => ed.note.id !== id));
  };

  const focusEditor = (id: string) => {
    setActiveEditors(prev => prev.map(ed => 
      ed.note.id === id ? { ...ed, zIndex: maxZIndex + 1 } : ed
    ));
    setMaxZIndex(prev => prev + 1);
  };

  const filteredNotes = notes.filter(note => 
    String(note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 h-[calc(100vh-10rem)] flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold">
            Workspace / Notes
          </span>
          <h2 className="text-5xl font-serif font-black italic tracking-tighter-extra leading-none">
            Ghi chú <span className="not-italic opacity-20">Cá nhân.</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input 
              placeholder="Tìm kiếm..." 
              className="h-10 pl-10 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button 
                className="h-10 px-6 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2"
              >
                <Plus size={14} /> Tạo mới
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 p-1">
              <DropdownMenuItem onClick={() => addNote('note')} className="text-[10px] uppercase tracking-widest font-bold gap-3 p-3">
                <FileText size={14} className="text-indigo-400" /> Ghi chú văn bản
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNote('sheet')} className="text-[10px] uppercase tracking-widest font-bold gap-3 p-3">
                <TableIcon size={14} className="text-emerald-400" /> Bảng tính (Sheets)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {activeEditors.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => {
                setActiveEditors(prev => prev.map((ed, i) => ({
                  ...ed,
                  position: { x: 100 + (i * 40), y: 100 + (i * 40) },
                  zIndex: 100 + i
                })));
                setMaxZIndex(100 + activeEditors.length);
              }}
              className="h-10 w-10 p-0 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl"
              title="Sắp xếp cửa sổ"
            >
              <Layers size={16} />
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden luxury-shadow">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => editNote(note)}
                className="bg-background/40 backdrop-blur-md p-8 group hover:bg-white/[0.02] transition-all cursor-pointer flex flex-col gap-6 relative"
              >
                {activeEditors.some(ed => ed.note.id === note.id) && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] uppercase tracking-widest animate-pulse">
                      Đang mở
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                    {note.category}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); editNote(note); }}
                        className="text-xs gap-2"
                      >
                        <Edit3 size={12} /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        className="text-xs gap-2 text-destructive"
                      >
                        <Trash2 size={12} /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-serif font-bold leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
                    {note.type === 'sheet' && <TableIcon size={16} className="text-emerald-400 opacity-50" />}
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground/80 line-clamp-4 leading-relaxed font-light">
                    {note.type === 'sheet' 
                      ? `${note.data?.length || 0} hàng x ${note.data?.[0]?.length || 0} cột dữ liệu bảng tính.` 
                      : note.content}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">{note.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Draggable Editors Layer */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <AnimatePresence>
          {activeEditors.map((editor) => (
            <div key={editor.note.id} className="pointer-events-auto">
              <DraggableNoteEditor 
                note={editor.note}
                zIndex={editor.zIndex}
                initialPosition={editor.position}
                onClose={() => closeEditor(editor.note.id)}
                onFocus={() => focusEditor(editor.note.id)}
                onSave={saveNote}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
