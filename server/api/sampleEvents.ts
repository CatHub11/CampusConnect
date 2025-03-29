import { Event } from '../../shared/schema';

/**
 * Sample event data for demonstration purposes
 * Used when external APIs don't return data
 */
export function getSampleEvents(city: string = 'State College', state: string = 'PA'): Event[] {
  // Create a few sample events based on the city and state
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date(now);
  nextMonth.setDate(nextMonth.getDate() + 30);
  
  // Create events with unique IDs in a high range to avoid conflicts
  return [
    {
      id: 2000001,
      name: `${city} Community Festival`,
      description: `Join us for the annual ${city} Community Festival featuring local food, music, and activities for all ages.`,
      location: `Downtown ${city}, ${state}`,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000), // 6 hours later
      createdAt: now,
      organizerId: 1,
      featured: false,
      externalId: null,
      externalUrl: null,
      source: 'sample'
    },
    {
      id: 2000002,
      name: `${city} Farmers Market`,
      description: `Visit the ${city} Farmers Market for fresh local produce, handmade crafts, and delicious prepared foods.`,
      location: `Central Park, ${city}, ${state}`,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      createdAt: now,
      organizerId: 1,
      featured: true,
      externalId: null,
      externalUrl: null,
      source: 'sample'
    },
    {
      id: 2000003,
      name: `${state} State Orchestra Concert`,
      description: `Experience the ${state} State Orchestra performing classical masterpieces at this special evening concert.`,
      location: `${city} Concert Hall, ${state}`,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
      createdAt: now,
      organizerId: 1,
      featured: false,
      externalId: null,
      externalUrl: null,
      source: 'sample'
    },
    {
      id: 2000004,
      name: `${city} Marathon`,
      description: `Join runners from across the region for the annual ${city} Marathon. Routes for all skill levels.`,
      location: `${city} Sports Complex, ${state}`,
      startTime: nextMonth,
      endTime: new Date(nextMonth.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
      createdAt: now,
      organizerId: 1,
      featured: true,
      externalId: null,
      externalUrl: null,
      source: 'sample'
    },
    {
      id: 2000005,
      name: `Tech Conference ${(new Date()).getFullYear()}`,
      description: `The largest technology conference in ${city}. Network with industry professionals and learn about the latest tech trends.`,
      location: `${city} Convention Center, ${state}`,
      startTime: nextMonth,
      endTime: new Date(nextMonth.getTime() + 48 * 60 * 60 * 1000), // 2 days later
      createdAt: now,
      organizerId: 1,
      featured: false,
      externalId: null,
      externalUrl: null,
      source: 'sample'
    }
  ];
}