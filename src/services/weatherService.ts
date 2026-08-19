// Real-time Weather Service using Open-Meteo API (No API Key Required)

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  condition: string;
  icon: string;
  city: string;
  isDay: boolean;
  rainChance: number;
  tip: string;
  humidity: number;
  windSpeed: number;
}

const WEATHER_CACHE_KEY = 'snapsched_weather_cache';
const LOCATION_CACHE_KEY = 'snapsched_location_cache';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Map WMO weather codes to human labels & icons
function parseWmoCode(code: number, isDay: boolean): { condition: string; icon: string; tip: string } {
  switch (code) {
    case 0:
      return {
        condition: isDay ? 'Clear Sky' : 'Clear Night',
        icon: isDay ? '☀️' : '🌙',
        tip: isDay ? 'Great weather for your commute!' : 'Clear night sky.',
      };
    case 1:
    case 2:
      return {
        condition: isDay ? 'Partly Cloudy' : 'Partly Cloudy',
        icon: isDay ? '⛅' : '☁️',
        tip: 'Mild weather today.',
      };
    case 3:
      return {
        condition: 'Overcast',
        icon: '☁️',
        tip: 'Cloudy today — good day to study indoors.',
      };
    case 45:
    case 48:
      return {
        condition: 'Foggy / Hazy',
        icon: '🌫️',
        tip: 'Low visibility on the road.',
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: 'Light Drizzle',
        icon: '🌦️',
        tip: 'Bring a light jacket or umbrella!',
      };
    case 61:
    case 63:
    case 65:
      return {
        condition: 'Rainy',
        icon: '🌧️',
        tip: 'Rain expected — don’t forget your umbrella ☔',
      };
    case 80:
    case 81:
    case 82:
      return {
        condition: 'Rain Showers',
        icon: '🌧️',
        tip: 'Sudden rain showers possible today ☔',
      };
    case 95:
    case 96:
    case 99:
      return {
        condition: 'Thunderstorm',
        icon: '⛈️',
        tip: 'Stay safe indoors if heavy rain starts ⚡',
      };
    default:
      return {
        condition: 'Fair Weather',
        icon: isDay ? '🌤️' : '🌙',
        tip: 'Have a great day ahead!',
      };
  }
}

export async function fetchCityName(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || 'Your City';
  } catch {
    return 'Current Location';
  }
}

export async function fetchRealtimeWeather(lat: number, lon: number): Promise<WeatherData> {
  // Check local cache
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION_MS && parsed.data) {
        return parsed.data;
      }
    }
  } catch {
    // Ignore cache error
  }

  // Fetch live weather from Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&timezone=auto`;

  const [weatherRes, city] = await Promise.all([
    fetch(url),
    fetchCityName(lat, lon),
  ]);

  if (!weatherRes.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await weatherRes.json();
  const current = data.current;
  const isDay = current.is_day === 1;
  const wmo = parseWmoCode(current.weather_code, isDay);

  const rainChance =
    data.hourly?.precipitation_probability && data.hourly.precipitation_probability.length > 0
      ? data.hourly.precipitation_probability[0]
      : current.precipitation > 0 ? 80 : 0;

  const weatherData: WeatherData = {
    temperature: Math.round(current.temperature_2m),
    apparentTemperature: Math.round(current.apparent_temperature),
    weatherCode: current.weather_code,
    condition: wmo.condition,
    icon: wmo.icon,
    city,
    isDay,
    rainChance,
    tip: rainChance > 40 ? 'High chance of rain — bring an umbrella ☔' : wmo.tip,
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
  };

  // Save to cache
  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: weatherData })
    );
  } catch {
    // Ignore cache error
  }

  return weatherData;
}
