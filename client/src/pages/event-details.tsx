import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft, 
  Loader2,
  Share2,
  Download,
  CalendarRange
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CalendarEventButton } from "@/components/event-calendar";

const EventDetails = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [rsvpStatus, setRsvpStatus] = useState<string>("");
  const [isRsvpDialogOpen, setIsRsvpDialogOpen] = useState(false);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: [`/api/events/${id}`],
  });

  // Handle RSVP submission
  const rsvpMutation = useMutation({
    mutationFn: async (status: string) => {
      // In a real app, we'd have user auth and pass the user ID
      const userId = 1; // Placeholder
      return apiRequest("POST", `/api/events/${id}/rsvp`, {
        userId,
        status
      });
    },
    onSuccess: () => {
      toast({
        title: "RSVP Successful",
        description: `You've ${rsvpStatus.toLowerCase()} this event.`,
      });
      setIsRsvpDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "RSVP Failed",
        description: error.message || "Failed to RSVP to this event.",
        variant: "destructive"
      });
    }
  });

  const handleRsvp = () => {
    if (!rsvpStatus) {
      toast({
        title: "Please select a status",
        description: "You need to select whether you're attending, interested, or not attending.",
        variant: "destructive"
      });
      return;
    }
    
    rsvpMutation.mutate(rsvpStatus);
  };

  // Format event date and time for display
  const formatEventDateTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const dateStr = format(start, "EEEE, MMMM d, yyyy");
    const timeStr = `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
    
    return { dateStr, timeStr };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/events")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const { dateStr, timeStr } = formatEventDateTime(event.startTime, event.endTime);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate("/events")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {event.categories?.map((category) => (
                <Badge 
                  key={category.id} 
                  style={{ backgroundColor: category.color }}
                  className="text-white"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">{dateStr}</p>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{timeStr}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-gray-500">Campus Map</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Organized by</p>
                  <p className="text-gray-500">
                    {event.organizer ? (
                      `${event.organizer.firstName} ${event.organizer.lastName}`
                    ) : "University Organization"}
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-3">About this event</h2>
            <div className="prose max-w-none">
              <p>{event.description}</p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Event Actions</h2>
            
            <Dialog open={isRsvpDialogOpen} onOpenChange={setIsRsvpDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-3">RSVP to this Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>RSVP to {event.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="mb-4">Let the organizers know if you'll be attending this event.</p>
                  <Select value={rsvpStatus} onValueChange={setRsvpStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your RSVP status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attending">I'm Attending</SelectItem>
                      <SelectItem value="interested">I'm Interested</SelectItem>
                      <SelectItem value="not attending">I Can't Attend</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsRsvpDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRsvp}
                      disabled={rsvpMutation.isPending || !rsvpStatus}
                    >
                      {rsvpMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit RSVP
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="w-full mb-4">
              <Share2 className="mr-2 h-4 w-4" /> Share Event
            </Button>
            
            {/* Add to Calendar Button */}
            <div className="mb-4">
              {/* Using a placeholder userId of 1 for demonstration purposes */}
              {/* In a real app, you would get the userId from authentication context */}
              <CalendarEventButton eventId={Number(id)} userId={1} />
            </div>
            
            {/* Download Calendar File Button */}
            <a 
              href={`/api/events/${id}/export/ics`} 
              download={`event-${event.name}.ics`}
              className="w-full mb-6"
              onClick={() => {
                toast({
                  title: "Calendar Export",
                  description: "Event is being downloaded as an .ics file.",
                });
              }}
            >
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download .ics File
              </Button>
            </a>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Event Time</h3>
              <p className="text-gray-600 mb-4">{dateStr}<br />{timeStr}</p>
              
              <h3 className="font-medium mb-2">Location</h3>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
