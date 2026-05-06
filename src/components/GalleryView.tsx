import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Maximize2, Download, Trash2, X, Cloud, CloudOff, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { CloudSettings } from '../types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { googleSheetsService } from '../services/googleSheetsService';

interface GalleryViewProps {
  gallery: any[];
  onSync: (gallery: any[]) => Promise<void>;
  cloudSettings: CloudSettings;
}

export default function GalleryView({ gallery, onSync, cloudSettings }: GalleryViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isPCloudConnected = !!cloudSettings.pCloudToken;

  const addImage = async () => {
    if (!newImageUrl) return;
    setIsSaving(true);
    
    try {
      const newImg = {
        id: Date.now().toString(),
        url: newImageUrl,
        title: newImageTitle || 'Ảnh mới',
        date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      
      const newGallery = [newImg, ...gallery];
      await onSync(newGallery);
      setNewImageUrl('');
      setNewImageTitle('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Add image failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteImage = async (id: string) => {
    const newGallery = gallery.filter(img => img.id !== id);
    await onSync(newGallery);
  };

  return (
    <div className="space-y-12 h-[calc(100vh-10rem)] flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold">
              Media / Gallery
            </span>
            <Badge variant="secondary" className={cn(
              "gap-1 text-[8px] uppercase tracking-widest px-2 py-0 h-4 border-none",
              isPCloudConnected ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-muted-foreground"
            )}>
              {isPCloudConnected ? <Cloud size={8} /> : <CloudOff size={8} />}
              {isPCloudConnected ? "pCloud" : "Local"}
            </Badge>
          </div>
          <h2 className="text-5xl font-serif font-black italic tracking-tighter-extra leading-none">
            Thư viện <span className="not-italic opacity-20">Ảnh.</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsAddDialogOpen(true)}
            className="h-10 border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-xl text-[10px] uppercase tracking-widest font-bold"
          >
            <LinkIcon size={14} className="mr-2" /> Liên kết ảnh
          </Button>
          <Button className="h-10 px-6 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-[10px] uppercase tracking-widest">
            Tải lên
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {gallery.map((image, i) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 cursor-pointer luxury-shadow"
                onClick={() => setSelectedImage(image.url)}
              >
                <img 
                  src={image.url} 
                  alt={image.title} 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                  <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-lg font-serif font-bold italic">{image.title}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/60 font-medium">{image.date}</p>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full h-8 w-8 bg-white/10 backdrop-blur-md border-white/10 hover:bg-white/20"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(image.url); }}
                      >
                        <Maximize2 size={14} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        onClick={(e) => { e.stopPropagation(); deleteImage(image.id); }}
                        className="rounded-full h-8 w-8 bg-red-500/10 backdrop-blur-md border-red-500/20 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white luxury-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Liên kết ảnh từ Google Photos / Web</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary font-bold">Mẹo:</span> Để liên kết ảnh từ Google Photos, hãy mở ảnh, chọn "Chia sẻ" -&gt; "Tạo liên kết", sau đó sao chép địa chỉ hình ảnh và dán vào đây.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Đường dẫn hình ảnh (URL)</label>
              <Input 
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tên gợi nhớ</label>
              <Input 
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="Kỷ niệm đẹp..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>Hủy</Button>
            <Button onClick={addImage} disabled={isSaving} className="bg-white text-black hover:bg-zinc-200">
              {isSaving ? 'Đang lưu...' : 'Thêm vào thư viện'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-transparent border-none p-0 luxury-shadow">
          {selectedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
                onClick={() => setSelectedImage(null)}
              >
                <X size={24} />
              </Button>
              <img 
                src={selectedImage} 
                alt="Full preview" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
