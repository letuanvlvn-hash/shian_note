import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GripHorizontal, Maximize2, Minimize2, FileAudio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EntertainmentItem } from '../types';
import { cn } from '@/lib/utils';

interface DraggableVideoPlayerProps {
  item: EntertainmentItem;
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
  initialPosition?: { x: number; y: number };
}

export default function DraggableVideoPlayer({ 
  item, 
  onClose, 
  zIndex, 
  onFocus,
  initialPosition = { x: 200, y: 100 }
}: DraggableVideoPlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState({ width: 640, height: 400 });
  const [isExtracting, setIsExtracting] = useState(false);

  const extractAudio = async () => {
    if (!item.isLocal || !item.url) return;
    setIsExtracting(true);

    try {
      const response = await fetch(item.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Simple WAV encoding
      const numOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numOfChannels * 2 + 44;
      const buffer = new ArrayBuffer(length);
      const view = new DataView(buffer);

      // Write WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, length - 8, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numOfChannels, true);
      view.setUint32(24, audioBuffer.sampleRate, true);
      view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChannels, true);
      view.setUint16(32, numOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length - 44, true);

      // Write PCM data
      let offset = 44;
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.split('.')[0]}_audio.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error extracting audio:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const getEmbedUrl = (item: EntertainmentItem) => {
    if (item.platform === 'youtube') {
      const videoId = item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : item.url;
    }
    return item.url;
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragListener={!isMinimized}
      initial={{ opacity: 0, scale: 0.9, x: initialPosition.x, y: initialPosition.y }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        height: isMinimized ? '48px' : size.height,
        width: isMinimized ? '300px' : size.width
      }}
      onMouseDown={onFocus}
      style={{ zIndex, position: 'fixed', top: 0, left: 0 }}
      className={cn(
        "border border-white/10 rounded-2xl luxury-shadow overflow-hidden flex flex-col pointer-events-auto backdrop-blur-2xl",
        isMinimized ? "bg-zinc-900/95" : "bg-zinc-950"
      )}
    >
      {/* Header / Drag Handle */}
      <div 
        className="h-12 px-4 flex items-center justify-between border-b border-white/5 cursor-move bg-white/10 hover:bg-white/20 transition-colors shrink-0"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <GripHorizontal size={14} className="text-muted-foreground shrink-0" />
          <span className="text-[10px] uppercase tracking-widest font-bold truncate opacity-80">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {item.isLocal && item.fileType?.startsWith('video/') && !isMinimized && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[8px] uppercase tracking-widest font-bold gap-1.5 rounded-lg hover:bg-primary/20 text-primary"
              onClick={extractAudio}
              disabled={isExtracting}
            >
              {isExtracting ? <Loader2 size={10} className="animate-spin" /> : <FileAudio size={10} />}
              {isExtracting ? 'Đang xử lý...' : 'Tách nhạc'}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-lg hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-lg hover:bg-red-500/20 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Video/Audio Content */}
      <div 
        className={cn(
          "flex-1 bg-black overflow-hidden relative",
          isMinimized ? "h-0 opacity-0 pointer-events-none" : "h-full opacity-100"
        )}
      >
        {item.platform === 'local' ? (
          item.fileType?.startsWith('audio/') ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-zinc-900 p-8">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 rounded-3xl overflow-hidden luxury-shadow border border-white/10"
              >
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              </motion.div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-serif font-bold italic text-white line-clamp-2">{item.title}</h3>
                <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold">Đang phát âm thanh</p>
              </div>
              <audio 
                src={item.url} 
                className="w-full max-w-md mt-4"
                controls
                autoPlay
              />
            </div>
          ) : (
            <video 
              src={item.url} 
              className="w-full h-full object-contain"
              controls
              autoPlay
            />
          )
        ) : (
          <iframe 
            src={getEmbedUrl(item)}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Resize Handle */}
      {!isMinimized && (
        <motion.div
          drag
          dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={(_, info) => {
            setSize(prev => ({
              width: Math.max(400, prev.width + info.delta.x),
              height: Math.max(300, prev.height + info.delta.y)
            }));
          }}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center group/resize"
        >
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full group-hover/resize:bg-white/50 transition-colors" />
        </motion.div>
      )}
    </motion.div>
  );
}
