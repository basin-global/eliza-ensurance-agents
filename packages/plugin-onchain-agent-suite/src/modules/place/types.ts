// Place types supporting natural language description
export interface PlaceDescription {
  description: string;      // Natural language description of location
}

// Simple place configuration for now
// Future: Add location verification, coordinates, etc.
export interface PlaceConfig {
  location?: string;    // Where agent is based/operates
}