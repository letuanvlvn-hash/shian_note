import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Volume2, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Globe,
  Cpu,
  Briefcase,
  Clock,
  Play,
  Pause,
  X,
  Plus,
  Music,
  Palette,
  Mic2,
  Share2,
  Trash2
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
import { NewsItem, NewsCategory } from '@/src/types';
import { geminiService } from '@/src/services/geminiService';
import { aiVoiceService } from '@/src/services/aiVoiceService';
import { cn } from '@/lib/utils';

const DEFAULT_CATEGORIES: NewsCategory[] = [
  { id: 'latest', label: 'Tin mới nhất', rssUrl: 'https://vnexpress.net/rss/tin-moi-nhat.rss' },
  { id: 'business', label: 'Kinh doanh', rssUrl: 'https://vnexpress.net/rss/kinh-doanh.rss' },
  { id: 'tech', label: 'Công nghệ', rssUrl: 'https://vnexpress.net/rss/khoa-hoc.rss' },
  { id: 'finance', label: 'Tài chính', rssUrl: 'https://cafef.vn/rss/thi-truong-chung-khoan.rss' },
  { id: 'world', label: 'Thế giới', rssUrl: 'https://vnexpress.net/rss/the-gioi.rss' },
  { id: 'entertainment', label: 'Giải trí', rssUrl: 'https://vnexpress.net/rss/giai-tri.rss' },
  { id: 'arts', label: 'Nghệ thuật', rssUrl: 'https://vnexpress.net/rss/du-lich.rss' },
  { id: 'podcast', label: 'Podcast & Radio', rssUrl: 'https://blogradio.vn/rss/podcast.rss' },
];

