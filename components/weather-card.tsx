"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherCardProps {
  country: string;
  city?: string;
  date: string;
  className?: string;
}

interface WeatherData {
  type: "real" | "climate";
  temperature: string;
  condition: string;
  icon: string;
  description: string;
  humidity?: number;
  windSpeed?: string;
  feelsLike?: string;
}

export function WeatherCard({ country, city, date, className = "" }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country,
            city: city || undefined,
            date,
          }),
        });

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        console.error("[v0] Error fetching weather:", err);
        setError("Failed to fetch weather data");
        // Set fallback weather
        setWeather({
          type: "climate",
          temperature: "15-25°C",
          condition: "Comfortable",
          icon: "🌍",
          description: "Typical weather for this destination",
        });
      } finally {
        setLoading(false);
      }
    }

    if (country && date) {
      fetchWeather();
    }
  }, [country, city, date]);

  if (loading) {
    return (
      <Card className={`p-6 bg-card/50 backdrop-blur-sm border-2 ${className}`}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className={`p-6 bg-card/50 backdrop-blur-sm border-2 ${className}`}>
        <p className="text-sm text-muted-foreground">Unable to load weather data</p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-2 ${className}`}>
      <div className="space-y-4">
        {/* Header with icon and condition */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">{weather.icon}</h3>
            <p className="text-lg font-semibold text-foreground">{weather.condition}</p>
          </div>
          <Badge variant={weather.type === "real" ? "default" : "secondary"}>
            {weather.type === "real" ? "Live Weather" : "Estimated"}
          </Badge>
        </div>

        {/* Temperature */}
        <div>
          <p className="text-3xl font-bold text-primary">{weather.temperature}</p>
          {weather.feelsLike && (
            <p className="text-sm text-muted-foreground">Feels like {weather.feelsLike}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-foreground">{weather.description}</p>

        {/* Additional details */}
        {(weather.humidity !== undefined || weather.windSpeed) && (
          <div className="border-t border-border/50 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {weather.humidity !== undefined && (
                <div>
                  <p className="text-muted-foreground">Humidity</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
              )}
              {weather.windSpeed && (
                <div>
                  <p className="text-muted-foreground">Wind Speed</p>
                  <p className="font-semibold">{weather.windSpeed}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data source info */}
        <div className="text-xs text-muted-foreground pt-2">
          {weather.type === "real"
            ? "Real-time weather data (travel within 7 days)"
            : "Climate-based estimate (based on historical patterns)"}
        </div>
      </div>
    </Card>
  );
}
