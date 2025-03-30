import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Share2, Copy, Twitter, Facebook, Mail, Linkedin } from "lucide-react";
import { FaTwitter, FaFacebook, FaLinkedinIn, FaEnvelope, FaCopy } from "react-icons/fa";

interface EventSharingProps {
  eventId: number;
  userId?: number;
  eventName: string;
  eventDescription: string;
  eventDate: string;
  eventLocation: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const EventSharing: React.FC<EventSharingProps> = ({
  eventId,
  userId = 1, // Default user ID if not provided
  eventName,
  eventDescription,
  eventDate,
  eventLocation,
  size = "md",
  variant = "outline",
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  // Create social sharing mutation
  const shareEvent = useMutation({
    mutationFn: (platform: string) => 
      apiRequest(`/api/events/${eventId}/share`, {
        method: 'POST',
        data: {
          userId,
          platform,
          sharedContent: `Check out this event: ${eventName} on ${eventDate} at ${eventLocation}`,
          sharingUrl: null
        }
      }),
    onSuccess: (_, platform) => {
      toast({
        title: 'Event shared',
        description: `Event shared successfully on ${platform}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'shares'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'shares'] });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error sharing event',
        description: 'There was a problem sharing this event',
        variant: 'destructive',
      });
    }
  });

  // Generate sharing content
  const shareContent = `Check out this event: ${eventName} on ${eventDate} at ${eventLocation} via CampusConnect`;
  const shareUrl = window.location.href;

  // Share to social media
  const handleShare = (platform: string) => {
    // Track the share with the API
    shareEvent.mutate(platform);

    // Open sharing URL in a new window
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent)}&url=${encodeURIComponent(window.location.href)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareContent)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Check out this event: ${eventName}`)}&body=${encodeURIComponent(`${shareContent}\n\n${window.location.href}`)}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied',
      description: 'Event link copied to clipboard',
    });
    shareEvent.mutate('clipboard');
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => setIsOpen(true)} 
              size={size} 
              variant={variant}
              disabled={shareEvent.isPending}
            >
              <Share2 className={size === "sm" ? "h-4 w-4 mr-1" : "h-5 w-5 mr-2"} />
              {size !== "sm" && "Share"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this event</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this event</DialogTitle>
            <DialogDescription>
              Share "{eventName}" with friends and colleagues
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4 h-auto space-y-2"
                onClick={() => handleShare('twitter')}
              >
                <FaTwitter className="h-6 w-6 text-[#1DA1F2]" />
                <span className="text-xs">Twitter</span>
              </Button>

              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4 h-auto space-y-2"
                onClick={() => handleShare('facebook')}
              >
                <FaFacebook className="h-6 w-6 text-[#4267B2]" />
                <span className="text-xs">Facebook</span>
              </Button>

              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4 h-auto space-y-2"
                onClick={() => handleShare('linkedin')}
              >
                <FaLinkedinIn className="h-6 w-6 text-[#0077B5]" />
                <span className="text-xs">LinkedIn</span>
              </Button>

              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4 h-auto space-y-2"
                onClick={() => handleShare('email')}
              >
                <FaEnvelope className="h-6 w-6 text-gray-500" />
                <span className="text-xs">Email</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="grid">
                  <div className="bg-muted p-2 rounded-md text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                    {shareUrl}
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="px-3" 
                onClick={copyToClipboard}
              >
                <span className="sr-only">Copy</span>
                <FaCopy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="mt-2 sm:mt-0"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventSharing;