import { Event } from '../../shared/schema';
import { fetchLocalEvents as fetchSeatGeekEvents } from './seatgeek';
import { fetchLocalEvents as fetchTicketmasterEvents } from './ticketmaster';
import { getSampleEvents } from './sampleEvents';

/**
 * Fetch events from all available sources and combine them
 */
export async function fetchAllLocalEvents(
  city: string = 'State College',
  state: string = 'PA'
): Promise<Event[]> {
  console.log(`Fetching local events for ${city}, ${state}...`);
  
  // Create a wrapped promise that handles errors for each API
  const safePromise = async (promise: Promise<Event[]>, source: string): Promise<Event[]> => {
    try {
      const result = await promise;
      console.log(`✓ Successfully fetched ${result.length} events from ${source}`);
      return result;
    } catch (error) {
      console.error(`✗ Error fetching events from ${source}:`, error);
      return []; // Return empty array on error so other sources can still work
    }
  };
  
  try {
    // Fetch events from multiple sources in parallel with error handling
    const [seatGeekEvents, ticketmasterEvents] = await Promise.all([
      safePromise(fetchSeatGeekEvents(city, state), 'SeatGeek'),
      safePromise(fetchTicketmasterEvents(city, state), 'Ticketmaster')
    ]);
    
    // Combine the events from different sources
    let allEvents = [...seatGeekEvents, ...ticketmasterEvents];
    
    // If no events were found from external APIs, use sample data
    if (allEvents.length === 0) {
      console.log(`No events found from external APIs, using sample data for ${city}, ${state}`);
      const sampleEvents = getSampleEvents(city, state);
      allEvents = [...sampleEvents];
      console.log(`Added ${sampleEvents.length} sample events`);
    }
    
    console.log(`Total combined events: ${allEvents.length}`);
    
    // Sort events by date
    return allEvents.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  } catch (error) {
    console.error('Error fetching local events:', error);
    // Return sample data as a fallback
    const sampleEvents = getSampleEvents(city, state);
    return sampleEvents;
  }
}

/**
 * Get the most appropriate category based on the event name or description
 */
export function suggestCategoryForEvent(event: Event): string {
  // Handle the case where name or description might be null or undefined
  const title = (event.name || '').toLowerCase();
  const description = (event.description || '').toLowerCase();
  
  // Simple keyword matching for demonstration purposes
  if (
    title.includes('concert') || 
    title.includes('music') || 
    title.includes('festival') ||
    title.includes('band') ||
    description.includes('band') ||
    description.includes('music')
  ) {
    return 'Music';
  } else if (
    title.includes('game') || 
    title.includes('vs') || 
    title.includes('match') ||
    title.includes('sports') ||
    title.includes('football') ||
    title.includes('basketball') ||
    title.includes('baseball') ||
    title.includes('hockey') ||
    description.includes('team') ||
    description.includes('sport')
  ) {
    return 'Sports';
  } else if (
    title.includes('lecture') || 
    title.includes('seminar') || 
    title.includes('workshop') ||
    title.includes('class') ||
    title.includes('education') ||
    description.includes('learn') ||
    description.includes('education')
  ) {
    return 'Academic';
  } else if (
    title.includes('party') || 
    title.includes('social') || 
    title.includes('mixer') ||
    title.includes('networking') ||
    description.includes('social') ||
    description.includes('networking')
  ) {
    return 'Social';
  } else if (
    title.includes('volunteer') || 
    title.includes('charity') || 
    title.includes('drive') ||
    title.includes('community') ||
    description.includes('volunteer') ||
    description.includes('community')
  ) {
    return 'Community Service';
  } else if (
    title.includes('theater') || 
    title.includes('theatre') ||
    title.includes('show') || 
    title.includes('performance') ||
    title.includes('play') ||
    title.includes('art') ||
    title.includes('exhibit') ||
    description.includes('performance') ||
    description.includes('art')
  ) {
    return 'Arts & Culture';
  } else {
    // Default category if no match is found
    return 'Other';
  }
}