import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User,
  Loader2,
  Maximize2,
  Minimize2,
  Languages,
  ChevronDown,
  Copy,
  Check,
  SpellCheck,
  Volume2,
  Radio,
  Headphones,
  Mic2
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  langName?: string;
  isGrammar?: boolean;
}

export default function ShopeeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Chào bạn! Tôi là trợ lý ảo Shian. Tôi có thể giúp gì cho bạn hôm nay?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslationMode, setIsTranslationMode] = useState(false);
  const [isGrammarMode, setIsGrammarMode] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [interimInput, setInterimInput] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isInterpretingMode, setIsInterpretingMode] = useState(false);
  const [activePTT, setActivePTT] = useState<'source' | 'target' | null>(null);
  const latestTranscriptRef = useRef('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Gemini AI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Update ref when state changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechError('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'vi-VN';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentInput = (finalTranscript || interimTranscript).trim();
      latestTranscriptRef.current = currentInput;

      if (finalTranscript) {
        setInput(prev => {
          const base = prev.trim();
          return base ? `${base} ${finalTranscript.trim()}` : finalTranscript.trim();
        });
        setInterimInput('');
      } else {
        setInterimInput(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        setSpeechError('Quyền truy cập Micro bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt.');
      } else {
        setSpeechError(`Lỗi: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // Only restart if we are still supposed to be listening
      // and it wasn't stopped manually
      if (recognitionRef.current?.isManualStop) {
        recognitionRef.current.isManualStop = false;
        return;
      }
      
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.isManualStop = true;
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimInput('');
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setSpeechError('Không thể khởi động Micro. Vui lòng thử lại.');
      }
    }
  };

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Tiếng Việt', code: 'vi' },
    { name: 'Tiếng Trung', code: 'zh' },
    { name: 'Tiếng Nhật', code: 'ja' },
    { name: 'Tiếng Hàn', code: 'ko' },
    { name: 'Tiếng Pháp', code: 'fr' },
    { name: 'Tiếng Đức', code: 'de' },
    { name: 'Tiếng Tây Ban Nha', code: 'es' },
    { name: 'Tiếng Nga', code: 'ru' },
    { name: 'Tiếng Thái', code: 'th' },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      let systemInstruction = `Bạn là một trợ lý ảo cao cấp tên là 'Shian Assistant'. Hãy trả lời một cách thông minh, chuyên nghiệp và CỰC KỲ NGẮN GỌN. Tránh giải thích dài dòng, chỉ tập trung vào ý chính hoặc câu trả lời trực tiếp. Sử dụng tiếng Việt tự nhiên, súc tích.`;

      if (isTranslationMode) {
        systemInstruction = `Bạn là một chuyên gia dịch thuật. Hãy dịch đoạn văn bản sau sang ${targetLanguage}. Chỉ trả về bản dịch duy nhất, không thêm bất kỳ lời giải thích, dẫn nhập hay ký tự nào khác.`;
      } else if (isGrammarMode) {
        systemInstruction = `Bạn là một chuyên gia sửa lỗi chính tả tiếng Việt. Khi nhận được văn bản, hãy:
1. Liệt kê các lỗi sai và cách sửa theo định dạng: từ_sai = từ_đúng; từ_sai2 = từ_đúng2; ...
2. Cung cấp nguyên văn đoạn văn bản đã được sửa lỗi hoàn chỉnh và đặt trong dấu ngoặc đơn ().
Ví dụ: "cong cha như nuối tháy sơn" -> "cong = công; nuối = núi; tháy = thái; (Công cha như núi thái sơn)"
Chỉ trả về kết quả theo định dạng trên, không thêm lời chào hay giải thích gì khác.`;
      }

      if (!process.env.GEMINI_API_KEY) {
        throw new Error('API Key missing');
      }

      const contents = (isTranslationMode || isGrammarMode)
        ? [{ role: 'user', parts: [{ text: input }] }]
        : [...chatHistory, { role: 'user', parts: [{ text: input }] }];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents as any,
        config: {
          systemInstruction,
        },
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || 'Xin lỗi, tôi gặp chút trục trặc khi xử lý yêu cầu.',
        timestamp: new Date(),
        langName: isTranslationMode ? targetLanguage : 'Tiếng Việt',
        isGrammar: isGrammarMode
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Gemini Error:', error);
      let errorMessage = 'Có lỗi xảy ra khi kết nối với trí tuệ nhân tạo. Vui lòng thử lại sau.';
      
      if (error.message === 'API Key missing') {
        errorMessage = 'Vui lòng thiết lập GEMINI_API_KEY trong phần Cài đặt để sử dụng trợ lý AI.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (index: number) => {
    if (isTranslating !== null) return;
    
    const msg = messages[index];
    setIsTranslating(index);

    try {
      if (!process.env.GEMINI_API_KEY) throw new Error('API Key missing');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ 
          role: 'user', 
          parts: [{ text: `Dịch đoạn văn bản sau sang tiếng Việt (nếu là tiếng Việt thì dịch sang tiếng Anh): "${msg.content}"` }] 
        }],
        config: {
          systemInstruction: "Bạn là một chuyên gia dịch thuật. Chỉ trả về bản dịch, không thêm bất kỳ lời giải thích nào."
        }
      });

      if (response.text) {
        const resultText = response.text;
        const newMessages = [...messages];
        
        // Simple heuristic to detect if the translation result is Vietnamese or English
        const hasVietnamese = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(resultText);
        
        newMessages[index] = {
          ...msg,
          content: resultText,
          langName: hasVietnamese ? 'Tiếng Việt' : 'English'
        };
        setMessages(newMessages);
      }
    } catch (error) {
      console.error('Translation Error:', error);
    } finally {
      setIsTranslating(null);
    }
  };

  const handleTranslateInput = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error('API Key missing');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ 
          role: 'user', 
          parts: [{ text: `Dịch đoạn văn bản sau sang tiếng Anh: "${input}"` }] 
        }],
        config: {
          systemInstruction: "Bạn là một chuyên gia dịch thuật. Chỉ trả về bản dịch, không thêm bất kỳ lời giải thích nào."
        }
      });

      if (response.text) {
        setInput(response.text);
      }
    } catch (error) {
      console.error('Input Translation Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeak = (text: string, msg?: Message) => {
    if (!('speechSynthesis' in window)) {
      setSpeechError('Trình duyệt của bạn không hỗ trợ đọc văn bản.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap: Record<string, string> = {
      'English': 'en-US',
      'Tiếng Việt': 'vi-VN',
      'Tiếng Trung': 'zh-CN',
      'Tiếng Nhật': 'ja-JP',
      'Tiếng Hàn': 'ko-KR',
      'Tiếng Pháp': 'fr-FR',
      'Tiếng Đức': 'de-DE',
      'Tiếng Tây Ban Nha': 'es-ES',
      'Tiếng Nga': 'ru-RU',
      'Tiếng Thái': 'th-TH',
    };

    /**
     * USER REQUESTED LOGIC:
     * - If Translation Mode is OFF -> All text is read as Vietnamese (vi-VN).
     * - If Translation Mode is ON -> Use the target language selected by the user.
     */
    let speechLang = 'vi-VN';

    if (isTranslationMode) {
      speechLang = langMap[targetLanguage] || 'en-US';
    } else if (isGrammarMode) {
      speechLang = 'vi-VN';
    } else {
      speechLang = 'vi-VN';
    }

    // Special case: If we have specific message metadata and we are reading a SINGLE message, 
    // we might want to respect its own language if the user is clicking the volume button on it.
    // However, the user said "nếu không bật tính năng dịch thì toàn bộ văn bản trả về đều đọc tiếng việt".
    // I will prioritize the CURRENT mode state as requested.
    
    utterance.lang = speechLang;
    
    // Improved voice selection
    const voices = window.speechSynthesis.getVoices();
    console.log(`Available voices: ${voices.length}, target lang: ${speechLang}`);
    
    if (voices.length > 0) {
      // Priority 1: Exact match (e.g., vi-VN)
      let voice = voices.find(v => v.lang === speechLang);
      
      // Priority 2: Sub-language match (e.g., vi)
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith(speechLang.split('-')[0]));
      }
      
      // Priority 3: Fuzzy name match (only for Vietnamese specifically)
      if (speechLang === 'vi-VN' && !voice) {
        voice = voices.find(v => v.name.toLowerCase().includes('vietnamese') || v.name.toLowerCase().includes('tiếng việt'));
      }
      
      if (voice) {
        console.log(`Setting voice: ${voice.name} (${voice.lang})`);
        utterance.voice = voice;
        // Sometimes the lang property of the voice is better than what we set
        utterance.lang = voice.lang;
      } else {
        console.warn(`No specific voice found for ${speechLang}, falling back to browser default.`);
      }
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleGeminiTTS = async (text: string, langName: string) => {
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error('API Key missing');

      const langMap: Record<string, string> = {
        'English': 'en-US',
        'Tiếng Việt': 'vi-VN',
        'Tiếng Trung': 'zh-CN',
        'Tiếng Nhật': 'ja-JP',
        'Tiếng Hàn': 'ko-KR',
        'Tiếng Pháp': 'fr-FR',
        'Tiếng Đức': 'de-DE',
        'Tiếng Tây Ban Nha': 'es-ES',
        'Tiếng Nga': 'ru-RU',
        'Tiếng Thái': 'th-TH',
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBlob = b64toBlob(base64Audio, 'audio/pcm');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Gemini TTS usually returns raw PCM or similar that might need AudioContext for 24kHz.
        // For simplicity, let's try standard Audio if it's wrapped or use Web Audio API.
        playPCM(base64Audio);
      }
    } catch (error) {
      console.error('Gemini TTS Error:', error);
      // Fallback to browser TTS if Gemini fails
      handleSpeak(text);
    }
  };

  const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  const playPCM = (base64Data: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // PCM 16-bit Little Endian
    const dataView = new DataView(bytes.buffer);
    const floatData = new Float32Array(len / 2);
    for (let i = 0; i < floatData.length; i++) {
      const sample = dataView.getInt16(i * 2, true);
      floatData[i] = sample / 32768; // Normalize to -1 to 1
    }

    const audioBuffer = audioContext.createBuffer(1, floatData.length, 24000);
    audioBuffer.getChannelData(0).set(floatData);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const togglePTT = (type: 'source' | 'target') => {
    if (activePTT === type) {
      handlePTTEnd();
    } else {
      if (activePTT) {
        // If another one is active, end it first (though UI might prevent this)
        handlePTTEnd();
        setTimeout(() => handlePTTStart(type), 300);
      } else {
        handlePTTStart(type);
      }
    }
  };

  const handlePTTStart = (type: 'source' | 'target') => {
    if (!recognitionRef.current) return;
    
    // Cancel any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.isManualStop = true;
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped or not started
      }
    }
    
    window.speechSynthesis.cancel();
    setActivePTT(type);
    
    // Slight delay to allow previous session to fully clean up
    setTimeout(() => {
      if (!recognitionRef.current) return;
      
      const langMapCode: Record<string, string> = {
        'English': 'en-US',
        'Tiếng Việt': 'vi-VN',
        'Tiếng Trung': 'zh-CN',
        'Tiếng Nhật': 'ja-JP',
        'Tiếng Hàn': 'ko-KR',
        'Tiếng Pháp': 'fr-FR',
        'Tiếng Đức': 'de-DE',
        'Tiếng Tây Ban Nha': 'es-ES',
        'Tiếng Nga': 'ru-RU',
        'Tiếng Thái': 'th-TH',
      };

      // Set recognition language
      if (type === 'source') {
        recognitionRef.current.lang = 'vi-VN';
      } else {
        recognitionRef.current.lang = langMapCode[targetLanguage] || 'en-US';
      }

      try {
        recognitionRef.current.isManualStop = false;
        recognitionRef.current.start();
        setIsListening(true);
        setInput('');
        setInterimInput('');
        latestTranscriptRef.current = '';
      } catch (e) {
        console.error('PTT Start Error (Attempted Start):', e);
      }
    }, 100);
  };

  const handlePTTEnd = async () => {
    if (!recognitionRef.current) return;
    
    const type = activePTT;
    setActivePTT(null);
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.isManualStop = true;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Stop error:', e);
      }
    }

    // Small delay to ensure final transcript is processed
    setTimeout(async () => {
      const textToTranslate = (input.trim() || latestTranscriptRef.current.trim()).trim();
      if (!textToTranslate) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const targetLang = type === 'source' ? targetLanguage : 'Tiếng Việt';
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ 
            role: 'user', 
            parts: [{ text: `Dịch câu này sang ${targetLang}: "${textToTranslate}"` }] 
          }],
          config: {
            systemInstruction: "Bạn là trợ lý phiên dịch trực tiếp siêu tốc. Chỉ trả về nội dung đã dịch. Tuyệt đối không thêm lời dẫn, không giải thích, không dùng dấu ngoặc kép trừ khi bản gốc có. Trả về văn bản để đọc ngay lập tức."
          }
        });

        if (response.text) {
          const translatedText = response.text;
          const newMsg: Message = {
            role: 'assistant',
            content: translatedText,
            timestamp: new Date(),
            langName: targetLang
          };
          setMessages(prev => [...prev, newMsg]);
          
          // Auto speak with Gemini TTS
          handleGeminiTTS(translatedText, targetLang);
        }
      } catch (error) {
        console.error('PTT Translation error:', error);
      } finally {
        setIsLoading(false);
        setInput('');
      }
    }, 500);
  };

  return (
    <div className={cn("fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[50000] flex flex-col items-end gap-2")}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              filter: 'blur(0px)',
              height: isMinimized ? '56px' : (window.innerWidth < 768 ? 'min(500px, 75vh)' : '550px'),
              width: window.innerWidth < 768 ? 'min(380px, calc(100vw - 32px))' : '400px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            className="bg-card/85 backdrop-blur-3xl border border-white/10 rounded-3xl luxury-shadow flex flex-col mb-14 md:mb-0 z-[50001] select-none"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center luxury-shadow">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Shian Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    isInterpretingMode ? "text-indigo-400 bg-indigo-500/10" : "text-white/60 hover:text-white"
                  )}
                  onClick={() => {
                    setIsInterpretingMode(!isInterpretingMode);
                    setIsMinimized(false);
                  }}
                  title="Chế độ phiên dịch trực tiếp (PTT)"
                >
                  <Radio size={14} className={isInterpretingMode ? "animate-pulse" : ""} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-white/5"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full hover:bg-white/10 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} strokeWidth={2.5} />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-hidden relative min-h-0">
                  <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-8 pb-32">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5",
                            msg.role === 'assistant' ? "bg-white/5" : "bg-indigo-500/20"
                          )}>
                            {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                          </div>
                          <div className="flex flex-col gap-1 max-w-[85%]">
                            <div className={cn(
                              "p-3 rounded-2xl text-xs leading-relaxed relative group/msg",
                              msg.role === 'assistant' 
                                ? "bg-white/5 text-foreground rounded-tl-none" 
                                : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-tr-none"
                            )}>
                              {msg.content}
                              
                              <div className={cn(
                                "absolute -bottom-6 flex items-center gap-2 opacity-0 group-hover/msg:opacity-100 transition-all z-10",
                                msg.role === 'user' ? "right-0" : "left-0"
                              )}>
                                <button 
                                  onClick={() => handleCopy(msg.content, i)}
                                  className="p-1 hover:text-primary transition-colors bg-card/80 backdrop-blur-md rounded-md border border-white/10"
                                  title="Sao chép"
                                >
                                  {copiedIndex === i ? (
                                    <Check size={14} className="text-green-400" />
                                  ) : (
                                    <Copy size={14} className="text-muted-foreground" />
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleSpeak(msg.content, msg)}
                                  className="p-1 hover:text-primary transition-colors bg-card/80 backdrop-blur-md rounded-md border border-white/10"
                                  title="Đọc văn bản"
                                >
                                  <Volume2 size={14} className="text-muted-foreground" />
                                </button>
                                {msg.role === 'assistant' && !msg.isGrammar && (
                                  <button 
                                    onClick={() => handleTranslate(i)}
                                    className={cn(
                                      "p-1 hover:text-primary transition-colors bg-card/80 backdrop-blur-md rounded-md border border-white/10",
                                      isTranslating === i && "animate-pulse text-primary"
                                    )}
                                    title="Dịch tin nhắn này"
                                  >
                                    <Languages size={14} className={isTranslating === i ? "animate-spin" : "text-muted-foreground"} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3 mr-auto">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                            <Bot size={14} />
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none">
                            <Loader2 size={14} className="animate-spin opacity-50" />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-white/[0.02] flex flex-col gap-3 shrink-0">
                  {isInterpretingMode ? (
                    <div className="flex flex-col gap-4 py-2">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                          <Radio size={10} className="text-indigo-400" />
                          Phiên dịch trực tiếp (PTT)
                        </span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] text-indigo-400/60 font-bold uppercase tracking-widest whitespace-nowrap">Sang:</span>
                          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                            <SelectTrigger className="h-6 w-24 text-[10px] bg-white/5 border-white/10 rounded-lg focus:ring-0 px-2">
                              <SelectValue placeholder="Ngôn ngữ" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 z-[70000]" side="top" sideOffset={8}>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.name} className="text-[10px] focus:bg-white/10">
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <button
                          onClick={() => togglePTT('source')}
                          className={cn(
                            "flex-1 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border select-none touch-none",
                            activePTT === 'source' 
                              ? "bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/50" 
                              : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          <Mic2 size={24} className={activePTT === 'source' ? "animate-pulse text-indigo-400" : ""} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Tiếng Việt</span>
                          {activePTT === 'source' && interimInput && (
                            <span className="text-[8px] text-indigo-300 truncate max-w-[80px] animate-pulse">"{interimInput}"</span>
                          )}
                          {activePTT === 'source' && (
                            <span className="text-[8px] text-indigo-400 mt-1">Đang nghe - Nhấn để dừng</span>
                          )}
                        </button>

                        <button
                          onClick={() => togglePTT('target')}
                          className={cn(
                            "flex-1 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border select-none touch-none",
                            activePTT === 'target' 
                              ? "bg-violet-500/20 border-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-2 ring-violet-500/50" 
                              : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          <Headphones size={24} className={activePTT === 'target' ? "animate-pulse text-violet-400" : ""} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{targetLanguage}</span>
                          {activePTT === 'target' && interimInput && (
                            <span className="text-[8px] text-violet-300 truncate max-w-[80px] animate-pulse">"{interimInput}"</span>
                          )}
                          {activePTT === 'target' && (
                            <span className="text-[8px] text-violet-400 mt-1">Đang nghe - Nhấn để dừng</span>
                          )}
                        </button>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-[9px] text-white/40 italic">Nhấn 1 lần để bắt đầu nói, nhấn lần nữa để AI dịch</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Mode Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch 
                            id="translation-mode" 
                            checked={isTranslationMode}
                            onCheckedChange={(val) => {
                              setIsTranslationMode(val);
                              if (val) setIsGrammarMode(false);
                            }}
                            className="scale-75"
                          />
                          <Label htmlFor="translation-mode" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                            Chế độ dịch
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch 
                            id="grammar-mode" 
                            checked={isGrammarMode}
                            onCheckedChange={(val) => {
                              setIsGrammarMode(val);
                              if (val) setIsTranslationMode(false);
                            }}
                            className="scale-75"
                          />
                          <Label htmlFor="grammar-mode" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                            Sửa chính tả
                          </Label>
                        </div>
                      </div>
                      
                      {isTranslationMode && (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-end gap-2"
                        >
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sang:</span>
                          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                            <SelectTrigger className="h-6 w-28 text-[10px] bg-white/5 border-white/10 rounded-lg focus:ring-0">
                              <SelectValue placeholder="Ngôn ngữ" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-white/10 z-[70000]" side="top" sideOffset={8}>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.name} className="text-[10px] focus:bg-white/10">
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>
                      )}

                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Nhập tin nhắn hoặc nói..."
                              value={isListening ? (input + (interimInput ? (input ? ' ' : '') + interimInput : '')) : input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                              className={cn(
                                "h-11 bg-white/5 border-white/5 focus:border-indigo-500/50 transition-all rounded-xl pr-20 text-xs",
                                isListening && interimInput && "text-indigo-400 font-medium"
                              )}
                            />
                            <div className="absolute right-1 top-1 flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleTranslateInput}
                                disabled={!input.trim() || isLoading}
                                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
                                title="Dịch sang tiếng Anh"
                              >
                                <Languages size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleListening}
                                className={cn(
                                  "h-9 w-9 rounded-lg transition-all",
                                  isListening ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-white"
                                )}
                              >
                                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 transition-all active:scale-95 shrink-0"
                        >
                          <Send size={18} />
                        </Button>
                      </div>
                      
                      {isListening && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] mt-2 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center gap-2 text-red-400 font-medium italic">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            Đang lắng nghe... Hãy nói tiếng Việt.
                          </div>
                          {interimInput && (
                            <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 animate-pulse">
                              "{interimInput}..."
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}
                  
                  {speechError && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-amber-400 mt-2 font-medium italic"
                    >
                      {speechError}
                    </motion.p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button - Ultra Compact */}
      <motion.button
        drag
        dragMomentum={false}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center luxury-shadow transition-all duration-500 z-50 cursor-move",
          isOpen 
            ? "bg-white text-black rotate-90 scale-90 opacity-50 hover:opacity-100 md:opacity-100" 
            : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
        )}
      >
        {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
      </motion.button>
    </div>
  );
}
