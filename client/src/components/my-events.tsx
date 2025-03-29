import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, ClockIcon, ChevronRight } from "lucide-react";
import { Event } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";

interface MyEventsProps {
  limit?: number;
}

const MyEvents = ({ limit = 3 }: MyEventsProps) => {
  // In a real app, this would fetch the user's events based on their ID
  // For now, we'll just fetch a subset of all events
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const userEvents = Array.isArray(events) ? events.slice(0, limit) : [];

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">My Events</CardTitle>
          <Link href="/events">
            <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading your events...</div>
        ) : userEvents.length > 0 ? (
          <div className="space-y-3">
            {userEvents.map((event: Event) => (
              <Link key={event.id} href={`/event-details/${event.id}`}>
                <div className="p-3 rounded-md border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{event.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {new Date(event.startTime) > new Date() ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500 text-xs">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {format(new Date(event.startTime), "EEE, MMM d, yyyy")}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">You haven't RSVP'd to any events yet.</p>
            <Link href="/events">
              <Button size="sm">Browse Events</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyEvents;