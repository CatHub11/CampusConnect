import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ClubCard from "@/components/club-card";
import CategoryTag from "@/components/category-tag";
import { Club, Category } from "@shared/schema";

const Clubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['/api/clubs'],
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Filter clubs based on search term and selected categories
  const filteredClubs = clubs.filter((club: Club) => {
    const matchesSearch = searchTerm === "" || 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.meetingLocation && club.meetingLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If no categories are selected, show all clubs
    if (selectedCategories.length === 0) return matchesSearch;
    
    // Otherwise, filter by category (this would require full club data with categories)
    // For this example, we'll just return the search matches since we don't have the category info here
    return matchesSearch;
  });

  const handleCategoryChange = (categoryIds: number[]) => {
    setSelectedCategories(categoryIds);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campus Clubs</h1>
        <p className="text-gray-500">Discover and join clubs and organizations on campus</p>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <div className="relative max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Categories
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter by Categories</DialogTitle>
                </DialogHeader>
                
                <div className="mt-4 space-y-3">
                  {isCategoriesLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {categories.map((category: Category) => (
                        <div 
                          key={category.id} 
                          className={`flex items-center rounded-md px-3 py-2 transition-colors cursor-pointer hover:bg-gray-100 ${
                            selectedCategories.includes(category.id) ? "bg-primary/10" : ""
                          }`}
                          onClick={() => {
                            if (selectedCategories.includes(category.id)) {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            } else {
                              setSelectedCategories([...selectedCategories, category.id]);
                            }
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm flex-1">{category.name}</span>
                          {selectedCategories.includes(category.id) && (
                            <X className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Category Tags */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(id => {
                const category = categories.find((c: Category) => c.id === id);
                if (!category) return null;
                
                return (
                  <CategoryTag 
                    key={category.id}
                    category={category}
                    selected={true}
                    onRemove={() => {
                      setSelectedCategories(selectedCategories.filter(catId => catId !== id));
                    }}
                  />
                );
              })}
              
              <Badge 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setSelectedCategories([])}
              >
                Clear All <X className="h-3 w-3 ml-1" />
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          
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
