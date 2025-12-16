import React from 'react';
import { SavedTrip, User } from '../types';
import { ArrowLeft, User as UserIcon, Globe, Award, Download, LogOut, Map } from 'lucide-react';

interface UserProfileProps {
  user: User | null;
  savedTrips: SavedTrip[];
  onOpenTrip: (trip: SavedTrip) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, savedTrips, onOpenTrip, onBack, onLogout }) => {
  // Helper to generate consistent "random" visual properties for stamps based on trip ID
  const getStampStyle = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rotation = (hash % 30) - 15; // -15 to +15 deg
    const colors = [
      'border-indigo-600 text-indigo-800 bg-indigo-50/50',
      'border-rose-600 text-rose-800 bg-rose-50/50',
      'border-emerald-600 text-emerald-800 bg-emerald-50/50',
      'border-amber-600 text-amber-800 bg-amber-50/50',
      'border-blue-600 text-blue-800 bg-blue-50/50',
    ];
    const colorClass = colors[hash % colors.length];
    
    return { rotation, colorClass };
  };

  const handleExportTrips = () => {
    if (savedTrips.length === 0) return;

    try {
      const dataStr = JSON.stringify(savedTrips, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BrainTrip_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export trips", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      {/* Header / ID Page */}
      <div className="bg-slate-800 text-white p-6 pb-12 shadow-xl z-10 relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="absolute top-6 right-6 flex items-center gap-2">
            <button 
            onClick={handleExportTrips}
            disabled={savedTrips.length === 0}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export Trips"
            aria-label="Export Trips"
            >
            <Download className="w-5 h-5 text-white" />
            </button>
            <button 
            onClick={onLogout}
            className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-200 transition-colors"
            title="Log Out"
            aria-label="Log Out"
            >
            <LogOut className="w-5 h-5 text-white" />
            </button>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-200 rounded-full border-4 border-white/20 shadow-inner flex items-center justify-center mb-4 overflow-hidden relative">
            <UserIcon className="w-12 h-12 text-slate-400" />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 mix-blend-overlay"></div>
          </div>
          <h1 className="text-2xl font-mono font-bold tracking-widest uppercase">{user?.name || 'Explorer'}</h1>
          <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
             <Globe className="w-3 h-3" />
             <span>Global Citizen ID: 8942-BTRP</span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="absolute -bottom-10 left-6 right-6 bg-white rounded-xl shadow-lg p-4 flex justify-around items-center border border-slate-100">
           <div className="text-center">
              <span className="block text-2xl font-bold text-indigo-600">{savedTrips.length}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cities</span>
           </div>
           <div className="w-px h-8 bg-slate-100"></div>
           <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-600">
                {savedTrips.reduce((acc, trip) => acc + trip.items.length, 0)}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Places</span>
           </div>
           <div className="w-px h-8 bg-slate-100"></div>
           <div className="text-center">
              <span className="block text-2xl font-bold text-amber-500">
                <Award className="w-6 h-6 inline-block" />
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rank</span>
           </div>
        </div>
      </div>

      {/* Passport Pages / Stamps Grid */}
      <div className="flex-1 overflow-y-auto pt-16 px-6 pb-6 relative z-0">
        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 text-center border-b border-stone-200 pb-2">
          Visas & Entry Stamps
        </h2>

        {savedTrips.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 text-stone-400 opacity-60">
              <Map className="w-16 h-16 mb-4 stroke-1" />
              <p className="font-serif italic text-lg">No stamps yet...</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12">
            {savedTrips.map((trip) => {
              const { rotation, colorClass } = getStampStyle(trip.id);
              const date = new Date(trip.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
              }).toUpperCase();

              return (
                <button
                  key={trip.id}
                  onClick={() => onOpenTrip(trip)}
                  className={`group relative aspect-square flex flex-col items-center justify-center p-2 rounded-full border-4 border-double transition-transform hover:scale-105 active:scale-95 focus:outline-none ${colorClass}`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="text-center">
                    <div className="text-[10px] font-bold uppercase opacity-70 mb-1 tracking-widest">
                       BrainTrip Entry
                    </div>
                    <div className="text-lg font-black uppercase leading-none tracking-tighter mix-blend-multiply">
                      {trip.city.split(',')[0]}
                    </div>
                    <div className="text-[10px] font-mono mt-1 opacity-80 border-t border-current inline-block px-2 pt-0.5">
                      {date}
                    </div>
                  </div>
                  
                  {/* Grungy overlay effect for ink stamp look */}
                  <div className="absolute inset-0 rounded-full opacity-30 mix-blend-screen bg-noise pointer-events-none"></div>
                </button>
              );
            })}
          </div>
        )}
        
        <div className="mt-12 text-center">
           <p className="text-xs text-stone-300 font-serif italic">Department of Global Exploration</p>
        </div>
      </div>
    </div>
  );
};