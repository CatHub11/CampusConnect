import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Event, Category } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import CategoryTag from './category-tag';

interface LocalEventsProps {
  limit?: number;
}

const LocalEvents = ({ limit = 5 }: LocalEventsProps) => {
  const { toast } = useToast();
  const [city, setCity] = useState("State College");
  const [state, setState] = useState("PA");

  // Query for local events
  const { 
    data: localEvents, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Event[]>({ 
    queryKey: ['/api/events/local', city, state],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/events/local?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch local events');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching local events:', error);
        toast({
          title: "Error",
          description: "Failed to load local events. Please try again later.",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Query for categories to map them to events
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Don't need these here anymore as the EventCard has its own formatting functions

  // Handle search button click
  const handleSearch = () => {
    refetch();
  };

  // Get categories for an event
  const getEventCategories = (eventId: number) => {
    if (!categories) return [];
    
    const event = localEvents?.find(e => e.id === eventId);
    if (!event) return [];
    
    // This is a simplification as we don't have direct access to event categories
    // In a real implementation, you'd query event categories or include them in the response
    return categories.filter(c => 
      c.name === 'Music' && event.name.toLowerCase().includes('concert') ||
      c.name === 'Sports' && event.name.toLowerCase().includes('game') ||
      c.name === 'Academic' && event.name.toLowerCase().includes('lecture')
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Local Events</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="w-24">
            <Input
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              maxLength={2}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {isLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : isError ? (
            // Error state
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load events. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-2">Retry</Button>
            </div>
          ) : localEvents && localEvents.length > 0 ? (
            // Successfully loaded events
            localEvents
              .filter(event => new Date(event.startTime) > new Date())
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, limit)
              .map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  categories={categories}
                />
              ))
          ) : (
            // No events found
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming events found for this location.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {isLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : isError ? (
            // Error state
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load events. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-2">Retry</Button>
            </div>
          ) : localEvents && localEvents.length > 0 ? (
            // Successfully loaded events
            localEvents
              .slice(0, limit)
              .map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  categories={categories}
                />
              ))
          ) : (
            // No events found
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events found for this location.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Event Card component for local events
interface EventCardProps {
  event: Event;
  categories?: Category[];
}

const EventCard = ({ event, categories }: EventCardProps) => {
  // Format event date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Format event time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{event.name}</h3>
            
            {event.externalUrl && (
              <a 
                href={event.externalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          
          {event.source && (
            <Badge variant="outline" className="text-xs self-start mb-2">
              {event.source === 'seatgeek' ? 'SeatGeek' : 
               event.source === 'ticketmaster' ? 'Ticketmaster' : 
               event.source}
            </Badge>
          )}
          
          <div className="space-y-2 mb-3">
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mr-2 text-gray-500 mt-1" />
              <span className="text-sm">
                {formatDate(event.startTime)} · {formatTime(event.startTime)}
              </span>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-1" />
              <span className="text-sm line-clamp-1">{event.location}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {event.description}
          </p>
          
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {categories
                .filter(category => { 
                  // This is just a simple implementation for demonstration
                  // In a real app, you'd map events to their actual categories
                  const eventCategories = [{name: 'Local Event', color: '#9C27B0'}];
                  
                  if (event.name.toLowerCase().includes('concert') || 
                      event.name.toLowerCase().includes('music')) {
                    eventCategories.push({name: 'Music', color: '#2196F3'});
                  } else if (event.name.toLowerCase().includes('game') || 
                             event.name.toLowerCase().includes('sports')) {
                    eventCategories.push({name: 'Sports', color: '#4CAF50'});
                  } else if (event.name.toLowerCase().includes('lecture') || 
                             event.name.toLowerCase().includes('class')) {
                    eventCategories.push({name: 'Academic', color: '#FF9800'});
                  }
                  
                  return eventCategories.some(ec => ec.name === category.name);
                })
                .map((category) => (
                  <CategoryTag
                    key={category.id}
                    category={category}
                    className="text-xs"
                  />
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalEvents;