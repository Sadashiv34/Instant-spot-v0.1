
import React, { useState, useEffect, useRef } from 'react';
import MapComp from './components/MapComp';
import { fetchNearbyPlaces } from './services/geoapifyService';
import { trackButtonClick } from './services/analyticsService';
import { GeoapifyPlace, UserLocation, Tab } from './types';
import { Loader2, AlertCircle, Lock, X, User, LogIn, Sparkles } from 'lucide-react';
import UserProfile from './components/UserProfile';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import SpotGuide from './components/SpotGuide'; // Import the new component
import { auth } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Hosted Logo URL
const LOGO_URL = "https://i.ibb.co/nqYyNTKW/1764266537309.png";

function App() {
  // Navigation / View State
  // Initialize state based on current URL to allow refreshes on /explore to work correctly
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path === '/explore' || path.startsWith('/explore/');
    }
    return false;
  });

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [places, setPlaces] = useState<GeoapifyPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeoapifyPlace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // New state for profile modal
  
  // Initialize Active Tab based on URL
  const [activeTab, setActiveTab] = useState<Tab>(() => {
      if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          if (path.includes('/details')) return Tab.DETAILS;
          if (path.includes('/reviews')) return Tab.REVIEW;
          if (path.includes('/guide')) return Tab.GUIDE;
      }
      return Tab.NONE;
  });
  
  // Details State
  const [placeDescription, setPlaceDescription] = useState<string | null>(null);

  // Handle URL changes via Browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setHasEntered(path.startsWith('/explore'));
      
      if (path.includes('/details')) setActiveTab(Tab.DETAILS);
      else if (path.includes('/reviews')) setActiveTab(Tab.REVIEW);
      else if (path.includes('/guide')) setActiveTab(Tab.GUIDE);
      else setActiveTab(Tab.NONE);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen for Auth State Changes (Always listen in background)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      // If user just logged in, close auth page
      if (user) {
        setIsAuthPageOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only initialize location and scanning AFTER user has entered from Landing Page
    if (!hasEntered) return;

    // Get User Location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        try {
          // Fetch Places
          const data = await fetchNearbyPlaces(latitude, longitude, 30000); // FIX: Use 30km radius
          if (data && data.features) {
            setPlaces(data.features);
          }
        } catch (err) {
          console.error(err);
          setError("Failed to fetch nearby places");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        let message = "Unable to retrieve your location. Please enable GPS in your phone settings.";
        // Check if permission was denied by the user
        if (err.code === 1) { // PERMISSION_DENIED
            message = "Location access was denied. To use this app, please enable location permissions for this site in your browser settings.";
        }
        setError(message);
        setLoading(false);
      }
    );
  }, [hasEntered]);

  // Reset Content when Place Changes
  useEffect(() => {
    if (!selectedPlace) {
        setPlaceDescription(null);
    }
  }, [selectedPlace]);

  const handlePlaceSelect = (place: GeoapifyPlace) => {
    setSelectedPlace(place);
    setPlaceDescription(null);
  };

  const handleClosePanel = () => {
    setSelectedPlace(null);
    setPlaceDescription(null);
    navigateTo('/explore', Tab.NONE); // Sync URL on close
  }

  // Helper for Navigation state updates
  const navigateTo = (path: string, tab: Tab) => {
      try {
          if (window.location.pathname !== path) {
              window.history.pushState({}, '', path);
          }
      } catch (e) {
          console.debug("Navigation history update skipped due to restriction:", e);
      }
      setActiveTab(tab);
  };

  const handleDetailsClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    trackButtonClick('Spot Details'); // Analytics
    if (activeTab === Tab.DETAILS) {
        navigateTo('/explore', Tab.NONE);
    } else {
        navigateTo('/explore/details', Tab.DETAILS);
    }
  };

  const handleReviewClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    trackButtonClick('Spot Reviews'); // Analytics
    if (activeTab === Tab.REVIEW) {
        navigateTo('/explore', Tab.NONE);
    } else {
        navigateTo('/explore/reviews', Tab.REVIEW);
    }
  };

  const handleGuideClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    trackButtonClick('Spot Guide'); // Analytics
    if (activeTab === Tab.GUIDE) {
        navigateTo('/explore', Tab.NONE);
    } else {
        navigateTo('/explore/guide', Tab.GUIDE);
    }
  };

  const handleProfileClick = () => {
      trackButtonClick('User Profile');
      if (currentUser) {
          setIsProfileModalOpen(true);
      } else {
          setIsAuthPageOpen(true);
      }
  };

  // Transition from Landing to App with URL update
  const handleEnterApp = () => {
    // 1. CRITICAL: Update State IMMEDIATELY to switch the view. 
    setHasEntered(true);
    
    // 2. Try to update URL for persistence (Best Effort)
    try {
        window.history.pushState({}, '', '/explore');
    } catch (e) {
        console.debug("Navigation history update skipped due to environment restriction:", e);
    }
  };

  // Reusable Close Button Component
  const CloseButton = () => (
      <button 
        onClick={() => navigateTo('/explore', Tab.NONE)}
        className="ml-auto p-1.5 bg-black/80 border border-green-500/50 rounded-lg text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:text-white hover:border-green-400 transition-all duration-300 backdrop-blur-sm group shrink-0"
        aria-label="Close Window"
    >
        <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );

  // LANDING PAGE VIEW
  if (!hasEntered) {
    return <LandingPage onEnter={handleEnterApp} />;
  }

  // MAIN APP VIEW
  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col overflow-hidden font-sans selection:bg-green-500/30">
      
      {isAuthPageOpen && <AuthPage onClose={() => setIsAuthPageOpen(false)} />}
      {isProfileModalOpen && <UserProfile onClose={() => setIsProfileModalOpen(false)} />}

      {/* --- HUD / SCANNER / CONTENT SECTION (Top Area) --- */}
      <div className={`w-full flex-1 overflow-hidden relative transition-all duration-500 z-30 pointer-events-auto bg-black`}>
        
        {activeTab === Tab.NONE && (
          <>
            <div className="absolute top-6 left-6 z-50 group cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-105">
                <div className="flex items-center gap-2">
                    <img 
                        src={LOGO_URL} 
                        alt="instantspot logo" 
                        className="h-8 md:h-12 w-auto" 
                    />
                    <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-bold text-white tracking-tighter uppercase leading-none">
                            instantspot
                        </span>
                        <span className="text-[9px] font-bold text-green-400 border border-green-500/50 bg-green-900/40 px-1.5 py-0.5 rounded-full tracking-widest w-fit mt-0.5">BETA</span>
                    </div>
                </div>
            </div>
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={handleProfileClick}
                    className={`
                      flex items-center gap-2 transition-all duration-300 backdrop-blur-sm group shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:text-white hover:border-green-400
                      ${currentUser 
                        ? 'p-1 rounded-full border border-green-500/50' // Logged In: Circular
                        : 'px-4 py-2 bg-black/80 border border-green-500/50 rounded-full text-green-400' // Logged Out: Rectangular Button
                      }
                    `}
                >
                    {currentUser ? (
                        currentUser.photoURL ? (
                             <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full object-cover border border-green-500/30" />
                        ) : (
                            <div className="p-1.5"><User size={20} className="group-hover:scale-110 transition-transform duration-300 text-green-400" /></div>
                        )
                    ) : (
                        <>
                             <LogIn size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                             <span className="text-xs font-bold tracking-wide whitespace-nowrap">SIGN IN / JOIN</span>
                        </>
                    )}
                </button>
            </div>
          </>
        )}
        
        {/* Spot Guide Panel */}
        {activeTab === Tab.GUIDE && (
          <div className="w-full h-full flex flex-col p-6 pt-10 relative z-10">
             <div className="flex items-center mb-4 pl-4 shrink-0 relative w-full">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-green-600 to-green-400 animate-pulse shadow-[0_0_12px_#22c55e]"></div>
                <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md uppercase">Spot Guide</h2>
                <CloseButton />
             </div>
             {/* Render the Guide Component */}
             <SpotGuide place={selectedPlace} onClose={() => navigateTo('/explore', Tab.NONE)} />
          </div>
        )}

        {activeTab === Tab.DETAILS && (
          <div className="w-full h-full flex flex-col p-6 pt-10 relative z-10">
             <div className="flex items-center mb-4 pl-4 shrink-0 relative w-full">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-green-600 to-green-400 animate-pulse shadow-[0_0_12px_#22c55e]"></div>
                <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md uppercase">Spot Details</h2>
                <CloseButton />
             </div>
             <div className="flex-1 flex flex-col items-center justify-center pb-20 text-center px-8">
                <div className="relative mb-6"><div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div><Lock size={48} className="text-green-400 relative z-10" /></div>
                <p className="text-green-400 text-xs font-bold tracking-widest uppercase border border-green-500/30 px-4 py-2 rounded-full bg-green-950/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">COMING SOON</p>
             </div>
          </div>
        )}

        {activeTab === Tab.REVIEW && (
          <div className="w-full h-full flex flex-col p-6 pt-10 relative z-10">
             <div className="flex items-center mb-4 pl-4 shrink-0 relative w-full">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-green-600 to-green-400 animate-pulse shadow-[0_0_12px_#22c55e]"></div>
                <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md uppercase">Spot Reviews</h2>
                <CloseButton />
             </div>
             <div className="flex-1 flex flex-col items-center justify-center pb-20 text-center px-8">
                <div className="relative mb-6"><div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div><Lock size={48} className="text-green-400 relative z-10" /></div>
                <p className="text-green-400 text-xs font-bold tracking-widest uppercase border border-green-500/30 px-4 py-2 rounded-full bg-green-950/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">COMING SOON</p>
             </div>
          </div>
        )}
      </div>

      <div className="px-4 md:px-6 pt-4 md:pt-8 pb-2 md:pb-4 shrink-0 z-40 flex flex-col gap-3 md:gap-4 bg-black border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,1)] relative mt-auto">
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1 relative z-50">
          {/* Spot Guide Button (First on left as requested) */}
          <a href={activeTab === Tab.GUIDE ? '/explore' : '/explore/guide'} onClick={handleGuideClick} className={`px-4 md:px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 border whitespace-nowrap backdrop-blur-md cursor-pointer flex items-center justify-center no-underline ${activeTab === Tab.GUIDE ? 'bg-green-500/10 text-green-400 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-105' : 'bg-black/40 text-gray-400 border-white/20 hover:border-white/50 hover:text-white'}`}>
             <Sparkles size={14} className="mr-2" />
             {activeTab === Tab.GUIDE ? 'Close Guide' : 'Spot Guide'}
          </a>

          <a href={activeTab === Tab.DETAILS ? '/explore' : '/explore/details'} onClick={handleDetailsClick} className={`px-4 md:px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 border whitespace-nowrap backdrop-blur-md cursor-pointer flex items-center justify-center no-underline ${activeTab === Tab.DETAILS ? 'bg-green-500/10 text-green-400 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-105' : 'bg-black/40 text-gray-400 border-white/20 hover:border-white/50 hover:text-white'}`}>{activeTab === Tab.DETAILS ? 'Close Details' : 'Spot Details'}</a>
          <a href={activeTab === Tab.REVIEW ? '/explore' : '/explore/reviews'} onClick={handleReviewClick} className={`px-4 md:px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 border whitespace-nowrap backdrop-blur-md cursor-pointer flex items-center justify-center no-underline ${activeTab === Tab.REVIEW ? 'bg-green-500/10 text-green-400 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] transform scale-105' : 'bg-black/40 text-gray-400 border-white/20 hover:border-white/50 hover:text-white'}`}>{activeTab === Tab.REVIEW ? 'Close Reviews' : 'Spot Reviews'}</a>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 tracking-tight text-white drop-shadow-md">Nearby Tourist Spots</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-green-400' : 'bg-green-500'}`}></span><span className={`relative inline-flex rounded-full h-2 w-2 ${loading ? 'bg-green-600' : 'bg-green-500'}`}></span></div>
            <p className="text-green-400 text-[10px] font-bold tracking-[0.15em] uppercase font-mono">{loading ? 'SCANNING SECTOR...' : 'Viewing All Attractions Within a 30 km Range'}</p>
          </div>
        </div>
      </div>

      <div className="h-[45vh] shrink-0 mx-2 mb-2 md:mx-4 md:mb-4 relative bg-[#0a0a0a] rounded-[24px] md:rounded-[32px] overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5 z-10">
        <div className="absolute inset-0 z-0">
          {loading && !userLocation ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
              <Loader2 size={32} className="text-green-500 animate-spin mb-4" />
              <p className="text-gray-500 text-xs tracking-widest uppercase font-mono">Initializing Sat-Link...</p>
            </div>
          ) : error ? (
             <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-white text-lg font-bold mb-2">Signal Lost</p>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">Retry Connection</button>
            </div>
          ) : (
            <MapComp userLocation={userLocation} places={places} onPlaceSelect={handlePlaceSelect} selectedPlaceId={selectedPlace?.properties.place_id} activeTab={activeTab} onClosePanel={handleClosePanel} />
          )}
        </div>
      </div>
      
    </div>
  );
}

export default App;
