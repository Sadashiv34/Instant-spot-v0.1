
import React, { useMemo } from 'react';
import { MapPin, Sparkles, Navigation, Zap, Radar, Compass } from 'lucide-react';

// Hosted Logo URL (reusing the same hosted asset)
const LOGO_URL = "https://i.ibb.co/nqYyNTKW/1764266537309.png";

// Hexagon Pattern SVG (Base64) - Subtle Green Stroke
const HEX_PATTERN = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSI0OSIgdmlld0JveD0iMCAwIDI4IDQ5Ij48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGlkPSJoZXhhZ29ucyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjJjNTVlIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNMTMuOTkgOS4yNWwxMyA3LjV2MTVsMTMgNy41TDEgMzEuNzV2LTE1eiIvPjxwYXRoIGQ9Ik0xMy45OS0yNC43NWwxMyA3LjV2MTVsLTEzIDcuNXUxLTIuMjV2LTE1eiIvPjxwYXRoIGQ9Ik0xMy45OSA0My4yNWwxMyA3LjV2MTVsLTEzIDcuNUwxIDY1Ljc1di0xNXoiLz48L2c+PC9nPjwvc3ZnPg==";

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  // Generate random particles for the futuristic background
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: Math.random() > 0.6 ? 3 : 2,
      opacity: 0.1 + Math.random() * 0.3
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-green-500/30">
       
       <style>{`
          @keyframes float-particle {
            0% { transform: translateY(100px); opacity: 0; }
            20% { opacity: var(--target-opacity); }
            80% { opacity: var(--target-opacity); }
            100% { transform: translateY(-100vh); opacity: 0; }
          }
       `}</style>

       {/* --- NEW FUTURISTIC BACKGROUND --- */}
       <div className="absolute inset-0 bg-black pointer-events-none">
          {/* 1. Hexagonal Mesh Layer */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: `url("${HEX_PATTERN}")` }}
          ></div>
          
          {/* 2. Radial Gradient Mask (Vignette) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_95%)]"></div>
          
          {/* 3. Subtle Moving 'Fog' or 'Data' */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_farthest-corner_at_center,#22c55e05_0%,transparent_50%)] animate-pulse"></div>
          </div>

          {/* 4. Scanning Radar Line (Slow Rotation) */}
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] opacity-20 pointer-events-none animate-[spin_20s_linear_infinite]">
             <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,#22c55e15_60deg,transparent_90deg)]"></div>
          </div>

          {/* 5. FLOATING PARTICLE LAYER (New) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
             {particles.map((p, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-green-400 blur-[1px]"
                  style={{
                     left: p.left,
                     top: p.top,
                     width: `${p.size}px`,
                     height: `${p.size}px`,
                     '--target-opacity': p.opacity,
                     animation: `float-particle ${p.duration} linear infinite`,
                     animationDelay: p.delay,
                  } as React.CSSProperties}
                />
             ))}
          </div>
       </div>

       {/* Top & Bottom Shades */}
       <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
       
       {/* Responsive Header / Branding */}
       <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <img 
                src={LOGO_URL} 
                alt="instantspot logo" 
                className="h-8 md:h-12 w-auto transition-all duration-300" 
            />
            <div className="flex flex-col">
                <span className="text-sm md:text-2xl font-bold text-white tracking-tighter uppercase leading-none">
                    instantspot
                </span>
            </div>
       </div>

       {/* Floating Elements Animation - Updated to look more like nodes/satellites */}
       <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-green-500/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none">
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-green-500/30 rounded-full"></div>
       </div>
       <div className="absolute bottom-1/3 right-1/4 w-64 h-64 border border-blue-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none">
          <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-500/20 rounded-full"></div>
       </div>

       {/* Hero Content */}
       <div className="z-20 text-center px-6 max-w-5xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-20 md:mt-0 relative">
          
          <div className="mb-8 relative group">
              <div className="absolute inset-0 bg-green-500 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"></div>
              {/* Hexagon Shape Container */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-black/50 border border-green-500/50 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)] group-hover:scale-110 transition-transform duration-500"
                   style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                 <Radar size={48} className="text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-[spin_10s_linear_infinite] md:w-16 md:h-16" />
                 {/* Inner Pulse */}
                 <div className="absolute inset-2 border border-green-500/30" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
              </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight">
            Discover Amazing <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              Tourist Places
            </span>
            <span className="block text-4xl md:text-7xl text-white mt-2">Near You</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-2xl mb-12 max-w-3xl leading-relaxed font-light">
             Instantly find the best <strong>tourist places</strong>, top attractions, hidden sightseeing spots, and <strong>things to do near you</strong>. 
             <br className="hidden md:block"/>
             Your ultimate global AI travel guide for exploring weekend destinations and landmarks around you.
          </p>

          {/* WRAPPER for Radar Sweep + Button */}
          <div className="relative inline-flex items-center justify-center group">
              {/* RADAR SWEEP ANIMATION */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[320%] z-0 pointer-events-none opacity-80">
                   <div className="w-full h-full animate-[spin_8s_linear_infinite]">
                      <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,rgba(34,197,94,0.15)_100deg,transparent_180deg)] blur-xl"></div>
                   </div>
              </div>
              
              <button 
                onClick={onEnter}
                className="relative px-10 py-5 md:px-14 md:py-7 bg-green-600 hover:bg-green-500 text-black font-black text-lg md:text-xl rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] hover:-translate-y-1 active:scale-95 active:translate-y-0 cursor-pointer z-30 overflow-hidden"
              >
                 <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider">
                    Explore Nearby
                    <Navigation size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 md:w-6 md:h-6" strokeWidth={3} />
                 </span>
                 {/* Button Scan Effect */}
                 <div className="absolute top-0 -left-full w-1/2 h-full skew-x-12 bg-white/20 blur-sm group-hover:animate-[shimmer_1s_infinite]"></div>
              </button>
          </div>
       </div>

       {/* How it works / Features */}
       <div className="mt-24 mb-12 z-20 w-full max-w-6xl px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-white text-lg md:text-2xl font-bold tracking-widest uppercase opacity-80">How It Works</h2>
            <p className="text-gray-400 text-sm md:text-xl mt-3 max-w-2xl mx-auto leading-relaxed">Real amazing places to visit in just a few simple steps.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: <Compass size={24}/>, title: "Allow Location Access", desc: "Enable location services in your browser to find the spots nearest you." },
              { icon: <Radar size={24}/>, title: "View Nearby Spots", desc: "Discover popular attractions and hidden gems in your immediate area." },
              { icon: <MapPin size={24}/>, title: "Click on Markers", desc: "Tap any marker on the map to see detailed information about the place." },
              { icon: <Sparkles size={24}/>, title: "AI Spot Guide", desc: "Get instant history, fun facts, and AI-powered insights for any selected location." }
            ].map((f, i) => (
               <div key={i} className="bg-[#111]/80 border border-white/10 p-5 md:p-8 rounded-xl md:rounded-2xl hover:border-green-500/30 hover:bg-white/5 transition-all duration-300 group text-left flex flex-col items-start h-full backdrop-blur-sm">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-black rounded-lg md:rounded-xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-green-400 group-hover:scale-110 transition-all border border-white/10 group-hover:border-green-500/30 shadow-lg">
                      {React.cloneElement(f.icon as React.ReactElement<any>, { className: "w-5 h-5 md:w-8 md:h-8" })}
                  </div>
                  <h3 className="text-white font-bold text-xs md:text-lg mb-2 uppercase tracking-wide group-hover:text-green-300 transition-colors">{f.title}</h3>
                  <p className="text-gray-500 text-[10px] md:text-sm leading-relaxed md:leading-relaxed">{f.desc}</p>
               </div>
            ))}
          </div>
       </div>

       {/* Why Choose Us */}
        <div className="z-20 w-full max-w-6xl px-6 pb-20">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-white text-lg md:text-2xl font-bold tracking-widest uppercase opacity-80">Why Choose Our App?</h2>
            <p className="text-gray-400 text-sm md:text-xl mt-3 max-w-2xl mx-auto leading-relaxed">Experience the best way to discover new places with features designed for explorers.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
             {[
               { icon: <Sparkles size={24}/>, title: "Instant Search", desc: "Get personalized suggestions based on your current location and preferences." },
               { icon: <Zap size={24}/>, title: "Save Time", desc: "Quickly find the best spots without wasting time searching multiple sources." },
               { icon: <MapPin size={24}/>, title: "Hidden Gems", desc: "Find peaceful natural spots, historical sites, and unique local attractions." },
               { icon: <Radar size={24}/>, title: "Instant Joy", desc: "Start exploring and creating memorable experiences right away with zero hassle." }
             ].map((f, i) => (
                <div key={i} className="bg-[#111]/80 border border-white/10 p-5 md:p-8 rounded-xl md:rounded-2xl hover:border-blue-500/30 hover:bg-white/5 transition-all duration-300 group text-left flex flex-col items-start h-full backdrop-blur-sm">
                   <div className="w-10 h-10 md:w-16 md:h-16 bg-black rounded-lg md:rounded-xl flex items-center justify-center mb-4 text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all border border-white/10 group-hover:border-blue-500/30 shadow-lg">
                       {React.cloneElement(f.icon as React.ReactElement<any>, { className: "w-5 h-5 md:w-8 md:h-8" })}
                   </div>
                   <h3 className="text-white font-bold text-xs md:text-lg mb-2 uppercase tracking-wide group-hover:text-blue-300 transition-colors">{f.title}</h3>
                   <p className="text-gray-500 text-[10px] md:text-sm leading-relaxed md:leading-relaxed">{f.desc}</p>
                </div>
             ))}
          </div>
       </div>

       {/* Footer CTA */}
       <div className="z-20 mb-8 text-center animate-bounce">
          <h2 className="text-white font-bold mb-2 md:text-xl">Start Your Journey</h2>
          <p className="text-gray-600 text-[10px] md:text-sm mb-4">Begin discovering amazing places around you today.</p>
          <button 
            onClick={onEnter}
            className="bg-green-600 hover:bg-green-500 text-black text-xs md:text-base font-bold py-2 px-6 md:py-3 md:px-8 rounded-full transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] cursor-pointer tracking-wider uppercase"
          >
             Start Your Journey
          </button>
       </div>

       {/* Links Section */}
      <div className="z-20 flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-16 px-4">
          <a href="/privacy-policy.html" className="text-xs text-gray-500 hover:text-green-400 transition-colors">
    Privacy Policy
  </a>
          <a href="/terms.html" className="text-xs text-gray-500 hover:text-green-400 transition-colors">
    Terms & Services
  </a>
           <a href="/contact.html" className="text-xs text-gray-500 hover:text-green-400 transition-colors">
    Contact Us
  </a>
          <a href="/about.html" className="text-xs text-gray-500 hover:text-green-400 transition-colors">
    About Us
  </a>
       </div>

       <div className="absolute bottom-4 z-20 flex gap-4 text-[10px] md:text-xs text-gray-600">
          <span>© 2025 InstantSpot. Crafted for explorers worldwide.</span>
       </div>
    </div>
  );
}

export default LandingPage;
