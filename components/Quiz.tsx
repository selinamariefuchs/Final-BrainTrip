import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { CheckCircle2, XCircle, ChevronRight, Mic, MicOff, Volume2, Pause, Play, Trophy, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface QuizProps {
  city: string;
  questions: Question[];
  initialHandsFree: boolean;
  onComplete: (score: number) => void;
}

type VoiceStatus = 'idle' | 'speaking' | 'listening' | 'processing' | 'paused';

const SuccessBurst = () => {
  // Generate particles with random directions
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * 360 + Math.random() * 30; // spread circle
    const distance = 40 + Math.random() * 30; // 40-70px distance
    const rad = (angle * Math.PI) / 180;
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;
    const color = ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400', 'bg-pink-400'][i % 5];
    
    return {
      id: i,
      style: {
        '--tx': `${tx}px`,
        '--ty': `${ty}px`,
        animation: `particle 0.6s ease-out forwards`
      } as React.CSSProperties,
      color
    };
  });

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-0 h-0 flex items-center justify-center pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute w-1.5 h-1.5 rounded-full ${p.color}`}
          style={p.style}
        />
      ))}
    </div>
  );
};

const Confetti = () => {
  // Generate falling confetti particles with varied shapes and colors
  const particles = Array.from({ length: 60 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 4;
    const duration = 3 + Math.random() * 3;
    const size = 0.4 + Math.random() * 0.4; // Random size between 0.4rem and 0.8rem
    const color = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#84CC16'][i % 7];
    const isCircle = Math.random() > 0.5;
    
    return {
      id: i,
      style: {
        left: `${left}%`,
        width: `${size}rem`,
        height: `${size}rem`,
        backgroundColor: color,
        borderRadius: isCircle ? '50%' : '2px',
        animation: `fall ${duration}s linear ${delay}s infinite`,
      } as React.CSSProperties
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 opacity-80"
          style={p.style}
        />
      ))}
    </div>
  );
};

export const Quiz: React.FC<QuizProps> = ({ city, questions, initialHandsFree, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [handsFree, setHandsFree] = useState(initialHandsFree);
  const [showSummary, setShowSummary] = useState(false);
  
  // Voice State
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef(true);
  
  // Use a ref to track voice status to avoid stale closures in async functions
  const voiceStatusRef = useRef<VoiceStatus>(voiceStatus);

  const currentQuestion = questions[currentIndex];

  // Initialize Speech Recognition on Mount if needed
  useEffect(() => {
    isComponentMounted.current = true;
    
    // Fix types for experimental Speech Recognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
    }

    return () => {
      isComponentMounted.current = false;
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Sync ref with state
  useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  // Voice Loop Trigger
  useEffect(() => {
    if (handsFree && voiceStatus !== 'paused' && !showFeedback && !showSummary) {
      // Start the question sequence
      startQuestionSequence();
    }
  }, [currentIndex, handsFree, showFeedback, showSummary]);

  // Handle Summary Voice Feedback
  useEffect(() => {
    if (showSummary && handsFree) {
       speak(`Quiz complete! You scored ${score} out of ${questions.length}. I'm generating your travel suggestions now.`).then(() => {
          if (isComponentMounted.current) {
             onComplete(score);
          }
       });
    }
  }, [showSummary, handsFree]);

  // Helpers
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore error if not running
      }
    }
  };

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isComponentMounted.current) return resolve();
      
      stopSpeaking();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.0;
      u.onend = () => {
        if (isComponentMounted.current) resolve();
      };
      u.onerror = (e) => {
        // If canceled explicitly, we still resolve to move on or handle interruption
        resolve();
      };
      
      synthesisRef.current = u;
      window.speechSynthesis.speak(u);
    });
  };

  const listen = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!recognitionRef.current) return reject("No speech recognition");
      
      setVoiceStatus('listening');
      setTranscript('');

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        resolve(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error", event.error);
        if (event.error === 'no-speech') {
           resolve(''); // Resolve empty to retry or handle
        } else {
           reject(event.error);
        }
      };

      recognitionRef.current.onend = () => {
        // If we stopped but didn't resolve (handled in onresult), safe to leave
      };

      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    });
  };

  // Logic Loop
  const startQuestionSequence = async () => {
    if (!currentQuestion) return;
    setVoiceStatus('speaking');
    
    // 1. Read Question
    await speak(`Question ${currentIndex + 1}. ${currentQuestion.text}`);
    // Check against Ref to ensure we have latest status (e.g. if user paused)
    if (!handsFree || !isComponentMounted.current || (voiceStatusRef.current as VoiceStatus) === 'paused') return;

    // 2. Read Options
    for (let i = 0; i < currentQuestion.options.length; i++) {
      if (!handsFree || !isComponentMounted.current || (voiceStatusRef.current as VoiceStatus) === 'paused') return;
      await speak(`Option ${i + 1}: ${currentQuestion.options[i]}`);
    }

    if (!handsFree || !isComponentMounted.current || (voiceStatusRef.current as VoiceStatus) === 'paused') return;

    // 3. Listen for answer
    let validAnswer = false;
    let attempts = 0;

    while (!validAnswer && attempts < 2 && handsFree && voiceStatusRef.current !== 'paused') {
      try {
        await speak(attempts === 0 ? "What is your answer?" : "I didn't catch that. Please say option 1, 2, 3, 4, or the answer text.");
        const result = await listen();
        setVoiceStatus('processing');
        
        if (!result) {
          attempts++;
          continue;
        }

        // Check commands
        const lowerRes = result.toLowerCase();
        if (lowerRes.includes("repeat question")) {
           startQuestionSequence(); // Restart loop
           return;
        }
        if (lowerRes.includes("repeat options")) {
           // Skip question reading, just options
           for (let i = 0; i < currentQuestion.options.length; i++) {
             await speak(`Option ${i + 1}: ${currentQuestion.options[i]}`);
           }
           continue; 
        }
        if (lowerRes.includes("pause") || lowerRes.includes("stop")) {
          setVoiceStatus('paused');
          stopSpeaking();
          return;
        }
        if (lowerRes.includes("exit") || lowerRes.includes("quit")) {
          setHandsFree(false);
          setVoiceStatus('idle');
          return;
        }

        // Check Answer Logic
        const matchedIndex = matchAnswer(result, currentQuestion.options);
        if (matchedIndex !== -1) {
          validAnswer = true;
          handleOptionClick(matchedIndex); // This triggers showFeedback = true
        } else {
          attempts++;
        }
      } catch (e) {
        console.error(e);
        attempts++;
      }
    }

    if (!validAnswer && handsFree && (voiceStatusRef.current as VoiceStatus) !== 'paused') {
       await speak("Moving to manual mode.");
       setHandsFree(false);
       setVoiceStatus('idle');
    }
  };

  const matchAnswer = (spoken: string, options: string[]): number => {
    const s = spoken.toLowerCase();
    
    // Check "Option 1", "Answer A", etc.
    if (s.includes("option 1") || s.includes("answer 1") || s === "one" || s === "1" || s === "a" || s.includes("option a")) return 0;
    if (s.includes("option 2") || s.includes("answer 2") || s === "two" || s === "2" || s === "b" || s.includes("option b")) return 1;
    if (s.includes("option 3") || s.includes("answer 3") || s === "three" || s === "3" || s === "c" || s.includes("option c")) return 2;
    if (s.includes("option 4") || s.includes("answer 4") || s === "four" || s === "4" || s === "d" || s.includes("option d")) return 3;

    // Check content fuzzy match
    for (let i = 0; i < options.length; i++) {
      if (s.includes(options[i].toLowerCase())) return i;
    }
    
    return -1;
  };

  // UI Handlers
  const handleOptionClick = (index: number) => {
    if (showFeedback) return;
    
    setSelectedOption(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Voice Feedback
    if (handsFree) {
      provideVoiceFeedback(isCorrect, index);
    }
  };

  const provideVoiceFeedback = async (isCorrect: boolean, index: number) => {
    setVoiceStatus('speaking');
    
    let feedbackStart = "";
    if (isCorrect) {
      const phrases = [
        "That is correct! Well done.",
        "Spot on! You nailed it.",
        "Excellent! That's the right answer.",
        "Yes! You got it right.",
        "Perfect! Correct."
      ];
      feedbackStart = phrases[Math.floor(Math.random() * phrases.length)];
    } else {
      const phrases = [
        "Not quite.",
        "Good try, but that's not it.",
        "Ah, close, but actually...",
        "That was a tricky one.",
        "Good guess, but no."
      ];
      const prefix = phrases[Math.floor(Math.random() * phrases.length)];
      feedbackStart = `${prefix} The correct answer is ${currentQuestion.options[currentQuestion.correctIndex]}.`;
    }
    
    const fact = currentQuestion.funFact || "";
    
    await speak(`${feedbackStart} ${fact}`);
    
    if (handsFree && isComponentMounted.current && voiceStatusRef.current !== 'paused') {
       // Auto advance
       handleNext();
    } else {
       setVoiceStatus('idle');
    }
  };

  const handleNext = () => {
    stopSpeaking();
    stopListening();
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setTranscript('');
      // Loop triggers via useEffect
    } else {
      // Quiz Complete
      setShowSummary(true);
      // If hands-free, the useEffect on [showSummary] will handle speaking and auto-advancing
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Render Summary View
  if (showSummary) {
    return (
      <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden animate-fade-in">
        <Confetti />
        
        <div className="z-10 w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center border border-white/50 animate-pop">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
             <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 mb-8">You're becoming a {city} expert.</p>
          
          <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <span className="block text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-1">Your Score</span>
            <div className="flex items-center justify-center gap-3">
               <span className="text-6xl font-bold text-indigo-600">{score}</span>
               <span className="text-2xl text-indigo-300 font-medium">/ {questions.length}</span>
            </div>
          </div>
          
          <div className="space-y-3">
             <Button fullWidth onClick={() => onComplete(score)}>
               <span className="flex items-center justify-center gap-2">
                 Generate Itinerary <Sparkles className="w-4 h-4" />
               </span>
             </Button>
             
             {handsFree && (
               <p className="text-xs text-indigo-400 animate-pulse mt-4">
                 <Mic className="w-3 h-3 inline mr-1" /> Auto-advancing shortly...
               </p>
             )}
          </div>
        </div>
      </div>
    );
  }

  // Render Quiz View
  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm border-b border-gray-100 z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <Logo variant="icon" size="sm" />
             <h2 className="text-xl font-bold text-slate-800">{city} Trivia</h2>
          </div>
          <div className="flex items-center gap-3">
             {/* Hands Free Toggle/Indicator */}
             <button 
                onClick={() => {
                   if (handsFree) {
                     setHandsFree(false);
                     setVoiceStatus('idle');
                     stopSpeaking();
                     stopListening();
                   } else {
                     setHandsFree(true);
                     setVoiceStatus('idle'); // Will trigger effect
                   }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  handsFree 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1 animate-pulse' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
             >
                {handsFree ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                {handsFree ? 'Hands-Free On' : 'Hands-Free Off'}
             </button>
             <span className="text-sm font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
               {currentIndex + 1} / {questions.length}
             </span>
          </div>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
             <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] skew-x-12"></div>
          </div>
        </div>
      </div>

      {/* Voice Status Overlay for Hands Free */}
      {handsFree && (
         <div className="bg-indigo-600 text-white px-6 py-2 flex items-center justify-between text-sm transition-all animate-fade-in-up">
            <div className="flex items-center gap-2">
               {voiceStatus === 'speaking' && <Volume2 className="w-4 h-4 animate-bounce" />}
               {voiceStatus === 'listening' && <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />}
               {voiceStatus === 'processing' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               {voiceStatus === 'paused' && <Pause className="w-4 h-4" />}
               
               <span className="font-medium">
                  {voiceStatus === 'speaking' && "Reading..."}
                  {voiceStatus === 'listening' && "Listening..."}
                  {voiceStatus === 'processing' && "Thinking..."}
                  {voiceStatus === 'paused' && "Paused"}
                  {voiceStatus === 'idle' && "Ready"}
               </span>
            </div>
            {transcript && voiceStatus === 'listening' && (
               <span className="opacity-80 italic max-w-[150px] truncate">"{transcript}"</span>
            )}
            {voiceStatus === 'paused' && (
               <button onClick={() => setVoiceStatus('idle')} className="bg-white/20 p-1 rounded hover:bg-white/30">
                  <Play className="w-4 h-4" />
               </button>
            )}
         </div>
      )}

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="space-y-6 max-w-2xl mx-auto">
          <p className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed animate-fade-in">
            {currentQuestion.text}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let stateStyles = "bg-white border-gray-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
              let icon = null;
              let animClass = "";

              if (showFeedback) {
                if (idx === currentQuestion.correctIndex) {
                  stateStyles = "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                  animClass = "animate-pop"; // Pop effect on success reveal
                } else if (idx === selectedOption) {
                  stateStyles = "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
                  icon = <XCircle className="w-5 h-5 text-red-600" />;
                  animClass = "animate-pop"; // Pop effect on error reveal
                } else {
                  stateStyles = "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                }
              } else if (selectedOption === idx) {
                stateStyles = "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={showFeedback || (handsFree && voiceStatus !== 'paused' && voiceStatus !== 'idle')}
                  className={`w-full relative text-left p-4 rounded-xl border-2 transition-all duration-300 ease-out active:scale-95 hover:scale-[1.02] flex items-center justify-between group ${stateStyles} ${animClass}`}
                >
                  <span className="font-medium">
                     <span className="inline-block w-6 text-slate-400 font-normal text-sm mr-2">
                       {String.fromCharCode(65 + idx)}.
                     </span>
                     {option}
                  </span>
                  {icon}
                  {showFeedback && idx === currentQuestion.correctIndex && <SuccessBurst />}
                </button>
              );
            })}
          </div>

          {showFeedback && currentQuestion.funFact && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800 text-sm italic animate-fade-in-up">
               Did you know? {currentQuestion.funFact}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          {handsFree && voiceStatus !== 'paused' ? (
             <div className="text-center text-sm text-slate-500 flex flex-col gap-1 animate-pulse">
                <p>Say <span className="font-bold text-slate-700">"Option A"</span> or the answer.</p>
                <p>Commands: "Repeat", "Pause", "Exit"</p>
             </div>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={!showFeedback}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};