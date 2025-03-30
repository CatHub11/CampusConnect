import React from 'react';
import UserProfile from '@/components/user-profile';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const userId = params.id ? parseInt(params.id) : 1; // Default to user ID 1 if not provided

  // Check if user exists
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['/api/users', userId, 'complete'],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Not Found</h1>
        <p>The user profile you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => setLocation('/')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <UserProfile userId={userId} />
    </div>
  );
};

export default ProfilePage;