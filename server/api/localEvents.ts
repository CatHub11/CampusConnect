import { Event } from '../../shared/schema';
import { fetchLocalEvents as fetchSeatGeekEvents } from './seatgeek';
import { fetchLocalEvents as fetchTicketmasterEvents } from './ticketmaster';

// Merge local events from multiple sources
export async function fetchAllLocalEvents(
  city: string = 'State College',
  state: string = 'PA'
): Promise<Event[]> {
  try {
    // Fetch events from multiple sources in parallel
    const [seatGeekEvents, ticketmasterEvents] = await Promise.all([
      fetchSeatGeekEvents(city, state),
      fetchTicketmasterEvents(city, state)
    ]);
    
    // Combine the events from different sources
    return [...seatGeekEvents, ...ticketmasterEvents];
  } catch (error) {
    console.error('Error fetching local events:', error);
    return [];
  }
}

// Get the category based on the event name or description
export function suggestCategoryForEvent(event: Event): string {
  const title = event.name.toLowerCase();
  const description = event.description.toLowerCase();
  
  // Simple keyword matching for demonstration purposes
  if (
    title.includes('concert') || 
    title.includes('music') || 
    description.includes('band') ||
    description.includes('music')
  ) {
    return 'Music';
  } else if (
    title.includes('game') || 
    title.includes('vs') || 
    title.includes('match') ||
    description.includes('team') ||
    description.includes('sport')
  ) {
    return 'Sports';
  } else if (
    title.includes('lecture') || 
    title.includes('seminar') || 
    title.includes('workshop') ||
    description.includes('learn') ||
    description.includes('education')
  ) {
    return 'Academic';
  } else if (
    title.includes('party') || 
    title.includes('social') || 
    title.includes('mixer') ||
    description.includes('social') ||
    description.includes('networking')
  ) {
    return 'Social';
  } else if (
    title.includes('volunteer') || 
    title.includes('charity') || 
    title.includes('drive') ||
    description.includes('volunteer') ||
    description.includes('community')
  ) {
    return 'Community Service';
  } else if (
    title.includes('theater') || 
    title.includes('show') || 
    title.includes('performance') ||
    description.includes('performance') ||
    description.includes('art')
  ) {
    return 'Arts & Culture';
  } else {
    return 'Other';
  }
}