import { Link } from "wouter";
import { Users, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategoryTag from "@/components/category-tag";
import { Club, Category } from "@shared/schema";

interface ClubCardProps {
  club: Club;
  categories?: Category[];
}

const ClubCard = ({ club, categories }: ClubCardProps) => {
  // Format founded date if available
  const formatFoundedDate = (date?: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-40 bg-gradient-to-r from-secondary-100 to-primary-100 flex items-center justify-center">
        <div className="text-center px-4">
          <Users className="h-12 w-12 mx-auto text-primary mb-2" />
          <p className="text-gray-700 font-medium">{club.name}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{club.name}</h3>
        
        <div className="space-y-2 mb-3">
          {club.meetingLocation && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-1" />
              <span className="text-sm line-clamp-1">{club.meetingLocation}</span>
            </div>
          )}
          
          {club.foundedDate && (
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mr-2 text-gray-500 mt-1" />
              <span className="text-sm">Founded {formatFoundedDate(club.foundedDate)}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {club.description}
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
        <Link href={`/clubs/${club.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Club</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ClubCard;
