export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  relatedTopic: string;
  funFact: string;
}
export interface Coordinates { lat: number; lng: number; }
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: "Sightseeing" | "Food" | "Culture" | "Adventure";
  relatedQuizTopic?: string;
  nearbyInterest?: string;
  nearbyInterestDescription?: string;
  distanceText?: string;
  travelTimeText?: string;
  coordinates?: Coordinates;
  googleMapsLink?: string;
  generatedImageUrl?: string;
}
export interface ItineraryItem extends Suggestion {
  notes?: string;
  completed?: boolean;
}
export interface SavedTrip {
  id: string;
  city: string;
  hotelLocation?: string;
  items: ItineraryItem[];
  tripNotes?: string;
  createdAt: number;
}
export interface DraftTrip {
  city: string;
  hotelLocation?: string;
  items: ItineraryItem[];
  tripNotes?: string;
  updatedAt: number;
}
export interface User {
  name: string;
  email: string;
}
export enum AppView {
  HOME = "HOME",
  LOGIN = "LOGIN",
  LOADING_QUIZ = "LOADING_QUIZ",
  QUIZ = "QUIZ",
  LOADING_SUGGESTIONS = "LOADING_SUGGESTIONS",
  SUGGESTIONS = "SUGGESTIONS",
  ITINERARY = "ITINERARY",
  PROFILE = "PROFILE",
}
