/**
 * Centralized fallback data for the trip planner
 * Used when API calls fail or data is unavailable
 */

export const FALLBACK_WEATHER = {
  type: "climate",
  temperature: "15-25°C",
  condition: "Comfortable",
  icon: "🌍",
  description: "Typical pleasant weather for travel",
};

export const FALLBACK_HOTEL = {
  name: "Recommended Hotel",
  rating: 4.5,
  location: "City Center",
  category: "Mid-range accommodation",
  price_level: "$$$",
  image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
};

export const FALLBACK_HOTELS = [FALLBACK_HOTEL];

export const FALLBACK_RESTAURANT = {
  name: "Local Restaurant",
  rating: 4.5,
  cuisine: "Local",
  location: "Downtown",
  category: "Casual Dining",
  image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
};

export const FALLBACK_RESTAURANTS = [FALLBACK_RESTAURANT];

export const FALLBACK_ACTIVITY = {
  title: "Explore Local Culture",
  description: "Discover the unique attractions and heritage of this destination",
  duration: "Full day",
};

export const FALLBACK_ACTIVITIES = [FALLBACK_ACTIVITY];

export const FALLBACK_DESTINATION_SUMMARY = "This is a wonderful destination with rich culture, beautiful landscapes, and diverse activities for travelers. Enjoy local cuisine, explore historic sites, and create unforgettable memories.";

export const FALLBACK_NEGATIVES = [
  "Tourist crowds during peak seasons",
  "Language barriers in some areas",
];
