import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category, Club, Event, EventCategory, ClubCategory } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  Users, 
  Plus, 
  PanelLeft,
  Hash,
  Settings
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventWithCategoryIds extends Event {
  categoryIds?: number[];
}

interface ClubWithCategoryIds extends Club {
  categoryIds?: number[];
  memberCount?: number;
}

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<'events' | 'clubs'>('events');
  const [eventsWithCategories, setEventsWithCategories] = useState<EventWithCategoryIds[]>([]);
  const [clubsWithCategories, setClubsWithCategories] = useState<ClubWithCategoryIds[]>([]);

  // Fetch categories, events, event categories, clubs, and club categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: clubs } = useQuery<Club[]>({
    queryKey: ["/api/clubs"],
  });

  const { data: eventCategories } = useQuery<EventCategory[]>({
    queryKey: ["/api/event-categories"],
    // This is a fallback in case the endpoint doesn't exist
    enabled: false
  });

  const { data: clubCategories } = useQuery<ClubCategory[]>({
    queryKey: ["/api/club-categories"],
    // This is a fallback in case the endpoint doesn't exist
    enabled: false
  });

  // Process data to add categoryIds to events and clubs
  useEffect(() => {
    if (events) {
      // Since we don't have real event-category relationships from the API yet,
      // we'll simulate them by randomly assigning categories to events
      const processedEvents = events.map(event => {
        // For demo purposes, assign random categories (1-3 categories per event)
        const randomCategoryIds = categories 
          ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
              categories[Math.floor(Math.random() * categories.length)].id
            )
          : [];
        
        return {
          ...event,
          categoryIds: randomCategoryIds
        };
      });
      
      setEventsWithCategories(processedEvents);
    }
  }, [events, categories]);

  useEffect(() => {
    if (clubs) {
      // Similar simulation for clubs
      const processedClubs = clubs.map(club => {
        // For demo purposes, assign random categories (1-2 categories per club)
        const randomCategoryIds = categories 
          ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => 
              categories[Math.floor(Math.random() * categories.length)].id
            )
          : [];
        
        // Add a random member count for demo purposes
        const memberCount = Math.floor(Math.random() * 100) + 5;
        
        return {
          ...club,
          categoryIds: randomCategoryIds,
          memberCount
        };
      });
      
      setClubsWithCategories(processedClubs);
    }
  }, [clubs, categories]);

  // Filter events or clubs based on selected category
  const filteredEvents = eventsWithCategories.filter(event => 
    !selectedCategory || (event.categoryIds && event.categoryIds.includes(selectedCategory))
  );

  const filteredClubs = clubsWithCategories.filter(club => 
    !selectedCategory || (club.categoryIds && club.categoryIds.includes(selectedCategory))
  );

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top section - Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && <h2 className="font-semibold text-lg">Dashboard</h2>}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Middle section - Categories */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className={cn("px-3 mb-2", !sidebarCollapsed && "flex items-center justify-between")}>
            {!sidebarCollapsed && <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</h3>}
            {!sidebarCollapsed && (
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm font-medium transition-colors",
                !selectedCategory 
                  ? "bg-primary text-primary-foreground" 
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
                sidebarCollapsed && "justify-center"
              )}
            >
              <Hash className="h-4 w-4 mr-2" />
              {!sidebarCollapsed && <span>All</span>}
            </button>

            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2 text-sm font-medium transition-colors",
                  selectedCategory === category.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
                  sidebarCollapsed && "justify-center"
                )}
              >
                <div 
                  className="h-4 w-4 mr-2 rounded-full" 
                  style={{ backgroundColor: category.color || '#6E56CF' }}
                />
                {!sidebarCollapsed && <span>{category.name}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom section - Settings */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className={cn(
              "flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors",
              sidebarCollapsed && "justify-center"
            )}
          >
            <Settings className="h-4 w-4 mr-2" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Content Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {selectedCategory 
              ? `${categories?.find(c => c.id === selectedCategory)?.name} ${activeView === 'events' ? 'Events' : 'Clubs'}`
              : `All ${activeView === 'events' ? 'Events' : 'Clubs'}`
            }
          </h1>
          <div className="flex space-x-2">
            <Button 
              variant={activeView === 'events' ? 'default' : 'outline'} 
              onClick={() => setActiveView('events')}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Events
            </Button>
            <Button 
              variant={activeView === 'clubs' ? 'default' : 'outline'} 
              onClick={() => setActiveView('clubs')}
            >
              <Users className="h-4 w-4 mr-2" />
              Clubs
            </Button>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeView === 'events' ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Link key={event.id} href={`/event-details/${event.id}`}>
                  <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">{event.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories
                          ?.filter(cat => event.categoryIds?.includes(cat.id))
                          .map(cat => (
                            <Badge 
                              key={cat.id} 
                              style={{ 
                                backgroundColor: cat.color || undefined,
                                color: cat.color ? '#fff' : undefined
                              }}
                              className="text-xs"
                            >
                              {cat.name}
                            </Badge>
                          ))
                        }
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(new Date(event.startTime), "EEE, MMM d, yyyy")}
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">{event.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No events found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {selectedCategory 
                    ? "No events found in this category. Try selecting a different category."
                    : "No events found. Create a new event or try a different filter."
                  }
                </p>
                <Link href="/events">
                  <Button>Browse All Events</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.length > 0 ? (
              filteredClubs.map((club) => (
                <Link key={club.id} href={`/club-details/${club.id}`}>
                  <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">{club.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories
                          ?.filter(cat => club.categoryIds?.includes(cat.id))
                          .map(cat => (
                            <Badge 
                              key={cat.id} 
                              style={{ 
                                backgroundColor: cat.color || undefined,
                                color: cat.color ? '#fff' : undefined
                              }}
                              className="text-xs"
                            >
                              {cat.name}
                            </Badge>
                          ))
                        }
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <Users className="h-4 w-4 mr-2" />
                          {club.memberCount || 0} members
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mt-2">{club.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No clubs found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {selectedCategory 
                    ? "No clubs found in this category. Try selecting a different category."
                    : "No clubs found. Create a new club or try a different filter."
                  }
                </p>
                <Link href="/clubs">
                  <Button>Browse All Clubs</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;