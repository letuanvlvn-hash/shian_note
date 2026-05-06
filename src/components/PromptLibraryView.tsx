import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Image as ImageIcon, 
  Tag, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles,
  Filter,
  MoreVertical,
  X,
  Upload,
  Link,
  MessageSquare,
  Zap,
  Grid,
  Eye,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PromptItem } from '../types';
import { promptLibraryService } from '../services/promptLibraryService';
import { imgbbService } from '../services/imgbbService';
import { toast } from 'sonner';

interface PromptLibraryViewProps {
  prompts: PromptItem[];
  onAddPrompt: (prompt: Omit<PromptItem, 'id'>) => void;
  onUpdatePrompt?: (prompt: PromptItem) => void;
  onDeletePrompt?: (id: string) => void;
  currentUserEmail: string;
  activeGenerations?: Record<string, any>;
  onUpdateGenerations?: (gens: any) => void;
}

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({
  prompts,
  onAddPrompt,
  onUpdatePrompt,
  onDeletePrompt,
  currentUserEmail,
  activeGenerations = {},
  onUpdateGenerations
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [showHashtags, setShowHashtags] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  
  // Filtering
  const allCategories = Array.from(new Set(prompts.map(p => p.category)));
  const allHashtags = Array.from(new Set(prompts.flatMap(p => p.hashtags.map(h => h.replace(/^#/, '')))));

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.hashtags.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchesHashtags = selectedHashtags.length === 0 || 
                           selectedHashtags.every(sh => p.hashtags.map(h => h.replace(/^#/, '')).includes(sh));
    return matchesSearch && matchesCategory && matchesHashtags;
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Cyberpunk Header */}
      <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter-extra flex items-center gap-2">
              <Zap className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
              THƯ VIỆN CÂU LỆNH
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-500 bg-cyan-500/10 ml-2">PROMPT HUB</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-mono opacity-60">
              Công cụ tối ưu sức mạnh Gemini cho sáng tạo hình ảnh
            </p>
          </div>
          <Button 
            onClick={() => setIsAddingNew(true)}
            className="bg-white text-black hover:bg-cyan-400 group transition-all duration-300 rounded-none border-r-4 border-b-4 border-cyan-500/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            ĐĂNG CÂU LỆNH MỚI
          </Button>
        </div>

        {/* Search & Categories */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm kiếm phong cách, tác giả hoặc nội dung..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Category Multi-select Dropdown */}
              <div className="relative">
                 <Button 
                   variant="outline" 
                   onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                   className={`rounded-full border-white/10 bg-white/5 text-xs font-mono uppercase tracking-widest gap-2 min-w-[140px] justify-between ${showCategoryFilter ? 'border-cyan-500/50 text-cyan-400' : ''}`}
                 >
                   <Filter className="w-3 h-3" />
                   {selectedCategories.length === 0 ? 'Danh mục' : `${selectedCategories.length} Đã chọn`}
                 </Button>
                 
                 <AnimatePresence>
                   {showCategoryFilter && (
                     <>
                       {/* Overlay to close when clicking outside */}
                       <div 
                         className="fixed inset-0 z-40" 
                         onClick={() => setShowCategoryFilter(false)} 
                       />
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 10 }}
                         className="absolute top-full right-0 mt-2 w-64 bg-zinc-950 border border-white/10 rounded-2xl p-4 z-50 luxury-shadow"
                       >
                          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 opacity-50">Lọc theo danh mục</p>
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-none">
                             {allCategories.map(cat => (
                               <button
                                 key={cat}
                                 onClick={() => toggleCategory(cat)}
                                 className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                   selectedCategories.includes(cat)
                                   ? 'bg-cyan-500 text-black border-cyan-500'
                                   : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
                                 }`}
                               >
                                 {cat}
                               </button>
                             ))}
                          </div>
                          {selectedCategories.length > 0 && (
                            <button 
                              onClick={() => {
                                setSelectedCategories([]);
                                setShowCategoryFilter(false);
                              }}
                              className="mt-4 w-full py-2 text-[8px] uppercase font-bold text-red-400 hover:text-red-300 border-t border-white/5 pt-3"
                            >
                              Xóa lọc danh mục
                            </button>
                          )}
                       </motion.div>
                     </>
                   )}
                 </AnimatePresence>
              </div>

              {/* Hashtag Filter Button */}
              <Button 
                variant="outline" 
                onClick={() => setShowHashtags(!showHashtags)}
                className={`rounded-full border-white/10 bg-white/5 text-xs font-mono uppercase tracking-widest gap-2 ${showHashtags || selectedHashtags.length > 0 ? 'border-cyan-500/50 text-cyan-400' : ''}`}
              >
                <Tag className="w-3 h-3" />
                Hashtags
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showHashtags && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white/[0.02] rounded-2xl border border-white/5"
              >
                <div className="p-4 flex flex-wrap gap-2">
                  {allHashtags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleHashtag(tag)}
                      className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all border ${
                        selectedHashtags.includes(tag)
                        ? 'bg-white text-black border-white'
                        : 'bg-white/5 text-muted-foreground border-white/10 hover:border-white/30'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {selectedHashtags.length > 0 && (
                    <button 
                      onClick={() => setSelectedHashtags([])}
                      className="px-3 py-1 rounded-full text-[10px] font-bold text-red-400 hover:bg-red-400/10 transition-colors uppercase border border-red-400/30"
                    >
                      Clear Tags
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Grid Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPrompts.map((prompt, index) => (
              <motion.div
                layout
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                onClick={() => setSelectedPrompt(prompt)}
              >
                {/* Image Section */}
                <div className="aspect-[4/5] relative overflow-hidden cursor-pointer">
                  <img 
                    src={prompt.image} 
                    alt={prompt.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md border border-white/10 text-white uppercase tracking-tighter">
                      {prompt.category}
                    </span>
                  </div>

                  {/* Quick Action Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-2">
                       <Button size="sm" className="flex-1 bg-white text-black hover:bg-cyan-400 font-bold border-none h-9 text-xs">
                         <Sparkles className="w-3 h-3 mr-1" /> DÙNG MẪU NÀY
                       </Button>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4 bg-gradient-to-b from-[#0f0f0f] to-black">
                  <h3 className="font-bold text-base truncate group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                    {prompt.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {prompt.hashtags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] text-muted-foreground font-mono">#{tag.replace(/^#/, '')}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Grid className="w-16 h-16 mb-4" />
            <p className="text-xl font-mono uppercase tracking-widest">Không tìm thấy câu lệnh nào</p>
          </div>
        )}
      </ScrollArea>

      {/* Modals */}
      <AnimatePresence>
        {isAddingNew && (
          <ContributionModal 
            onClose={() => setIsAddingNew(false)} 
            onAdd={onAddPrompt}
            currentUserEmail={currentUserEmail}
            allCategories={allCategories}
            allHashtags={allHashtags}
          />
        )}
        {selectedPrompt && (
          <PromptDetailModal 
            prompt={selectedPrompt} 
            onClose={() => setSelectedPrompt(null)} 
            activeGenerations={activeGenerations}
            onUpdateGenerations={onUpdateGenerations || (() => {})}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Contribution Modal ---
const ContributionModal: React.FC<{ 
  onClose: () => void; 
  onAdd: (prompt: Omit<PromptItem, 'id'>) => void;
  currentUserEmail: string;
  allCategories: string[];
  allHashtags: string[];
}> = ({ onClose, onAdd, currentUserEmail, allCategories, allHashtags }) => {
  const [name, setName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [category, setCategory] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [imageValue, setImageValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Handle Paste Image
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const base64 = await imgbbService.fileToBase64(file);
            setImageFile(file);
            setImagePreview(base64);
            setImageValue(`pasted-image-${Date.now()}.png`);
            toast.success('Đã dán ảnh từ clipboard!');
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageValue('');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const base64 = await imgbbService.fileToBase64(file);
      setImagePreview(base64);
      setImageValue(file.name);
    }
  };

  const handleAddHashtag = (tag: string) => {
    const currentTags = hashtags.split(/\s+/).filter(t => t.length > 0);
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!currentTags.includes(cleanTag)) {
      setHashtags(prev => (prev.trim() + ' ' + cleanTag).trim());
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImageValue(val);
    if (val.startsWith('http')) {
      setImagePreview(val);
      setImageFile(null);
    }
  };

  const extractFromImage = async () => {
    if (!imagePreview) {
      toast.error('Vui lòng chọn ảnh minh họa trước');
      return;
    }
    setIsExtracting(true);
    try {
      const extracted = await promptLibraryService.extractPromptFromImage(imagePreview);
      if (extracted) {
        setPromptContent(extracted);
        toast.success('Đã bóc tách phong cách thành công!');
      } else {
        toast.error('Không thể bóc tách phong cách. Thử lại sau.');
      }
    } catch (err) {
      toast.error('Lỗi khi bóc tách phong cách.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !promptContent || !category || !imageValue) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    setIsPosting(true);
    // Background execution as requested
    onClose();
    toast.promise(
      (async () => {
        let imageUrl = imageValue;

        // If it's a file, upload to ImgBB
        if (imageFile && imagePreview) {
          const uploaded = await imgbbService.uploadImage(imagePreview);
          if (uploaded) {
            imageUrl = uploaded;
          } else {
            throw new Error('Upload ảnh thất bại');
          }
        }

        onAdd({
          name,
          prompt: promptContent,
          image: imageUrl,
          category,
          hashtags: hashtags.split(/[\s,]+/).filter(t => t.length > 0),
          userId: currentUserEmail,
          addedAt: new Date().toISOString()
        });
      })(),
      {
        loading: 'Đang đăng câu lệnh mới...',
        success: 'Đã đăng thành công lên thư viện!',
        error: (err) => `Lỗi: ${err.message}`
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
           <h2 className="text-lg font-bold font-mono tracking-tighter">ĐĂNG CÂU LỆNH MỚI</h2>
           <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <div className="md:col-span-3 space-y-3">
                <div className="space-y-1">
                   <label className="text-[10px] font-mono uppercase text-muted-foreground">Tên mẫu câu lệnh*</label>
                   <Input 
                      placeholder="Ví dụ: Neon Samurai" 
                      className="bg-white/5 h-8 text-xs" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-mono uppercase text-muted-foreground">Danh mục*</label>
                   <div className="relative group">
                      <Input 
                        placeholder="Cyberpunk, Watercolor..." 
                        className="bg-white/5 h-8 text-xs pr-8" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        list="categories-list"
                      />
                      <datalist id="categories-list">
                        {allCategories.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-mono uppercase text-muted-foreground">Hashtags</label>
                   <Input 
                      placeholder="#neon #future" 
                      className="bg-white/5 h-8 text-xs font-mono" 
                      value={hashtags} 
                      onChange={(e) => setHashtags(e.target.value)}
                   />
                   {allHashtags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-1 max-h-20 overflow-y-auto scrollbar-none">
                        <span className="text-[8px] uppercase text-white/30 mr-1 self-center">Gợi ý:</span>
                        {allHashtags.slice(0, 8).map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddHashtag(tag)}
                            className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                     </div>
                   )}
                </div>
             </div>

             <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-mono uppercase text-muted-foreground flex justify-between">
                  <span>Ảnh (Upload/URL)*</span>
                  {imagePreview && (
                    <button onClick={handleRemoveImage} className="text-red-400 hover:text-red-300">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </label>
                <div className="aspect-square bg-white/5 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                   {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                      <div className="text-center p-2">
                         <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground opacity-30" />
                         <span className="text-[8px] uppercase font-mono text-muted-foreground block">Tải lên / Ctrl+V</span>
                      </div>
                   )}
                   <input 
                      type="file" 
                      id="prompt-img" 
                      hidden 
                      accept="image/*" 
                      onChange={handleImageChange}
                   />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                      <Button size="xs" variant="outline" className="h-6 text-[8px] border-cyan-500/50 text-cyan-400" onClick={() => document.getElementById('prompt-img')?.click()}>
                         <Upload className="w-3 h-3 mr-1" /> Tải Lên
                      </Button>
                      <Input 
                        placeholder="URL..." 
                        className="w-[90%] h-6 text-[8px] bg-black" 
                        value={imageValue.startsWith('http') ? imageValue : ''}
                        onChange={handleUrlChange}
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase text-muted-foreground">Prompt Content*</label>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 text-[9px] font-bold text-cyan-400"
                onClick={extractFromImage}
                disabled={isExtracting}
              >
                {isExtracting ? <Sparkles className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                XUẤT TỪ ẢNH
              </Button>
            </div>
            <textarea 
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono focus:ring-1 focus:ring-cyan-500 focus:outline-none scrollbar-none"
              placeholder="Nhập nội dung câu lệnh..."
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
             <Button variant="ghost" className="flex-1 rounded-xl h-10 text-xs" onClick={onClose}>HỦY</Button>
             <Button 
                className="flex-2 bg-white text-black hover:bg-cyan-400 rounded-xl h-10 font-bold tracking-widest text-xs"
                onClick={handleSubmit}
                disabled={isPosting}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                ĐĂNG CÂU LỆNH
             </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Prompt Detail Modal ---
const PromptDetailModal: React.FC<{ 
  prompt: PromptItem; 
  onClose: () => void;
  activeGenerations: Record<string, any>;
  onUpdateGenerations: (gens: any) => void;
}> = ({ prompt, onClose, activeGenerations, onUpdateGenerations }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [targetImagePreview, setTargetImagePreview] = useState<string | null>(null);
  const [targetImageUrl, setTargetImageUrl] = useState('');
  const [editablePrompt, setEditablePrompt] = useState(prompt.prompt);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Handle Paste for Lab
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const base64 = await imgbbService.fileToBase64(file);
            setTargetImagePreview(base64);
            setTargetImageUrl('');
            toast.success('Đã dán ảnh từ clipboard vào Lab!');
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetImageUrl(val);
    if (val.trim().startsWith('http')) {
      setTargetImagePreview(val.trim());
    }
  };

  // Get active generation for THIS prompt if any
  const currentGen = activeGenerations[prompt.id];
  const isProcessing = currentGen?.status === 'processing';
  const resultImage = currentGen?.result;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('Đã sao chép!');
  };

  const handleTargetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const base64 = await imgbbService.fileToBase64(file);
        setTargetImagePreview(base64);
     }
  };

  const handleTransform = async () => {
    if (!targetImagePreview) {
      toast.error('Vui lòng tải lên ảnh cá nhân của bạn');
      return;
    }

    // Start background generation
    onUpdateGenerations({
      ...activeGenerations,
      [prompt.id]: { status: 'processing', startTime: Date.now(), result: null }
    });

    toast.info('Bắt đầu xử lý AI trong nền...');

    try {
      const result = await promptLibraryService.transformImage(targetImagePreview, editablePrompt);
      if (result) {
        onUpdateGenerations({
          ...activeGenerations,
          [prompt.id]: { status: 'completed', result: result }
        });
        toast.success(`Xử lý xong: ${prompt.name}!`);
      } else {
        onUpdateGenerations({
          ...activeGenerations,
          [prompt.id]: { status: 'error', error: 'Biến đổi thất bại' }
        });
        toast.error('Biến đổi thất bại. Thử lại sau.');
      }
    } catch (err) {
      onUpdateGenerations({
        ...activeGenerations,
        [prompt.id]: { status: 'error', error: 'Lỗi AI' }
      });
      toast.error('Lỗi khi xử lý AI.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-6xl bg-[#080808] border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,1)] relative"
      >
        <div className="absolute top-6 right-6 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-black/40 border border-white/10 hover:bg-white/10">
            <X size={20} />
          </Button>
        </div>

        {/* Left: Input Areas */}
        <div className="flex-1 bg-black p-6 md:p-10 flex flex-col border-r border-white/5 space-y-8 overflow-y-auto scrollbar-none">
           <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-500 tracking-[0.5em] uppercase font-bold">Media Studio Lab</span>
              <h2 className="text-3xl font-bold tracking-tighter uppercase">{prompt.name}</h2>
           </div>
           
           {/* Side by Side Preview */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <p className="text-[9px] uppercase font-mono text-muted-foreground tracking-widest text-center">Ảnh mẫu gốc</p>
                 <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative group">
                    <img src={prompt.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => setShowPreview(prompt.image)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Eye className="text-white w-6 h-6" />
                    </button>
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-[9px] uppercase font-mono text-muted-foreground tracking-widest text-center">Ảnh của bạn</p>
                 <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 group relative flex flex-col items-center justify-center">
                    {targetImagePreview ? (
                      <>
                        <img src={targetImagePreview} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Input 
                             placeholder="URL..." 
                             className="h-6 text-[8px] bg-black/50 border-white/10" 
                             value={targetImageUrl} 
                             onChange={handleUrlChange}
                           />
                        </div>
                        <button 
                          onClick={() => setShowPreview(targetImagePreview)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Eye className="text-white w-6 h-6" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-white/20" />
                        <span className="text-[8px] uppercase font-mono text-white/40 block mb-2">Tải ảnh lên / Ctrl+V</span>
                        <Input 
                           placeholder="Dán URL ảnh..." 
                           className="h-7 text-[9px] bg-black/40 border-white/10 w-3/4 mx-auto" 
                           value={targetImageUrl} 
                           onChange={handleUrlChange}
                        />
                      </div>
                    )}
                    <input 
                      type="file" 
                      id="lab-upload" 
                      hidden 
                      accept="image/*" 
                      onChange={handleTargetUpload} 
                    />
                    <button 
                      onClick={() => document.getElementById('lab-upload')?.click()}
                      className="absolute inset-0"
                    />
                 </div>
              </div>
           </div>

           {/* Editable Prompt */}
           <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">Nội dung câu lệnh (Tạm thời)</label>
                <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-transparent opacity-20" />
              </div>
              <textarea 
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-mono focus:ring-1 focus:ring-cyan-500/50 focus:outline-none scrollbar-none text-white/80"
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
              />
              <p className="text-[8px] text-muted-foreground uppercase opacity-50 italic">* Chỉnh sửa tại đây không làm thay đổi mẫu gốc</p>
           </div>

           <Button 
              className="w-full bg-white text-black hover:bg-cyan-400 h-14 rounded-2xl font-bold uppercase text-sm tracking-widest transition-all duration-500 luxury-shadow"
              onClick={handleTransform}
              disabled={isProcessing || !targetImagePreview}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-3 animate-spin text-cyan-600" />
                  <span className="animate-pulse">ĐANG XỬ LÝ TRONG NỀN...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-3" />
                  BẮT ĐẦU BIẾN ĐỔI ẢNH
                </>
              )}
           </Button>
        </div>

        {/* Right: Results Area */}
        <div className="w-full md:w-[480px] p-8 md:p-10 flex flex-col bg-zinc-950/20 backdrop-blur-sm overflow-y-auto scrollbar-none border-l border-white/5">
           <div className="flex-1 flex flex-col space-y-10">
              {/* Result Frame */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold">KẾT QUẢ AI</h4>
                    {resultImage && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPreview(resultImage)}>
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(resultImage || '')}>
                           <Link className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                 </div>
                 
                 <div className="aspect-square w-full rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-inner">
                    {resultImage ? (
                       <img src={resultImage} className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" referrerPolicy="no-referrer" />
                    ) : isProcessing ? (
                       <div className="text-center space-y-6">
                          <div className="relative w-20 h-20 mx-auto">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full"
                            />
                            <motion.div 
                              animate={{ rotate: -360 }}
                              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-2 border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                            </div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-500 font-bold">Neural Processing</p>
                             <p className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-60">Vui lòng chờ giây lát...</p>
                          </div>
                       </div>
                    ) : (
                       <div className="text-center opacity-20">
                          <ImageIcon className="w-20 h-20 mx-auto mb-4" />
                          <p className="text-xs font-mono uppercase tracking-widest font-bold">Chưa có kết quả</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Actions & Sharing */}
              <div className="space-y-4 flex-1">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Chi tiết & Chia sẻ</h4>
                    <Share2 className="w-3 h-3 text-white/20" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest gap-2"
                      onClick={() => handleCopy(editablePrompt)}
                    >
                      <Copy size={14} /> Copy Prompt
                    </Button>
                    {resultImage ? (
                      <Button 
                        className="h-12 bg-cyan-500 text-black hover:bg-cyan-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest gap-2"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = resultImage;
                          link.download = `transformed-${prompt.name}.png`;
                          link.click();
                        }}
                      >
                        <Download size={14} /> Tải ảnh
                      </Button>
                    ) : (
                      <Button variant="ghost" disabled className="h-12 border-white/5 bg-white/[0.01] rounded-2xl text-[10px] font-bold uppercase tracking-widest gap-2 opacity-30">
                        <Download size={14} /> Tải ảnh
                      </Button>
                    )}
                 </div>

                 <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                    <p className="text-[9px] uppercase font-mono text-muted-foreground">Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                       {prompt.hashtags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-white/60">#{tag.replace(/^#/, '')}</span>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Progress Indicator if processing */}
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase text-cyan-400">Đang tạo trong nền</p>
                    <p className="text-[8px] text-muted-foreground uppercase uppercase">Bạn có thể đóng cửa sổ này</p>
                  </div>
                </motion.div>
              )}
           </div>
        </div>

        {/* Large Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(null)}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 cursor-zoom-out"
            >
              <img src={showPreview} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" referrerPolicy="no-referrer" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-8 right-8 text-white hover:bg-white/10"
                onClick={() => setShowPreview(null)}
              >
                <X size={24} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
