import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EmojiReactionProps {
  eventId: number;
  initialReactions?: {
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
}

const defaultEmojis = [
  { emoji: "👍", label: "Like" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "❤️", label: "Love" },
  { emoji: "🚀", label: "Excited" }
];

export function EmojiReaction({ eventId, initialReactions }: EmojiReactionProps) {
  const queryClient = useQueryClient();
  
  // Initialize reactions with default emojis or provided initial reactions
  const [reactions, setReactions] = useState(
    initialReactions || 
    defaultEmojis.map(e => ({ 
      emoji: e.emoji, 
      count: 0, 
      userReacted: false 
    }))
  );

  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async ({ emoji }: { emoji: string }) => {
      return await apiRequest(
        "POST",
        `/api/events/${eventId}/reactions`,
        { emoji }
      );
    },
    onSuccess: (_, variables) => {
      // Optimistically update the UI
      setReactions(prevReactions => 
        prevReactions.map(reaction => {
          if (reaction.emoji === variables.emoji) {
            if (reaction.userReacted) {
              return { ...reaction, count: reaction.count - 1, userReacted: false };
            } else {
              return { ...reaction, count: reaction.count + 1, userReacted: true };
            }
          }
          return reaction;
        })
      );
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    }
  });

  const handleReaction = (emoji: string) => {
    toggleReactionMutation.mutate({ emoji });
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <TooltipProvider>
        {reactions.map(reaction => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleReaction(reaction.emoji)}
                className={cn(
                  "flex items-center space-x-1 transition-all hover:bg-muted", 
                  reaction.userReacted && "bg-primary/10 border-primary/30 font-medium"
                )}
              >
                <span className="text-base">{reaction.emoji}</span>
                {reaction.count > 0 && (
                  <span className="text-xs font-medium">{reaction.count}</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{defaultEmojis.find(e => e.emoji === reaction.emoji)?.label || 'React'}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}