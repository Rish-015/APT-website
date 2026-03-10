import axios from 'axios';

// API documentation: https://open-meteo.com/en/docs
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
    current: {
        temperature: number;
        conditionCode: number;
        humidity: number;
        windSpeed: number;
        isDay: boolean;
    };
    hourly: {
        time: string[];
        temperature: number[];
        humidity: number[];
    };
    daily: {
        time: string[];
        temperatureMax: number[];
        temperatureMin: number[];
        weatherCode: number[];
        rainSum: number[];
        sunrise: string[];
        sunset: string[];
    };
}

export async function fetchWeatherData(lat: number = 13.0827, lon: number = 80.2707): Promise<WeatherData | null> {
    try {
        const params = new URLSearchParams({
            latitude: lat.toString(),
            longitude: lon.toString(),
            hourly: 'temperature_2m,relative_humidity_2m',
            daily: 'weathercode,temperature_2m_max,temperature_2m_min,rain_sum,sunrise,sunset',
            timezone: 'Asia/Kolkata',
            current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day'
        });

        const response = await axios.get(`${BASE_URL}?${params.toString()}`);

        if (response.data && !response.data.error) {
            const data = response.data;

            return {
                current: {
                    temperature: data.current.temperature_2m,
                    conditionCode: data.current.weather_code,
                    humidity: data.current.relative_humidity_2m,
                    windSpeed: data.current.wind_speed_10m,
                    isDay: data.current.is_day === 1,
                },
                hourly: {
                    time: data.hourly.time,
                    temperature: data.hourly.temperature_2m,
                    humidity: data.hourly.relative_humidity_2m,
                },
                daily: {
                    time: data.daily.time,
                    temperatureMax: data.daily.temperature_2m_max,
                    temperatureMin: data.daily.temperature_2m_min,
                    weatherCode: data.daily.weathercode,
                    rainSum: data.daily.rain_sum,
                    sunrise: data.daily.sunrise,
                    sunset: data.daily.sunset,
                }
            };
        }

        return null;
    } catch (error) {
        console.error("Error fetching Weather data:", error);
        return null;
    }
}

// Map WMO Weather interpretation codes (https://open-meteo.com/en/docs)
export function getWeatherConditionText(code: number): string {
    if (code === 0) return "Sunny"; // Clear sky
    if (code >= 1 && code <= 3) return "Partly Cloudy"; // Mainly clear, partly cloudy, and overcast
    if (code >= 45 && code <= 48) return "Foggy"; // Fog and depositing rime fog
    if (code >= 51 && code <= 55) return "Drizzle"; // Drizzle: Light, moderate, and dense intensity
    if (code >= 56 && code <= 57) return "Freezing Drizzle"; // Freezing Drizzle: Light and dense intensity
    if (code >= 61 && code <= 65) return "Rainy"; // Rain: Slight, moderate and heavy intensity
    if (code >= 66 && code <= 67) return "Freezing Rain"; // Freezing Rain: Light and heavy intensity
    if (code >= 71 && code <= 75) return "Snow"; // Snow fall: Slight, moderate, and heavy intensity
    if (code === 77) return "Snow"; // Snow grains
    if (code >= 80 && code <= 82) return "Heavy Rain"; // Rain showers: Slight, moderate, and violent
    if (code >= 85 && code <= 86) return "Snow Showers"; // Snow showers slight and heavy
    if (code >= 95 && code <= 99) return "Thunderstorm"; // Thunderstorm: Slight or moderate, with hail

    return "Unknown";
}
