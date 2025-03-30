import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CheckboxGroup, CheckboxGroupItem } from "@/components/ui/checkbox-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import UserAchievements from '@/components/user-achievements';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, Settings, Award, CalendarClock, Share2, 
  Edit3, Check, X, Facebook, Twitter, Linkedin, Globe, Instagram
} from "lucide-react";

interface UserProfileProps {
  userId: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams<{ tab?: string }>();
  const activeTab = params.tab || "profile";
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Get user information
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users', userId, 'complete'],
    enabled: !!userId,
  });
  
  // Get preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/users', userId, 'preferences'],
    enabled: !!userId,
  });
  
  // Get profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
    enabled: !!userId,
  });
  
  // Get all available categories for preferences
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Form state
  const [profileForm, setProfileForm] = React.useState({
    visibility: 'public',
    interests: [] as string[],
    bio: '',
    profilePicture: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      website: '',
    }
  });
  
  const [preferencesForm, setPreferencesForm] = React.useState({
    preferredCategories: [] as number[],
    preferredDaysOfWeek: [] as string[],
    preferredTimeOfDay: [] as string[],
    locationPreference: 'on-campus',
  });
  
  // Update forms when data is loaded
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || '',
        interests: profile.interests || [],
        visibility: profile.visibility || 'public',
        socialLinks: profile.socialLinks || {
          twitter: '',
          facebook: '',
          instagram: '',
          linkedin: '',
          website: '',
        }
      });
    }
    
    if (preferences) {
      setPreferencesForm({
        preferredCategories: preferences.preferredCategories || [],
        preferredDaysOfWeek: preferences.preferredDaysOfWeek || [],
        preferredTimeOfDay: preferences.preferredTimeOfDay || [],
        locationPreference: preferences.locationPreference || 'on-campus',
      });
    }
  }, [profile, preferences]);
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/users/${userId}/profile`, {
        method: 'POST',
        data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'complete'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully',
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'There was a problem updating your profile',
        variant: 'destructive',
      });
    }
  });
  
  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/users/${userId}/preferences`, {
        method: 'POST',
        data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'preferences'] });
      toast({
        title: 'Preferences updated',
        description: 'Your event preferences have been updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'There was a problem updating your preferences',
        variant: 'destructive',
      });
    }
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm);
  };
  
  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences.mutate(preferencesForm);
  };
  
  // Loading state
  if (userLoading || profileLoading || preferencesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </TabsList>
          
          <div className="mt-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </Tabs>
      </div>
    );
  }
  
  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.profilePicture || ''} alt={user?.firstName} />
            <AvatarFallback className="text-xl font-bold">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-muted-foreground">@{user?.username}</p>
            <div className="flex items-center mt-1">
              <Badge variant={profile?.visibility === 'public' ? 'default' : 'outline'} className="mr-2">
                {profile?.visibility === 'public' ? 'Public Profile' : 'Private Profile'}
              </Badge>
              <p className="text-sm text-muted-foreground">{user?.university}</p>
            </div>
          </div>
        </div>
        
        {userId === 1 && ( // Show edit button only if viewing own profile (assumed userId 1 is self)
          <Button 
            className="mt-4 md:mt-0"
            variant={isEditing ? "destructive" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel Editing
              </>
            ) : (
              <>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        )}
      </div>
      
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="profile"
            onClick={() => setLocation(`/profile/${userId}`)}
            className="flex items-center"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            onClick={() => setLocation(`/profile/${userId}?tab=preferences`)}
            className="flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger 
            value="achievements"
            onClick={() => setLocation(`/profile/${userId}?tab=achievements`)}
            className="flex items-center"
          >
            <Award className="mr-2 h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information and social links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="visibility">Profile Visibility</Label>
                      <RadioGroup 
                        value={profileForm.visibility} 
                        onValueChange={value => setProfileForm({...profileForm, visibility: value})}
                        className="flex flex-col space-y-2 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <Label htmlFor="public" className="font-normal">Public - Anyone can view my profile</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="friends" id="friends" />
                          <Label htmlFor="friends" className="font-normal">Friends Only - Only connections can view my profile</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="private" />
                          <Label htmlFor="private" className="font-normal">Private - Only I can view my profile</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label htmlFor="profilePicture">Profile Picture URL</Label>
                      <Input
                        id="profilePicture"
                        placeholder="https://example.com/your-image.jpg"
                        value={profileForm.profilePicture || ''}
                        onChange={e => setProfileForm({...profileForm, profilePicture: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={profileForm.bio || ''}
                        onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label>Interests (Choose from popular tags)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Technology', 'Art', 'Music', 'Sports', 'Science', 'Literature', 'Gaming', 'Fitness', 'Food', 'Travel'].map(interest => (
                          <Badge 
                            key={interest}
                            variant={profileForm.interests.includes(interest) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              if (profileForm.interests.includes(interest)) {
                                setProfileForm({
                                  ...profileForm, 
                                  interests: profileForm.interests.filter(i => i !== interest)
                                });
                              } else {
                                setProfileForm({
                                  ...profileForm, 
                                  interests: [...profileForm.interests, interest]
                                });
                              }
                            }}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Social Media Links</Label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Twitter className="mr-2 h-4 w-4 text-[#1DA1F2]" />
                            <Label htmlFor="twitter" className="font-normal">Twitter</Label>
                          </div>
                          <Input
                            id="twitter"
                            placeholder="@username"
                            value={profileForm.socialLinks?.twitter || ''}
                            onChange={e => setProfileForm({
                              ...profileForm, 
                              socialLinks: {...profileForm.socialLinks, twitter: e.target.value}
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Facebook className="mr-2 h-4 w-4 text-[#4267B2]" />
                            <Label htmlFor="facebook" className="font-normal">Facebook</Label>
                          </div>
                          <Input
                            id="facebook"
                            placeholder="username"
                            value={profileForm.socialLinks?.facebook || ''}
                            onChange={e => setProfileForm({
                              ...profileForm, 
                              socialLinks: {...profileForm.socialLinks, facebook: e.target.value}
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Instagram className="mr-2 h-4 w-4 text-[#E1306C]" />
                            <Label htmlFor="instagram" className="font-normal">Instagram</Label>
                          </div>
                          <Input
                            id="instagram"
                            placeholder="username"
                            value={profileForm.socialLinks?.instagram || ''}
                            onChange={e => setProfileForm({
                              ...profileForm, 
                              socialLinks: {...profileForm.socialLinks, instagram: e.target.value}
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Linkedin className="mr-2 h-4 w-4 text-[#0077B5]" />
                            <Label htmlFor="linkedin" className="font-normal">LinkedIn</Label>
                          </div>
                          <Input
                            id="linkedin"
                            placeholder="username"
                            value={profileForm.socialLinks?.linkedin || ''}
                            onChange={e => setProfileForm({
                              ...profileForm, 
                              socialLinks: {...profileForm.socialLinks, linkedin: e.target.value}
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4" />
                            <Label htmlFor="website" className="font-normal">Personal Website</Label>
                          </div>
                          <Input
                            id="website"
                            placeholder="https://example.com"
                            value={profileForm.socialLinks?.website || ''}
                            onChange={e => setProfileForm({
                              ...profileForm, 
                              socialLinks: {...profileForm.socialLinks, website: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {profile?.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{profile.bio}</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.interests && profile.interests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map(interest => (
                          <Badge key={interest} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {profile?.socialLinks && Object.values(profile.socialLinks).some(link => !!link) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Connect with {user?.firstName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        {profile.socialLinks.twitter && (
                          <a href={`https://twitter.com/${profile.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon">
                              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                            </Button>
                          </a>
                        )}
                        
                        {profile.socialLinks.facebook && (
                          <a href={`https://facebook.com/${profile.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon">
                              <Facebook className="h-4 w-4 text-[#4267B2]" />
                            </Button>
                          </a>
                        )}
                        
                        {profile.socialLinks.instagram && (
                          <a href={`https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon">
                              <Instagram className="h-4 w-4 text-[#E1306C]" />
                            </Button>
                          </a>
                        )}
                        
                        {profile.socialLinks.linkedin && (
                          <a href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon">
                              <Linkedin className="h-4 w-4 text-[#0077B5]" />
                            </Button>
                          </a>
                        )}
                        
                        {profile.socialLinks.website && (
                          <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <UserAchievements userId={userId} compact />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Preferences</CardTitle>
              <CardDescription>
                Customize your event recommendations based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Preferred Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                      {categories && categories.map((category: any) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            checked={preferencesForm.preferredCategories.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferencesForm({
                                  ...preferencesForm,
                                  preferredCategories: [...preferencesForm.preferredCategories, category.id]
                                });
                              } else {
                                setPreferencesForm({
                                  ...preferencesForm,
                                  preferredCategories: preferencesForm.preferredCategories.filter(id => id !== category.id)
                                });
                              }
                            }}
                            className="rounded-sm"
                          />
                          <Label htmlFor={`category-${category.id}`} className="font-normal text-sm">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Preferred Days</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`day-${day}`}
                            checked={preferencesForm.preferredDaysOfWeek.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferencesForm({
                                  ...preferencesForm,
                                  preferredDaysOfWeek: [...preferencesForm.preferredDaysOfWeek, day]
                                });
                              } else {
                                setPreferencesForm({
                                  ...preferencesForm,
                                  preferredDaysOfWeek: preferencesForm.preferredDaysOfWeek.filter(d => d !== day)
                                });
                              }
                            }}
                            className="rounded-sm"
                          />
                          <Label htmlFor={`day-${day}`} className="font-normal text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Preferred Time of Day</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-2">
                      {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                        <div key={time} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`time-${time}`}
                            checked={preferencesForm.preferredTimeOfDay.includes(time)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferencesForm({
                                  ...preferencesForm,
                                  preferredTimeOfDay: [...preferencesForm.preferredTimeOfDay, time]
                                });
                              } else {
                                setPreferencesForm({
                                  ...preferencesForm,
                                  preferredTimeOfDay: preferencesForm.preferredTimeOfDay.filter(t => t !== time)
                                });
                              }
                            }}
                            className="rounded-sm"
                          />
                          <Label htmlFor={`time-${time}`} className="font-normal text-sm">
                            {time}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="locationPreference">Preferred Location</Label>
                    <Select
                      value={preferencesForm.locationPreference}
                      onValueChange={(value) => setPreferencesForm({...preferencesForm, locationPreference: value})}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select preferred location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-campus">On Campus</SelectItem>
                        <SelectItem value="off-campus">Off Campus</SelectItem>
                        <SelectItem value="online">Online/Virtual</SelectItem>
                        <SelectItem value="no-preference">No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={updatePreferences.isPending}
                  >
                    {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-6">
          {user && <UserAchievements userId={userId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;