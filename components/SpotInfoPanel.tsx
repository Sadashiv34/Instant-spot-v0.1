import React, { useState, useEffect } from 'react';
import { X, CloudRain, CloudLightning, Image as ImageIcon, Sun, Cloud, CloudSnow, CloudFog } from 'lucide-react';
import { GeoapifyPlace, Tab } from '../types';
import { getWikiPhoto, WikiPhoto } from '../services/wikiService';
import { getWeather, WeatherInfo } from '../services/weatherService';

interface SpotInfoPanelProps {
  place: GeoapifyPlace | null;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  activeTab: Tab;
}

const SpotInfoPanel: React.FC<SpotInfoPanelProps> = ({ place, onClose, userLocation, activeTab }) => {
  const [wikiPhoto, setWikiPhoto] = useState<WikiPhoto | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  
  // State to control animation phases
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle instant closing
  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onClose(); // Unmount immediately, removing exit animation
  };

  // Reset data when place changes
  useEffect(() => {
    let isMounted = true;

    if (place) {
        setWikiPhoto(null);
        setWeather(null);
        
        const props = place.properties;

        // 1. Fetch Photo from Wikimedia
        const fetchPhoto = async () => {
            if (!isMounted) return;
            setIsLoadingPhoto(true);
            try {
                const data = await getWikiPhoto(props.name);
                if (isMounted) setWikiPhoto(data);
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setIsLoadingPhoto(false);
            }
        };

        // 2. Fetch Weather
        const fetchWeatherData = async () => {
             if (!isMounted) return;
             const lat = props.lat; 
             const lon = props.lon;
             
             if (lat && lon) {
                 const wData = await getWeather(lat, lon);
                 if (isMounted) setWeather(wData);
             }
        };

        fetchPhoto();
        fetchWeatherData();
    }

    return () => {
      isMounted = false;
    };
  }, [place]);

  if (!place) return null;

  const props = place.properties;
  
  // Calculate distance relative to User Location if available
  const getDistance = () => {
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
        // Haversine Formula
        const R = 6371; // Radius of the earth in km
        const dLat = (props.lat - userLocation.lat) * (Math.PI / 180);
        const dLon = (props.lon - userLocation.lng) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation.lat * (Math.PI / 180)) * Math.cos(props.lat * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return `${d.toFixed(1)} km`;
    }

    // Fallback to API property if user location isn't passed correctly
    if (props.distance) {
        return `${(props.distance / 1000).toFixed(1)} km`;
    }
    return 'N/A'; 
  };
  const distanceStr = getDistance();

  const getWeatherIcon = (code: number, className: string) => {
      if (code === 0) return <Sun className={className} />;
      if (code >= 1 && code <= 3) return <Cloud className={className} />;
      if (code === 45 || code === 48) return <CloudFog className={className} />;
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code === 96 || code === 99) return <CloudRain className={className} />;
      if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <CloudSnow className={className} />;
      if (code >= 95) return <CloudLightning className={className} />;
      return <Sun className={className} />;
  };

  return (
    <div 
      className={`
        w-[70vw] max-w-[280px] origin-bottom 
        transition-all duration-300 
        ${isVisible 
            ? 'opacity-100 scale-100 translate-y-0 ease-[cubic-bezier(0.34,1.56,0.64,1)]' // Gentle bounce (spring effect) on enter
            : 'opacity-0 scale-90 translate-y-8' // Initial state before entrance
        }
      `}
    >
      <div className="bg-black border border-white rounded-[20px] md:rounded-[24px] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative">
        <button 
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 bg-black text-white rounded-full p-1.5 hover:bg-white/20 transition-colors z-20 border border-white cursor-pointer"
        >
          <X size={14} />
        </button>

        <div className="flex flex-col gap-2">
            {/* Always show DETAILS view, main guide content is now in top HUD */}
            <div className="flex gap-2 min-h-[90px]">
                <div className="w-[70px] shrink-0 h-[90px] rounded-[16px] border border-white bg-[#111] flex items-center justify-center relative overflow-hidden group">
                    {isLoadingPhoto ? (
                        <div className="w-full h-full animate-pulse bg-gray-900"></div>
                    ) : (
                        <>
                            {wikiPhoto?.imageUrl ? (
                                <img 
                                    src={wikiPhoto.imageUrl} 
                                    alt={props.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-1 text-center bg-[#111]">
                                     <span className="text-[8px] text-white/40 font-medium leading-tight">
                                        Image Not Available
                                     </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </>
                    )}
                </div>

                <div className="flex-1 flex flex-col min-w-0 pr-6"> 
                    <h2 className="text-[14px] font-bold text-white leading-tight line-clamp-2 mb-1" title={props.name}>
                        {props.name || "Unknown Spot"}
                    </h2>
                    
                    <div className="h-px w-full bg-white/20 my-1"></div>

                        <p className="text-[10px] text-gray-300 line-clamp-3 leading-tight">
                        {props.address_line1 || props.formatted}
                        </p>

                    {/* Weather Info */}
                    <div className="flex items-center justify-between mt-auto">
                        {weather ? (
                            <>
                                <div className="flex flex-col items-center">
                                    {getWeatherIcon(weather.todayCode, "text-white mb-0.5 w-[14px] h-[14px]")}
                                    <span className="text-[9px] font-semibold text-white uppercase">
                                        {weather.currentTemp.toFixed(0)}° Today
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-white/20 mx-2"></div>
                                <div className="flex flex-col items-center">
                                    {getWeatherIcon(weather.tomorrowCode, "text-white mb-0.5 w-[14px] h-[14px]")}
                                    <span className="text-[9px] font-semibold text-white uppercase">
                                        {weather.tomorrowTemp.toFixed(0)}° Tmrw
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-3.5 h-3.5 bg-white/20 rounded-full mb-0.5"></div>
                                    <span className="text-[9px] text-gray-500 uppercase">...</span>
                                </div>
                                <div className="w-px h-4 bg-white/20 mx-2"></div>
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-3.5 h-3.5 bg-white/20 rounded-full mb-0.5"></div>
                                    <span className="text-[9px] text-gray-500 uppercase">...</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative pt-2">
                    <div className="absolute top-0 left-0 right-0 h-px bg-white/20"></div>
                    
                    <div className="flex gap-2 mt-2">
                    <div className="flex-1 border border-white rounded-full py-1.5 px-2 flex items-center justify-center bg-transparent">
                        <span className="text-[10px] font-bold text-white whitespace-nowrap">
                            {distanceStr} away
                        </span>
                    </div>
                    </div>
            </div>
        </div>
      </div>

      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white absolute -bottom-[7px] left-1/2 -translate-x-1/2 filter drop-shadow-lg"></div>
      <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-black absolute -bottom-[6px] left-1/2 -translate-x-1/2"></div>

    </div>
  );
};

export default SpotInfoPanel;