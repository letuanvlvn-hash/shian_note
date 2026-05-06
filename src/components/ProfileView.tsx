import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Globe, 
  Shield, 
  Bell, 
  Moon, 
  Edit3,
  Camera,
  CheckCircle2,
  Palette,
  Type,
  Cloud,
  ExternalLink,
  Trash2,
  Layout,
  Smartphone,
  Key,
  Sparkles,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { AppearanceSettings, CloudSettings, ThemeType, FontType, FontSize, RadiusSize, DashboardSettings, ProfileSettings } from '../types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { aiVoiceService } from '../services/aiVoiceService';

interface ProfileViewProps {
  appearance: AppearanceSettings;
  setAppearance: (settings: AppearanceSettings) => void;
  cloud: CloudSettings;
  setCloud: (settings: CloudSettings) => void;
}

export default function ProfileView({ appearance, setAppearance, cloud, setCloud }: ProfileViewProps) {
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const themes: { id: ThemeType; label: string; color: string }[] = [
    { id: 'elite', label: 'Shian Dark', color: 'bg-[#050505]' },
    { id: 'midnight', label: 'Midnight Royal', color: 'bg-[#020617]' },
    { id: 'emerald', label: 'Emerald Forest', color: 'bg-[#022c22]' },
    { id: 'rose', label: 'Rose Quartz', color: 'bg-[#1c0a0a]' },
    { id: 'vintage', label: 'Vintage Paper', color: 'bg-[#f4ead5]' },
    { id: 'ivory-gold', label: 'Ivory Gold', color: 'bg-[#fdfcf0]' },
    { id: 'midnight-marble', label: 'Midnight Marble', color: 'bg-[#0a0c10]' },
    { id: 'dark-parchment', label: 'Dark Parchment', color: 'bg-[#1a1412]' },
    { id: 'industrial-rustic', label: 'Industrial Rustic', color: 'bg-[#121212]' },
  ];

  const updateDashboard = (updates: Partial<DashboardSettings>) => {
    setAppearance({
      ...appearance,
      dashboard: { ...appearance.dashboard, ...updates }
    });
  };

  const updateProfile = (updates: Partial<ProfileSettings>) => {
    setAppearance({
      ...appearance,
      profile: { ...appearance.profile, ...updates }
    });
  };

  const fonts: { id: FontType; label: string }[] = [
    { id: 'classic', label: 'Classic (Serif)' },
    { id: 'modern', label: 'Modern (Sans)' },
    { id: 'technical', label: 'Technical (Mono)' },
    { id: 'soft', label: 'UTM Minerva' },
  ];

  const sizes: { id: FontSize; label: string }[] = [
    { id: 'sm', label: 'Nhỏ' },
    { id: 'md', label: 'Vừa' },
    { id: 'lg', label: 'Lớn' },
  ];

  const radii: { id: RadiusSize; label: string }[] = [
    { id: 'none', label: 'Sắc cạnh' },
    { id: 'sm', label: 'Bo nhẹ' },
    { id: 'md', label: 'Bo vừa' },
    { id: 'lg', label: 'Bo nhiều' },
    { id: 'full', label: 'Tròn' },
  ];

  const handleSoundUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit for Base64 storage in Sheets
        alert("File âm thanh quá lớn. Vui lòng chọn file dưới 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppearance({
          ...appearance,
          notificationSound: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const playTestSound = () => {
    const sound = appearance.notificationSound || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    const audio = new Audio(sound);
    audio.play().catch(e => console.error("Test sound failed:", e));
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) { // 200KB limit for avatar
        alert("Ảnh quá lớn. Vui lòng chọn ảnh dưới 200KB để tối ưu bộ nhớ.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-semibold">
            Account / Settings
          </span>
          <h2 className="text-5xl font-serif font-black italic tracking-tighter-extra leading-none">
            Hồ sơ <span className="not-italic opacity-20">& Cài đặt.</span>
          </h2>
        </div>
        <Button 
          onClick={() => {
            // The sync is handled by useEffect in App.tsx when appearance/cloud changes
            // We can add a small visual feedback here if needed
            alert('Cài đặt đã được lên lịch đồng bộ với Google Sheets!');
          }}
          className="h-10 px-8 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
        >
          Lưu thay đổi
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-12">
          {/* Profile Card - Refined */}
          <div className="relative group">
            <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden luxury-shadow">
              <div className="h-32 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                />
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="absolute bottom-4 right-4 rounded-full h-8 w-8 bg-black/50 backdrop-blur-md border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={14} />
                </Button>
              </div>
              <div className="p-8 -mt-12 relative">
                <div className="flex flex-col items-center text-center space-y-6">
                  <Avatar className="h-24 w-24 border-4 border-background luxury-shadow ring-1 ring-white/10">
                    <AvatarImage src={appearance.profile.avatar} />
                    <AvatarFallback>{appearance.profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-2xl font-serif font-bold tracking-tight">{appearance.profile.name}</h3>
                        <CheckCircle2 size={16} className="text-blue-400" />
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{appearance.profile.role}</p>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Link ảnh đại diện (URL)</label>
                      <Input 
                        value={appearance.profile.avatar || ''}
                        onChange={(e) => updateProfile({ avatar: e.target.value })}
                        placeholder="Dán link ảnh tại đây..."
                        className="h-9 bg-white/[0.02] border-white/5 text-[10px] rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information - New Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <User size={16} className="text-orange-400" />
              <h3 className="text-lg font-serif font-bold italic tracking-tight">Thông tin cá nhân</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Họ và tên</label>
                <Input 
                  value={appearance.profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="h-11 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Vai trò / Chức danh</label>
                <Input 
                  value={appearance.profile.role}
                  onChange={(e) => updateProfile({ role: e.target.value })}
                  className="h-11 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Cloud Storage - Minimalist */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Bell size={16} className="text-yellow-400" />
              <h3 className="text-lg font-serif font-bold italic tracking-tight">Thông báo & Âm thanh</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="space-y-0.5">
                  <Label htmlFor="audio-toggle" className="text-sm font-medium">Bật âm thanh thông báo</Label>
                  <p className="text-[10px] text-muted-foreground">Phát âm thanh khi đến giờ nhắc hẹn</p>
                </div>
                <Switch 
                  id="audio-toggle" 
                  checked={appearance.isAudioEnabled}
                  onCheckedChange={(checked) => setAppearance({ ...appearance, isAudioEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ai-voice-toggle" className="text-sm font-medium">Giọng nói AI (TTS)</Label>
                    <Badge variant="outline" className="text-[8px] h-4 px-1 bg-primary/10 text-primary border-primary/20">Mới</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">AI sẽ đọc nội dung ghi chú khi đến giờ</p>
                </div>
                <Switch 
                  id="ai-voice-toggle" 
                  checked={appearance.useAIVoice}
                  onCheckedChange={(checked) => setAppearance({ ...appearance, useAIVoice: checked })}
                />
              </div>

              {appearance.useAIVoice && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    aiVoiceService.speak("Chào bạn, tôi là trợ lý AI. Tôi sẽ giúp bạn nhắc nhở công việc.").then(data => {
                      if (data) {
                        try {
                          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                          const binaryString = atob(data.split(',')[1]);
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
                          const source = audioContext.createBufferSource();
                          source.buffer = buffer;
                          source.connect(audioContext.destination);
                          source.start();
                        } catch (e) {
                          console.error("Test playback failed:", e);
                        }
                      }
                    });
                  }}
                  className="w-full text-[10px] uppercase tracking-widest h-9 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-2"
                >
                  <Sparkles size={14} /> Nghe thử giọng nói AI
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const now = new Date();
                  const testItem = {
                    id: 'test-' + Date.now(),
                    title: 'Thông báo thử nghiệm',
                    description: 'Đây là nội dung thông báo thử nghiệm từ hệ thống.',
                    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                  };
                  // We can't easily push to appointments state here without a prop, 
                  // but we can just trigger the notification logic directly if we had access.
                  // Instead, let's just alert the user to add a real one for now or I can add a prop.
                  alert("Để kiểm tra chính xác, hãy thêm một lịch hẹn hoặc ghi chú có thời gian cách hiện tại 1 phút.");
                }}
                className="w-full text-[10px] uppercase tracking-widest h-9 border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2"
              >
                <Bell size={14} /> Hướng dẫn kiểm tra thông báo
              </Button>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Âm thanh thông báo</label>
                <div className="flex gap-2">
                  <Input 
                    type="file"
                    accept="audio/*"
                    onChange={handleSoundUpload}
                    className="h-11 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-[10px] file:bg-white/10 file:border-none file:text-white file:mr-4 file:px-4 file:h-full cursor-pointer"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={playTestSound}
                    className="h-11 w-11 border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-xl"
                  >
                    <Bell size={16} />
                  </Button>
                </div>
                <p className="text-[9px] text-muted-foreground italic font-medium">Hỗ trợ file .mp3, .wav (tối đa 500KB)</p>
              </div>
              {appearance.notificationSound && (
                <Button 
                  variant="ghost" 
                  onClick={() => setAppearance({ ...appearance, notificationSound: undefined })}
                  className="w-full text-[9px] uppercase tracking-widest text-red-400 hover:text-red-300 h-8"
                >
                  Xóa âm thanh tùy chỉnh
                </Button>
              )}
            </div>
          </div>

          {/* Cloud Storage - Minimalist */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Cloud size={16} className="text-blue-400" />
              <h3 className="text-lg font-serif font-bold italic tracking-tight">Lưu trữ đám mây</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">pCloud Access Token</label>
                <Input 
                  type="password"
                  placeholder="••••••••••••••••" 
                  className="h-11 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-xs"
                  value={cloud.pCloudToken}
                  onChange={(e) => setCloud({ ...cloud, pCloudToken: e.target.value })}
                />
                <p className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium italic">
                  Lấy token tại <a href="https://docs.pcloud.com/" target="_blank" className="text-primary hover:underline flex items-center gap-0.5">pCloud API <ExternalLink size={8} /></a>
                </p>
              </div>
              <Button variant="outline" className="w-full h-11 border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-xl text-[10px] uppercase tracking-widest font-bold">
                Kết nối pCloud
              </Button>
            </div>
          </div>

          {/* Data Source - New Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <FileText size={16} className="text-amber-400" />
              <h3 className="text-lg font-serif font-bold italic tracking-tight">Dữ liệu hệ thống</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Truy cập trực tiếp vào tệp dữ liệu Google Sheets để quản lý dữ liệu thô của ứng dụng.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1XXaNRF6hjGs4hQ-a8DsaByhPrEy2Suay_FwZSm3YXTE/edit?gid=752725387#gid=752725387', '_blank')}
                className="w-full h-11 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 rounded-xl text-[10px] uppercase tracking-widest font-bold gap-2"
              >
                <ExternalLink size={14} /> FILE NGUỒN
              </Button>
              <p className="text-[9px] text-amber-500/60 italic font-medium">
                * Lưu ý: Không thay đổi cấu trúc cột trong file nguồn để tránh lỗi đồng bộ.
              </p>
            </div>
          </div>

          {/* Security & Vault */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Shield size={16} className="text-emerald-400" />
              <h3 className="text-lg font-serif font-bold italic tracking-tight">Bảo mật & Két sắt</h3>
            </div>
            <div className="space-y-4">
              {appearance.profile.vaultPin ? (
                <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Mã PIN hiện tại</label>
                    <Input 
                      type="password"
                      maxLength={4}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="h-11 bg-black/20 border-white/5 focus:border-white/20 transition-all rounded-xl text-center text-xl tracking-[0.5em]"
                      placeholder="••••"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {currentPinInput === appearance.profile.vaultPin && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t border-white/5"
                      >
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Mã PIN mới (4 số)</label>
                          <Input 
                            type="password"
                            maxLength={4}
                            value={newPinInput}
                            onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="h-11 bg-white/[0.05] border-emerald-500/30 focus:border-emerald-500/50 transition-all rounded-xl text-center text-xl tracking-[0.5em]"
                            placeholder="••••"
                          />
                        </div>
                        <Button 
                          onClick={() => {
                            if (newPinInput.length === 4) {
                              updateProfile({ vaultPin: newPinInput });
                              setCurrentPinInput('');
                              setNewPinInput('');
                              alert('Đã cập nhật mã PIN mới thành công!');
                            } else {
                              alert('Mã PIN mới phải có đúng 4 chữ số.');
                            }
                          }}
                          className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] uppercase tracking-widest font-bold"
                        >
                          Xác nhận đổi mã PIN
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {currentPinInput.length === 4 && currentPinInput !== appearance.profile.vaultPin && (
                    <p className="text-[9px] text-red-400 text-center font-medium">Mã PIN hiện tại không chính xác</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Thiết lập mã PIN Két sắt (4 số)</label>
                  <div className="flex gap-2">
                    <Input 
                      type="password"
                      maxLength={4}
                      value={appearance.profile.vaultPin || ''}
                      onChange={(e) => updateProfile({ vaultPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="h-11 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-center text-xl tracking-[0.5em]"
                      placeholder="••••"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground italic font-medium">Mã PIN này dùng để truy cập vào mục "Két sắt"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Appearance Settings - Editorial Grid */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-12 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-10 luxury-shadow">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <Palette size={18} className="text-purple-400" />
              <h3 className="text-2xl font-serif font-bold italic tracking-tight">Giao diện & Chủ đề</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Theme Selection */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Chủ đề màu sắc</h4>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAppearance({ ...appearance, theme: t.id })}
                      className={cn(
                        "group relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-500",
                        appearance.theme === t.id 
                          ? "border-white/20 bg-white/5" 
                          : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                      )}
                    >
                      <div className={cn("w-full h-16 rounded-xl luxury-shadow transition-transform group-hover:scale-[1.02]", t.color)} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                      {appearance.theme === t.id && (
                        <motion.div layoutId="active-theme" className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-background" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Selection */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Phong cách chữ</h4>
                <div className="space-y-3">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setAppearance({ ...appearance, font: f.id })}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500",
                        appearance.font === f.id 
                          ? "border-white/20 bg-white/5" 
                          : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium tracking-tight",
                        f.id === 'classic' && "font-serif",
                        f.id === 'technical' && "font-mono"
                      )}>{f.label}</span>
                      {appearance.font === f.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-white/5">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Kích thước chữ (Tùy chỉnh)</h4>
                <div className="flex gap-4 items-center">
                  <Input 
                    type="number"
                    value={appearance.customFontSize || 16}
                    onChange={(e) => setAppearance({ ...appearance, customFontSize: parseInt(e.target.value) })}
                    className="h-10 bg-white/[0.02] border-white/5 text-xs w-24"
                  />
                  <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/5 flex-1">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setAppearance({ ...appearance, fontSize: s.id })}
                        className={cn(
                          "flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          appearance.fontSize === s.id ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Font chữ (Tùy chỉnh)</h4>
                <Input 
                  value={appearance.customFontFamily || ''}
                  onChange={(e) => setAppearance({ ...appearance, customFontFamily: e.target.value })}
                  placeholder="Ví dụ: 'Inter', sans-serif"
                  className="h-10 bg-white/[0.02] border-white/5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-white/5">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Độ bo góc</h4>
                <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                  {radii.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setAppearance({ ...appearance, radius: r.id })}
                      className={cn(
                        "flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                        appearance.radius === r.id ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Customization - New Section */}
          <div className="space-y-12 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-10 luxury-shadow">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <Palette size={18} className="text-orange-400" />
                <h3 className="text-2xl font-serif font-bold italic tracking-tight">Tùy chỉnh Trang chủ</h3>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="show-greeting" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Hiển thị lời chào</Label>
                <Switch 
                  id="show-greeting" 
                  checked={appearance.dashboard.showGreeting}
                  onCheckedChange={(checked) => updateDashboard({ showGreeting: checked })}
                />
              </div>
            </div>

            <AnimatePresence>
              {appearance.dashboard.showGreeting && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-8 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Tiêu đề chính</label>
                      <Input 
                        value={appearance.dashboard.greetingText}
                        onChange={(e) => updateDashboard({ greetingText: e.target.value })}
                        className="h-11 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nội dung phụ</label>
                      <Input 
                        value={appearance.dashboard.subtitleText}
                        onChange={(e) => updateDashboard({ subtitleText: e.target.value })}
                        className="h-11 bg-white/[0.02] border-white/5 focus:border-white/20 transition-all rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Bố cục</h4>
                      <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                        {[
                          { id: 'left', label: 'Căn trái' },
                          { id: 'center', label: 'Căn giữa' }
                        ].map((l) => (
                          <button
                            key={l.id}
                            onClick={() => updateDashboard({ layout: l.id as any })}
                            className={cn(
                              "flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                              appearance.dashboard.layout === l.id ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                            )}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Kích thước lời chào</h4>
                      <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                        {[
                          { id: 'sm', label: 'S' },
                          { id: 'md', label: 'M' },
                          { id: 'lg', label: 'L' },
                          { id: 'xl', label: 'XL' }
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() => updateDashboard({ fontSize: s.id as any })}
                            className={cn(
                              "flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                              appearance.dashboard.fontSize === s.id ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Tiện ích hiển thị</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {[
                        { id: 'showStats', label: 'Thống kê nhanh' },
                        { id: 'showClock', label: 'Đồng hồ thời gian' },
                        { id: 'showWeather', label: 'Thời tiết hiện tại' },
                        { id: 'showQuickActions', label: 'Thao tác nhanh' },
                        { id: 'showRecentActivity', label: 'Hoạt động gần đây' },
                        { id: 'showTodoPanel', label: 'Ghi chú - Cần làm' }
                      ].map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between">
                          <Label htmlFor={widget.id} className="text-xs font-medium">{widget.label}</Label>
                          <Switch 
                            id={widget.id} 
                            checked={(appearance.dashboard as any)[widget.id]}
                            onCheckedChange={(checked) => updateDashboard({ [widget.id]: checked })}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Ảnh bìa Dashboard (URL)</Label>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="show-universal-clock" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Đồng hồ vạn năng</Label>
                          <Switch 
                            id="show-universal-clock" 
                            checked={appearance.dashboard.showUniversalClock}
                            onCheckedChange={(checked) => updateDashboard({ showUniversalClock: checked })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          value={appearance.dashboard.coverImage || ''}
                          onChange={(e) => updateDashboard({ coverImage: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="h-10 bg-white/[0.02] border-white/5 text-xs flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateDashboard({ coverImage: `https://picsum.photos/seed/${Date.now()}/1920/1080` })}
                          className="h-10 border-white/5 bg-white/[0.02] text-[9px] uppercase tracking-widest font-bold"
                        >
                          Ngẫu nhiên
                        </Button>
                      </div>

                      {/* Image Adjustments */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Độ mờ ảnh</Label>
                            <span className="text-[10px] font-mono">{appearance.dashboard.coverOpacity ?? 100}%</span>
                          </div>
                          <div onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                            <Slider 
                              defaultValue={[appearance.dashboard.coverOpacity ?? 100]}
                              value={[appearance.dashboard.coverOpacity ?? 100]} 
                              max={100} 
                              min={0}
                              step={1} 
                              onValueChange={(vals: number[]) => updateDashboard({ coverOpacity: vals[0] })}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Độ nhòe (Blur)</Label>
                            <span className="text-[10px] font-mono">{appearance.dashboard.coverBlur ?? 0}px</span>
                          </div>
                          <div onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                            <Slider 
                              defaultValue={[appearance.dashboard.coverBlur ?? 0]}
                              value={[appearance.dashboard.coverBlur ?? 0]} 
                              max={20} 
                              min={0}
                              step={1} 
                              onValueChange={(vals: number[]) => updateDashboard({ coverBlur: vals[0] })}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Lớp phủ tối</Label>
                            <span className="text-[10px] font-mono">{appearance.dashboard.coverOverlay ?? 40}%</span>
                          </div>
                          <div onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                            <Slider 
                              defaultValue={[appearance.dashboard.coverOverlay ?? 40]}
                              value={[appearance.dashboard.coverOverlay ?? 40]} 
                              max={100} 
                              min={0}
                              step={1} 
                              onValueChange={(vals: number[]) => updateDashboard({ coverOverlay: vals[0] })}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Clock Options */}
                      {appearance.dashboard.showUniversalClock && (
                        <div className="space-y-6 pt-4 border-t border-white/5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Kiểu đồng hồ</Label>
                              <Select 
                                value={String(appearance.dashboard.clockStyle || 1)} 
                                onValueChange={(val) => updateDashboard({ clockStyle: parseInt(val) })}
                              >
                                <SelectTrigger className="w-full bg-white/[0.02] border-white/5 h-10">
                                  <SelectValue placeholder="Chọn kiểu" />
                                </SelectTrigger>
                                <SelectContent className="z-[10001]">
                                  <SelectItem value="1">Hiện đại (Kính)</SelectItem>
                                  <SelectItem value="2">Tối giản (Minimal)</SelectItem>
                                  <SelectItem value="3">Kỹ thuật (Digital)</SelectItem>
                                  <SelectItem value="4">Cổ điển (Serif)</SelectItem>
                                  <SelectItem value="5">Phá cách (Brutalist)</SelectItem>
                                  <SelectItem value="6">Cyberpunk Neon</SelectItem>
                                  <SelectItem value="7">Luxury Gold</SelectItem>
                                  <SelectItem value="8">Retro LCD</SelectItem>
                                  <SelectItem value="9">Vertical Stack</SelectItem>
                                  <SelectItem value="10">Circular Progress</SelectItem>
                                  <SelectItem value="11">Minimal Dot</SelectItem>
                                  <SelectItem value="12">Terminal Console</SelectItem>
                                  <SelectItem value="13">Bauhaus Geometric</SelectItem>
                                  <SelectItem value="14">Neon Sign</SelectItem>
                                  <SelectItem value="15">Swiss Rail</SelectItem>
                                  <SelectItem value="16">Art Deco</SelectItem>
                                  <SelectItem value="17">Futuristic HUD</SelectItem>
                                  <SelectItem value="18">Origami Paper</SelectItem>
                                  <SelectItem value="19">Glass Morphic</SelectItem>
                                  <SelectItem value="20">Zen Minimal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-col justify-end gap-4">
                              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <Label htmlFor="show-lunar" className="text-xs font-medium">Hiển thị Âm lịch</Label>
                                <Switch 
                                  id="show-lunar" 
                                  checked={appearance.dashboard.showLunarCalendar}
                                  onCheckedChange={(checked) => updateDashboard({ showLunarCalendar: checked })}
                                />
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                <Label htmlFor="show-full-cal" className="text-xs font-medium">Lịch tháng (Mặc định mở)</Label>
                                <Switch 
                                  id="show-full-cal" 
                                  checked={appearance.dashboard.showFullCalendar}
                                  onCheckedChange={(checked) => updateDashboard({ showFullCalendar: checked })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
