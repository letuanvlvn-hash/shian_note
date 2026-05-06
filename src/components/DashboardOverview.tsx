import { 
  FileText, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  CreditCard, 
  ArrowUpRight,
  Plus,
  Clock,
  CloudRain,
  Zap,
  History,
  TrendingUp,
  Settings,
  Bookmark,
  Globe,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';
import UniversalClock from './UniversalClock';

import { DashboardSettings, ProfileSettings, AppBookmark } from '../types';

interface DashboardOverviewProps {
  onNavigate: (view: any) => void;
  onLaunchBookmark: (bookmark: AppBookmark, urlType: 'published' | 'studio') => void;
  settings: DashboardSettings;
  profile: ProfileSettings;
  bookmarks: AppBookmark[];
  counts: {
    notes: number;
    gallery: number;
    calendar: number;
    finance: number;
    accounts: number;
  };
}

export default function DashboardOverview({ onNavigate, onLaunchBookmark, settings, profile, bookmarks, counts }: DashboardOverviewProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Ghi chú', value: counts.notes.toString(), icon: FileText, color: 'text-blue-400', trend: 'Tổng số', view: 'notes' },
    { label: 'Thư viện', value: counts.gallery.toString(), icon: ImageIcon, color: 'text-purple-400', trend: 'Ảnh đã lưu', view: 'gallery' },
    { label: 'Lịch hẹn', value: counts.calendar.toString(), icon: CalendarIcon, color: 'text-orange-400', trend: 'Sự kiện', view: 'calendar' },
    { label: 'Thanh toán', value: counts.finance.toString(), icon: CreditCard, color: 'text-green-400', trend: 'Giao dịch', view: 'finance' },
    { label: 'Két sắt', value: counts.accounts.toString(), icon: Globe, color: 'text-amber-400', trend: 'Tài khoản', view: 'accounts' },
  ];

  const quickActions = [
    { label: 'Ghi chú mới', icon: Plus, view: 'notes' },
    { label: 'Tải ảnh lên', icon: ImageIcon, view: 'gallery' },
    { label: 'Đặt lịch hẹn', icon: CalendarIcon, view: 'calendar' },
    { label: 'Két sắt', icon: Globe, view: 'accounts' },
    { label: 'Cài đặt', icon: Settings, view: 'profile' },
  ];

  const recentActivity = [
    { id: 1, type: 'note', title: 'Ý tưởng thiết kế mới', time: '2 giờ trước' },
    { id: 2, type: 'image', title: 'Ảnh chụp dự án A', time: '5 giờ trước' },
    { id: 3, type: 'payment', title: 'Hóa đơn điện tháng 4', time: 'Hôm qua' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Cover Image Section */}
      {settings.coverImage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-video md:aspect-[700/250] rounded-[2rem] md:rounded-[3rem] luxury-shadow group"
        >
          {/* Background Layer with Overflow Hidden */}
          <div 
            className="absolute inset-0 rounded-[3rem] overflow-hidden"
            style={{
              opacity: (settings.coverOpacity ?? 100) / 100,
            }}
          >
            <img 
              src={settings.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              style={{
                filter: `blur(${settings.coverBlur ?? 0}px)`,
              }}
              referrerPolicy="no-referrer"
            />
            
            {/* Custom Overlay */}
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: (settings.coverOverlay ?? 40) / 100 }}
            />
            
            {/* Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          
          {/* Content Layer - NOT overflow hidden to allow calendar to pop out */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 z-20">
            {settings.showUniversalClock && (
              <UniversalClock 
                showLunar={settings.showLunarCalendar} 
                showFullCalendar={settings.showFullCalendar}
                clockStyle={settings.clockStyle || 1}
                className="max-w-3xl w-full scale-75 md:scale-100"
              />
            )}
            
            {!settings.showUniversalClock && (
              <div className="text-center space-y-2 md:space-y-4">
                <Badge className="bg-white/10 backdrop-blur-md border-white/10 text-[8px] md:text-[10px] uppercase tracking-[0.3em] py-1 px-3">
                  Shian Member
                </Badge>
                <h1 className="text-3xl md:text-7xl font-serif font-black italic tracking-tighter-extra text-white drop-shadow-2xl">
                  Premium Space.
                </h1>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {settings.showGreeting && (
        <header className={cn(
          "flex flex-col gap-2 md:gap-4 max-w-4xl",
          settings.layout === 'center' && "mx-auto text-center items-center"
        )}>
          <motion.div
            initial={{ opacity: 0, x: settings.layout === 'center' ? 0 : -20, y: settings.layout === 'center' ? -20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold mb-2 md:mb-4 block">
              Dashboard / Overview
            </span>
            <h2 className={cn(
              "font-serif font-black tracking-tighter-extra leading-tight italic flex flex-wrap items-baseline gap-x-2 md:gap-x-3",
              settings.fontSize === 'sm' && "text-2xl md:text-4xl",
              settings.fontSize === 'md' && "text-3xl md:text-5xl",
              settings.fontSize === 'lg' && "text-4xl md:text-7xl",
              settings.fontSize === 'xl' && "text-5xl md:text-8xl"
            )}>
              <span className="text-foreground">{settings.greetingText}</span>
              <span className="not-italic font-sans font-bold text-primary/90">
                {profile.name}.
              </span>
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className={cn(
              "text-muted-foreground font-light leading-relaxed max-w-md",
              settings.fontSize === 'sm' && "text-sm",
              settings.fontSize === 'md' && "text-base",
              settings.fontSize === 'lg' && "text-lg",
              settings.fontSize === 'xl' && "text-xl"
            )}
          >
            {settings.subtitleText}
          </motion.p>
        </header>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Stats Grid */}
        {settings.showStats && (
          <div className="md:col-span-8 grid grid-cols-2 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -5 }}
                onClick={() => onNavigate(stat.view)}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-[1.5rem] md:rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-card border border-border p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] luxury-shadow backdrop-blur-xl dashboard-card">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className={cn("p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/5", stat.color)}>
                      <stat.icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
                    </div>
                    <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">{stat.value}</h3>
                    <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</p>
                  </div>
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5 flex items-center gap-1 md:gap-2">
                    <TrendingUp size={10} className="text-green-400" />
                    <span className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-widest">{stat.trend}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Clock & Weather Widget */}
        <div className="md:col-span-4 space-y-6">
          {(settings.showClock || settings.showWeather) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border p-8 rounded-[2.5rem] luxury-shadow backdrop-blur-xl relative overflow-hidden group dashboard-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative space-y-8">
                {settings.showClock && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-indigo-400">
                      <Clock size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-bold tracking-tight">
                        {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {time.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                )}

                {settings.showWeather && (
                  <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-blue-400">
                      <CloudRain size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-bold tracking-tight">28°C</h3>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Thành phố Hồ Chí Minh / Có mưa</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          {settings.showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-6 rounded-[2rem] luxury-shadow backdrop-blur-xl dashboard-card"
            >
              <div className="flex items-center gap-2 mb-6">
                <Zap size={14} className="text-yellow-400" />
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Thao tác nhanh</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    onClick={() => onNavigate(action.view)}
                    className="h-auto py-4 flex flex-col gap-2 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-2xl transition-all group"
                  >
                    <action.icon size={18} strokeWidth={1.5} className="text-muted-foreground group-hover:text-white transition-colors" />
                    <span className="text-[9px] uppercase tracking-widest font-bold">{action.label}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent Activity Section */}
        {settings.showRecentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-12 bg-card/40 border border-border p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] luxury-shadow backdrop-blur-xl dashboard-card"
          >
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <Bookmark size={18} className="text-amber-400" />
                <h3 className="text-lg md:text-xl font-serif font-bold italic tracking-tight">Ứng dụng nhanh</h3>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('bookmarks')}
                className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-white"
              >
                Quản lý
              </Button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              {bookmarks.slice(0, 6).map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group text-center"
                  onClick={() => onLaunchBookmark(bookmark, 'published')}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform relative">
                    <Bookmark size={16} className="md:w-5 md:h-5 text-amber-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full flex items-center justify-center">
                      <ArrowUpRight size={8} className="text-white" />
                    </div>
                  </div>
                  <div className="space-y-0.5 md:space-y-1 overflow-hidden w-full">
                    <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate">{bookmark.title}</h4>
                    <p className="text-[7px] md:text-[8px] text-muted-foreground uppercase tracking-widest font-medium truncate">{bookmark.category}</p>
                  </div>
                </div>
              ))}
              {bookmarks.length === 0 && (
                <div 
                  className="col-span-full py-8 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all"
                  onClick={() => onNavigate('bookmarks')}
                >
                  <Plus size={24} className="mb-2 opacity-20" />
                  <p className="text-[10px] uppercase tracking-widest font-bold">Chưa có ứng dụng nhanh</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent Activity Section */}
        {settings.showRecentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-12 bg-card/40 border border-border p-8 rounded-[2.5rem] luxury-shadow backdrop-blur-xl dashboard-card"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <History size={18} className="text-purple-400" />
                <h3 className="text-xl font-serif font-bold italic tracking-tight">Hoạt động gần đây</h3>
              </div>
              <Button variant="ghost" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-white">
                Xem tất cả
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    {activity.type === 'note' && <FileText size={16} className="text-blue-400" />}
                    {activity.type === 'image' && <ImageIcon size={16} className="text-purple-400" />}
                    {activity.type === 'payment' && <CreditCard size={16} className="text-green-400" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-xs font-semibold truncate tracking-tight">{activity.title}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mt-1">{activity.time}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
