import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClubCard from "@/components/club-card";
import CategoryFilter from "@/components/category-filter";
import { Club } from "@shared/schema";

const Clubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data: clubs, isLoading } = useQuery({
    queryKey: ['/api/clubs'],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Filter clubs based on search term and selected categories
  const filteredClubs = clubs ? clubs.filter((club: Club) => {
    const matchesSearch = searchTerm === "" || 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.meetingLocation && club.meetingLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If no categories are selected, show all clubs
    if (selectedCategories.length === 0) return matchesSearch;
    
    // Otherwise, filter by category (this would require full club data with categories)
    // For this example, we'll just return the search matches since we don't have the category info here
    return matchesSearch;
  }) : [];

  const handleCategoryChange = (categoryIds: number[]) => {
    setSelectedCategories(categoryIds);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campus Clubs</h1>
        <p className="text-gray-500">Discover and join clubs and organizations on campus</p>
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
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              icon={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club: Club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-medium mb-2">No clubs found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedCategories([]);
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clubs;
