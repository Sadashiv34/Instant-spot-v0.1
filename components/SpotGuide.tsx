
import React, { useEffect, useState } from 'react';
import { GeoapifyPlace } from '../types';
import { generateSpotGuide, SpotGuideData } from '../services/geminiService';
import { Sparkles, History, Hammer, Target, Lightbulb, MapPin, AlertCircle } from 'lucide-react';

const LOGO_URL = "https://i.ibb.co/nqYyNTKW/1764266537309.png";

interface SpotGuideProps {
  place: GeoapifyPlace | null;
  onClose: () => void;
}

const SpotGuide: React.FC<SpotGuideProps> = ({ place, onClose }) => {
  const [data, setData] = useState<SpotGuideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (place) {
      setLoading(true);
      setError(null);
      setData(null);

      const fetchGuide = async () => {
        try {
            const name = place.properties.name;
            const address = place.properties.formatted || "";
            
            if (!name) {
                if (isMounted) setError("Place name not available.");
                return;
            }

            const result = await generateSpotGuide(name, address);
            if (isMounted) {
                if (result) {
                    setData(result);
                } else {
                    setError("Unable to generate guide for this location.");
                }
            }
        } catch (e) {
            if (isMounted) setError("AI Service unavailable.");
        } finally {
            if (isMounted) setLoading(false);
        }
      };
      
      fetchGuide();
    } else {
        setData(null);
        setError(null);
        setLoading(false);
    }

    return () => { isMounted = false; };
  }, [place]);

  if (!place) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                <MapPin size={40} className="text-green-400 animate-bounce" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Select a Location</h2>
             <p className="text-gray-400 max-w-sm">
                Tap any marker on the map below to unlock its history and secrets with AI.
             </p>
          </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="max-w-4xl mx-auto">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-10">
                {/* Premium Loader Animation */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full animate-pulse"></div>
                    
                    {/* Outer Rotating Ring (Green) */}
                    <div className="absolute inset-0 border-[3px] border-transparent border-t-green-500/80 border-r-green-500/30 rounded-full animate-spin"></div>
                    
                    {/* Inner Rotating Ring (White/Green, Reverse) */}
                    <div className="absolute inset-3 border-[2px] border-transparent border-b-white/50 border-l-green-400/50 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    
                    {/* Center Breathing Orb */}
                    <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-ping"></div>
                    <div className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,1)] animate-pulse"></div>
                </div>

                <div className="text-center space-y-3 relative z-10">
                    <h3 className="text-white text-2xl font-bold tracking-tight drop-shadow-lg animate-in fade-in duration-700">
                        Analyzing History...
                    </h3>
                    
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] md:text-xs font-mono font-medium text-blue-400/60 uppercase tracking-[0.15em]">
                         <span className="animate-pulse">CONSULTING ARCHIVES</span>
                         <span className="text-green-500/30">•</span>
                         <span className="animate-pulse delay-150">VERIFYING BUILDERS</span>
                         <span className="text-green-500/30">•</span>
                         <span className="animate-pulse delay-300">SUMMARIZING</span>
                    </div>
                </div>
             </div>
          ) : error ? (
             <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-4 text-red-200 mt-4">
                <AlertCircle size={24} className="shrink-0" />
                <p>{error}</p>
             </div>
          ) : data ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Summary Card - Full Width */}
                <div className="md:col-span-2 bg-[#111] border border-green-500/30 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                   <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <img src={LOGO_URL} alt="Background Logo" className="w-32 h-32 object-contain" />
                   </div>
                   <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                   <h3 className="text-green-400 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <img src={LOGO_URL} alt="Icon" className="w-4 h-4 object-contain brightness-0 invert opacity-80" /> 
                      Overview
                   </h3>
                   <p className="text-white text-lg leading-relaxed font-light">
                      {data.summary}
                   </p>
                </div>

                {/* History */}
                <div className="bg-black/40 border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-colors backdrop-blur-sm">
                   <div className="flex items-center gap-3 mb-3 text-purple-400">
                      <div className="p-1.5 bg-purple-500/10 rounded-lg">
                        <History size={16} />
                      </div>
                      <h3 className="font-bold uppercase tracking-wider text-xs">History</h3>
                   </div>
                   <p className="text-gray-300 text-sm leading-relaxed">
                      {data.history}
                   </p>
                </div>

                {/* Builder & Purpose Grouped */}
                <div className="space-y-6">
                    <div className="bg-black/40 border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-colors backdrop-blur-sm">
                       <div className="flex items-center gap-3 mb-3 text-blue-400">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Hammer size={16} />
                          </div>
                          <h3 className="font-bold uppercase tracking-wider text-xs">Architect / Builder</h3>
                       </div>
                       <p className="text-gray-300 text-sm leading-relaxed">
                          {data.builder}
                       </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-colors backdrop-blur-sm">
                       <div className="flex items-center gap-3 mb-3 text-orange-400">
                          <div className="p-1.5 bg-orange-500/10 rounded-lg">
                            <Target size={16} />
                          </div>
                          <h3 className="font-bold uppercase tracking-wider text-xs">Purpose</h3>
                       </div>
                       <p className="text-gray-300 text-sm leading-relaxed">
                          {data.purpose}
                       </p>
                    </div>
                </div>
                
                {/* Fun Fact - Full Width */}
                 <div className="md:col-span-2 bg-gradient-to-r from-yellow-900/10 to-transparent border border-yellow-500/20 p-5 rounded-2xl flex items-start gap-4 hover:bg-yellow-900/10 transition-colors">
                    <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500 shrink-0 mt-1 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="text-yellow-500 font-bold uppercase tracking-wider text-xs mb-1">Did You Know?</h3>
                        <p className="text-gray-300 text-sm italic">
                            "{data.fun_fact}"
                        </p>
                    </div>
                 </div>

             </div>
          ) : null}
       </div>
    </div>
  );
};

export default SpotGuide;
