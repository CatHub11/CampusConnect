import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  Users, 
  Calendar, 
  MapPin, 
  User, 
  Share2, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const ClubDetails = () => {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [membershipRole, setMembershipRole] = useState<string>("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const { data: club, isLoading, isError } = useQuery({
    queryKey: [`/api/clubs/${id}`],
  });

  // Handle joining club
  const joinMutation = useMutation({
    mutationFn: async (role: string) => {
      // In a real app, we'd have user auth and pass the user ID
      const userId = 1; // Placeholder
      return apiRequest("POST", `/api/clubs/${id}/members`, {
        userId,
        role
      });
    },
    onSuccess: () => {
      toast({
        title: "Club Joined",
        description: `You've successfully joined this club as a ${membershipRole}.`,
      });
      setIsJoinDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Join Club",
        description: error.message || "There was an error joining this club.",
        variant: "destructive"
      });
    }
  });

  const handleJoinClub = () => {
    if (!membershipRole) {
      toast({
        title: "Please select a role",
        description: "You need to select your role in the club.",
        variant: "destructive"
      });
      return;
    }
    
    joinMutation.mutate(membershipRole);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Club Not Found</h2>
          <p className="mb-6">The club you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/clubs")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Clubs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate("/clubs")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Clubs
      </Button>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{club.name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {club.categories?.map((category) => (
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
              {club.meetingLocation && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Meeting Location</p>
                    <p className="text-gray-500">{club.meetingLocation}</p>
                  </div>
                </div>
              )}
              
              {club.foundedDate && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Founded</p>
                    <p className="text-gray-500">
                      {new Date(club.foundedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <User className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Club President</p>
                  <p className="text-gray-500">
                    {club.president ? (
                      `${club.president.firstName} ${club.president.lastName}`
                    ) : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-3">About this club</h2>
            <div className="prose max-w-none">
              <p>{club.description}</p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Club Actions</h2>
            
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-3">Join this Club</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join {club.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="mb-4">Select your role to join this club.</p>
                  <Select value={membershipRole} onValueChange={setMembershipRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="officer">Officer (requires approval)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleJoinClub}
                      disabled={joinMutation.isPending || !membershipRole}
                    >
                      {joinMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="w-full mb-6">
              <Share2 className="mr-2 h-4 w-4" /> Share Club
            </Button>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Membership
                </div>
              </h3>
              <p className="text-gray-600 mb-4">
                Join this club to connect with fellow students who share your interests.
              </p>
              
              {club.meetingLocation && (
                <>
                  <h3 className="font-medium mb-2">Location</h3>
                  <p className="text-gray-600">{club.meetingLocation}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;
