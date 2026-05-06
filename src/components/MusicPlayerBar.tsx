import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Music, 
  Maximize2,
  ListMusic,
  Heart,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { EntertainmentItem } from '@/src/types';
import { cn } from '@/lib/utils';

interface MusicPlayerBarProps {
  activeItem: EntertainmentItem | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onOpenHub: () => void;
}

export default function MusicPlayerBar({ activeItem, isPlaying, setIsPlaying, onOpenHub }: MusicPlayerBarProps) {
  const [volume, setVolume] = useState([70]);
  const [progress, setProgress] = useState([0]);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (activeItem && audioRef.current) {
      if (activeItem.platform === 'local' || activeItem.platform === 'zingmp3' || activeItem.platform === 'nhaccuatoi') {
        audioRef.current.src = activeItem.url;
        audioRef.current.load(); // Ensure metadata is loaded
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
      }
    }
  }, [activeItem]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (!isNaN(total)) {
        setDuration(total);
        setProgress([(current / total) * 100 || 0]);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (val: number[]) => {
    setIsDragging(true);
    setProgress(val);
    if (duration) {
      const newTime = (val[0] / 100) * duration;
      setCurrentTime(newTime);
    }
  };

  const handleSliderCommitted = (val: number[]) => {
    setIsDragging(false);
    if (audioRef.current && duration) {
      const newTime = (val[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeItem) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/10 px-4 md:px-6 flex items-center justify-between luxury-shadow"
    >
      {/* Track Info */}
      <div className="flex items-center gap-3 md:gap-4 w-1/2 md:w-1/3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden bg-white/5 border border-white/10 group relative shrink-0">
          <img src={activeItem.thumbnail} alt={activeItem.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={onOpenHub}>
            <Maximize2 size={16} className="text-white" />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-xs md:text-sm font-serif font-bold italic text-white truncate">{activeItem.title}</h4>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-primary">{activeItem.platform}</span>
            <span className="hidden md:inline text-[10px] text-white/40 uppercase tracking-widest font-medium shrink-0">{activeItem.category}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 md:w-1/3">
        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" className="hidden md:flex text-white/60 hover:text-white">
            <SkipBack size={20} fill="currentColor" />
          </Button>
          <Button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
            <SkipForward className="w-4.5 h-4.5 md:w-5 md:h-5" fill="currentColor" />
          </Button>
        </div>
        <div className="hidden md:flex w-full max-w-md items-center gap-3">
          <span className="text-[9px] font-mono text-white/40">{formatTime(currentTime)}</span>
          <Slider 
            value={progress} 
            onValueChange={handleSliderChange} 
            onValueCommitted={handleSliderCommitted}
            max={100} 
            step={0.1} 
            className="flex-1"
          />
          <span className="text-[9px] font-mono text-white/40">{formatTime(duration)}</span>
        </div>
        
        <audio 
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>

      {/* Extra Controls */}
      <div className="hidden md:flex items-center justify-end gap-6 w-1/3">
        <div className="flex items-center gap-3 w-32">
          <Volume2 size={16} className="text-white/60" />
          <Slider 
            value={volume} 
            onValueChange={(val) => setVolume(val as number[])} 
            max={100} 
            step={1} 
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-white/10 pl-6">
          <Button variant="ghost" size="icon" onClick={onOpenHub} className="text-white/60 hover:text-primary">
            <ListMusic size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(activeItem.url, '_blank')} className="text-white/60 hover:text-white">
            <ExternalLink size={18} />
          </Button>
        </div>
      </div>

      {/* Mobile-only Expand Button */}
      <div className="md:hidden flex items-center shrink-0 ml-2">
        <Button variant="ghost" size="icon" onClick={onOpenHub} className="text-white/60 h-10 w-10">
          <Maximize2 size={18} />
        </Button>
      </div>
    </motion.div>
  );
}
