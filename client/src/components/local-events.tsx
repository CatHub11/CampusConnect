import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, MapPinIcon, ExternalLinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';

// Include our additional property for categories
interface LocalEvent extends Event {
  __suggestedCategory?: {
    id: number;
    name: string;
    color: string;
    isDefault: boolean;
    createdBy: number | null;
  };
}

interface LocalEventsProps {
  limit?: number;
}

const LocalEvents = ({ limit }: LocalEventsProps) => {
  const [city, setCity] = useState('State College');
  const [state, setStateCode] = useState('PA');
  const [searchCity, setSearchCity] = useState('State College');
  const [searchState, setSearchState] = useState('PA');

  // Using the same debounce pattern as before
  const debouncedSearch = debounce((newCity: string, newState: string) => {
    setSearchCity(newCity);
    setSearchState(newState);
  }, 500);

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    debouncedSearch(e.target.value, state);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStateCode(e.target.value);
    debouncedSearch(city, e.target.value);
  };

  // Log the search parameters for debugging
  useEffect(() => {
    console.log(`Fetching events for ${searchCity}, ${searchState}`);
  }, [searchCity, searchState]);

  const {
    data: events,
    isLoading,
    error
  } = useQuery<LocalEvent[]>({
    queryKey: ['/api/events/local-events', searchCity, searchState],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchCity) params.append('city', searchCity);
      if (searchState) params.append('state', searchState);
      
      const response = await fetch(`/api/events/local-events?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch local events');
      }
      const data = await response.json();
      console.log('Local events data:', data);
      return data;
    },
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return format(date, 'p');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Local Area Events</h2>
          <p className="text-gray-500">Discover what's happening in the area</p>
        </div>
        <div className="flex gap-4 items-center mt-4 md:mt-0">
          <div className="flex-1">
            <Input
              placeholder="City"
              value={city}
              onChange={handleCityChange}
              className="w-full"
            />
          </div>
          <div className="w-24">
            <Input
              placeholder="State"
              value={state}
              onChange={handleStateChange}
              maxLength={2}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-6 w-4/5" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Error</h3>
          <p>Failed to load local events. Please try again later.</p>
        </div>
      ) : !events || events.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 text-center rounded-lg">
          <h3 className="text-xl font-medium mb-2">No events found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try searching for a different city or state.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(limit ? events.slice(0, limit) : events).map((event) => (
            <Card key={event.id} className="overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                {event.__suggestedCategory && (
                  <Badge 
                    style={{ backgroundColor: event.__suggestedCategory.color, color: '#fff' }}
                    className="self-start mb-2"
                  >
                    {event.__suggestedCategory.name}
                  </Badge>
                )}
                <CardTitle className="text-lg">{event.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{event.location}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {event.description || 'No description available'}
                </p>
                <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(event.startTime)} at {formatTime(event.startTime)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                {event.externalUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <span>View Details</span>
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/events/${event.id}`}>View Details</a>
                  </Button>
                )}
                <Badge variant="outline" className="ml-2">
                  {event.source || 'Local'}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalEvents;