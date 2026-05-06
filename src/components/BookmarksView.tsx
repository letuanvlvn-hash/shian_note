import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Search, 
  Bookmark, 
  LayoutGrid, 
  List,
  Globe,
  Cpu,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AppBookmark } from '../types';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface BookmarksViewProps {
  bookmarks: AppBookmark[];
  onSync: (bookmarks: AppBookmark[]) => Promise<void>;
}

export default function BookmarksView({ bookmarks, onSync }: BookmarksViewProps) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<AppBookmark | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<AppBookmark | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [newBookmark, setNewBookmark] = useState<Partial<AppBookmark>>({
    title: '',
    studioUrl: '',
    publishedUrl: '',
    category: 'Ứng dụng',
    openMode: 'external'
  });

  const handleAddBookmark = async () => {
    if (!newBookmark.title || !newBookmark.studioUrl || !newBookmark.publishedUrl) return;
    setIsSaving(true);
    try {
      const bookmark: AppBookmark = {
        id: editingBookmark?.id || Date.now().toString(),
        title: newBookmark.title,
        studioUrl: newBookmark.studioUrl,
        publishedUrl: newBookmark.publishedUrl,
        category: newBookmark.category || 'Ứng dụng',
        icon: newBookmark.icon,
        openMode: newBookmark.openMode || 'external'
      };

      let updatedBookmarks;
      if (editingBookmark) {
        updatedBookmarks = bookmarks.map(b => b.id === editingBookmark.id ? bookmark : b);
      } else {
        updatedBookmarks = [bookmark, ...bookmarks];
      }

      await onSync(updatedBookmarks);
      setIsDialogOpen(false);
      setNewBookmark({ title: '', studioUrl: '', publishedUrl: '', category: 'Ứng dụng', openMode: 'external' });
      setEditingBookmark(null);
    } catch (error) {
      console.error("Failed to save bookmark:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ứng dụng này?')) return;
    const updatedBookmarks = bookmarks.filter(b => b.id !== id);
    await onSync(updatedBookmarks);
  };

  const openEditDialog = (bookmark: AppBookmark) => {
    setEditingBookmark(bookmark);
    setNewBookmark(bookmark);
    setIsDialogOpen(true);
  };

  const openLaunchDialog = (bookmark: AppBookmark) => {
    setSelectedBookmark(bookmark);
    setIsLaunchDialogOpen(true);
  };

  const filteredBookmarks = bookmarks.filter(b => 
    String(b.title || '').toLowerCase().includes(search.toLowerCase()) ||
    String(b.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-serif font-bold italic tracking-tight">Hệ sinh thái Ứng dụng</h2>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">Quản lý và truy cập nhanh các dự án của bạn</p>
        </div>
        <Button 
          onClick={() => {
            setEditingBookmark(null);
            setNewBookmark({ title: '', studioUrl: '', publishedUrl: '', category: 'Ứng dụng', openMode: 'external' });
            setIsDialogOpen(true);
          }}
          className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 h-12 font-bold uppercase tracking-widest text-[10px] gap-2 luxury-shadow"
        >
          <Plus size={16} /> Thêm ứng dụng mới
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Tìm kiếm ứng dụng..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 bg-transparent border-none focus-visible:ring-0 text-lg font-serif italic"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode('grid')}
            className={cn("h-10 w-10 rounded-lg", viewMode === 'grid' && "bg-white/10 text-white")}
          >
            <LayoutGrid size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewMode('list')}
            className={cn("h-10 w-10 rounded-lg", viewMode === 'list' && "bg-white/10 text-white")}
          >
            <List size={18} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {filteredBookmarks.length > 0 ? (
          <div className={cn(
            "grid gap-6 pb-8",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card 
                    className={cn(
                      "group relative glass border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer",
                      viewMode === 'list' ? "flex items-center" : "flex flex-col"
                    )}
                    onClick={() => openLaunchDialog(bookmark)}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    )} />
                    
                    <CardContent className={cn("p-6 relative z-10", viewMode === 'list' ? "flex-1 flex items-center justify-between" : "space-y-4")}>
                      <div className={cn("flex items-center gap-4", viewMode === 'list' ? "flex-1" : "")}>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                          <Bookmark size={24} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-serif font-bold italic group-hover:text-primary transition-colors">{bookmark.title}</h3>
                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest bg-white/5 border-white/10">
                              {bookmark.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{bookmark.publishedUrl}</p>
                        </div>
                      </div>

                      <div className={cn("flex items-center gap-2", viewMode === 'grid' ? "pt-4" : "")}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-widest font-bold gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLaunchDialog(bookmark);
                          }}
                        >
                          <ExternalLink size={14} /> Mở ứng dụng
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white">
                            <DropdownMenuItem onClick={() => openEditDialog(bookmark)} className="gap-2 cursor-pointer">
                              <Edit3 size={14} /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBookmark(bookmark.id)} className="gap-2 cursor-pointer text-red-400 focus:text-red-400">
                              <Trash2 size={14} /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Bookmark size={32} className="opacity-20" />
            </div>
            <p className="font-serif italic">Chưa có ứng dụng nào được lưu.</p>
          </div>
        )}
      </ScrollArea>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white luxury-shadow sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic">{editingBookmark ? 'Chỉnh sửa ứng dụng' : 'Thêm ứng dụng mới'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Nhập thông tin các đường dẫn ứng dụng của bạn.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tên ứng dụng</label>
              <Input 
                value={newBookmark.title}
                onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                placeholder="Ví dụ: Quản lý chi tiêu..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20 h-12 text-lg font-serif italic"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Danh mục</label>
              <Input 
                value={newBookmark.category}
                onChange={(e) => setNewBookmark({ ...newBookmark, category: e.target.value })}
                placeholder="Ví dụ: Công việc, Giải trí..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20 h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <Cpu size={12} /> Link AI Studio (https://aistudio.google.com/apps/...)
              </label>
              <Input 
                value={newBookmark.studioUrl}
                onChange={(e) => setNewBookmark({ ...newBookmark, studioUrl: e.target.value })}
                placeholder="Dán link AI Studio tại đây"
                className="bg-white/[0.02] border-white/5 focus:border-white/20 h-12 font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                <Globe size={12} /> Link Xuất bản (https://...run.app/)
              </label>
              <Input 
                value={newBookmark.publishedUrl}
                onChange={(e) => setNewBookmark({ ...newBookmark, publishedUrl: e.target.value })}
                placeholder="Dán link ứng dụng đã xuất bản tại đây"
                className="bg-white/[0.02] border-white/5 focus:border-white/20 h-12 font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Chế độ mở</label>
              <Select 
                value={newBookmark.openMode || 'external'} 
                onValueChange={(val: any) => setNewBookmark({ ...newBookmark, openMode: val })}
              >
                <SelectTrigger className="bg-white/[0.02] border-white/5 h-12">
                  <SelectValue placeholder="Chọn chế độ mở" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="external">Mở tab mới (Khuyên dùng)</SelectItem>
                  <SelectItem value="internal">Mở trực tiếp trong App (Dành cho trang cho phép)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="rounded-xl">Hủy</Button>
            <Button 
              onClick={handleAddBookmark} 
              disabled={isSaving || !newBookmark.title || !newBookmark.studioUrl || !newBookmark.publishedUrl} 
              className="bg-white text-black hover:bg-zinc-200 rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-[10px]"
            >
              {isSaving ? 'Đang lưu...' : (editingBookmark ? 'Cập nhật' : 'Lưu ứng dụng')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Launch Dialog */}
      <Dialog open={isLaunchDialogOpen} onOpenChange={setIsLaunchDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white luxury-shadow sm:max-w-[400px] p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
                <Bookmark size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold italic">{selectedBookmark?.title}</h3>
              <p className="text-muted-foreground text-xs uppercase tracking-widest">Chọn phiên bản để truy cập</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => {
                  if (selectedBookmark) window.open(selectedBookmark.publishedUrl, '_blank');
                  setIsLaunchDialogOpen(false);
                }}
                className="h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-1 group"
              >
                <div className="flex items-center gap-2">
                  <Globe size={18} />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Phiên bản Xuất bản</span>
                </div>
                <span className="text-[8px] opacity-50 font-mono truncate max-w-[250px]">{selectedBookmark?.publishedUrl}</span>
              </Button>

              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedBookmark) window.open(selectedBookmark.studioUrl, '_blank');
                  setIsLaunchDialogOpen(false);
                }}
                className="h-16 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl flex flex-col items-center justify-center gap-1 group"
              >
                <div className="flex items-center gap-2">
                  <Cpu size={18} />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Phiên bản AI Studio</span>
                </div>
                <span className="text-[8px] opacity-50 font-mono truncate max-w-[250px]">{selectedBookmark?.studioUrl}</span>
              </Button>
            </div>
          </div>
          <div className="bg-white/5 p-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => setIsLaunchDialogOpen(false)} className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
