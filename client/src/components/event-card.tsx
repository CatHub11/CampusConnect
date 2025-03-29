import { format } from "date-fns";
import { Link } from "wouter";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CategoryTag from "@/components/category-tag";
import { Event, Category } from "@shared/schema";

interface EventCardProps {
  event: Event;
  categories?: Category[];
}

const EventCard = ({ event, categories }: EventCardProps) => {
  // Format event date and time
  const formatEventDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };
  
  const formatEventTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-40 bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
        <div className="text-center px-4">
          <Calendar className="h-10 w-10 mx-auto text-primary mb-2" />
          <p className="text-gray-700 font-medium">{event.name}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.name}</h3>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-start">
            <Calendar className="h-4 w-4 mr-2 text-gray-500 mt-1" />
            <span className="text-sm">{formatEventDate(event.startTime)}</span>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-4 w-4 mr-2 text-gray-500 mt-1" />
            <span className="text-sm">
              {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
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
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.map((category) => (
              <CategoryTag 
                key={category.id} 
                category={category}
                className="text-xs"
              />
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
