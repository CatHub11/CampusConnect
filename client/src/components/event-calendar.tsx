import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Event } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, CalendarX, Download } from 'lucide-react';

interface EventCalendarProps {
  userId: number;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({ userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user's calendar events
  const { data: calendarEvents, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/users', userId, 'calendar'],
    queryFn: () => apiRequest(`/api/users/${userId}/calendar`),
    enabled: !!userId,
  });
  
  // Add event to calendar
  const addToCalendarMutation = useMutation({
    mutationFn: ({ eventId }: { eventId: number }) => 
      apiRequest(`/api/events/${eventId}/calendar`, {
        method: 'POST',
        data: { userId }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'calendar'] });
      toast({
        title: 'Event added to calendar',
        description: 'The event has been added to your personal calendar.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to add event',
        description: 'There was an error adding the event to your calendar.',
        variant: 'destructive',
      });
    }
  });
  
  // Remove event from calendar
  const removeFromCalendarMutation = useMutation({
    mutationFn: ({ eventId }: { eventId: number }) => 
      apiRequest(`/api/events/${eventId}/calendar`, {
        method: 'DELETE',
        data: { userId }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'calendar'] });
      toast({
        title: 'Event removed from calendar',
        description: 'The event has been removed from your personal calendar.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to remove event',
        description: 'There was an error removing the event from your calendar.',
        variant: 'destructive',
      });
    }
  });
  
  // Transform events for FullCalendar
  const calendarEventItems = calendarEvents?.map(event => ({
    id: String(event.id),
    title: event.name,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    extendedProps: event,
  })) || [];
  
  // Handle event click to view details
  const handleEventClick = (info: any) => {
    const eventId = Number(info.event.id);
    window.location.href = `/events/${eventId}`;
  };
  
  // Check if loading
  if (isLoading) {
    return (
      <Card className="col-span-3 h-full">
        <CardHeader>
          <CardTitle>My Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p>Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-3 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Calendar</CardTitle>
        <a 
          href={`/api/users/${userId}/calendar/export/ics`} 
          download="my-calendar.ics"
          className="ml-auto"
        >
          <Button variant="outline" size="sm">
            <CalendarPlus className="mr-2 h-4 w-4" /> Export Calendar
          </Button>
        </a>
      </CardHeader>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEventItems}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
        />
      </CardContent>
    </Card>
  );
};

// Button component to add/remove an event to/from the calendar
export const CalendarEventButton: React.FC<{
  eventId: number;
  userId: number;
}> = ({ eventId, userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInCalendar, setIsInCalendar] = useState(false);
  
  // Check if the event is already in the user's calendar
  const { data, isLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'calendar', userId],
    queryFn: () => apiRequest(`/api/events/${eventId}/calendar/${userId}`),
    enabled: !!userId && !!eventId,
  });
  
  useEffect(() => {
    if (data) {
      setIsInCalendar(data.isInCalendar);
    }
  }, [data]);
  
  // Add event to calendar
  const addToCalendarMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/events/${eventId}/calendar`, {
        method: 'POST',
        data: { userId }
      }),
    onSuccess: () => {
      setIsInCalendar(true);
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'calendar', userId] });
      toast({
        title: 'Event added to calendar',
        description: 'The event has been added to your personal calendar.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to add event',
        description: 'There was an error adding the event to your calendar.',
        variant: 'destructive',
      });
    }
  });
  
  // Remove event from calendar
  const removeFromCalendarMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/events/${eventId}/calendar`, {
        method: 'DELETE',
        data: { userId }
      }),
    onSuccess: () => {
      setIsInCalendar(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'calendar', userId] });
      toast({
        title: 'Event removed from calendar',
        description: 'The event has been removed from your personal calendar.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to remove event',
        description: 'There was an error removing the event from your calendar.',
        variant: 'destructive',
      });
    }
  });
  
  const handleToggleCalendar = () => {
    if (isInCalendar) {
      removeFromCalendarMutation.mutate();
    } else {
      addToCalendarMutation.mutate();
    }
  };
  
  const isLoaded = !isLoading && !addToCalendarMutation.isPending && !removeFromCalendarMutation.isPending;
  
  return (
    <Button 
      variant={isInCalendar ? "destructive" : "secondary"}
      size="sm" 
      onClick={handleToggleCalendar}
      disabled={!isLoaded}
    >
      {isInCalendar ? (
        <>
          <CalendarX className="mr-2 h-4 w-4" />
          Remove from Calendar
        </>
      ) : (
        <>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add to Calendar
        </>
      )}
    </Button>
  );
};