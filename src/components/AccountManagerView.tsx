import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Plus, 
  Search, 
  Trash2, 
  Edit2,
  Globe,
  ShoppingCart,
  Share2,
  Wrench,
  Mail,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Account } from '../types';
import { cn } from '@/lib/utils';

interface AccountManagerViewProps {
  accounts: Account[];
  onSync: (accounts: Account[]) => Promise<void>;
  vaultPin: string;
  onUpdatePin: (newPin: string) => void;
}

export default function AccountManagerView({ accounts, onSync, vaultPin, onUpdatePin }: AccountManagerViewProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isChangePinDialogOpen, setIsChangePinDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changePinError, setChangePinError] = useState('');

  const categories = [
    { id: 'all', label: 'Tất cả', icon: Globe },
    { id: 'ecommerce', label: 'Sàn TMĐT', icon: ShoppingCart },
    { id: 'social', label: 'Mạng xã hội', icon: Share2 },
    { id: 'tools', label: 'Công cụ', icon: Wrench },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'other', label: 'Khác', icon: Key },
  ];

  const filteredAccounts = useMemo(() => {
    if (!Array.isArray(accounts)) return [];
    return accounts.filter(acc => {
      if (!acc) return false;
      const title = String(acc.title || '');
      const username = String(acc.username || '');
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || acc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [accounts, searchQuery, activeCategory]);

  const handleUnlock = useCallback(() => {
    if (pin === vaultPin) {
      setIsLocked(false);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
      setTimeout(() => setPinError(false), 2000);
    }
  }, [pin, vaultPin]);

  const handleChangePin = () => {
    if (newPin.length !== 4) {
      setChangePinError('Mã PIN mới phải có 4 chữ số');
      return;
    }
    if (newPin !== confirmPin) {
      setChangePinError('Mã PIN xác nhận không khớp');
      return;
    }
    onUpdatePin(newPin);
    setIsChangePinDialogOpen(false);
    setNewPin('');
    setConfirmPin('');
    setChangePinError('');
  };

  // Keyboard support for PIN entry
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          setPin(prev => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handleUnlock();
        }
      } else if (e.key === 'Escape') {
        setPin('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pin, handleUnlock]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newAccount: Account = {
      id: editingAccount?.id || Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      url: formData.get('url') as string,
      category: formData.get('category') as any,
      notes: formData.get('notes') as string,
      twoFactorCode: formData.get('twoFactorCode') as string,
      updatedAt: new Date().toISOString(),
    };

    let updatedAccounts;
    if (editingAccount) {
      updatedAccounts = accounts.map(acc => acc.id === editingAccount.id ? newAccount : acc);
    } else {
      updatedAccounts = [...accounts, newAccount];
    }

    await onSync(updatedAccounts);
    setIsAddDialogOpen(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = async (id: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== id);
    await onSync(updatedAccounts);
  };

  if (isLocked) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-black/40 backdrop-blur-2xl border-white/10 text-center space-y-8 luxury-shadow">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="text-primary" size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold italic text-white">Shian Vault</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Nhập mã PIN để truy cập két sắt</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-300",
                      pin.length > i ? "bg-primary border-primary scale-110" : "border-white/20"
                    )} 
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="h-14 text-xl font-bold bg-white/5 border-white/10 hover:bg-white/10"
                    onClick={() => pin.length < 4 && setPin(prev => prev + num)}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="h-14 text-red-400 hover:bg-red-400/10"
                  onClick={() => setPin('')}
                >
                  Xóa
                </Button>
                <Button
                  variant="outline"
                  className="h-14 text-xl font-bold bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() => pin.length < 4 && setPin(prev => prev + '0')}
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "h-14 bg-primary text-primary-foreground hover:bg-primary/90",
                    pin.length !== 4 && "opacity-50 pointer-events-none"
                  )}
                  onClick={handleUnlock}
                >
                  <Unlock size={20} />
                </Button>
              </div>

              {pinError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                >
                  <AlertCircle size={12} /> Mã PIN không chính xác
                </motion.p>
              )}
            </div>
            
            <p className="text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
              Dữ liệu được mã hóa cục bộ trên thiết bị của bạn
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-8 gap-4 md:gap-8 overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center luxury-shadow shrink-0">
            <ShieldCheck className="text-primary w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold italic tracking-tight text-white">Shian Vault</h2>
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Quản lý bảo mật</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative flex-1 md:w-64 min-w-[150px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input 
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 h-9 md:h-10 text-xs rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                setEditingAccount(null);
                setIsAddDialogOpen(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 md:h-10 px-4 md:px-6 rounded-xl luxury-shadow flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest font-bold"
            >
              <Plus size={16} /><span className="hidden sm:inline">Thêm tài khoản</span><span className="sm:hidden">Thêm</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLocked(true)}
              className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <Lock size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChangePinDialogOpen(true)}
              className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
              title="Đổi mã PIN"
            >
              <Key size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant="ghost"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "h-9 px-4 rounded-full text-[10px] uppercase tracking-widest font-bold gap-2 transition-all",
              activeCategory === cat.id 
                ? "bg-primary/20 text-primary border border-primary/20" 
                : "text-muted-foreground hover:bg-white/5"
            )}
          >
            <cat.icon size={12} />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Accounts Grid */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
          <AnimatePresence mode="popLayout">
            {filteredAccounts.map((acc) => (
              <motion.div
                key={acc.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="group relative bg-black/40 backdrop-blur-xl border-white/10 overflow-hidden luxury-shadow hover:border-primary/30 transition-all duration-500">
                  <div className="p-6 space-y-6">
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          {(() => {
                            const category = categories.find(c => c.id === acc.category) || categories[categories.length - 1];
                            const Icon = category.icon;
                            return <Icon size={18} className="text-primary" />;
                          })()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{acc.title}</h3>
                          <Badge variant="outline" className="text-[8px] uppercase tracking-widest py-0 h-4 border-white/10 bg-white/5">
                            {categories.find(c => c.id === acc.category)?.label || 'Khác'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-white/10"
                          onClick={() => {
                            setEditingAccount(acc);
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                          onClick={() => handleDeleteAccount(acc.id)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>

                    {/* Credentials */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Tên đăng nhập / Email</label>
                        <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 h-9 border border-white/5 group/field">
                          <span className="text-xs font-medium truncate pr-4">{acc.username}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover/field:opacity-100 transition-opacity"
                            onClick={() => handleCopy(acc.username, acc.id + '-user')}
                          >
                            {copiedId === acc.id + '-user' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Mật khẩu</label>
                        <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 h-9 border border-white/5 group/field">
                          <span className="text-xs font-mono tracking-wider">
                            {showPasswords[acc.id] ? acc.password : '••••••••••••'}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => togglePassword(acc.id)}
                            >
                              {showPasswords[acc.id] ? <EyeOff size={10} /> : <Eye size={10} />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleCopy(acc.password, acc.id + '-pass')}
                            >
                              {copiedId === acc.id + '-pass' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {acc.twoFactorCode && (
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest text-primary font-bold">Mã 2FA / Khôi phục</label>
                          <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 h-9 border border-primary/10 group/field">
                            <span className="text-xs font-mono font-bold text-primary">{acc.twoFactorCode}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-primary"
                              onClick={() => handleCopy(acc.twoFactorCode!, acc.id + '-2fa')}
                            >
                              {copiedId === acc.id + '-2fa' ? <Check size={10} /> : <Copy size={10} />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {acc.url && (
                      <Button 
                        variant="outline" 
                        className="w-full h-9 bg-white/5 border-white/10 hover:bg-white/10 text-[9px] uppercase tracking-widest font-bold gap-2"
                        onClick={() => window.open(acc.url, '_blank')}
                      >
                        <ExternalLink size={12} /> Truy cập trang web
                      </Button>
                    )}
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">
              {editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAccount} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tên gợi nhớ</label>
                <Input 
                  name="title" 
                  defaultValue={editingAccount?.title} 
                  required 
                  placeholder="Ví dụ: Shopee Shop A"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Danh mục</label>
                <Select name="category" defaultValue={editingAccount?.category || 'ecommerce'}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tên đăng nhập / Email</label>
                <Input 
                  name="username" 
                  defaultValue={editingAccount?.username} 
                  required 
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mật khẩu</label>
                <Input 
                  name="password" 
                  type="text"
                  defaultValue={editingAccount?.password} 
                  required 
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">URL Trang đăng nhập (Tùy chọn)</label>
              <Input 
                name="url" 
                defaultValue={editingAccount?.url} 
                placeholder="https://..."
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mã 2FA / Khôi phục</label>
                <Input 
                  name="twoFactorCode" 
                  defaultValue={editingAccount?.twoFactorCode} 
                  className="bg-white/5 border-white/10 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Ghi chú thêm</label>
                <Input 
                  name="notes" 
                  defaultValue={editingAccount?.notes} 
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAddDialogOpen(false)}
                className="text-muted-foreground hover:bg-white/5"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                Lưu tài khoản
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Change PIN Dialog */}
      <Dialog open={isChangePinDialogOpen} onOpenChange={setIsChangePinDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">Đổi mã PIN Két sắt</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mã PIN mới (4 số)</label>
              <Input 
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em]"
                placeholder="••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Xác nhận mã PIN mới</label>
              <Input 
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em]"
                placeholder="••••"
              />
            </div>
            {changePinError && (
              <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold text-center">{changePinError}</p>
            )}
            <DialogFooter className="pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsChangePinDialogOpen(false)}
                className="text-muted-foreground hover:bg-white/5"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleChangePin}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                Cập nhật PIN
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
