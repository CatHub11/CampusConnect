import axios from 'axios';
import { Event, InsertEvent } from '../../shared/schema';
import { storage } from '../storage';

// SeatGeek API client for fetching local events
export interface SeatGeekEvent {
  id: number;
  title: string;
  description: string;
  url: string;
  datetime_local: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    location: {
      lat: number;
      lon: number;
    }
  };
  performers: Array<{
    name: string;
    image: string;
  }>;
  type: string;
}

interface SeatGeekEventsResponse {
  events: SeatGeekEvent[];
  meta: {
    total: number;
    took: number;
    page: number;
    per_page: number;
  }
}

// Convert SeatGeek event to our application's Event model
function convertToAppEvent(seatGeekEvent: SeatGeekEvent): InsertEvent {
  // Find or create organizer
  // For simplicity, we're using a default user ID (1) as the organizer
  const organizerId = 1;
  
  // Create event start and end times
  // For simplicity, we're setting end time to 2 hours after start time
  const startTime = new Date(seatGeekEvent.datetime_local);
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 2);
  
  return {
    name: seatGeekEvent.title,
    description: seatGeekEvent.description || `${seatGeekEvent.title} at ${seatGeekEvent.venue.name}`,
    location: `${seatGeekEvent.venue.name}, ${seatGeekEvent.venue.address || ''}, ${seatGeekEvent.venue.city}, ${seatGeekEvent.venue.state}`,
    startTime,
    endTime,
    organizerId,
    featured: false,
    externalId: `seatgeek_${seatGeekEvent.id}`,
    externalUrl: seatGeekEvent.url,
    source: 'seatgeek'
  };
}

export async function fetchLocalEvents(city: string = 'State College', state: string = 'PA'): Promise<Event[]> {
  try {
    // SeatGeek API endpoint for events
    const url = 'https://api.seatgeek.com/2/events';
    
    // Make the API call - SeatGeek allows access without a client ID for development/low usage
    const response = await axios.get<SeatGeekEventsResponse>(url, {
      params: {
        'venue.city': city,
        'venue.state': state,
        per_page: 25,
      },
    });
    
    // Process the response
    const seatGeekEvents = response.data.events;
    
    // Convert SeatGeek events to our app's event model
    const localEvents = await Promise.all(seatGeekEvents.map(async (seatGeekEvent) => {
      const appEvent = convertToAppEvent(seatGeekEvent);
      
      // Check if this event is already in our storage (by externalId)
      const existingEvents = await storage.getAllEvents();
      const existingEvent = existingEvents.find(e => e.externalId === appEvent.externalId);
      
      if (existingEvent) {
        return existingEvent;
      }
      
      // If not, save it to our storage
      return storage.createEvent(appEvent);
    }));
    
    return localEvents;
  } catch (error) {
    console.error('Error fetching SeatGeek events:', error);
    return [];
  }
}