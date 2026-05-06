/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  CreditCard, 
  User, 
  Menu,
  X,
  LogOut,
  ListTodo,
  Volume2,
  VolumeX,
  Clock,
  Bookmark,
  Settings,
  Globe,
  Cpu,
  Sparkles,
  ExternalLink,
  Newspaper,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
} from '@/components/ui/dialog';
import { AppearanceSettings, CloudSettings, AppBookmark } from './types';
import { googleSheetsService } from './services/googleSheetsService';
import { aiVoiceService } from './services/aiVoiceService';

// Views
import DashboardOverview from './components/DashboardOverview';
import NotesView from './components/NotesView';
import GalleryView from './components/GalleryView';
import CalendarView from './components/CalendarView';
import FinanceView from './components/FinanceView';
import ProfileView from './components/ProfileView';
import BookmarksView from './components/BookmarksView';
import AccountManagerView from './components/AccountManagerView';
import NewsView from './components/NewsView';
import EntertainmentView from './components/EntertainmentView';
import { PromptLibraryView } from './components/PromptLibraryView';
import MusicPlayerBar from './components/MusicPlayerBar';
import DraggableVideoPlayer from './components/DraggableVideoPlayer';
import ShopeeChat from './components/ShopeeChat';
import TodoPanel from './components/TodoPanel';
import Login from './components/Login';
import { Toaster } from 'sonner';

type View = 'dashboard' | 'notes' | 'gallery' | 'calendar' | 'news' | 'music' | 'finance' | 'profile' | 'bookmarks' | 'accounts' | 'prompts';

interface AuthenticatedUser {
  id: string;
  name: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    const saved = localStorage.getItem('shian_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [selectedBookmark, setSelectedBookmark] = useState<AppBookmark | null>(null);
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
  const [internalBrowserUrl, setInternalBrowserUrl] = useState<string | null>(null);
  const [activeMusicItem, setActiveMusicItem] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideoWindows, setActiveVideoWindows] = useState<any[]>([]);
  const [maxVideoZIndex, setMaxVideoZIndex] = useState(200);
  
  // ALL Data store (to preserve other users' data)
  const [allRawData, setAllRawData] = useState<any>({});
  
