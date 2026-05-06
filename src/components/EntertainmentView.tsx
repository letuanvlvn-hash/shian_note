import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Youtube, 
  Plus, 
  Search, 
  Trash2, 
  Play, 
  Pause,
  ExternalLink, 
  Maximize2,
  Headphones, 
  Video, 
  Radio,
  Sparkles,
  Heart,
  Clock,
  Filter,
  X,
  Mic2,
  Share2,
  Upload,
  Download,
  FileAudio,
  FileVideo,
  Loader2,
  Settings2,
  Globe,
  Check,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { EntertainmentItem, SearchSource } from '@/src/types';
import { cn } from '@/lib/utils';
import { geminiService } from '@/src/services/geminiService';

const FOCUS_PRESETS: EntertainmentItem[] = [
  {
    id: 'focus-1',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    platform: 'youtube',
    category: 'lofi',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    addedAt: new Date().toISOString()
  },
  {
    id: 'focus-2',
    title: 'Deep Focus - Spotify Playlist',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKzbUnY3Y9',
    platform: 'spotify',
    category: 'lofi',
    thumbnail: 'https://i.scdn.co/image/ab67706f00000003ca5a75171afb4ad17c39240b',
    addedAt: new Date().toISOString()
  },
  {
    id: 'focus-3',
    title: 'Nhạc Không Lời Tập Trung Làm Việc',
    url: 'https://zingmp3.vn/album/Nhac-Khong-Loi-Tap-Trung-Lam-Viec-Various-Artists/ZWZB966I.html',
    platform: 'zingmp3',
    category: 'lofi',
    thumbnail: 'https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/3/2/a/3/32a35f4d26ee563663a3c068b9e8a2d7.jpg',
    addedAt: new Date().toISOString()
  }
];

interface EntertainmentViewProps {
  items: EntertainmentItem[];
  onSync: (items: EntertainmentItem[]) => void;
  onSelectItem?: (item: EntertainmentItem, forceWindow?: boolean) => void;
  activeMusicItem?: EntertainmentItem | null;
  isPlaying?: boolean;
}

