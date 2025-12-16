import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Mic, MicOff, Calendar, Trash2, Brain, Plane, ChevronRight, RotateCcw, Building, User } from 'lucide-react';
import { Button } from './Button';
import { SavedTrip, DraftTrip } from '../types';
import { Logo } from './Logo';

interface CityInputProps {
  onStart: (city: string, handsFree: boolean, hotel: string) => void;
  savedTrips: SavedTrip[];
  onLoadTrip: (trip: SavedTrip) => void;
  onDeleteTrip: (id: string) => void;
  onResumeDraft?: () => void;
  onOpenProfile: () => void;
}

export const CityInput: React.FC<CityInputProps> = ({ onStart, savedTrips, onLoadTrip, onDeleteTrip, onResumeDraft, onOpenProfile }) => {
  const [city, setCity] = useState('');
  const [hotel, setHotel] = useState('');
  const [handsFree, setHandsFree] = useState(false);
  const [draft, setDraft] = useState<DraftTrip | null>(null);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('braintrip_autosave');
      if (savedDraft) {
        setDraft(JSON.parse(savedDraft));
      }
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onStart(city.trim(), handsFree, hotel.trim());
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center justify-center min-h-full p-6 pb-20 relative">
          
          {/* Top Bar */}
          <div className="absolute top-6 right-6">
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all text-sm font-medium border border-white/20 shadow-lg"
            >
              <User className="w-4 h-4" />
              <span>My Passport</span>
            </button>
          </div>

          <div className="w-full max-w-md space-y-8 animate-fade-in-up mt-12">
            
            {/* Header with Logo */}
            <div className="flex justify-center mb-6">
              <Logo size="xl" variant="full" theme="light" />
            </div>

            {/* Resume Draft Banner */}
            {draft && onResumeDraft && (
              <div 
                className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-all shadow-lg animate-pop"
                onClick={onResumeDraft}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-full text-white">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Resume Planning</h3>
                    <p className="text-indigo-100 text-xs">Continue your {draft.city} trip</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-200" />
              </div>
            )}

            {/* Main Input Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium text-gray-700 block ml-1">
                    Where do you want to go?
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Paris, Tokyo, New York..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="hotel" className="text-sm font-medium text-gray-700 block ml-1">
                    Hotel / Accommodation <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="hotel"
                      type="text"
                      value={hotel}
                      onChange={(e) => setHotel(e.target.value)}
                      placeholder="Hotel Name or Address"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div 
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${handsFree ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                onClick={() => setHandsFree(!handsFree)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${handsFree ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                    {handsFree ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <span className={`block font-semibold ${handsFree ? 'text-indigo-900' : 'text-gray-600'}`}>
                      Hands-Free Mode
                    </span>
                    <span className="text-xs text-gray-500">
                      Voice-only quiz experience
                    </span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${handsFree ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'}`}>
                   {handsFree && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                disabled={!city.trim()}
              >
                <span className="flex items-center justify-center gap-2">
                  Start Adventure <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </form>

            {/* Saved Trips List */}
            {savedTrips.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 <div className="flex items-center justify-between px-2 mb-3 mt-8">
                    <h3 className="font-semibold text-indigo-100">Your Recent Trips</h3>
                 </div>
                 <div className="space-y-3">
                    {savedTrips.map(trip => (
                      <div 
                        key={trip.id}
                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition-colors group cursor-pointer relative"
                        onClick={() => onLoadTrip(trip)}
                      >
                         <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 border border-indigo-400/30">
                               <MapPin className="w-5 h-5 text-indigo-100" />
                            </div>
                            <div className="min-w-0 pr-8">
                               <h4 className="font-bold text-white truncate text-lg">{trip.city}</h4>
                               <div className="flex items-center gap-2 text-xs text-indigo-200">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                  <span>•</span>
                                  <span>{trip.items.length} items</span>
                               </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-2">
                            <button 
                                className="p-2 text-indigo-200 hover:text-red-300 hover:bg-white/10 rounded-full transition-colors z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTrip(trip.id);
                                }}
                                aria-label="Delete trip"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-white/40" />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
            
            <div className="text-center text-indigo-200 text-sm pt-4">
              Powered by Gemini AI
            </div>

            {/* How it works */}
            <div className="pt-8 border-t border-white/10">
              <h3 className="text-center text-indigo-100 font-semibold mb-6">How BrainTrip Works</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-6 h-6 text-indigo-200" />
                  </div>
                  <p className="text-xs text-indigo-100 font-medium">Pick a City</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Brain className="w-6 h-6 text-indigo-200" />
                  </div>
                  <p className="text-xs text-indigo-100 font-medium">Play Trivia</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Plane className="w-6 h-6 text-indigo-200" />
                  </div>
                  <p className="text-xs text-indigo-100 font-medium">Get Plan</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};