  // Appearance State
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'elite',
    font: 'classic',
    fontSize: 'md',
    radius: 'lg',
    dashboard: {
      showGreeting: true,
      greetingText: 'Chào buổi sáng,',
      subtitleText: 'Chào mừng bạn quay trở lại không gian cá nhân cao cấp. Mọi thứ đã sẵn sàng cho ngày mới của bạn.',
      layout: 'left',
      fontSize: 'lg',
      showStats: true,
      showClock: true,
      showWeather: true,
      showQuickActions: true,
      showRecentActivity: true,
      glassOpacity: 20,
      showTodoPanel: true,
      coverImage: 'https://picsum.photos/seed/elite-cover/1920/1080',
      showUniversalClock: true,
      showLunarCalendar: true,
      showFullCalendar: false,
      clockStyle: 1,
    },
    profile: {
      name: 'Đặng Xinh',
      role: 'Nhà thiết kế & Doanh nhân',
      avatar: 'https://picsum.photos/seed/user/200',
      vaultPin: '1234'
    },
    isAudioEnabled: false
  });

  const [isTodoPinned, setIsTodoPinned] = useState(false);

  // Filtered Data State (Only for current user)
  const [notes, setNotes] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<AppBookmark[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entertainment, setEntertainment] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [activeGenerations, setActiveGenerations] = useState<Record<string, any>>({});

  // Cloud State
  const [cloud, setCloud] = useState<CloudSettings>({
    pCloudToken: ''
  });

  const handleLogin = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    localStorage.setItem('shian_user', JSON.stringify(user));
    setAppearance(prev => ({
      ...prev,
      profile: { ...prev.profile, name: user.name }
    }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('shian_user');
    window.location.reload(); // Refresh to clear state
  };

  // Load initial data from Google Sheets
  useEffect(() => {
    if (!currentUser) return;
    
    googleSheetsService.checkConnection();
    const loadData = async () => {
      try {
        const data = await googleSheetsService.getAllData();
        if (data) {
          setAllRawData(data); // Save all for merging

          // Helper to filter by userId
          const filterUser = (list: any[]) => (list || []).filter(item => item.userId === currentUser.id);

          if (data.settings) {
            const userSettings = data.settings.find((s: any) => s.userId === currentUser.id);
            if (userSettings) {
              if (userSettings.appearance) setAppearance(userSettings.appearance);
              if (userSettings.cloud) setCloud(userSettings.cloud);
            }
          }
          
          setNotes(filterUser(data.notes));
          setAppointments(filterUser(data.calendar));
          setTransactions(filterUser(data.finance));
          setGallery(filterUser(data.gallery));
          setTodos(filterUser(data.todos));
          setBookmarks(filterUser(data.bookmarks));
          setAccounts(filterUser(data.accounts));
          setEntertainment(filterUser(data.entertainment));
          setPrompts(filterUser(data.prompts));
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };
    loadData();
  }, [currentUser]);

  // Global Sync Functions with Isolation
  const syncTableWithIsolation = useCallback(async (tableName: string, userList: any[]) => {
    if (!currentUser) return false;

    try {
      // Attach userId to all items if missing
      const preparedUserList = userList.map(item => ({ ...item, userId: currentUser.id }));
      
      // Merge with other users' data
      const tableKey = tableName === 'Calendar' ? 'calendar' : tableName.toLowerCase();
      const otherUsersData = (allRawData[tableKey] || []).filter((item: any) => item.userId !== currentUser.id);
      const fullTableData = [...otherUsersData, ...preparedUserList];

      // Update local raw cache
      setAllRawData(prev => ({ ...prev, [tableKey]: fullTableData }));
      
      // Sync to sheet
      const success = await googleSheetsService.syncTable(tableName, fullTableData);
      return success;
    } catch (error) {
      console.error(`Isolation sync error for ${tableName}:`, error);
      return false;
    }
  }, [currentUser, allRawData]);

  const syncNotes = useCallback(async (newNotes: any[]) => {
    setNotes(newNotes);
    await syncTableWithIsolation('Notes', newNotes);
  }, [syncTableWithIsolation]);

  const syncAppointments = useCallback(async (newApps: any[]) => {
    setAppointments(newApps);
    await syncTableWithIsolation('Calendar', newApps);
  }, [syncTableWithIsolation]);

  const syncTransactions = useCallback(async (newTrans: any[]) => {
    setTransactions(newTrans);
    await syncTableWithIsolation('Finance', newTrans);
  }, [syncTableWithIsolation]);

  const syncGallery = useCallback(async (newGallery: any[]) => {
    setGallery(newGallery);
    await syncTableWithIsolation('Gallery', newGallery);
  }, [syncTableWithIsolation]);

  const syncTodos = useCallback(async (newTodos: any[]) => {
    setTodos(newTodos);
    await syncTableWithIsolation('Todos', newTodos);
  }, [syncTableWithIsolation]);

  const syncBookmarks = useCallback(async (newBookmarks: AppBookmark[]) => {
    setBookmarks(newBookmarks);
    await syncTableWithIsolation('Bookmarks', newBookmarks);
  }, [syncTableWithIsolation]);

  const syncAccounts = useCallback(async (newAccounts: any[]) => {
    setAccounts(newAccounts);
    await syncTableWithIsolation('Accounts', newAccounts);
  }, [syncTableWithIsolation]);

  const syncEntertainment = useCallback(async (newItems: any[]) => {
    setEntertainment(newItems);
    await syncTableWithIsolation('Entertainment', newItems);
  }, [syncTableWithIsolation]);

  const syncPrompts = useCallback(async (newPrompts: any[]) => {
    setPrompts(newPrompts);
    await syncTableWithIsolation('Prompts', newPrompts);
  }, [syncTableWithIsolation]);

  // Handle responsive sidebar and todo panel
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setAppearance(prev => ({
          ...prev,
          dashboard: { ...prev.dashboard, showTodoPanel: false }
        }));
      }
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync settings to Google Sheets when they change
  useEffect(() => {
    if (isInitialLoad || !currentUser) return;
    const timer = setTimeout(() => {
      // For settings, we also need to merge with other users
      const otherUsersSettings = (allRawData.settings || []).filter((s: any) => s.userId !== currentUser.id);
      const fullSettingsData = [...otherUsersSettings, { userId: currentUser.id, appearance, cloud }];
      
      setAllRawData(prev => ({ ...prev, settings: fullSettingsData }));
      googleSheetsService.syncTable('Settings', fullSettingsData);
    }, 2000);
    return () => clearTimeout(timer);
  }, [appearance, cloud, isInitialLoad, currentUser]);

  // Apply appearance classes to body
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Clear existing classes
    body.className = '';
    
    // Add new classes
    if (appearance.theme !== 'elite') body.classList.add(`theme-${appearance.theme}`);
    if (appearance.font !== 'classic') body.classList.add(`font-${appearance.font}`);
    body.classList.add(`size-${appearance.fontSize}`);
    body.classList.add(`radius-${appearance.radius}`);

    // Handle dark mode class for light themes
    if (appearance.theme === 'ivory-gold') {
      html.classList.remove('dark');
    } else {
      // Default to dark for other themes as they have dark backgrounds
      html.classList.add('dark');
    }
  }, [appearance]);

  // Appointment Notification Logic
  useEffect(() => {
    if (!appearance.isAudioEnabled) return;

    const checkAppointments = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDayStr = `${year}-${month}-${day}`;
      
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      console.log(`Checking notifications at ${currentHours}:${currentMinutes} for ${currentDayStr}`);

      // Helper to parse time string
      const parseTime = (timeStr: string) => {
        try {
          const s = timeStr.toUpperCase().trim();
          let h = 0, m = 0;
          if (s.includes('AM') || s.includes('PM')) {
            const parts = s.split(/\s+/);
            const timePart = parts[0];
            const ampm = parts[1];
            [h, m] = timePart.split(':').map(Number);
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
          } else {
            [h, m] = s.split(':').map(Number);
          }
          return { h, m };
        } catch (e) {
          return null;
        }
      };

      const triggerNotification = (item: any, isTodo: boolean = false) => {
        if (notifiedIds.has(item.id)) return;
        
        setNotifiedIds(prev => new Set(prev).add(item.id));
        console.log(`Triggering notification for: ${item.title || item.text}`);

        const title = isTodo ? 'Ghi chú' : item.title;
        const content = isTodo ? item.text : item.description;

        const playAudio = (audioData: string | null) => {
          const sound = audioData || appearance.notificationSound || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
          const audio = new Audio(sound);
          
          // Loop if it's a standard sound, AI voice is usually short
          if (!audioData) {
            audio.loop = true;
          }
          
          audio.play().catch(e => console.error("Audio play failed:", e));
          setCurrentAudio(audio);

          // Auto stop after 1 minute if not stopped manually
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
            setCurrentAudio(prev => prev === audio ? null : prev);
          }, 60000);
        };

        if (appearance.useAIVoice) {
          aiVoiceService.speak(`Nhắc nhở: ${title}. ${content || ''}`)
            .then(audioData => {
              if (audioData) {
                playPCM(audioData);
              } else {
                playAudio(null);
              }
            });
        } else {
          playAudio(null);
        }
        
        setActiveNotification(isTodo ? { ...item, title: 'Ghi chú', description: item.text } : item);
      };

      const playPCM = (base64Data: string) => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          const binaryString = atob(base64Data.split(',')[1]);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const pcmData = new Int16Array(bytes.buffer);
          const float32Data = new Float32Array(pcmData.length);
          for (let i = 0; i < pcmData.length; i++) {
            float32Data[i] = pcmData[i] / 32768.0;
          }

          const buffer = audioContext.createBuffer(1, float32Data.length, 24000);
          buffer.copyToChannel(float32Data, 0);
          
          let count = 0;
          let currentSource: AudioBufferSourceNode | null = null;
          let isStopped = false;

          const playNext = () => {
            if (count >= 5 || isStopped) {
              setCurrentAudio(null);
              return;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.onended = () => {
              count++;
              playNext();
            };
            source.start();
            currentSource = source;
          };

          playNext();
          
          const stopObj = {
            pause: () => { 
              isStopped = true;
              if (currentSource) {
                try { currentSource.stop(); } catch(e) {}
              }
            },
            currentTime: 0
          } as any;
          
          setCurrentAudio(stopObj);
        } catch (e) {
          console.error("PCM Playback failed:", e);
          const sound = appearance.notificationSound || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
          const audio = new Audio(sound);
          audio.loop = true;
          audio.play();
          setCurrentAudio(audio);
        }
      };

      // Check Appointments
      appointments.forEach(app => {
        if (app.date === currentDayStr) {
          const time = parseTime(app.time);
          if (time && time.h === currentHours && time.m === currentMinutes) {
            triggerNotification(app);
          }
        }
      });

      // Check Todos
      todos.forEach(todo => {
        if (todo.dueTime && !todo.completed) {
          const time = parseTime(todo.dueTime);
          // For todos, we check if they were created today or if we just want to notify regardless of date if time matches
          // Usually, todos in the sidebar are for "today"
          if (time && time.h === currentHours && time.m === currentMinutes) {
            triggerNotification(todo, true);
          }
        }
      });
    };

    const interval = setInterval(checkAppointments, 20000); // Check every 20 seconds for better responsiveness
    return () => clearInterval(interval);
  }, [appointments, todos, notifiedIds, appearance.isAudioEnabled, appearance.useAIVoice, appearance.notificationSound]);

  const stopNotification = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setActiveNotification(null);
  };
  const toggleAudio = () => {
    const newState = !appearance.isAudioEnabled;
    setAppearance({ ...appearance, isAudioEnabled: newState });
    
    if (newState) {
      // Play a silent sound to unlock audio context
      const sound = appearance.notificationSound || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
      const audio = new Audio(sound);
      audio.volume = 0;
      audio.play().catch(() => {});
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'notes', label: 'Ghi chú', icon: FileText },
    { id: 'prompts', label: 'Câu lệnh AI', icon: Sparkles },
    { id: 'gallery', label: 'Thư viện', icon: ImageIcon },
    { id: 'calendar', label: 'Lịch hẹn', icon: CalendarIcon },
    { id: 'news', label: 'Tin tức', icon: Newspaper },
    { id: 'music', label: 'Giải trí', icon: Music },
    { id: 'finance', label: 'Thanh toán', icon: CreditCard },
    { id: 'bookmarks', label: 'Quản lý App', icon: Settings },
    { id: 'accounts', label: 'Két sắt', icon: Globe },
    { id: 'profile', label: 'Cá nhân', icon: User },
  ];

  const handleLaunchBookmark = (bookmark: AppBookmark, urlType: 'published' | 'studio') => {
    const url = urlType === 'published' ? bookmark.publishedUrl : bookmark.studioUrl;
    
    if (urlType === 'published' && bookmark.openMode === 'internal') {
      setInternalBrowserUrl(url);
    } else {
      window.open(url, '_blank');
    }
    setIsLaunchDialogOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return (
        <DashboardOverview 
          onNavigate={setActiveView} 
          onLaunchBookmark={handleLaunchBookmark}
          settings={appearance.dashboard}
          profile={appearance.profile}
          bookmarks={bookmarks}
          counts={{
            notes: notes.length,
            gallery: gallery.length,
            calendar: appointments.length,
            finance: transactions.length,
            accounts: accounts.length
          }}
        />
      );
      case 'notes': return <NotesView notes={notes} onSync={syncNotes} />;
      case 'gallery': return <GalleryView gallery={gallery} onSync={syncGallery} cloudSettings={cloud} />;
      case 'calendar': return <CalendarView appointments={appointments} onSync={syncAppointments} />;
      case 'news': return <NewsView />;
      case 'music': return (
        <EntertainmentView 
          items={entertainment}
          onSync={syncEntertainment}
          activeMusicItem={activeMusicItem}
          isPlaying={isPlaying}
          onSelectItem={(item, forceWindow) => {
            if (forceWindow || item.category === 'video' || (item.platform === 'youtube' && !item.url.includes('list'))) {
              // Open as window
              const existing = activeVideoWindows.find(w => w.id === item.id);
              if (existing) {
                setActiveVideoWindows(prev => prev.map(w => 
                  w.id === item.id ? { ...w, zIndex: maxVideoZIndex + 1 } : w
                ));
                setMaxVideoZIndex(prev => prev + 1);
              } else {
                const offset = (activeVideoWindows.length % 5) * 40;
                setActiveVideoWindows(prev => [...prev, {
                  ...item,
                  zIndex: maxVideoZIndex + 1,
                  position: { x: 200 + offset, y: 100 + offset }
                }]);
                setMaxVideoZIndex(prev => prev + 1);
              }
            } else {
              // Play in music bar
              if (activeMusicItem?.id === item.id) {
                setIsPlaying(!isPlaying);
              } else {
                setActiveMusicItem(item);
                setIsPlaying(true);
              }
            }
          }} 
        />
      );
      case 'prompts': return (
        <PromptLibraryView 
          prompts={prompts} 
          onAddPrompt={(p) => {
            const newItem = { id: Date.now().toString(), ...p };
            syncPrompts([...prompts, newItem]);
          }}
          currentUserEmail={currentUser.id}
          activeGenerations={activeGenerations}
          onUpdateGenerations={setActiveGenerations}
        />
      );
      case 'finance': return <FinanceView transactions={transactions} onSync={syncTransactions} />;
      case 'bookmarks': return <BookmarksView bookmarks={bookmarks} onSync={syncBookmarks} />;
      case 'accounts': return (
        <AccountManagerView 
          accounts={accounts} 
          onSync={syncAccounts} 
          vaultPin={appearance.profile.vaultPin || '1234'}
          onUpdatePin={(newPin) => setAppearance({
            ...appearance,
            profile: { ...appearance.profile, vaultPin: newPin }
          })}
        />
      );
      case 'profile': return (
        <ProfileView 
          appearance={appearance} 
          setAppearance={setAppearance}
          cloud={cloud}
          setCloud={setCloud}
        />
      );
      default: return (
        <DashboardOverview 
          onNavigate={setActiveView} 
          onLaunchBookmark={handleLaunchBookmark}
          settings={appearance.dashboard} 
          profile={appearance.profile} 
          bookmarks={bookmarks}
          counts={{
            notes: notes.length,
            gallery: gallery.length,
            calendar: appointments.length,
            finance: transactions.length,
            accounts: accounts.length
          }}
        />
      );
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div 
      className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-white selection:text-black"
      style={{
        fontSize: appearance.customFontSize ? `${appearance.customFontSize}px` : undefined,
        fontFamily: appearance.customFontFamily || undefined
      }}
    >
      {/* High-end noise texture overlay */}
      <div className="noise" />
      
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 768 ? '280px' : '310px') : (window.innerWidth < 768 ? '0px' : '80px'),
          x: !isSidebarOpen && window.innerWidth < 768 ? -280 : 0
        }}
        className={cn(
          "fixed md:relative z-[6000] flex flex-col border-r border-border bg-card/95 backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
          !isSidebarOpen && "items-center"
        )}
      >
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary/50 to-amber-500/50 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <img 
                  src="https://i.ibb.co/Q3cr5KdJ/4-21-2026-4-23-40-PM.jpg" 
                  alt="SHIAN NOTE" 
                  className="relative w-10 h-10 rounded-xl object-cover border border-white/10 luxury-shadow"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-minerva font-black italic tracking-tighter leading-none text-white">
                  SHIAN NOTE
                </h1>
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium mt-1 font-minerva">
                  Personal Hub
                </span>
              </div>
            </motion.div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-white/5 rounded-full transition-transform active:scale-90"
          >
            {isSidebarOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-1 py-8">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 h-11 rounded-lg transition-all duration-300 group relative",
                  activeView === item.id 
                    ? "bg-white/5 text-white" 
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.03]",
                  !isSidebarOpen && "justify-center px-0"
                )}
                onClick={() => setActiveView(item.id as View)}
              >
                <item.icon size={18} strokeWidth={activeView === item.id ? 2 : 1.5} className="transition-transform group-hover:scale-110" />
                {isSidebarOpen && (
                  <span className="text-sm font-medium tracking-tight">{item.label}</span>
                )}
                {activeView === item.id && (
                  <motion.div 
                    layoutId="active-nav-pill"
                    className="absolute left-0 w-1 h-4 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Button>
            ))}

            {isSidebarOpen && bookmarks.length > 0 && (
              <div className="pt-6 pb-2 px-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Ứng dụng của tôi</p>
              </div>
            )}

            {bookmarks.map((bookmark) => (
              <Button
                key={bookmark.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-4 h-11 rounded-lg transition-all duration-300 group relative",
                  "text-muted-foreground hover:text-amber-400 hover:bg-amber-400/5",
                  !isSidebarOpen && "justify-center px-0"
                )}
                onClick={() => {
                  setSelectedBookmark(bookmark);
                  setIsLaunchDialogOpen(true);
                }}
              >
                <Bookmark size={18} strokeWidth={1.5} className="transition-transform group-hover:scale-110 text-amber-500/50 group-hover:text-amber-400" />
                {isSidebarOpen && (
                  <span className="text-sm font-medium tracking-tight truncate">{bookmark.title}</span>
                )}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-6 mt-auto">
          <div className={cn(
            "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05]",
            !isSidebarOpen && "justify-center p-2"
          )}>
            <Avatar className="h-9 w-9 border border-white/10 luxury-shadow">
              <AvatarImage src={appearance.profile.avatar} />
              <AvatarFallback className="bg-zinc-900 text-[10px]">{appearance.profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex flex-col">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="justify-start gap-2 h-8 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 hover:bg-red-500/5 px-0"
              >
                <LogOut size={12} /> Đăng xuất
              </Button>
            </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        appearance.dashboard.showTodoPanel ? "lg:mr-[310px]" : "mr-0"
      )}>
        <Toaster position="top-right" theme={appearance.theme === 'ivory-gold' ? 'light' : 'dark'} />
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-card/50 backdrop-blur-xl sticky top-0 z-[10]">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 luxury-shadow">
              <img 
                src="https://i.ibb.co/Q3cr5KdJ/4-21-2026-4-23-40-PM.jpg" 
                alt="SHIAN NOTE" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl font-minerva font-black italic tracking-tighter leading-none text-white lowercase">shian note</h1>
          </div>
          <motion.div 
            onClick={() => setActiveView('profile')}
            className="cursor-pointer"
          >
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={appearance.profile.avatar} />
              <AvatarFallback>{appearance.profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </motion.div>
        </div>

        {/* Subtle background gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/[0.01] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <ScrollArea className="h-full">
          <div className="py-6 md:py-12 max-w-6xl mx-auto px-4 md:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>

      {/* Todo Panel */}
      <TodoPanel 
        isOpen={appearance.dashboard.showTodoPanel}
        onClose={() => setAppearance({
          ...appearance,
          dashboard: { ...appearance.dashboard, showTodoPanel: false }
        })}
        isPinned={isTodoPinned}
        onTogglePin={() => setIsTodoPinned(!isTodoPinned)}
        todos={todos}
        onSync={syncTodos}
        appointments={appointments}
      />

      {/* Todo Toggle Button (When closed) */}
      <AnimatePresence>
        {!appearance.dashboard.showTodoPanel && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-16 right-4 z-50"
          >
            <Button
              onClick={() => setAppearance({
                ...appearance,
                dashboard: { ...appearance.dashboard, showTodoPanel: true }
              })}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 p-0 flex items-center justify-center shadow-lg transition-all active:scale-90"
            >
              <ListTodo size={14} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Player Bar */}
      <MusicPlayerBar 
        activeItem={activeMusicItem} 
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onOpenHub={() => setActiveView('music')} 
      />

      {/* Shopee Style AI Chat */}
      <ShopeeChat />

      {/* Draggable Video Players Layer */}
      <div className="fixed inset-0 pointer-events-none z-[150]">
        <AnimatePresence>
          {activeVideoWindows.map((video) => (
            <div key={video.id} className="pointer-events-auto">
              <DraggableVideoPlayer 
                item={video}
                zIndex={video.zIndex}
                initialPosition={video.position}
                onClose={() => setActiveVideoWindows(prev => prev.filter(w => w.id !== video.id))}
                onFocus={() => {
                  setActiveVideoWindows(prev => prev.map(w => 
                    w.id === video.id ? { ...w, zIndex: maxVideoZIndex + 1 } : w
                  ));
                  setMaxVideoZIndex(prev => prev + 1);
                }}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Appointment Notification Toast */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/20 p-6 rounded-[2rem] luxury-shadow flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                <CalendarIcon size={32} />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Nhắc nhở lịch hẹn</p>
                <h4 className="text-xl font-serif font-bold italic">{activeNotification.title}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock size={14} /> {activeNotification.time || activeNotification.dueTime}
                </p>
                <Button 
                  onClick={stopNotification}
                  className="mt-2 h-8 bg-primary text-white hover:bg-primary/90 rounded-full text-[10px] uppercase tracking-widest font-bold px-4"
                >
                  Đã hiểu & Tắt chuông
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={stopNotification}
                className="rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Toggle Button */}
      <div className="fixed bottom-6 left-6 z-[60] flex items-center gap-3">
        <Button 
          onClick={toggleAudio}
          className={cn(
            "backdrop-blur-md rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-bold gap-2 transition-all duration-500",
            appearance.isAudioEnabled 
              ? "bg-white/10 hover:bg-white/20 text-white border border-white/20" 
              : "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          )}
        >
          {appearance.isAudioEnabled ? (
            <>
              <Volume2 size={14} /> Tắt âm thanh
            </>
          ) : (
            <>
              <VolumeX size={14} className="animate-pulse" /> Bật âm thanh
            </>
          )}
        </Button>
      </div>

      {/* Launch Dialog */}
      <Dialog open={isLaunchDialogOpen} onOpenChange={setIsLaunchDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white luxury-shadow sm:max-w-[400px] p-0 overflow-hidden z-[200]">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-4">
                <Bookmark size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold italic">{selectedBookmark?.title}</h3>
              <p className="text-muted-foreground text-xs uppercase tracking-widest">Chọn phiên bản để truy cập</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => {
                  if (selectedBookmark) handleLaunchBookmark(selectedBookmark, 'published');
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
                  if (selectedBookmark) handleLaunchBookmark(selectedBookmark, 'studio');
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

      {/* Internal Browser Modal */}
      <AnimatePresence>
        {internalBrowserUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex flex-col"
          >
            <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-zinc-950/50">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Globe size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-serif font-bold italic truncate text-white">
                    {bookmarks.find(b => b.publishedUrl === internalBrowserUrl)?.title || 'Trình duyệt Shian'}
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{internalBrowserUrl}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(internalBrowserUrl, '_blank')}
                  className="h-9 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-widest font-bold gap-2"
                >
                  <ExternalLink size={14} /> Mở tab mới
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setInternalBrowserUrl(null)}
                  className="h-9 w-9 rounded-xl hover:bg-red-500/20 hover:text-red-400"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 relative bg-white">
              <iframe 
                src={internalBrowserUrl} 
                className="w-full h-full border-none"
                title="Shian Internal Browser"
                allow="camera; microphone; geolocation; fullscreen"
              />
              
              {/* Fallback info overlay - subtle */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] text-white/70 uppercase tracking-widest font-bold pointer-events-none">
                Nếu trang web không hiển thị, vui lòng nhấn "Mở tab mới" ở phía trên
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
