/**
 * Weather utility functions for travel planning
 * Handles date calculations and weather logic
 */

/**
 * Calculate the number of days between today and a given date
 */
export function getDaysDifference(targetDate: string | Date): number {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get the month name from a date
 */
export function getMonthName(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[d.getMonth()];
}

/**
 * Determine if we should use real weather or climate estimate
 */
export function shouldUseRealWeather(daysUntilTravel: number): boolean {
  return daysUntilTravel <= 7 && daysUntilTravel >= 0;
}

/**
 * Map weather API codes to human-readable conditions
 */
export function mapWeatherCondition(
  weatherCode: number | string,
  source: "openweather" | "weatherapi" = "openweather"
): { condition: string; icon: string } {
  if (source === "openweather") {
    // OpenWeatherMap API codes
    const codeMap: Record<number, { condition: string; icon: string }> = {
      // Clear
      800: { condition: "Clear", icon: "☀️" },
      801: { condition: "Mostly Clear", icon: "🌤️" },
      802: { condition: "Partly Cloudy", icon: "⛅" },
      803: { condition: "Mostly Cloudy", icon: "☁️" },
      804: { condition: "Cloudy", icon: "☁️" },
      // Rain
      500: { condition: "Light Rain", icon: "🌧️" },
      501: { condition: "Moderate Rain", icon: "🌧️" },
      502: { condition: "Heavy Rain", icon: "⛈️" },
      503: { condition: "Very Heavy Rain", icon: "⛈️" },
      504: { condition: "Extreme Rain", icon: "⛈️" },
      511: { condition: "Freezing Rain", icon: "🧊" },
      // Drizzle
      300: { condition: "Light Drizzle", icon: "🌦️" },
      301: { condition: "Drizzle", icon: "🌦️" },
      302: { condition: "Heavy Drizzle", icon: "🌧️" },
      // Thunderstorm
      200: { condition: "Thunderstorm", icon: "⛈️" },
      201: { condition: "Thunderstorm with Rain", icon: "⛈️" },
      202: { condition: "Heavy Thunderstorm", icon: "⛈️" },
      // Snow
      600: { condition: "Light Snow", icon: "❄️" },
      601: { condition: "Snow", icon: "❄️" },
      602: { condition: "Heavy Snow", icon: "❄️" },
      611: { condition: "Sleet", icon: "🌨️" },
      // Mist
      701: { condition: "Mist", icon: "🌫️" },
      711: { condition: "Smoke", icon: "🌫️" },
      721: { condition: "Haze", icon: "🌫️" },
      731: { condition: "Dust", icon: "🌫️" },
      741: { condition: "Fog", icon: "🌫️" },
      751: { condition: "Sand", icon: "🌫️" },
      761: { condition: "Dust", icon: "🌫️" },
      762: { condition: "Volcanic Ash", icon: "🌫️" },
      771: { condition: "Squall", icon: "💨" },
      781: { condition: "Tornado", icon: "🌪️" },
    };

    return codeMap[weatherCode as number] || { condition: "Unknown", icon: "❓" };
  }

  // WeatherAPI codes
  const weatherapiMap: Record<string | number, { condition: string; icon: string }> = {
    1000: { condition: "Clear", icon: "☀️" },
    1003: { condition: "Partly cloudy", icon: "⛅" },
    1006: { condition: "Cloudy", icon: "☁️" },
    1009: { condition: "Overcast", icon: "☁️" },
    1030: { condition: "Mist", icon: "🌫️" },
    1063: { condition: "Partly cloudy with rain", icon: "🌧️" },
    1066: { condition: "Partly cloudy with snow", icon: "❄️" },
    1069: { condition: "Partly cloudy with sleet", icon: "🌨️" },
    1072: { condition: "Partly cloudy with freezing drizzle", icon: "🧊" },
    1087: { condition: "Thundery outbreaks in vicinity", icon: "⛈️" },
    1114: { condition: "Blowing snow", icon: "❄️" },
    1117: { condition: "Blizzard", icon: "❄️" },
    1135: { condition: "Fog", icon: "🌫️" },
    1147: { condition: "Freezing fog", icon: "🌫️" },
    1150: { condition: "Patchy light drizzle", icon: "🌦️" },
    1153: { condition: "Light drizzle", icon: "🌦️" },
    1168: { condition: "Freezing drizzle", icon: "🧊" },
    1171: { condition: "Heavy freezing drizzle", icon: "🧊" },
    1180: { condition: "Patchy light rain", icon: "🌧️" },
    1183: { condition: "Light rain", icon: "🌧️" },
    1186: { condition: "Moderate rain at times", icon: "🌧️" },
    1189: { condition: "Moderate rain", icon: "🌧️" },
    1192: { condition: "Heavy rain at times", icon: "⛈️" },
    1195: { condition: "Heavy rain", icon: "⛈️" },
    1198: { condition: "Light freezing rain", icon: "🧊" },
    1201: { condition: "Moderate or heavy freezing rain", icon: "🧊" },
    1204: { condition: "Light sleet", icon: "🌨️" },
    1207: { condition: "Moderate or heavy sleet", icon: "🌨️" },
    1210: { condition: "Patchy light snow", icon: "❄️" },
    1213: { condition: "Light snow", icon: "❄️" },
    1216: { condition: "Patchy moderate snow", icon: "❄️" },
    1219: { condition: "Moderate snow", icon: "❄️" },
    1222: { condition: "Patchy heavy snow", icon: "❄️" },
    1225: { condition: "Heavy snow", icon: "❄️" },
    1237: { condition: "Ice pellets", icon: "🧊" },
    1240: { condition: "Light rain shower", icon: "🌧️" },
    1243: { condition: "Moderate or heavy rain shower", icon: "⛈️" },
    1246: { condition: "Torrential rain shower", icon: "⛈️" },
    1249: { condition: "Light sleet showers", icon: "🌨️" },
    1252: { condition: "Moderate or heavy sleet showers", icon: "🌨️" },
    1255: { condition: "Light snow showers", icon: "❄️" },
    1258: { condition: "Moderate or heavy snow showers", icon: "❄️" },
    1261: { condition: "Light hail showers", icon: "🧊" },
    1264: { condition: "Heavy hail showers", icon: "🧊" },
    1273: { condition: "Patchy light rain with thunder", icon: "⛈️" },
    1276: { condition: "Moderate or heavy rain with thunder", icon: "⛈️" },
    1279: { condition: "Patchy light snow with thunder", icon: "⛈️" },
    1282: { condition: "Moderate or heavy snow with thunder", icon: "⛈️" },
  };

  return weatherapiMap[weatherCode] || { condition: "Unknown", icon: "❓" };
}
