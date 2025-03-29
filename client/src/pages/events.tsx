import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, Grid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "@/components/event-card";
import CategoryFilter from "@/components/category-filter";
import { Event } from "@shared/schema";

const Events = () => {
  const [view, setView] = useState<"grid" | "calendar">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Filter events based on search term and selected categories
  const filteredEvents = events ? events.filter((event: Event) => {
    const matchesSearch = searchTerm === "" || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If no categories are selected, show all events
    if (selectedCategories.length === 0) return matchesSearch;
    
    // Otherwise, filter by category (this would require full event data with categories)
    // For this example, we'll just return the search matches since we don't have the category info here
    return matchesSearch;
  }) : [];

  const handleCategoryChange = (categoryIds: number[]) => {
    setSelectedCategories(categoryIds);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-gray-500">Discover and join events happening on campus</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "calendar")}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64">
          <CategoryFilter 
            categories={categories || []} 
            isLoading={isCategoriesLoading}
            selectedCategories={selectedCategories}
            onChange={handleCategoryChange}
          />
        </div>
        
        <div className="flex-1">
          <div className="mb-6">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Tabs value={view} className="w-full">
            <TabsContent value="grid">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event: Event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <h3 className="text-xl font-medium mb-2">No events found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <Button onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="calendar">
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <h3 className="text-xl font-medium mb-2">Calendar View</h3>
                  <p className="text-gray-500 mb-4">
                    View events organized by date to better plan your schedule
                  </p>
                  <Calendar className="h-24 w-24 mx-auto text-primary mb-4" />
                  <p className="text-sm text-gray-500">
                    Coming soon! Our calendar view is under development.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Events;
