
export interface WeatherInfo {
  currentTemp: number;
  todayCode: number;
  tomorrowCode: number;
  tomorrowTemp: number;
}

// Simple in-memory cache: "lat,lon" -> WeatherInfo
const weatherCache = new Map<string, WeatherInfo>();

export const getWeather = async (lat: number, lon: number): Promise<WeatherInfo | null> => {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  
  if (weatherCache.has(key)) {
    return weatherCache.get(key)!;
  }

  try {
    // Fetch current weather and daily weathercode + max temp (for today & tomorrow)
    // daily=weathercode,temperature_2m_max returns arrays. Index 0 is today, Index 1 is tomorrow.
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max&timezone=auto`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    
    const data = await res.json();
    
    const result: WeatherInfo = {
      currentTemp: data.current_weather.temperature,
      todayCode: data.daily.weathercode[0],
      tomorrowCode: data.daily.weathercode[1],
      tomorrowTemp: data.daily.temperature_2m_max[1] // Index 1 is tomorrow
    };

    weatherCache.set(key, result);
    return result;
  } catch (e) {
    console.warn("Open-Meteo Error:", e);
    return null;
  }
};
