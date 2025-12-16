import React, { useState, useEffect } from 'react';
import { Suggestion } from '../types';
import { Button } from './Button';
import { Plus, Check, Map, Coffee, Camera, Mountain, Compass, ArrowRight, RefreshCw, Car, Navigation, ArrowUpDown, Pin, Sparkles, ExternalLink, MapPin } from 'lucide-react';
import { generateLocationImage } from '../services/geminiService';
import { Logo } from './Logo';

interface SuggestionsProps {
  city: string;
  suggestions: Suggestion[];
  itineraryIds: Set<string>;
  onAddToItinerary: (suggestion: Suggestion) => void;
  onUpdateSuggestion: (id: string, updates: Partial<Suggestion>) => void;
  onContinue: () => void;
  onRetry: () => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Food': return <Coffee className="w-4 h-4 text-orange-500" />;
    case 'Culture': return <Map className="w-4 h-4 text-purple-500" />;
    case 'Adventure': return <Mountain className="w-4 h-4 text-green-500" />;
    default: return <Camera className="w-4 h-4 text-blue-500" />;
  }
};

const SuggestionCardImage = ({ suggestion, city, onUpdate }: { suggestion: Suggestion, city: string, onUpdate: (id: string, updates: Partial<Suggestion>) => void }) => {
  const [loading, setLoading] = useState(false);
  // Default placeholder
  const placeholderUrl = `https://picsum.photos/seed/${suggestion.id}/800/400`;
  const displayUrl = suggestion.generatedImageUrl || placeholderUrl;

  useEffect(() => {
    // Attempt generation if not present
    if (!suggestion.generatedImageUrl && !loading) {
      setLoading(true);
      generateLocationImage(suggestion.title, city)
        .then(url => {
          if (url) {
            onUpdate(suggestion.id, { generatedImageUrl: url });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [suggestion.id]);

  return (
    <div className="h-36 w-full bg-gray-100 relative group">
      <img 
        src={displayUrl} 
        alt={suggestion.title} 
        className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-80' : 'opacity-100'}`}
        loading="lazy"
      />
      
      {/* Loading overlay/indicator */}
      {loading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
           <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-indigo-600 flex items-center gap-1.5 shadow-sm">
             <Sparkles className="w-3 h-3 animate-spin" /> Generating view...
           </div>
        </div>
      )}

      <div className="absolute top-3 left-3 flex gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
            <CategoryIcon category={suggestion.category} />
            {suggestion.category}
          </span>
          {suggestion.relatedQuizTopic && (
            <span className="inline-flex items-center text-xs font-bold text-indigo-700 bg-indigo-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
              Quiz: {suggestion.relatedQuizTopic}
            </span>
          )}
      </div>
    </div>
  );
};

export const Suggestions: React.FC<SuggestionsProps> = ({ 
  city, 
  suggestions, 
  itineraryIds, 
  onAddToItinerary,
  onUpdateSuggestion,
  onContinue,
  onRetry
}) => {
  const [sortByDistance, setSortByDistance] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Sightseeing', 'Food', 'Culture', 'Adventure'];

  const filteredSuggestions = suggestions.filter(s => 
    selectedCategory === 'All' ? true : s.category === selectedCategory
  );

  const displayedSuggestions = sortByDistance 
    ? [...filteredSuggestions].sort((a, b) => {
        // Simple parse of distance string "1.2 km" -> 1.2
        const getDist = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 9999;
        return getDist(a.distanceText || '') - getDist(b.distanceText || '');
      })
    : filteredSuggestions;

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
           <Map className="w-10 h-10 text-indigo-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No suggestions found</h2>
        <p className="text-slate-500 mb-8 max-w-xs leading-relaxed">
           We couldn't generate a personalized itinerary for {city} just yet.
        </p>
        <Button onClick={onRetry} className="flex items-center gap-2 shadow-indigo-200">
           <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm border-b border-gray-100 z-10 shrink-0 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
             <Logo variant="icon" size="sm" />
             <div>
               <h1 className="text-2xl font-bold text-slate-800">For You in {city}</h1>
               <p className="text-slate-500 mt-1">Based on your quiz results</p>
             </div>
          </div>
          <button 
             onClick={() => setSortByDistance(!sortByDistance)}
             className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
               sortByDistance 
                 ? 'bg-indigo-100 text-indigo-700' 
                 : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
             }`}
          >
             <ArrowUpDown className="w-3 h-3" />
             {sortByDistance ? 'Nearest First' : 'Recommended'}
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-6 px-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
        {displayedSuggestions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No suggestions found for this category.</p>
            <button 
              onClick={() => setSelectedCategory('All')} 
              className="text-indigo-600 font-semibold mt-2 hover:underline"
            >
              View all
            </button>
          </div>
        ) : (
          displayedSuggestions.map((suggestion) => {
            const isAdded = itineraryIds.has(suggestion.id);
            
            return (
              <div 
                key={suggestion.id}
                className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden ${isAdded ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:shadow-md'}`}
              >
                {/* Image Component with generation logic */}
                <SuggestionCardImage 
                  suggestion={suggestion} 
                  city={city} 
                  onUpdate={onUpdateSuggestion} 
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{suggestion.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                          href={suggestion.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
                          title="View on Google Maps"
                      >
                          <MapPin className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => !isAdded && onAddToItinerary(suggestion)}
                        disabled={isAdded}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                          isAdded 
                            ? 'bg-green-100 text-green-700 cursor-default border border-green-200' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{suggestion.description}</p>

                  {/* Map & Distance Card */}
                  <div className="bg-slate-50 rounded-xl p-1 border border-slate-100 mb-4 flex gap-1">
                     {/* Map Preview Button */}
                     <a 
                        href={suggestion.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-20 bg-blue-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shrink-0 relative overflow-hidden group"
                     >
                        <div className="absolute inset-0 bg-blue-200 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <Pin className="w-5 h-5 text-blue-600 relative z-10 mb-1" />
                        <span className="text-[10px] font-bold text-blue-700 relative z-10">MAP</span>
                     </a>
                     
                     {/* Distance Info */}
                     <div className="flex-1 p-2 pl-3 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5">
                              <Car className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-semibold text-slate-700">{suggestion.distanceText}</span>
                           </div>
                           <div className="w-px h-4 bg-slate-200"></div>
                           <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-slate-500">{suggestion.travelTimeText}</span>
                           </div>
                        </div>
                        <a 
                           href={suggestion.googleMapsLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-1 text-xs font-bold text-indigo-600 mt-1 hover:underline"
                        >
                           <Navigation className="w-3 h-3" /> Navigate
                        </a>
                     </div>
                  </div>

                  {suggestion.nearbyInterest && (
                    <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 flex items-start gap-3">
                      <div className="shrink-0 mt-0.5 bg-indigo-100 p-1.5 rounded-full">
                          <Compass className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                             <div>
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-0.5">Nearby</p>
                                <p className="text-sm font-semibold text-slate-800">{suggestion.nearbyInterest}</p>
                             </div>
                             <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(suggestion.nearbyInterest + " " + city)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-white/50 hover:bg-white px-2 py-1 rounded-full transition-colors border border-indigo-200/50"
                             >
                                View <ExternalLink className="w-3 h-3" />
                             </a>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-snug">{suggestion.nearbyInterestDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <Button onClick={onContinue} fullWidth className="shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
            View Itinerary ({itineraryIds.size}) <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};