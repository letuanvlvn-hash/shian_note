import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, MoreHorizontal, Calendar as CalendarIcon, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { googleSheetsService } from '../services/googleSheetsService';
import { Appointment } from '../types';

interface CalendarViewProps {
  appointments: any[];
  onSync: (appointments: any[]) => Promise<void>;
}

export default function CalendarView({ appointments, onSync }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today');
  const [newEvent, setNewEvent] = useState<Partial<Appointment>>({
    title: '',
    time: '09:00',
    date: new Date().toISOString().split('T')[0],
    location: '',
    type: 'Công việc',
    repeat: 'none'
  });

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    setIsSaving(true);
    
    try {
      const event = {
        id: Date.now().toString(),
        ...newEvent
      };
      
      const newAppointments = [...appointments, event];
      await onSync(newAppointments);
      setIsDialogOpen(false);
      setNewEvent({ 
        title: '', 
        time: '09:00', 
        date: new Date().toISOString().split('T')[0], 
        location: '', 
        type: 'Công việc',
        repeat: 'none'
      });
    } catch (error) {
      console.error("Add event failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    const newAppointments = appointments.filter(app => app.id !== id);
    await onSync(newAppointments);
  };

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayDay = now.getDate();

    const isMatch = (app: any, targetDateStr: string, targetDay: number) => {
      if (app.date === targetDateStr) return true;
      if (app.repeat === 'daily' || app.repeat === 'hourly') return true;
      if (app.repeat === 'monthly') {
        const appDate = new Date(app.date);
        return appDate.getDate() === targetDay;
      }
      return false;
    };

    if (filterMode === 'all') {
      return [...appointments].sort((a, b) => a.date.localeCompare(b.date));
    }
    
    return appointments.filter((app: any) => isMatch(app, todayStr, todayDay));
  }, [appointments, filterMode]);

  const selectedDateAppointments = useMemo(() => {
    if (!date) return [];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const day = date.getDate();
    return appointments.filter((app: any) => {
      if (app.date === dateStr) return true;
      if (app.repeat === 'daily' || app.repeat === 'hourly') return true;
      if (app.repeat === 'monthly') {
        const appDate = new Date(app.date);
        return appDate.getDate() === day;
      }
      return false;
    });
  }, [appointments, date]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Lịch hẹn</h2>
          <p className="text-muted-foreground">Quản lý thời gian và các sự kiện quan trọng của bạn.</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          <Plus size={18} /> Thêm sự kiện
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass border-none luxury-shadow p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-none"
          />
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-medium">
                {filterMode === 'today' ? 'Sự kiện hôm nay' : 'Tất cả sự kiện'}
              </h3>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilterMode('today')}
                  className={cn("h-7 px-3 text-[10px] uppercase tracking-widest font-bold", filterMode === 'today' ? "bg-white text-black hover:bg-white" : "text-muted-foreground")}
                >
                  Hôm nay
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilterMode('all')}
                  className={cn("h-7 px-3 text-[10px] uppercase tracking-widest font-bold", filterMode === 'all' ? "bg-white text-black hover:bg-white" : "text-muted-foreground")}
                >
                  Tất cả
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 border-white/10"><ChevronLeft size={16} /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-white/10"><ChevronRight size={16} /></Button>
            </div>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {filteredAppointments.map((app: any, i: number) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass border-none luxury-shadow hover:bg-white/[0.05] transition-all group">
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center min-w-[80px] py-2 border-r border-white/10">
                        <span className="text-lg font-bold">{app.time.split(' ')[0]}</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{app.time.split(' ')[1]}</span>
                        <span className="text-[8px] mt-1 text-primary/60 font-mono">{app.date}</span>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-medium">{app.title}</h4>
                            {app.repeat && app.repeat !== 'none' && (
                              <Badge variant="secondary" className="text-[8px] uppercase tracking-widest bg-primary/10 text-primary border-none">
                                {app.repeat === 'hourly' && 'Hằng giờ'}
                                {app.repeat === 'daily' && 'Hằng ngày'}
                                {app.repeat === 'monthly' && 'Hằng tháng'}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase tracking-widest">
                            {app.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>1 giờ</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>{app.location}</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteEvent(app.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {filteredAppointments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <CalendarIcon size={48} className="mb-4 opacity-20" />
                  <p>Không có sự kiện nào trong ngày này.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white luxury-shadow">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Thêm sự kiện mới</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tên sự kiện</label>
              <Input 
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Ví dụ: Họp đối tác..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Ngày</label>
                <Input 
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="bg-white/[0.02] border-white/5 focus:border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Thời gian</label>
                <Input 
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="bg-white/[0.02] border-white/5 focus:border-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Địa điểm</label>
              <Input 
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Zoom, Văn phòng..."
                className="bg-white/[0.02] border-white/5 focus:border-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Lặp lại</label>
              <Select 
                value={newEvent.repeat || 'none'} 
                onValueChange={(val: any) => setNewEvent({ ...newEvent, repeat: val })}
              >
                <SelectTrigger className="bg-white/[0.02] border-white/5">
                  <SelectValue placeholder="Chọn chế độ lặp" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="none">Không lặp lại</SelectItem>
                  <SelectItem value="hourly">Hằng giờ</SelectItem>
                  <SelectItem value="daily">Hằng ngày</SelectItem>
                  <SelectItem value="monthly">Hằng tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Hủy</Button>
            <Button onClick={addEvent} disabled={isSaving} className="bg-white text-black hover:bg-zinc-200">
              {isSaving ? 'Đang lưu...' : 'Lưu sự kiện'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
