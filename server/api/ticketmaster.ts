import axios from 'axios';
import { Event, InsertEvent } from '../../shared/schema';
import { storage } from '../storage';

// Ticketmaster API client for fetching local events
export interface TicketmasterEvent {
  id: string;
  name: string;
  description?: string;
  url: string;
  dates: {
    start: {
      dateTime: string;
      localDate: string;
      localTime: string;
    };
    end?: {
      dateTime: string;
      localDate: string;
      localTime: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name: string;
      address?: {
        line1: string;
      };
      city: {
        name: string;
      };
      state: {
        name: string;
        stateCode: string;
      };
      postalCode: string;
    }>;
  };
  classifications?: Array<{
    segment: {
      name: string;
    };
    genre: {
      name: string;
    };
    subGenre: {
      name: string;
    };
  }>;
  images?: Array<{
    url: string;
    ratio: string;
    width: number;
    height: number;
  }>;
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Convert Ticketmaster event to our application's Event model
function convertToAppEvent(tmEvent: TicketmasterEvent): InsertEvent {
  // Find or create organizer
  // For simplicity, we're using a default user ID (1) as the organizer
  const organizerId = 1;
  
  // Create event start and end times
  const startTime = new Date(tmEvent.dates.start.dateTime || `${tmEvent.dates.start.localDate}T${tmEvent.dates.start.localTime || '19:00:00'}`);
  
  // Set end time to 3 hours after start if not provided
  const endTime = tmEvent.dates.end?.dateTime 
    ? new Date(tmEvent.dates.end.dateTime) 
    : new Date(startTime.getTime() + 3 * 60 * 60 * 1000);
  
  // Get venue information
  const venue = tmEvent._embedded?.venues?.[0];
  const location = venue 
    ? `${venue.name}, ${venue.address?.line1 || ''}, ${venue.city?.name}, ${venue.state?.stateCode}` 
    : 'Location TBD';
  
  return {
    name: tmEvent.name,
    description: tmEvent.description || `${tmEvent.name} - Ticketmaster Event`,
    location,
    startTime,
    endTime,
    organizerId,
    featured: false,
    externalId: `ticketmaster_${tmEvent.id}`,
    externalUrl: tmEvent.url,
    source: 'ticketmaster'
  };
}

export async function fetchLocalEvents(city: string = 'State College', stateCode: string = 'PA'): Promise<Event[]> {
  try {
    // Ticketmaster API endpoint for events
    const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
    
    // Make the API call - using public API (limited rate)
    const response = await axios.get<TicketmasterResponse>(url, {
      params: {
        city: city,
        stateCode: stateCode,
        size: 20,
        apikey: 'pLOeuGq2JL05uEGrZG7DuGWu6sh2OnMz', // Public API key for demo purposes
      },
    });
    
    // Process the response
    const tmEvents = response.data._embedded?.events || [];
    
    // Convert Ticketmaster events to our app's event model
    const localEvents = await Promise.all(tmEvents.map(async (tmEvent) => {
      const appEvent = convertToAppEvent(tmEvent);
      
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
    console.error('Error fetching Ticketmaster events:', error);
    return [];
  }
}