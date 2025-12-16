
import React, { useState, useRef, useEffect } from 'react';
import { ItineraryItem, DraftTrip } from '../types';
import { Button } from './Button';
import { Trash2, Calendar, MapPin, Share2, ArrowLeft, Save, Check, Copy, Undo2, Cloud, Navigation, Route, Sparkles, Pencil, CheckCircle2, Circle, NotebookPen } from 'lucide-react';
import { optimizeItineraryRoute } from '../services/geminiService';
import { Logo } from './Logo';

interface ItineraryProps {
  city: string;
  hotelLocation?: string;
  items: ItineraryItem[];
  tripNotes?: string;
  onRemove: (id: string) => void;
  onBack: () => void;
  onSave: () => void;
  onRestore: (item: ItineraryItem) => void;
  onReorder?: (items: ItineraryItem[]) => void;
  onUpdate?: (id: string, updates: Partial<ItineraryItem>) => void;
  onUpdateTripNotes?: (notes: string) => void;
}

export const Itinerary: React.FC<ItineraryProps> = ({ city, hotelLocation, items, tripNotes = '', onRemove, onBack, onSave, onRestore, onReorder, onUpdate, onUpdateTripNotes }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<ItineraryItem | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  // Auto-save logic
  useEffect(() => {
    const saveDraft = () => {
      const draft: DraftTrip = {
        city,
        hotelLocation,
        items,
        tripNotes,
        updatedAt: Date.now()
      };
      localStorage.setItem('braintrip_autosave', JSON.stringify(draft));
      setLastAutoSave(new Date());
    };

    // Debounce save for 2 seconds after changes
    const timer = setTimeout(saveDraft, 2000);

    // Also save immediately on unmount/cleanup
    return () => {
      clearTimeout(timer);
      saveDraft();
    };
  }, [city, hotelLocation, items, tripNotes]);

  const handleSave = () => {
    onSave();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleShare = async () => {
    const summary = `My Trip to ${city}: ${items.map(item => item.title).join(', ')}`;
    const shareData = {
      title: `My Trip to ${city}`,
      text: summary,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share skipped", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(summary);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setLastRemoved(item);
      setShowUndo(true);
      onRemove(id);

      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setShowUndo(false);
        setLastRemoved(null);
      }, 4000);
    }
  };

  const handleUndo = () => {
    if (lastRemoved) {
      onRestore(lastRemoved);
      setShowUndo(false);
      setLastRemoved(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  const handleToggleComplete = (id: string, currentStatus: boolean | undefined) => {
    if (onUpdate) {
      onUpdate(id, { completed: !currentStatus });
    }
  };

  const handleOptimizeRoute = async () => {
    if (!onReorder || isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      // Call AI service to reorder based on complex factors (notes, time, geography)
      const reorderedIds = await optimizeItineraryRoute(city, hotelLocation, items);
      
      // Reconstruct the array in the new order
      const newItemOrder: ItineraryItem[] = [];
      // Explicitly type Map to avoid TS inference issues
      const itemMap = new Map<string, ItineraryItem>();
      items.forEach(i => itemMap.set(i.id, i));
      
      reorderedIds.forEach(id => {
        const item = itemMap.get(id);
        if (item) newItemOrder.push(item);
      });
      
      // Add any items that might have been missed (fallback)
      items.forEach(item => {
        if (!newItemOrder.find(i => i.id === item.id)) {
          newItemOrder.push(item);
        }
      });
      
      onReorder(newItemOrder);
      setIsOptimized(true);
      setTimeout(() => setIsOptimized(false), 2000);
    } catch (e) {
      console.error("Optimization failed", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-indigo-50 relative">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm border-b border-gray-100 z-10">
        <div className="flex justify-between items-start mb-4">
          <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          {lastAutoSave && (
            <span className="text-xs text-slate-400 flex items-center gap-1 animate-fade-in">
              <Cloud className="w-3 h-3" /> Auto-saved {lastAutoSave.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div className="flex items-center gap-3">
             <Logo variant="icon" size="sm" />
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Your {city} Trip</h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Planned for You
                </p>
             </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className={`p-2 rounded-full transition-all duration-300 flex items-center gap-2 px-4 border ${
                isShared 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {isShared ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              <span className="text-sm font-semibold">{isShared ? 'Copied' : 'Share'}</span>
            </button>

            <button 
              onClick={handleSave}
              className={`p-2 rounded-full transition-all duration-300 flex items-center gap-2 px-4 ${
                isSaved 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              <span className="text-sm font-semibold">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Itinerary List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        
        {/* Starting Point Card */}
        {items.length > 0 && (
           <div className="flex items-center gap-4 bg-indigo-100/50 p-4 rounded-xl border border-indigo-100">
               <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-5 h-5" />
               </div>
               <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-500 uppercase">Starting Point</p>
                  <p className="font-bold text-slate-800">{hotelLocation || "City Center"}</p>
               </div>
               {onReorder && (
                 <button 
                   onClick={handleOptimizeRoute}
                   disabled={isOptimizing}
                   className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                     isOptimized 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-indigo-600 shadow-sm hover:shadow-md active:scale-95'
                   }`}
                 >
                    {isOptimizing ? (
                       <Sparkles className="w-3 h-3 animate-spin" />
                    ) : isOptimized ? (
                       <Check className="w-3 h-3" />
                    ) : (
                       <Sparkles className="w-3 h-3" />
                    )}
                    {isOptimizing ? 'Optimizing...' : isOptimized ? 'Optimized' : 'Smart Optimize'}
                 </button>
               )}
           </div>
        )}

        {/* Trip Notes Section */}
        {items.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 shadow-sm relative group">
             <div className="flex items-center gap-2 mb-2">
                <NotebookPen className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Trip Notes</h3>
             </div>
             <textarea
                placeholder="Write overall trip notes, packing lists, or reminders here..."
                value={tripNotes}
                onChange={(e) => onUpdateTripNotes && onUpdateTripNotes(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-700 placeholder-amber-400/70 text-sm leading-relaxed min-h-[80px] resize-y"
             />
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="w-3 h-3 text-amber-400" />
             </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MapPin className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Your itinerary is empty</p>
            <p className="text-sm">Go back and add some suggestions!</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-200 ml-5 space-y-8 animate-fade-in-up">
            {items.map((item, index) => (
              <div key={item.id} className="relative pl-8">
                {/* Timeline dot */}
                <div 
                  className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 transition-colors ${
                    item.completed ? 'bg-green-500' : 'bg-indigo-500'
                  }`} 
                />
                
                <div 
                  className={`bg-white rounded-xl p-5 shadow-sm border group transition-all hover:shadow-md ${
                    item.completed ? 'border-green-200 bg-green-50/10 opacity-75' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Checkmark Button */}
                      <button 
                        onClick={() => handleToggleComplete(item.id, item.completed)}
                        className={`mt-0.5 shrink-0 rounded-full transition-transform active:scale-90 ${
                           item.completed ? 'text-green-500' : 'text-slate-300 hover:text-indigo-400'
                        }`}
                        title={item.completed ? "Mark as incomplete" : "Mark as complete"}
                      >
                         {item.completed ? (
                           <CheckCircle2 className="w-6 h-6 animate-pop" />
                         ) : (
                           <Circle className="w-6 h-6" />
                         )}
                      </button>

                      <div>
                        <h3 className={`text-lg font-bold text-slate-800 transition-all ${item.completed ? 'line-through text-slate-500 decoration-slate-400' : ''}`}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-xs font-semibold tracking-wider text-indigo-500 uppercase">
                             {item.category}
                           </span>
                           {item.distanceText && (
                             <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded">
                               {item.distanceText}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className={item.completed ? 'opacity-50' : ''}>
                    <p className="text-slate-500 text-sm mt-3 leading-relaxed">{item.description}</p>
                    
                    {/* Notes Section */}
                    <div className="mt-4 pt-3 border-t border-gray-50">
                       <div className="flex items-start gap-2">
                          <Pencil className="w-3 h-3 text-gray-400 mt-1" />
                          <textarea
                             placeholder="Add notes (e.g., 'Dinner at 8pm', 'Buy tickets')..."
                             defaultValue={item.notes || ''}
                             onBlur={(e) => {
                                if (onUpdate && e.target.value !== item.notes) {
                                   onUpdate(item.id, { notes: e.target.value });
                                }
                             }}
                             className="w-full text-sm bg-transparent focus:bg-gray-50 border-none focus:ring-1 focus:ring-indigo-200 rounded p-1 resize-none text-slate-600 placeholder-slate-300 transition-colors"
                             rows={1}
                             onInput={(e) => {
                                e.currentTarget.style.height = 'auto';
                                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                             }}
                          />
                       </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                       {item.relatedQuizTopic ? (
                          <div className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded inline-block font-medium">
                            Quiz: {item.relatedQuizTopic}
                          </div>
                       ) : <div></div>}
                       
                       {item.googleMapsLink && (
                         <a 
                           href={item.googleMapsLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                         >
                           <Navigation className="w-3 h-3" /> Navigate
                         </a>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Undo Toast */}
      {showUndo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-4 min-w-[300px] justify-between">
            <span className="text-sm font-medium">Item removed</span>
            <button 
              onClick={handleUndo}
              className="text-indigo-400 hover:text-indigo-300 font-bold text-sm flex items-center gap-1 transition-colors"
            >
              <Undo2 className="w-4 h-4" /> Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