export default function NewsView() {
  const [customCategories, setCustomCategories] = useState<NewsCategory[]>(() => {
    const saved = localStorage.getItem('shian_custom_news_sources');
    return saved ? JSON.parse(saved) : [];
  });
  
  const categories = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  const saveCustomSources = (sources: NewsCategory[]) => {
    setCustomCategories(sources);
    localStorage.setItem('shian_custom_news_sources', JSON.stringify(sources));
  };

  const handleAddSource = () => {
    if (!newSourceName || !newSourceUrl) return;
    const newSource: NewsCategory = {
      id: 'custom-' + Date.now(),
      label: newSourceName,
      rssUrl: newSourceUrl
    };
    saveCustomSources([...customCategories, newSource]);
    setNewSourceName('');
    setNewSourceUrl('');
    setIsAddSourceOpen(false);
  };

  const handleDeleteSource = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customCategories.filter(c => c.id !== id);
    saveCustomSources(updated);
    if (activeCategory.id === id) {
      setActiveCategory(DEFAULT_CATEGORIES[0]);
    }
  };

  const fetchNews = async (category: NewsCategory) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/news?url=${encodeURIComponent(category.rssUrl)}`);
      const data = await response.json();
      
      const items: NewsItem[] = data.items.map((item: any) => ({
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content || item.description,
        contentSnippet: item.contentSnippet || item.description?.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...',
        categories: item.categories,
        creator: item.creator,
        thumbnail: item.enclosure?.url || extractThumbnail(item.content || item.description),
        audioUrl: item.enclosure?.type?.startsWith('audio/') ? item.enclosure.url : extractAudioUrl(item.content || item.description)
      }));
      
      setNews(items);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractThumbnail = (html: string) => {
    const match = html.match(/src="([^"]*)"/);
    return match ? match[1] : null;
  };

  const extractAudioUrl = (html: string) => {
    const match = html.match(/src="([^"]*\.(mp3|wav|ogg|m4a))"/i);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const filteredNews = useMemo(() => {
    return news.filter(item => 
      String(item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.contentSnippet || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [news, searchQuery]);

  const handleSummarize = async (item: NewsItem) => {
    setSummarizing(true);
    setSummary(null);
    try {
      const result = await geminiService.summarizeNews(item.title, item.content);
      setSummary(result);
    } catch (error) {
      setSummary("Lỗi khi tóm tắt tin tức.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (isPlaying) {
      currentAudio?.pause();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const audioData = await aiVoiceService.speak(text);
    if (audioData) {
      const audio = new Audio(audioData);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setCurrentAudio(audio);
    } else {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    currentAudio?.pause();
    setIsPlaying(false);
    setCurrentAudio(null);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Newspaper size={20} />
            </div>
            <h1 className="text-4xl font-serif font-bold italic tracking-tight text-white">Shian News</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Trung tâm tin tức đa phương thức</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Tìm kiếm tin tức..." 
              className="pl-10 w-64 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => fetchNews(activeCategory)}
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Method 1: News Ticker */}
      <div className="relative h-12 bg-primary/5 border-y border-white/5 overflow-hidden flex items-center">
        <div className="absolute left-0 top-0 bottom-0 px-4 bg-zinc-950 z-10 flex items-center gap-2 border-r border-white/5">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Mới nhất</span>
        </div>
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
          {news.slice(0, 10).map((item, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedNews(item)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="font-bold text-primary/80">[{activeCategory.label}]</span>
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="flex flex-wrap gap-2 items-center">
        {categories.map((cat) => (
          <div key={cat.id} className="relative group">
            <Button
              variant={activeCategory.id === cat.id ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-6 text-[10px] uppercase tracking-widest font-bold h-9 transition-all pr-8",
                activeCategory.id === cat.id ? "bg-primary text-primary-foreground" : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              {cat.label}
            </Button>
            {cat.id.startsWith('custom-') && (
              <button 
                onClick={(e) => handleDeleteSource(cat.id, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsAddSourceOpen(true)}
          className="rounded-full border-dashed border-white/20 bg-white/5 hover:bg-white/10 h-9 w-9"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Method 2: Luxury News Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative h-full overflow-hidden bg-zinc-900/50 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2rem] flex flex-col luxury-shadow">
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <Newspaper size={40} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                    <Badge className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md border-none text-[8px] uppercase tracking-widest px-3">
                      {activeCategory.label}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <Clock size={12} />
                      {new Date(item.pubDate).toLocaleDateString('vi-VN', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <h3 className="text-lg font-serif font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
                      {item.contentSnippet}
                    </p>

                    <div className="pt-4 flex items-center justify-between gap-2 border-t border-white/5">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all"
                          onClick={() => {
                            setSelectedNews(item);
                            handleSummarize(item);
                          }}
                          title="Tóm tắt AI"
                        >
                          <Sparkles size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                          onClick={() => handleSpeak(item.title + ". " + item.contentSnippet)}
                          title="Đọc tin"
                        >
                          <Volume2 size={16} />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        className="text-[10px] uppercase tracking-widest font-bold gap-2 hover:bg-white/10"
                        onClick={() => setSelectedNews(item)}
                      >
                        Chi tiết <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail & AI Summary Dialog */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => {
        if (!open) {
          setSelectedNews(null);
          setSummary(null);
          stopAudio();
        }
      }}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem]">
          {selectedNews && (
            <>
              <div className="relative h-64 w-full">
                {selectedNews.thumbnail ? (
                  <img 
                    src={selectedNews.thumbnail} 
                    alt={selectedNews.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 text-white"
                  onClick={() => setSelectedNews(null)}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Badge variant="outline" className="border-primary/30 text-primary text-[9px] uppercase tracking-widest px-3">
                      {activeCategory.label}
                    </Badge>
                    <h2 className="text-3xl font-serif font-bold italic leading-tight">{selectedNews.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(selectedNews.pubDate).toLocaleString('vi-VN')}</span>
                      {selectedNews.creator && <span>• {selectedNews.creator}</span>}
                    </div>
                  </div>

                  {/* Method 3: AI Summary Section */}
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles size={18} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Tóm tắt thông minh bởi Gemini</span>
                      </div>
                      <div className="flex gap-2">
                        {selectedNews.audioUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[9px] uppercase tracking-widest font-bold gap-2 border-primary/30 bg-primary/10 text-primary"
                            onClick={() => window.open(selectedNews.audioUrl, '_blank')}
                          >
                            <Mic2 size={14} /> Nghe Podcast Gốc
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "h-8 text-[9px] uppercase tracking-widest font-bold gap-2",
                            isPlaying && "text-primary bg-primary/10"
                          )}
                          onClick={() => handleSpeak(summary || selectedNews.title)}
                          disabled={summarizing || !summary}
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />} 
                          {isPlaying ? "Đang đọc..." : "Nghe tóm tắt"}
                        </Button>
                      </div>
                    </div>
                    
                    {selectedNews.audioUrl && (
                      <div className="pt-2">
                        <audio controls className="w-full h-10 rounded-xl bg-white/5">
                          <source src={selectedNews.audioUrl} type="audio/mpeg" />
                          Trình duyệt của bạn không hỗ trợ phát âm thanh.
                        </audio>
                      </div>
                    )}
                    
                    {summarizing ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-white/5 animate-pulse rounded w-full" />
                        <div className="h-4 bg-white/5 animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-white/5 animate-pulse rounded w-5/6" />
                      </div>
                    ) : summary ? (
                      <div className="text-sm text-zinc-300 leading-relaxed prose prose-invert max-w-none">
                        {summary.split('\n').map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-primary/20 bg-primary/5 hover:bg-primary/10 text-[10px] uppercase tracking-widest font-bold h-10"
                        onClick={() => handleSummarize(selectedNews)}
                      >
                        Tạo tóm tắt AI ngay
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 border-t border-white/5 pt-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Nội dung chi tiết nguyên văn</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "h-8 text-[9px] uppercase tracking-widest font-bold gap-2",
                          isPlaying && "text-primary bg-primary/10"
                        )}
                        onClick={() => handleSpeak(selectedNews.contentSnippet)}
                      >
                        <Volume2 size={14} /> {isPlaying ? "Đang đọc..." : "Đọc nguyên văn"}
                      </Button>
                    </div>
                    <div 
                      className="text-zinc-400 leading-relaxed text-sm news-content"
                      dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-zinc-950 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-white"
                  onClick={() => setSelectedNews(null)}
                >
                  Đóng
                </Button>
                <Button 
                  className="bg-white text-black hover:bg-zinc-200 rounded-xl px-8 text-[10px] uppercase tracking-widest font-bold gap-2"
                  onClick={() => window.open(selectedNews.link, '_blank')}
                >
                  Đọc tại nguồn <ExternalLink size={14} />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .news-content img {
          border-radius: 1.5rem;
          margin: 1.5rem 0;
          width: 100%;
          height: auto;
        }
        .news-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      {/* Add Source Dialog */}
      <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">Thêm nguồn tin tùy chỉnh</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Nhập tên và địa chỉ RSS feed để theo dõi các nguồn tin yêu thích của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tên nguồn tin</label>
              <Input 
                placeholder="Ví dụ: Blog Cá Nhân" 
                className="bg-white/5 border-white/10"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Địa chỉ RSS URL</label>
              <Input 
                placeholder="https://example.com/rss" 
                className="bg-white/5 border-white/10"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddSourceOpen(false)}>Hủy</Button>
            <Button onClick={handleAddSource} className="bg-primary text-primary-foreground hover:bg-primary/90">Thêm nguồn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
