import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  RefreshCw,
  Droplets,
  Wind,
  AlertCircle,
  SunMedium,
  Compass,
} from 'lucide-react';
import { fetchRealtimeWeather, WeatherData } from '../../services/weatherService';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Request location and load weather
  const loadWeather = useCallback((latitude?: number, longitude?: number) => {
    setLoading(true);
    setPermissionDenied(false);

    if (latitude !== undefined && longitude !== undefined) {
      fetchRealtimeWeather(latitude, longitude)
        .then((data) => {
          setWeather(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
      return;
    }

    if (!navigator.geolocation) {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        // Save user location coords for quick fallback
        localStorage.setItem(
          'snapsched_saved_coords',
          JSON.stringify({ lat, lon, timestamp: Date.now() })
        );

        fetchRealtimeWeather(lat, lon)
          .then((data) => {
            setWeather(data);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      },
      (err) => {
        console.warn('Geolocation permission not granted or error:', err.message);
        setPermissionDenied(true);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000 * 60 * 15, // 15 mins
      }
    );
  }, []);

  // Try auto-loading if coords are saved or permission is already granted
  useEffect(() => {
    try {
      const saved = localStorage.getItem('snapsched_saved_coords');
      if (saved) {
        const { lat, lon } = JSON.parse(saved);
        loadWeather(lat, lon);
        return;
      }
    } catch {
      // ignore
    }

    // Check if permission was already granted previously
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          loadWeather();
        }
      });
    }
  }, [loadWeather]);

  const handleRequestLocation = () => {
    setHasPrompted(true);
    loadWeather();
  };

  // State: Not granted yet
  if (!weather && !loading && !permissionDenied) {
    return (
      <div className="p-4 rounded-3xl bg-white shadow-card border border-white/80 select-none space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
            <SunMedium className="w-4 h-4 text-amber-500" />
            <span>Local Weather</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Live</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Enable location to see live temperature & rain alerts for your commute.
        </p>
        <button
          onClick={handleRequestLocation}
          className="w-full py-2 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11.5px] flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-sm active:scale-98"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Enable Live Weather</span>
        </button>
      </div>
    );
  }

  // State: Loading
  if (loading) {
    return (
      <div className="p-4 rounded-3xl bg-white shadow-card border border-white/80 select-none flex items-center justify-center gap-2.5 py-6">
        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
        <span className="text-[12px] text-slate-600 font-medium">Detecting local weather...</span>
      </div>
    );
  }

  // State: Denied or Error
  if (permissionDenied && !weather) {
    return (
      <div className="p-4 rounded-3xl bg-white shadow-card border border-white/80 select-none text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Location Permission Needed</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Please allow location in your browser to view your live local weather.
        </p>
        <button
          onClick={handleRequestLocation}
          className="py-1 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-indigo-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="p-4 rounded-3xl bg-white shadow-card border border-white/80 select-none space-y-2.5 relative group transition-all hover:shadow-md">
      {/* Top Row: Location & Refresh */}
      <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate max-w-[170px]">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">{weather.city}</span>
        </div>

        <button
          onClick={() => loadWeather()}
          title="Refresh live weather"
          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Temperature & Weather Row */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl leading-none">{weather.icon}</span>
          <div>
            <div className="font-black text-[20px] text-slate-900 leading-none">
              {weather.temperature}°C
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              {weather.condition}
            </div>
          </div>
        </div>

        <div className="text-right text-[10.5px] text-slate-400 font-medium space-y-1">
          <div className="flex items-center justify-end gap-1">
            <Droplets className="w-3 h-3 text-blue-500" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Wind className="w-3 h-3 text-slate-400" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {/* Weather Commute Tip Badge */}
      <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100/90 text-[10.5px] font-semibold text-slate-600 flex items-center gap-2">
        <span className="shrink-0 text-sm">💡</span>
        <span className="truncate">{weather.tip}</span>
      </div>
    </div>
  );
};
