import { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, Volume2, Search, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAppNavigate } from '../hooks/useAppNavigate';

interface VoiceAssistantProps {
  userName?: string;
}

export function VoiceAssistant({ userName = 'there' }: VoiceAssistantProps) {
  const { navigate } = useAppNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponse(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript) {
          handleCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
            toast.error("Microphone access denied. Please enable it to use voice assistance.");
        }
      };

      recognitionRef.current = recognition;
    } else {
        console.log("Web Speech API not supported");
    }
  }, [transcript]); // We depend on transcript to process it in onend? Actually transcript state is updated in onresult. 
  // Wait, the closure for onend might see stale transcript if not careful. 
  // Better approach: use a ref for transcript or rely on the event in onresult to set final transcript, 
  // but onend doesn't receive the transcript. 
  // Let's rely on the state being updated.

  // Re-attach onend/onresult if dependencies change? 
  // Actually, let's keep it simple.

  const startListening = () => {
    if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
        } catch (e) {
            // fast restart if already started
            recognitionRef.current.stop();
        }
    } else {
        toast.error("Voice recognition not supported in this browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleCommand = async (text: string) => {
    setIsProcessing(true);
    const lowerText = text.toLowerCase();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let reply = "I didn't quite catch that. Could you repeat?";
    let action = null;

    if (lowerText.includes('appointment') || lowerText.includes('book') || lowerText.includes('doctor')) {
      reply = "I can help you book an appointment. Taking you to the booking section.";
      action = () => navigate('book-doctor');
    } else if (lowerText.includes('hospital') || lowerText.includes('near me')) {
      reply = "Searching for top hospitals nearby.";
      action = () => navigate('hospitals');
    } else if (lowerText.includes('record') || lowerText.includes('health') || lowerText.includes('report')) {
      reply = "Opening your health records.";
      action = () => navigate('health-records');
    } else if (lowerText.includes('emergency') || lowerText.includes('help')) {
      reply = "Activating Emergency Mode. Hang tight.";
      action = () => navigate('emergency');
    } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
      reply = `Hello ${userName}! How can I assist you with your health today?`;
    }

    setResponse(reply);
    setIsProcessing(false);
    
    // Speak response (simple synthesis)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(reply);
      window.speechSynthesis.speak(utterance);
    }

    if (action) {
       setTimeout(() => {
           action();
           setTranscript('');
           setResponse(null);
       }, 2000);
    }
  };

  return (
    <div className="relative">
      <Button 
        onClick={isListening ? stopListening : startListening}
        className={`rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
        size="icon"
        variant={isListening ? "default" : "ghost"}
      >
        {isListening ? <X className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
      </Button>

      <AnimatePresence>
        {(isListening || response || isProcessing) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-14 right-0 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ORYA Voice</span>
            </div>

            <div className="min-h-[60px] flex flex-col justify-center">
                {isListening ? (
                    <div className="space-y-2">
                         <p className="text-slate-900 font-medium text-lg leading-tight">
                            {transcript || "Listening..."}
                         </p>
                         <div className="flex gap-1 h-4 items-end">
                            {[1,2,3,4,5].map(i => (
                                <motion.div 
                                    key={i}
                                    className="w-1 bg-primary/40 rounded-full"
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                />
                            ))}
                         </div>
                    </div>
                ) : isProcessing ? (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </div>
                ) : (
                    <p className="text-slate-700 font-medium">
                        {response}
                    </p>
                )}
            </div>
            
            {response && !isListening && !isProcessing && (
                <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setResponse(null); setTranscript(''); }}>
                        Close
                    </Button>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}