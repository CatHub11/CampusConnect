import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, ClockIcon, ChevronRight, Users } from "lucide-react";
import { Event } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";

interface UpcomingEventsProps {
  limit?: number;
}

const UpcomingEvents = ({ limit = 4 }: UpcomingEventsProps) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  // Filter for upcoming events and sort by start time
  const upcomingEvents = Array.isArray(events) 
    ? events
        .filter(event => new Date(event.startTime) > new Date())
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, limit)
    : [];

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Upcoming Events</CardTitle>
          <Link href="/events">
            <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading events...</div>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event: Event) => (
              <Link key={event.id} href={`/event-details/${event.id}`}>
                <div className="p-3 rounded-md border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">{event.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {Math.floor(Math.random() * 30) + 5} {/* Placeholder for attendee count */}
                      </div>
                      <Badge variant="secondary" className="text-xs">{
                        Math.floor((new Date(event.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) === 0 
                        ? 'Today' 
                        : Math.floor((new Date(event.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) === 1
                        ? 'Tomorrow'
                        : `In ${Math.floor((new Date(event.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                      }</Badge>
                    </div>
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
            <p className="text-gray-500 mb-4">No upcoming events found.</p>
            <Link href="/events">
              <Button size="sm" variant="outline">Browse All Events</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;