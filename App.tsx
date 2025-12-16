
import React, { useState, useEffect } from 'react';
import { AppView, Question, Suggestion, ItineraryItem, SavedTrip, DraftTrip, User } from './types';
import { CityInput } from './components/CityInput';
import { Quiz } from './components/Quiz';
import { Suggestions } from './components/Suggestions';
import { Itinerary } from './components/Itinerary';
import { Loading } from './components/Loading';
import { UserProfile } from './components/UserProfile';
import { Auth } from './components/Auth';
import { generateCityQuiz, generateTravelSuggestions } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [city, setCity] = useState('');
  const [hotel, setHotel] = useState('');
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [tripNotes, setTripNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  // Load saved trips on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('braintrip_saved_trips');
      if (saved) {
        setSavedTrips(JSON.parse(saved));
      }
      const savedUser = localStorage.getItem('braintrip_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load saved data", e);
    }
  }, []);

  // Save trips when state changes
  const persistTrips = (trips: SavedTrip[]) => {
    setSavedTrips(trips);
    localStorage.setItem('braintrip_saved_trips', JSON.stringify(trips));
  };

  // Handlers
  const handleStart = async (selectedCity: string, isHandsFree: boolean, hotelLocation: string) => {
    setCity(selectedCity);
    setHandsFreeMode(isHandsFree);
    setHotel(hotelLocation);
    setError(null);
    
    // Check for existing trip to merge
    const normalizedCity = selectedCity.toLowerCase().trim();
    const existingTrip = savedTrips.find(t => t.city.toLowerCase().trim() === normalizedCity);
    
    if (existingTrip) {
      console.log(`Merging with existing trip for ${existingTrip.city}`);
      setCurrentTripId(existingTrip.id);
      setItinerary(existingTrip.items);
      setTripNotes(existingTrip.tripNotes || '');
      
      // If user provided a new hotel location, use it, otherwise keep existing
      if (!hotelLocation && existingTrip.hotelLocation) {
        setHotel(existingTrip.hotelLocation);
      } else if (hotelLocation && hotelLocation !== existingTrip.hotelLocation) {
        // Update the hotel in the saved trip immediately if it changed
        const updatedTrips = savedTrips.map(t => t.id === existingTrip.id ? { ...t, hotelLocation } : t);
        persistTrips(updatedTrips);
      }
    } else {
      setCurrentTripId(null);
      setItinerary([]);
      setTripNotes('');
    }

    setView(AppView.LOADING_QUIZ);
    
    try {
      const generatedQuestions = await generateCityQuiz(selectedCity);
      setQuestions(generatedQuestions);
      setView(AppView.QUIZ);
    } catch (err) {
      console.error(err);
      setError("We couldn't generate a quiz for that city. Please try again.");
      setView(AppView.HOME);
    }
  };

  const fetchSuggestions = async () => {
    setView(AppView.LOADING_SUGGESTIONS);
    
    // Extract related topics from questions to personalize suggestions
    const topics = questions.map(q => q.relatedTopic).filter(Boolean);
    
    try {
      // Pass hotel location for distance calculation
      const generatedSuggestions = await generateTravelSuggestions(city, topics, hotel);
      setSuggestions(generatedSuggestions);
      setView(AppView.SUGGESTIONS);
    } catch (err) {
      console.error(err);
      setError("We couldn't create your travel plan. Please try again.");
      setView(AppView.HOME);
    }
  };

  const handleQuizComplete = async (score: number) => {
    await fetchSuggestions();
  };

  const handleAddToItinerary = (suggestion: Suggestion) => {
    // Check if already exists in current list
    if (itinerary.find(item => item.id === suggestion.id)) return;
    
    const newItinerary = [...itinerary, { ...suggestion }];
    setItinerary(newItinerary); // Update UI state

    // Automatically save to passport profile
    if (currentTripId) {
       // Update existing trip
       const updatedSavedTrips = savedTrips.map(trip => {
         if (trip.id === currentTripId) {
           return { ...trip, items: newItinerary, hotelLocation: hotel || trip.hotelLocation, tripNotes };
         }
         return trip;
       });
       persistTrips(updatedSavedTrips);
    } else {
       // Create new trip immediately
       const newId = Math.random().toString(36).substring(2, 9);
       const newTrip: SavedTrip = {
         id: newId,
         city: city,
         hotelLocation: hotel,
         items: newItinerary,
         tripNotes: tripNotes,
         createdAt: Date.now(),
       };
       const updated = [newTrip, ...savedTrips];
       persistTrips(updated);
       setCurrentTripId(newId);
    }
  };

  const handleReorderItinerary = (items: ItineraryItem[]) => {
    setItinerary(items);

    if (currentTripId) {
       const updatedSavedTrips = savedTrips.map(trip => {
        if (trip.id === currentTripId) {
          return { ...trip, items: items };
        }
        return trip;
      });
      persistTrips(updatedSavedTrips);
    }
  };

  const handleUpdateItineraryItem = (id: string, updates: Partial<ItineraryItem>) => {
    const updatedItinerary = itinerary.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    
    setItinerary(updatedItinerary);

    // If we are editing a saved trip, persist changes to profile immediately
    if (currentTripId) {
      const updatedSavedTrips = savedTrips.map(trip => {
        if (trip.id === currentTripId) {
          return { ...trip, items: updatedItinerary };
        }
        return trip;
      });
      persistTrips(updatedSavedTrips);
    }
  };

  const handleUpdateTripNotes = (notes: string) => {
    setTripNotes(notes);

    if (currentTripId) {
      const updatedSavedTrips = savedTrips.map(trip => {
        if (trip.id === currentTripId) {
          return { ...trip, tripNotes: notes };
        }
        return trip;
      });
      persistTrips(updatedSavedTrips);
    }
  };
  
  const handleUpdateSuggestion = (id: string, updates: Partial<Suggestion>) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const handleRemoveFromItinerary = (id: string) => {
    const updatedItinerary = itinerary.filter(item => item.id !== id);
    setItinerary(updatedItinerary);

    // Also update saved trip if active
    if (currentTripId) {
       const updatedSavedTrips = savedTrips.map(trip => {
        if (trip.id === currentTripId) {
          return { ...trip, items: updatedItinerary };
        }
        return trip;
      });
      persistTrips(updatedSavedTrips);
    }
  };

  const handleSaveTrip = () => {
    // Manual save button action
    if (currentTripId) {
      const updatedSavedTrips = savedTrips.map(trip => {
        if (trip.id === currentTripId) {
          return { ...trip, items: itinerary, hotelLocation: hotel, tripNotes }; 
        }
        return trip;
      });
      persistTrips(updatedSavedTrips);
    } else {
      if (itinerary.length === 0) return; 

      const newId = Math.random().toString(36).substring(2, 9);
      const newTrip: SavedTrip = {
        id: newId,
        city,
        hotelLocation: hotel,
        items: itinerary,
        tripNotes,
        createdAt: Date.now(),
      };
      
      const updated = [newTrip, ...savedTrips];
      persistTrips(updated);
      setCurrentTripId(newId);
    }
  };

  const handleLoadTrip = (trip: SavedTrip) => {
    setCity(trip.city);
    setHotel(trip.hotelLocation || '');
    setItinerary(trip.items);
    setTripNotes(trip.tripNotes || '');
    setSuggestions([]); 
    setQuestions([]);
    setCurrentTripId(trip.id); 
    setView(AppView.ITINERARY);
  };

  const handleDeleteTrip = (id: string) => {
    const updated = savedTrips.filter(t => t.id !== id);
    persistTrips(updated);
    if (currentTripId === id) {
      setCurrentTripId(null);
    }
  };

  const handleResumeDraft = () => {
    try {
      const savedDraft = localStorage.getItem('braintrip_autosave');
      if (savedDraft) {
        const draft: DraftTrip = JSON.parse(savedDraft);
        setCity(draft.city);
        setHotel(draft.hotelLocation || '');
        setItinerary(draft.items);
        setTripNotes(draft.tripNotes || '');
        setSuggestions([]); 
        setQuestions([]);
        setCurrentTripId(null); 
        setView(AppView.ITINERARY);
      }
    } catch (e) {
      console.error("Failed to resume draft", e);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('braintrip_current_user', JSON.stringify(loggedInUser));
    setView(AppView.PROFILE);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('braintrip_current_user');
    setView(AppView.HOME);
  };

  // Helper to render current view content
  const renderView = () => {
    if (error) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-white animate-fade-in">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button 
            onClick={() => { setError(null); setView(AppView.HOME); }}
            className="px-6 py-2 bg-slate-100 rounded-lg font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (view) {
      case AppView.LOGIN:
        return <Auth onLogin={handleLogin} onBack={() => setView(AppView.HOME)} />;
      
      case AppView.LOADING_QUIZ:
        return <Loading message={`Constructing a quiz about ${city}...`} />;
      
      case AppView.QUIZ:
        return <Quiz 
          city={city} 
          questions={questions} 
          initialHandsFree={handsFreeMode}
          onComplete={handleQuizComplete} 
        />;
      
      case AppView.LOADING_SUGGESTIONS:
        return <Loading message={`Checking Google Maps for distances from ${hotel || 'city center'}...`} />;
      
      case AppView.SUGGESTIONS:
        return (
          <Suggestions 
            city={city} 
            suggestions={suggestions} 
            itineraryIds={new Set(itinerary.map(i => i.id))}
            onAddToItinerary={handleAddToItinerary}
            onUpdateSuggestion={handleUpdateSuggestion}
            onContinue={() => setView(AppView.ITINERARY)}
            onRetry={fetchSuggestions}
          />
        );
      
      case AppView.ITINERARY:
        return (
          <Itinerary 
            city={city} 
            hotelLocation={hotel}
            items={itinerary} 
            tripNotes={tripNotes}
            onRemove={handleRemoveFromItinerary} 
            onBack={() => suggestions.length > 0 ? setView(AppView.SUGGESTIONS) : setView(AppView.HOME)}
            onSave={handleSaveTrip}
            onRestore={handleAddToItinerary}
            onReorder={handleReorderItinerary}
            onUpdate={handleUpdateItineraryItem}
            onUpdateTripNotes={handleUpdateTripNotes}
          />
        );
      
      case AppView.PROFILE:
        return (
          <UserProfile 
            user={user}
            savedTrips={savedTrips}
            onOpenTrip={handleLoadTrip}
            onBack={() => setView(AppView.HOME)}
            onLogout={handleLogout}
          />
        );

      case AppView.HOME:
      default:
        return (
          <CityInput 
            onStart={handleStart} 
            savedTrips={savedTrips}
            onLoadTrip={handleLoadTrip}
            onDeleteTrip={handleDeleteTrip}
            onResumeDraft={handleResumeDraft}
            onOpenProfile={() => {
              if (user) {
                setView(AppView.PROFILE);
              } else {
                setView(AppView.LOGIN);
              }
            }}
          />
        );
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-slate-50">
      <div key={view} className="h-full w-full animate-fade-in">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
