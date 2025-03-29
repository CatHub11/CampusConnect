import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "./event-card";
import { Event } from "@shared/schema";
import { CalendarIcon, ChevronRight } from "lucide-react";

interface FeaturedEventsProps {
  events?: Event[];
  isLoading?: boolean;
}

const FeaturedEvents = ({ events: propEvents, isLoading: propIsLoading }: FeaturedEventsProps) => {
  // Either use provided events or fetch them
  const { data: fetchedEvents, isLoading: isFetchingEvents } = useQuery({
    queryKey: ['/api/events/featured'],
    enabled: !propEvents, // Only fetch if events weren't provided as props
  });
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const [mappedEvents, setMappedEvents] = useState<any[]>([]);
  
  const events = propEvents || fetchedEvents;
  const isLoading = propIsLoading || isFetchingEvents;

  // Map categories to events if we have both
  useEffect(() => {
    if (events && categories) {
      // This is a simplified mapping since we don't have the direct relationships
      // In a real app with complete data, we would have the relationships
      setMappedEvents(events.map(event => ({
        ...event,
        categories: categories.slice(0, 2) // Just for demonstration
      })));
    } else {
      setMappedEvents(events || []);
    }
  }, [events, categories]);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Events</h2>
            <p className="text-gray-500">Check out these upcoming campus events</p>
          </div>
          
          <Link href="/events">
            <Button variant="outline">
              View All Events
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : mappedEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappedEvents.map((event) => (
              <EventCard key={event.id} event={event} categories={event.categories} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Featured Events</h3>
            <p className="text-gray-500 mb-6">Check back soon for upcoming campus events</p>
            <Link href="/events">
              <Button>Browse All Events</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
