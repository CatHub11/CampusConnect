import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Trophy, Star, Target, Zap, Clock, Book, Users, Calendar } from "lucide-react";
import { Link } from "wouter";

interface UserAchievementsProps {
  userId: number;
  compact?: boolean;
}

// Map of achievement icons
const achievementIcons: Record<string, React.ReactNode> = {
  'event_attendance': <Calendar className="h-5 w-5" />,
  'club_membership': <Users className="h-5 w-5" />,
  'event_hosting': <Award className="h-5 w-5" />,
  'category_explorer': <Star className="h-5 w-5" />,
  'social_butterfly': <Zap className="h-5 w-5" />,
  'perfect_attendance': <Clock className="h-5 w-5" />,
  'knowledge_seeker': <Book className="h-5 w-5" />,
  'community_builder': <Target className="h-5 w-5" />,
  'default': <Trophy className="h-5 w-5" />
};

// Achievement colors based on category
const achievementColors: Record<string, string> = {
  'participation': 'bg-blue-100 text-blue-800',
  'engagement': 'bg-purple-100 text-purple-800',
  'social': 'bg-pink-100 text-pink-800',
  'leadership': 'bg-amber-100 text-amber-800',
  'exploration': 'bg-emerald-100 text-emerald-800',
  'consistency': 'bg-teal-100 text-teal-800',
  'default': 'bg-gray-100 text-gray-800'
};

const UserAchievements: React.FC<UserAchievementsProps> = ({ userId, compact = false }) => {
  // Fetch user achievements
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'achievements'],
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {!compact && <h3 className="text-xl font-bold">Achievements</h3>}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    if (compact) {
      return (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No achievements yet</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>
            Earn badges by participating in campus events and activities
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">You haven't earned any achievements yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Start participating in events to collect badges!</p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/events">
            <Button variant="default">Browse Events</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Sort achievements by progress (completed first, then by highest progress)
  const sortedAchievements = [...achievements].sort((a, b) => {
    // First by completion (100% first)
    if (a.progress === 100 && b.progress !== 100) return -1;
    if (a.progress !== 100 && b.progress === 100) return 1;
    
    // Then by progress percentage (higher first)
    return b.progress - a.progress;
  });

  if (compact) {
    // Just show the top 3 achievements in a compact view
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Achievements</h3>
          <Link href={`/profile/${userId}?tab=achievements`}>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              View All
            </Button>
          </Link>
        </div>
        {sortedAchievements.slice(0, 3).map((achievement) => (
          <div key={achievement.id} className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${achievementColors[achievement.type.category] || achievementColors.default}`}>
              {achievementIcons[achievement.type.category] || achievementIcons.default}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-sm font-medium">{achievement.type.name}</p>
                <Badge variant={achievement.progress === 100 ? "default" : "outline"} className="ml-2 text-xs">
                  {achievement.progress}%
                </Badge>
              </div>
              <Progress value={achievement.progress} className="h-1 mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Achievements</h2>
        <Badge className="text-sm">{achievements.length} Total</Badge>
      </div>
      
      {achievements.filter(a => a.progress === 100).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Completed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAchievements
              .filter(a => a.progress === 100)
              .map((achievement) => (
                <Card key={achievement.id} className="overflow-hidden">
                  <div className="flex p-4">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${achievementColors[achievement.type.category] || achievementColors.default}`}>
                      {achievementIcons[achievement.type.category] || achievementIcons.default}
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold">{achievement.type.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.type.description}</p>
                      <div className="flex items-center mt-1">
                        <Progress value={100} className="h-2 flex-1" />
                        <span className="ml-2 text-xs font-medium">Completed</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
      
      {achievements.filter(a => a.progress < 100).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">In Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAchievements
              .filter(a => a.progress < 100)
              .map((achievement) => (
                <Card key={achievement.id} className="overflow-hidden">
                  <div className="flex p-4">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${achievementColors[achievement.type.category] || achievementColors.default}`}>
                      {achievementIcons[achievement.type.category] || achievementIcons.default}
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold">{achievement.type.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.type.description}</p>
                      <div className="flex items-center mt-1">
                        <Progress value={achievement.progress} className="h-2 flex-1" />
                        <span className="ml-2 text-xs font-medium">{achievement.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAchievements;