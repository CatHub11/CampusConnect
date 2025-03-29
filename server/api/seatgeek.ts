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
    // Note: For better results, you should use a client_id, but for demo purposes we'll use without
    const response = await axios.get<SeatGeekEventsResponse>(url, {
      params: {
        'venue.city': city,
        'venue.state': state,
        per_page: 10,
      },
    });
    
    console.log('SeatGeek API response status:', response.status);
    
    // If there are no events or API response doesn't match expected format, return empty array
    if (!response.data || !response.data.events || !Array.isArray(response.data.events)) {
      console.log('No SeatGeek events found or invalid format');
      return [];
    }
    
    const seatGeekEvents = response.data.events;
    console.log(`Found ${seatGeekEvents.length} SeatGeek events`);
    
    // Instead of saving to database, just return the events directly for this demo
    // This simplifies the implementation and avoids database issues
    const localEvents: Event[] = seatGeekEvents.map(seatGeekEvent => {
      // Convert SeatGeek event to our app's event model format
      const appEvent = convertToAppEvent(seatGeekEvent);
      
      // Add required fields for Event type
      return {
        ...appEvent,
        id: Math.floor(1000000 + Math.random() * 9000000), // Generate a random ID
        createdAt: new Date(),
      } as Event;
    });
    
    return localEvents;
  } catch (error) {
    console.error('Error fetching SeatGeek events:', error);
    return [];
  }
}