export default function EntertainmentView({ items, onSync, onSelectItem, activeMusicItem, isPlaying }: EntertainmentViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('elite_entertainment_categories');
    return saved ? JSON.parse(saved) : ['music', 'video', 'podcast', 'lofi'];
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<EntertainmentItem[]>([]);
  
  const [searchSources, setSearchSources] = useState<SearchSource[]>(() => {
    const saved = localStorage.getItem('shian_search_sources');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'yt', name: 'YouTube', domain: 'youtube.com', enabled: true },
      { id: 'zmp3', name: 'ZingMP3', domain: 'zingmp3.vn', enabled: true },
      { id: 'nct', name: 'NhacCuaTui', domain: 'nhaccuatoi.com', enabled: true }
    ];
  });

  // Custom Source Form
  const [customSourceName, setCustomSourceName] = useState('');
  const [customSourceDomain, setCustomSourceDomain] = useState('');

  useEffect(() => {
    localStorage.setItem('shian_search_sources', JSON.stringify(searchSources));
  }, [searchSources]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCategory, setNewCategory] = useState<string>('music');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('shian_entertainment_categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddCustomCategory = () => {
    if (!customCategoryName.trim()) return;
    const formattedCat = customCategoryName.trim().toLowerCase();
    if (!categories.includes(formattedCat)) {
      setCategories([...categories, formattedCat]);
    }
    setNewCategory(formattedCat);
    setCustomCategoryName('');
    setIsAddingCustomCategory(false);
  };

  const handleAddItem = () => {
    if (!newTitle || !newUrl) return;
    
    let platform: EntertainmentItem['platform'] = 'youtube';
    if (newUrl.includes('spotify.com')) platform = 'spotify';
    else if (newUrl.includes('zingmp3.vn')) platform = 'zingmp3';
    else if (newUrl.includes('nhaccuatoi.com')) platform = 'nhaccuatoi';
    
    const tags = newTags.split(',').map(t => t.trim().replace(/^#/, '')).filter(t => t !== '');
    
    const newItem: EntertainmentItem = {
      id: Date.now().toString(),
      title: newTitle,
      url: newUrl,
      platform,
      category: newCategory,
      addedAt: new Date().toISOString(),
      thumbnail: `https://picsum.photos/seed/${newTitle}/400/225`,
      tags: tags.length > 0 ? tags : undefined
    };
    
    onSync([newItem, ...items]);
    setNewTitle('');
    setNewUrl('');
    setNewTags('');
    setIsAddOpen(false);
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Seek to 5 seconds or duration/2 if shorter
        const seekTime = Math.min(5, video.duration / 2);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 225;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          URL.revokeObjectURL(video.src);
          resolve(thumbnail);
        } else {
          resolve('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400');
        }
      };

      video.onerror = () => {
        resolve('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400');
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    
    let thumbnail = isVideo 
      ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400' 
      : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400';

    if (isVideo) {
      thumbnail = await generateVideoThumbnail(file);
    }
    
    const newItem: EntertainmentItem = {
      id: Date.now().toString(),
      title: file.name,
      url: url,
      platform: 'local',
      category: isVideo ? 'video' : 'music',
      addedAt: new Date().toISOString(),
      thumbnail: thumbnail,
      isLocal: true,
      fileType: file.type,
      tags: ['local']
    };

    onSync([newItem, ...items]);
    if (e.target) e.target.value = '';
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSync(items.filter(item => item.id !== id));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSync(items.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const favoriteItems = useMemo(() => items.filter(item => item.isFavorite), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = String(item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags?.some(t => String(t || '').toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesTag = !selectedTag || item.tags?.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [items, searchQuery, activeCategory, selectedTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [items]);

  const handleSelectItem = (item: EntertainmentItem, forceWindow: boolean = false) => {
    if (onSelectItem) onSelectItem(item, forceWindow);
  };

  const handleQuickPlay = () => {
    if (!quickUrl.trim()) return;
    
    let platform: EntertainmentItem['platform'] = 'youtube';
    if (quickUrl.includes('spotify.com')) platform = 'spotify';
    else if (quickUrl.includes('zingmp3.vn')) platform = 'zingmp3';
    else if (quickUrl.includes('nhaccuatoi.com')) platform = 'nhaccuatoi';
    
    const item: EntertainmentItem = {
      id: 'quick-' + Date.now(),
      title: 'Phát nhanh: ' + quickUrl.split('/').pop()?.substring(0, 20) || 'Link',
      url: quickUrl,
      platform,
      category: 'music',
      addedAt: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400'
    };
    
    handleSelectItem(item);
    setQuickUrl('');
  };

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const activeSources = searchSources.filter(s => s.enabled);
      const results = await geminiService.searchEntertainment(searchQuery, activeSources);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSource = (id: string) => {
    setSearchSources(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const addCustomSource = () => {
    if (!customSourceName || !customSourceDomain) return;
    const newSource: SearchSource = {
      id: Date.now().toString(),
      name: customSourceName,
      domain: customSourceDomain,
      enabled: true,
      isCustom: true
    };
    setSearchSources([...searchSources, newSource]);
    setCustomSourceName('');
    setCustomSourceDomain('');
  };

  const deleteSource = (id: string) => {
    setSearchSources(prev => prev.filter(s => s.id !== id));
  };

  const addToLibrary = (item: EntertainmentItem) => {
    if (items.find(i => i.url === item.url)) return;
    onSync([item, ...items]);
  };

  return (
    <div className="space-y-12 h-[calc(100vh-10rem)] flex flex-col">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="video/*,audio/*" 
        onChange={handleFileUpload}
      />
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="space-y-2 md:space-y-4">
          <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold">
            Workspace / Entertainment
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-black italic tracking-tighter-extra leading-none">
            Giải trí <span className="not-italic opacity-20">Shian.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <div className="relative flex-1 md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
              <Input 
                placeholder="Tìm kiếm đa nền tảng..." 
                className="h-11 md:h-12 pl-10 pr-12 bg-white/[0.02] border-white/5 focus:border-primary/30 transition-all rounded-xl md:rounded-2xl text-xs luxury-shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGlobalSearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg md:rounded-xl hover:bg-primary/20 text-primary"
              >
                {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsSettingsOpen(true)}
                variant="outline"
                className="h-11 md:h-12 w-11 md:w-12 p-0 border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-xl md:rounded-2xl luxury-shadow shrink-0"
              >
                <Settings2 size={18} />
              </Button>
              <Button 
                onClick={() => setIsAddOpen(true)}
                className="flex-1 md:flex-none h-11 md:h-12 px-4 md:px-6 bg-white text-black hover:bg-zinc-200 rounded-xl md:rounded-2xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest luxury-shadow"
              >
                Thêm mới
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1 md:flex-none h-11 md:h-12 px-4 md:px-6 border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-xl md:rounded-2xl luxury-shadow font-bold text-[9px] md:text-[10px] uppercase tracking-widest gap-2"
              >
                <Upload size={14} className="hidden sm:inline" /> Tải lên
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <Input 
                placeholder="Dán link phát nhanh..." 
                className="h-9 md:h-10 bg-white/[0.02] border-white/5 focus:border-primary/30 transition-all rounded-lg md:rounded-xl text-[9px] md:text-[10px] luxury-shadow"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickPlay()}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleQuickPlay}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 md:h-8 w-7 md:w-8 rounded-lg hover:bg-primary/20 text-primary"
              >
                <Play className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
              </Button>
            </div>
          </div>

          {/* Quick Toggle Sources */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {searchSources.map(source => (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap text-[9px] font-bold uppercase tracking-widest",
                  source.enabled 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {source.enabled ? <Check size={10} /> : <Globe size={10} />}
                {source.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-6">
          <div className="space-y-12 pb-12">
            {/* Search Results Section */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold italic flex items-center gap-3">
                      <Sparkles size={20} className="text-primary" />
                      Kết quả tìm kiếm
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSearchResults([])}
                      className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                    >
                      Đóng kết quả
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {searchResults.map((item) => (
                      <Card key={item.id} className="group relative overflow-hidden bg-primary/5 border-primary/20 hover:border-primary/40 transition-all rounded-2xl luxury-shadow h-full flex flex-col">
                        <div className="aspect-video relative overflow-hidden cursor-pointer" onClick={() => handleSelectItem(item)}>
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className={cn(
                            "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                            activeMusicItem?.id === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}>
                            {activeMusicItem?.id === item.id && isPlaying ? (
                              <Pause size={32} className="text-primary animate-pulse" fill="currentColor" />
                            ) : (
                              <Play size={32} className="text-white" fill="currentColor" />
                            )}
                          </div>
                          <div className="absolute top-2 left-2 flex gap-1">
                            <Badge className="bg-primary text-primary-foreground border-none text-[8px] uppercase">
                              {item.platform}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 rounded-lg bg-black/60 text-white hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectItem(item, true);
                              }}
                            >
                              <Maximize2 size={12} />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <h3 className="text-sm font-medium line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => addToLibrary(item)}
                            className="w-full h-8 text-[9px] uppercase font-bold gap-2 border-primary/20 hover:bg-primary/10"
                          >
                            {items.find(i => i.url === item.url) ? <Check size={12} /> : <Plus size={12} />}
                            {items.find(i => i.url === item.url) ? 'Đã lưu' : 'Lưu vào thư viện'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Favorites Section */}
            {favoriteItems.length > 0 && (
              <section className="space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl font-serif font-bold italic flex items-center gap-3">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  Danh Mục Yêu Thích
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {favoriteItems.slice(0, 3).map((item) => (
                    <Card 
                      key={item.id} 
                      onClick={() => handleSelectItem(item)}
                      className="group relative h-40 md:h-48 overflow-hidden rounded-2xl border-white/5 cursor-pointer luxury-shadow"
                    >
                      <img src={item.thumbnail} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity",
                        activeMusicItem?.id === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        {activeMusicItem?.id === item.id && isPlaying ? (
                          <Pause className="text-primary animate-pulse w-10 h-10 md:w-12 md:h-12" fill="currentColor" />
                        ) : (
                          <Play className="text-white w-10 h-10 md:w-12 md:h-12" fill="currentColor" />
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <Badge className="bg-white/10 backdrop-blur-md border-none text-[7px] md:text-[8px] uppercase tracking-widest">
                            {item.platform}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-black/40 text-yellow-400 hover:bg-black/60"
                            onClick={(e) => toggleFavorite(item.id, e)}
                          >
                            <Star className="fill-yellow-400 w-3 h-3 md:w-3.5 md:h-3.5" />
                          </Button>
                        </div>
                        <h4 className="text-xs md:text-sm font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Library Section */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg md:text-xl font-serif font-bold italic flex items-center gap-3">
                    <Music size={20} className="text-primary" />
                    Thư viện
                  </h3>
                  
                  <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {['all', ...categories].map((cat) => (
                      <Button
                        key={cat}
                        variant="ghost"
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "h-7 md:h-8 px-3 md:px-4 text-[8px] md:text-[9px] uppercase tracking-widest font-bold rounded-full transition-all whitespace-nowrap",
                          activeCategory === cat ? "bg-white text-black" : "text-muted-foreground hover:bg-white/5"
                        )}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                {allTags.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTag(null)}
                      className={cn(
                        "h-7 px-3 text-[8px] uppercase tracking-widest font-bold rounded-full border border-white/5",
                        !selectedTag ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground hover:bg-white/5"
                      )}
                    >
                      Tất cả tag
                    </Button>
                    {allTags.map(tag => (
                      <Button
                        key={tag}
                        variant="ghost"
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={cn(
                          "h-7 px-3 text-[8px] uppercase tracking-widest font-bold rounded-full border border-white/5 whitespace-nowrap",
                          selectedTag === tag ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground hover:bg-white/5"
                        )}
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group relative overflow-hidden bg-zinc-900/50 border-white/5 hover:border-primary/30 transition-all rounded-2xl luxury-shadow h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden cursor-pointer" onClick={() => handleSelectItem(item)}>
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className={cn(
                          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                          activeMusicItem?.id === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          {activeMusicItem?.id === item.id && isPlaying ? (
                            <Pause size={32} className="text-primary animate-pulse" fill="currentColor" />
                          ) : (
                            <Play size={32} className="text-white" fill="currentColor" />
                          )}
                        </div>
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-black/60 backdrop-blur-md border-none text-[8px] uppercase">
                            {item.platform}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-6 w-6 rounded-lg bg-black/60 transition-all",
                              item.isFavorite ? "text-yellow-400 opacity-100" : "text-white opacity-0 group-hover:opacity-100 hover:text-primary"
                            )}
                            onClick={(e) => toggleFavorite(item.id, e)}
                          >
                            <Star size={12} className={cn(item.isFavorite && "fill-yellow-400")} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-lg bg-black/60 text-white hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectItem(item, true);
                            }}
                          >
                            <Maximize2 size={12} />
                          </Button>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map(tag => (
                                <span 
                                  key={tag} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTag(tag);
                                  }}
                                  className="text-[8px] text-primary hover:underline cursor-pointer"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-[9px] uppercase font-bold gap-1 hover:bg-white/10"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            Mở nguồn <ExternalLink size={10} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </div>

      {/* Settings Dialog (Source Manager) */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">Quản lý nguồn tìm kiếm</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Tùy chỉnh các nền tảng mà hệ thống sẽ tìm kiếm kết quả.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Danh sách nguồn</label>
              <div className="space-y-2">
                {searchSources.map(source => (
                  <div key={source.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", source.enabled ? "bg-primary" : "bg-zinc-700")} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{source.name}</span>
                        <span className="text-[9px] text-muted-foreground">{source.domain}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSource(source.id)}
                        className={cn("h-8 text-[9px] uppercase font-bold", source.enabled ? "text-primary" : "text-muted-foreground")}
                      >
                        {source.enabled ? 'Bật' : 'Tắt'}
                      </Button>
                      {source.isCustom && (
                        <Button variant="ghost" size="icon" onClick={() => deleteSource(source.id)} className="h-8 w-8 text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Thêm nguồn tùy chỉnh</label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  placeholder="Tên nguồn (VD: SoundCloud)" 
                  className="bg-white/5 border-white/10 text-xs"
                  value={customSourceName}
                  onChange={(e) => setCustomSourceName(e.target.value)}
                />
                <Input 
                  placeholder="Tên miền (VD: soundcloud.com)" 
                  className="bg-white/5 border-white/10 text-xs"
                  value={customSourceDomain}
                  onChange={(e) => setCustomSourceDomain(e.target.value)}
                />
              </div>
              <Button onClick={addCustomSource} className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 h-10 text-[10px] uppercase tracking-widest font-bold rounded-xl">
                Thêm vào danh sách
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">Thêm nội dung giải trí</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Hỗ trợ YouTube, Spotify, ZingMP3 và NhacCuaTui.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tiêu đề / Tên bài hát</label>
              <Input 
                placeholder="Nhập tiêu đề..." 
                className="bg-white/5 border-white/10"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Địa chỉ URL (Link)</label>
              <Input 
                placeholder="Dán link tại đây..." 
                className="bg-white/5 border-white/10"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Hashtags (cách nhau bằng dấu phẩy)</label>
              <Input 
                placeholder="VD: chill, remix, nhac-tre..." 
                className="bg-white/5 border-white/10"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Phân loại</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                  className="h-6 text-[8px] uppercase font-bold text-primary hover:bg-primary/10"
                >
                  {isAddingCustomCategory ? "Hủy" : "+ Thêm phân loại"}
                </Button>
              </div>
              
              {isAddingCustomCategory ? (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Tên phân loại mới..." 
                    className="bg-white/5 border-white/10 h-8 text-xs"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                  />
                  <Button onClick={handleAddCustomCategory} size="sm" className="h-8 bg-primary/20 text-primary hover:bg-primary/30">
                    Thêm
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={newCategory === cat ? "default" : "outline"}
                      onClick={() => setNewCategory(cat)}
                      className={cn(
                        "rounded-full px-4 text-[9px] uppercase tracking-widest font-bold h-8",
                        newCategory === cat ? "bg-primary text-primary-foreground" : "border-white/10 bg-white/5"
                      )}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button onClick={handleAddItem} className="bg-primary text-primary-foreground hover:bg-primary/90">Lưu vào thư viện</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
