import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { formatDate, formatTime } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Calendar, MapPin, Users, Award, Share2 } from "lucide-react";
import EventSharing from './event-sharing';

interface EventRecommendationsProps {
  userId: number;
  limit?: number;
  showFeedback?: boolean;
  showHeader?: boolean;
}

const EventRecommendations: React.FC<EventRecommendationsProps> = ({
  userId,
  limit = 3,
  showFeedback = true,
  showHeader = true,
}) => {
  // Fetch recommended events for the user
  const { data: recommendations, isLoading, isError } = useQuery({
    queryKey: ['/api/users', userId, 'recommended-events'],
    queryFn: async () => {
      const res = await apiRequest(`/api/users/${userId}/recommended-events${limit ? `?limit=${limit}` : ''}`);
      return res.json();
    },
    enabled: !!userId,
  });

  // Add to calendar mutation
  const addToCalendar = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest(`/api/events/${eventId}/calendar`, {
        method: 'POST',
        data: { userId }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'recommended-events'] });
    }
  });

  // Share event mutation
  const shareEvent = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest(`/api/events/${eventId}/share`, {
        method: 'POST',
        data: {
          userId,
          platform: 'share_button',
          sharedContent: 'Shared from recommendations',
          sharingUrl: null,
        }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'recommended-events'] });
    }
  });

  // Feedback on recommendation mutation
  const provideFeedback = useMutation({
    mutationFn: async ({ eventId, isRelevant }: { eventId: number, isRelevant: boolean }) => {
      const res = await apiRequest(`/api/ai-suggestions/feedback`, {
        method: 'POST',
        data: {
          userId,
          eventId,
          suggestionType: 'event_recommendation',
          isRelevant,
          feedbackText: null,
        }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'recommended-events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'ai-suggestions/feedback'] });
    }
  });

  if (isLoading) {
    return (
      <div>
        {showHeader && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
            <p className="text-muted-foreground">
              Personalized event recommendations based on your preferences
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-1">
                <Skeleton className="h-40 w-full rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex space-x-2 pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !recommendations || recommendations.length === 0) {
    return (
      <div>
        {showHeader && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
            <p className="text-muted-foreground">
              Complete your profile and preferences to get personalized recommendations
            </p>
          </div>
        )}
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>No Recommendations Yet</CardTitle>
            <CardDescription>
              We're still learning about your interests. Complete your profile or attend a few events to get personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center space-x-4">
            <Link href="/profile">
              <Button variant="outline">Update Profile</Button>
            </Link>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
          <p className="text-muted-foreground">
            Personalized event recommendations based on your preferences and interests
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((event: any) => (
          <Card key={event.id} className="overflow-hidden flex flex-col h-full border-2 hover:border-primary/50 transition-colors">
            <div className="relative">
              {event.relevanceScore && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                    {Math.round(event.relevanceScore * 100)}% Match
                  </Badge>
                </div>
              )}
              {!event.image && (
                <div className="h-40 bg-muted flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
              {event.image && (
                <img 
                  src={event.image} 
                  alt={event.name} 
                  className="h-40 w-full object-cover"
                />
              )}
            </div>
            
            <CardHeader className="p-4 pb-2">
              <div className="flex space-x-2 mb-2">
                {event.categories && event.categories.slice(0, 2).map((category: any) => (
                  <Badge key={category.id} variant="outline" style={{ 
                    backgroundColor: `${category.color}10`, 
                    color: category.color,
                    borderColor: category.color
                  }}>
                    {category.name}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg">
                <Link href={`/events/${event.id}`}>
                  {event.name}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                {event.location}
              </CardDescription>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                {formatDate(event.startTime)} · {formatTime(event.startTime)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 pb-2 flex-grow">
              <p className="text-sm line-clamp-2">{event.description}</p>
              {event.reasoning && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground italic">
                    <span className="font-medium">Why this event:</span> {event.reasoning}
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-4 pt-2 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => addToCalendar.mutate(event.id)}
                disabled={addToCalendar.isPending}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Save
              </Button>
              
              <EventSharing 
                eventId={event.id} 
                userId={userId}
                eventName={event.name}
                eventDescription={event.description}
                eventDate={formatDate(event.startTime)}
                eventLocation={event.location}
                size="sm"
              />
              
              {showFeedback && (
                <div className="flex gap-1 ml-auto">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-green-100 hover:text-green-700"
                    title="This recommendation is relevant"
                    onClick={() => provideFeedback.mutate({ eventId: event.id, isRelevant: true })}
                    disabled={provideFeedback.isPending}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-700"
                    title="This recommendation is not relevant"
                    onClick={() => provideFeedback.mutate({ eventId: event.id, isRelevant: false })}
                    disabled={provideFeedback.isPending}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventRecommendations;