import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, Shield, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoginProps {
  onLogin: (user: { id: string; name: string }) => void;
}

const VALID_USERS = [
  { id: 'letuan', username: 'letuan', password: 'letuan', name: 'Lê Tuấn' },
  { id: 'syan', username: 'syan', password: '716', name: 'Syan' }
];

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulate network delay
    setTimeout(() => {
      const user = VALID_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        onLogin({ id: user.id, name: user.name });
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="noise opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md p-6 relative z-10"
      >
        <Card className="p-8 bg-black/40 backdrop-blur-3xl border-white/10 luxury-shadow relative overflow-hidden group">
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent opacity-50 pointer-events-none" />
          
          <div className="space-y-8 relative">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 luxury-shadow mb-4">
                <Shield className="text-primary w-8 h-8" />
              </div>
              <h1 className="text-4xl font-minerva font-black italic tracking-tighter leading-none text-white lowercase">
                shian <span className="not-italic text-sm uppercase tracking-[0.3em] opacity-40 block mt-2 text-primary">personal hub</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold pt-2">Vui lòng đăng nhập để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Tài khoản</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                    <Input
                      type="text"
                      placeholder="Username"
                      className="pl-10 bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all font-medium text-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Mật khẩu</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                    <Input
                      type="password"
                      placeholder="Password"
                      className="pl-10 bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all font-medium text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold justify-center"
                  >
                    <AlertCircle size={14} />
                    Thông tin đăng nhập không hợp lệ
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 luxury-shadow relative overflow-hidden group/btn",
                  isLoading && "opacity-80"
                )}
              >
                <span className={cn(
                  "flex items-center gap-2 font-bold uppercase tracking-widest text-[11px] transition-all duration-300",
                  isLoading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                )}>
                  Đăng nhập <ChevronRight size={14} />
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />
              </Button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2">
                <Sparkles size={10} className="text-primary" /> 
                Trải nghiệm không gian cá nhân đẳng cấp
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground/40 font-serif italic">
            &copy; 2026 Shian Note. All data is securely private.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
