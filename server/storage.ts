import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  events, type Event, type InsertEvent,
  eventCategories, type EventCategory, type InsertEventCategory,
  clubs, type Club, type InsertClub,
  clubCategories, type ClubCategory, type InsertClubCategory,
  eventRsvps, type EventRsvp, type InsertEventRsvp,
  clubMembers, type ClubMember, type InsertClubMember,
  waitlist, type WaitlistEntry, type InsertWaitlistEntry,
  chatConversations, type ChatConversation, type InsertChatConversation,
  chatMessages, type ChatMessage, type InsertChatMessage,
  eventReactions, type EventReaction, type InsertEventReaction, type EventReactionCount,
  userCalendarEvents, type UserCalendarEvent, type InsertUserCalendarEvent,
  userPreferences, type UserPreferences, type InsertUserPreferences,
  userProfiles, type UserProfile, type InsertUserProfile,
  achievementTypes, type AchievementType, type InsertAchievementType,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  eventShares, type EventShare, type InsertEventShare,
  aiSuggestionFeedback, type AiSuggestionFeedback, type InsertAiSuggestionFeedback,
  type EventWithCategories, type ClubWithCategories, type UserWithProfile, type EventWithSuggestionMetadata
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Event methods
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventWithCategories(id: number): Promise<EventWithCategories | undefined>;
  getFeaturedEvents(limit?: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  addEventCategory(eventCategory: InsertEventCategory): Promise<EventCategory>;
  
  // Club methods
  getAllClubs(): Promise<Club[]>;
  getClub(id: number): Promise<Club | undefined>;
  getClubWithCategories(id: number): Promise<ClubWithCategories | undefined>;
  getFeaturedClubs(limit?: number): Promise<Club[]>;
  createClub(club: InsertClub): Promise<Club>;
  addClubCategory(clubCategory: InsertClubCategory): Promise<ClubCategory>;
  
  // RSVP methods
  createEventRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  getEventRsvpsByEventId(eventId: number): Promise<EventRsvp[]>;
  
  // Club membership methods
  createClubMember(member: InsertClubMember): Promise<ClubMember>;
  getClubMembersByClubId(clubId: number): Promise<ClubMember[]>;
  
  // Waitlist methods
  addToWaitlist(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  isEmailOnWaitlist(email: string): Promise<boolean>;
  
  // Chat methods
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByConversationId(conversationId: number): Promise<ChatMessage[]>;
  
  // Event Reactions methods
  createEventReaction(reaction: InsertEventReaction): Promise<EventReaction>;
  getEventReactionsByEventId(eventId: number): Promise<EventReaction[]>;
  getEventReactionCounts(eventId: number, userId?: number): Promise<EventReactionCount[]>;
  toggleEventReaction(eventId: number, userId: number, emoji: string): Promise<EventReaction | null>;
  
  // User Calendar Events methods
  addEventToCalendar(calendarEvent: InsertUserCalendarEvent): Promise<UserCalendarEvent>;
  removeEventFromCalendar(userId: number, eventId: number): Promise<boolean>;
  getUserCalendarEvents(userId: number): Promise<Event[]>;
  isEventInUserCalendar(userId: number, eventId: number): Promise<boolean>;
  
  // User preferences and profiles methods
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  getUserWithProfile(userId: number): Promise<UserWithProfile | undefined>;
  
  // Achievement and badges methods
  getAllAchievementTypes(): Promise<AchievementType[]>;
  getAchievementType(id: number): Promise<AchievementType | undefined>;
  createAchievementType(achievementType: InsertAchievementType): Promise<AchievementType>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { type: AchievementType })[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievementProgress(userId: number, achievementId: number, progress: number): Promise<UserAchievement>;
  
  // Social sharing methods
  createEventShare(share: InsertEventShare): Promise<EventShare>;
  getEventSharesByEventId(eventId: number): Promise<EventShare[]>;
  getEventSharesByUserId(userId: number): Promise<EventShare[]>;
  
  // Recommendation engine methods
  getRecommendedEventsForUser(userId: number, limit?: number): Promise<EventWithSuggestionMetadata[]>;
  createAiSuggestionFeedback(feedback: InsertAiSuggestionFeedback): Promise<AiSuggestionFeedback>;
  getAiSuggestionFeedbackByUser(userId: number): Promise<AiSuggestionFeedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private events: Map<number, Event>;
  private eventCategories: EventCategory[];
  private clubs: Map<number, Club>;
  private clubCategories: ClubCategory[];
  private eventRsvps: EventRsvp[];
  private clubMembers: ClubMember[];
  private waitlistEntries: Map<number, WaitlistEntry>;
  private chatConversations: Map<number, ChatConversation>;
  private chatMessages: Map<number, ChatMessage>;
  private eventReactions: EventReaction[];
  private userCalendarEvents: UserCalendarEvent[] = [];
  private userPreferences: Map<number, UserPreferences>;
  private userProfiles: Map<number, UserProfile>;
  private achievementTypes: Map<number, AchievementType>;
  private userAchievements: UserAchievement[];
  private eventShares: EventShare[];
  private aiSuggestionFeedback: AiSuggestionFeedback[];
  
  private userId: number;
  private categoryId: number;
  private eventId: number;
  private clubId: number;
  private waitlistId: number;
  private conversationId: number;
  private messageId: number;
  private reactionId: number;
  private preferenceId: number;
  private profileId: number;
  private achievementTypeId: number;
  private achievementId: number;
  private shareId: number;
  private feedbackId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.events = new Map();
    this.eventCategories = [];
    this.clubs = new Map();
    this.clubCategories = [];
    this.eventRsvps = [];
    this.clubMembers = [];
    this.waitlistEntries = new Map();
    this.chatConversations = new Map();
    this.chatMessages = new Map();
    this.eventReactions = [];
    this.userCalendarEvents = [];
    this.userPreferences = new Map();
    this.userProfiles = new Map();
    this.achievementTypes = new Map();
    this.userAchievements = [];
    this.eventShares = [];
    this.aiSuggestionFeedback = [];
    
    this.userId = 1;
    this.categoryId = 1;
    this.eventId = 1;
    this.clubId = 1;
    this.waitlistId = 1;
    this.conversationId = 1;
    this.messageId = 1;
    this.reactionId = 1;
    this.preferenceId = 1;
    this.profileId = 1;
    this.achievementTypeId = 1;
    this.achievementId = 1;
    this.shareId = 1;
    this.feedbackId = 1;
    
    // Initialize default categories
    const defaultCategories: InsertCategory[] = [
      { name: "Sports", color: "#4CAF50", isDefault: true, createdBy: null },
      { name: "Academic", color: "#2196F3", isDefault: true, createdBy: null },
      { name: "Arts", color: "#F44336", isDefault: true, createdBy: null },
      { name: "Cultural", color: "#9C27B0", isDefault: true, createdBy: null },
      { name: "Professional", color: "#FF9800", isDefault: true, createdBy: null },
      { name: "Social", color: "#795548", isDefault: true, createdBy: null },
    ];
    
    defaultCategories.forEach(cat => this.createCategory(cat));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventWithCategories(id: number): Promise<EventWithCategories | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const organizer = this.users.get(event.organizerId);
    if (!organizer) return undefined;
    
    const eventCategoryIds = this.eventCategories
      .filter(ec => ec.eventId === id)
      .map(ec => ec.categoryId);
    
    const eventCategories = eventCategoryIds
      .map(categoryId => this.categories.get(categoryId))
      .filter((cat): cat is Category => cat !== undefined);
    
    return {
      ...event,
      categories: eventCategories,
      organizer
    };
  }
  
  async getFeaturedEvents(limit: number = 5): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.featured)
      .slice(0, limit);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const now = new Date();
    const event: Event = { ...insertEvent, id, createdAt: now };
    this.events.set(id, event);
    return event;
  }
  
  async addEventCategory(eventCategory: InsertEventCategory): Promise<EventCategory> {
    this.eventCategories.push(eventCategory);
    return eventCategory;
  }
  
  // Club methods
  async getAllClubs(): Promise<Club[]> {
    return Array.from(this.clubs.values());
  }
  
  async getClub(id: number): Promise<Club | undefined> {
    return this.clubs.get(id);
  }
  
  async getClubWithCategories(id: number): Promise<ClubWithCategories | undefined> {
    const club = this.clubs.get(id);
    if (!club) return undefined;
    
    const president = this.users.get(club.presidentId);
    if (!president) return undefined;
    
    const clubCategoryIds = this.clubCategories
      .filter(cc => cc.clubId === id)
      .map(cc => cc.categoryId);
    
    const clubCategories = clubCategoryIds
      .map(categoryId => this.categories.get(categoryId))
      .filter((cat): cat is Category => cat !== undefined);
    
    return {
      ...club,
      categories: clubCategories,
      president
    };
  }
  
  async getFeaturedClubs(limit: number = 5): Promise<Club[]> {
    return Array.from(this.clubs.values())
      .filter(club => club.featured)
      .slice(0, limit);
  }
  
  async createClub(insertClub: InsertClub): Promise<Club> {
    const id = this.clubId++;
    const now = new Date();
    const club: Club = { ...insertClub, id, createdAt: now };
    this.clubs.set(id, club);
    return club;
  }
  
  async addClubCategory(clubCategory: InsertClubCategory): Promise<ClubCategory> {
    this.clubCategories.push(clubCategory);
    return clubCategory;
  }
  
  // RSVP methods
  async createEventRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp> {
    const now = new Date();
    const eventRsvp: EventRsvp = { ...rsvp, createdAt: now };
    this.eventRsvps.push(eventRsvp);
    return eventRsvp;
  }
  
  async getEventRsvpsByEventId(eventId: number): Promise<EventRsvp[]> {
    return this.eventRsvps.filter(rsvp => rsvp.eventId === eventId);
  }
  
  // Club membership methods
  async createClubMember(member: InsertClubMember): Promise<ClubMember> {
    const now = new Date();
    const clubMember: ClubMember = { ...member, joinedAt: now };
    this.clubMembers.push(clubMember);
    return clubMember;
  }
  
  async getClubMembersByClubId(clubId: number): Promise<ClubMember[]> {
    return this.clubMembers.filter(member => member.clubId === clubId);
  }
  
  // Waitlist methods
  async addToWaitlist(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const id = this.waitlistId++;
    const now = new Date();
    const waitlistEntry: WaitlistEntry = { ...entry, id, createdAt: now };
    this.waitlistEntries.set(id, waitlistEntry);
    return waitlistEntry;
  }
  
  async isEmailOnWaitlist(email: string): Promise<boolean> {
    return Array.from(this.waitlistEntries.values()).some(
      (entry) => entry.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  // Chat methods
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const id = this.conversationId++;
    const now = new Date();
    const chatConversation: ChatConversation = { ...conversation, id, createdAt: now };
    this.chatConversations.set(id, chatConversation);
    return chatConversation;
  }
  
  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    return this.chatConversations.get(id);
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageId++;
    const now = new Date();
    const chatMessage: ChatMessage = { ...message, id, createdAt: now };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }
  
  async getChatMessagesByConversationId(conversationId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Event Reactions methods
  async createEventReaction(reaction: InsertEventReaction): Promise<EventReaction> {
    const id = this.reactionId++;
    const now = new Date();
    const eventReaction: EventReaction = { ...reaction, id, createdAt: now };
    this.eventReactions.push(eventReaction);
    return eventReaction;
  }

  async getEventReactionsByEventId(eventId: number): Promise<EventReaction[]> {
    return this.eventReactions.filter(reaction => reaction.eventId === eventId);
  }

  async getEventReactionCounts(eventId: number, userId?: number): Promise<EventReactionCount[]> {
    const eventReactions = this.getEventReactionsByEventId(eventId);
    
    // Group reactions by emoji and count them
    const emojiCounts = new Map<string, number>();
    const userReacted = new Map<string, boolean>();
    
    for (const reaction of await eventReactions) {
      const count = emojiCounts.get(reaction.emoji) || 0;
      emojiCounts.set(reaction.emoji, count + 1);
      
      // Check if the current user has reacted with this emoji
      if (userId && reaction.userId === userId) {
        userReacted.set(reaction.emoji, true);
      }
    }
    
    // Convert to the expected format
    return Array.from(emojiCounts.entries()).map(([emoji, count]) => ({
      emoji,
      count,
      userReacted: userId ? userReacted.get(emoji) || false : false,
    }));
  }

  async toggleEventReaction(eventId: number, userId: number, emoji: string): Promise<EventReaction | null> {
    // Check if the user has already reacted with this emoji
    const existingReaction = this.eventReactions.find(
      r => r.eventId === eventId && r.userId === userId && r.emoji === emoji
    );
    
    if (existingReaction) {
      // If reaction exists, remove it (toggle off)
      this.eventReactions = this.eventReactions.filter(r => r !== existingReaction);
      return null;
    } else {
      // If reaction doesn't exist, create it (toggle on)
      return this.createEventReaction({ eventId, userId, emoji });
    }
  }

  // User Calendar Event methods
  async addEventToCalendar(calendarEvent: InsertUserCalendarEvent): Promise<UserCalendarEvent> {
    const now = new Date();
    const newCalendarEvent: UserCalendarEvent = {
      ...calendarEvent,
      id: this.eventId++,
      addedAt: now
    };
    
    // Check if the event already exists in the calendar
    const exists = await this.isEventInUserCalendar(calendarEvent.userId, calendarEvent.eventId);
    if (!exists) {
      this.userCalendarEvents.push(newCalendarEvent);
    }
    
    return newCalendarEvent;
  }
  
  async removeEventFromCalendar(userId: number, eventId: number): Promise<boolean> {
    const initialLength = this.userCalendarEvents.length;
    this.userCalendarEvents = this.userCalendarEvents.filter(
      uce => !(uce.userId === userId && uce.eventId === eventId)
    );
    return initialLength > this.userCalendarEvents.length;
  }
  
  async getUserCalendarEvents(userId: number): Promise<Event[]> {
    // Get all event IDs in the user's calendar
    const eventIds = this.userCalendarEvents
      .filter(uce => uce.userId === userId)
      .map(uce => uce.eventId);
    
    // Get the full event objects
    return Array.from(this.events.values())
      .filter(event => eventIds.includes(event.id))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async isEventInUserCalendar(userId: number, eventId: number): Promise<boolean> {
    return this.userCalendarEvents.some(
      uce => uce.userId === userId && uce.eventId === eventId
    );
  }
  
  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }
  
  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.preferenceId++;
    const now = new Date();
    const userPreference: UserPreferences = { ...preferences, id, updatedAt: now };
    this.userPreferences.set(preferences.userId, userPreference);
    return userPreference;
  }
  
  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existingPreferences = this.userPreferences.get(userId);
    const now = new Date();
    
    if (existingPreferences) {
      // Update existing preferences
      const updatedPreferences: UserPreferences = { 
        ...existingPreferences, 
        ...preferences, 
        updatedAt: now 
      };
      this.userPreferences.set(userId, updatedPreferences);
      return updatedPreferences;
    } else {
      // Create new preferences if they don't exist
      return this.createUserPreferences({ 
        userId, 
        preferredCategories: preferences.preferredCategories || [],
        preferredDaysOfWeek: preferences.preferredDaysOfWeek || [],
        preferredTimeOfDay: preferences.preferredTimeOfDay || [],
        locationPreference: preferences.locationPreference || "",
      });
    }
  }
  
  // User Profile methods
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    return this.userProfiles.get(userId);
  }
  
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = this.profileId++;
    const now = new Date();
    const userProfile: UserProfile = { ...profile, id, updatedAt: now };
    this.userProfiles.set(profile.userId, userProfile);
    return userProfile;
  }
  
  async updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const existingProfile = this.userProfiles.get(userId);
    const now = new Date();
    
    if (existingProfile) {
      // Update existing profile
      const updatedProfile: UserProfile = { 
        ...existingProfile, 
        ...profile, 
        updatedAt: now 
      };
      this.userProfiles.set(userId, updatedProfile);
      return updatedProfile;
    } else {
      // Create new profile if it doesn't exist
      return this.createUserProfile({ 
        userId, 
        bio: profile.bio || "",
        profilePicture: profile.profilePicture || "",
        socialLinks: profile.socialLinks || {},
        interests: profile.interests || [],
        visibility: profile.visibility || "public"
      });
    }
  }
  
  async getUserWithProfile(userId: number): Promise<UserWithProfile | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const profile = this.userProfiles.get(userId) || await this.createUserProfile({
      userId,
      bio: "",
      profilePicture: "",
      socialLinks: {},
      interests: [],
      visibility: "public"
    });
    
    const preferences = this.userPreferences.get(userId) || await this.createUserPreferences({
      userId,
      preferredCategories: [],
      preferredDaysOfWeek: [],
      preferredTimeOfDay: [],
      locationPreference: ""
    });
    
    const achievements = this.userAchievements
      .filter(achievement => achievement.userId === userId)
      .map(achievement => {
        const achievementType = this.achievementTypes.get(achievement.achievementId);
        if (!achievementType) return undefined;
        return { ...achievement, type: achievementType };
      })
      .filter((achievement): achievement is UserAchievement & { type: AchievementType } => 
        achievement !== undefined
      );
    
    return {
      ...user,
      profile,
      preferences,
      achievements
    };
  }
  
  // Achievement and Badges methods
  async getAllAchievementTypes(): Promise<AchievementType[]> {
    return Array.from(this.achievementTypes.values());
  }
  
  async getAchievementType(id: number): Promise<AchievementType | undefined> {
    return this.achievementTypes.get(id);
  }
  
  async createAchievementType(achievementType: InsertAchievementType): Promise<AchievementType> {
    const id = this.achievementTypeId++;
    const now = new Date();
    const newAchievementType: AchievementType = { ...achievementType, id, createdAt: now };
    this.achievementTypes.set(id, newAchievementType);
    return newAchievementType;
  }
  
  async getUserAchievements(userId: number): Promise<(UserAchievement & { type: AchievementType })[]> {
    const userAchievements = this.userAchievements.filter(achievement => achievement.userId === userId);
    
    return userAchievements
      .map(achievement => {
        const achievementType = this.achievementTypes.get(achievement.achievementId);
        if (!achievementType) return undefined;
        return { ...achievement, type: achievementType };
      })
      .filter((achievement): achievement is UserAchievement & { type: AchievementType } => 
        achievement !== undefined
      );
  }
  
  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.achievementId++;
    const now = new Date();
    const userAchievement: UserAchievement = { ...achievement, id, earnedAt: now };
    
    // Check if the user already has this achievement
    const existingAchievement = this.userAchievements.find(
      a => a.userId === achievement.userId && a.achievementId === achievement.achievementId
    );
    
    if (!existingAchievement) {
      this.userAchievements.push(userAchievement);
    }
    
    return userAchievement;
  }
  
  async updateUserAchievementProgress(userId: number, achievementId: number, progress: number): Promise<UserAchievement> {
    const existingAchievement = this.userAchievements.find(
      a => a.userId === userId && a.achievementId === achievementId
    );
    
    if (existingAchievement) {
      // Update existing achievement
      existingAchievement.progress = Math.min(100, Math.max(0, progress));
      return existingAchievement;
    } else {
      // Create new achievement
      return this.createUserAchievement({
        userId,
        achievementId,
        progress: Math.min(100, Math.max(0, progress)),
        displayed: true
      });
    }
  }
  
  // Social Sharing methods
  async createEventShare(share: InsertEventShare): Promise<EventShare> {
    const id = this.shareId++;
    const now = new Date();
    const eventShare: EventShare = { ...share, id, sharedAt: now };
    this.eventShares.push(eventShare);
    return eventShare;
  }
  
  async getEventSharesByEventId(eventId: number): Promise<EventShare[]> {
    return this.eventShares.filter(share => share.eventId === eventId);
  }
  
  async getEventSharesByUserId(userId: number): Promise<EventShare[]> {
    return this.eventShares.filter(share => share.userId === userId);
  }
  
  // AI Recommendation methods
  async getRecommendedEventsForUser(userId: number, limit: number = 5): Promise<EventWithSuggestionMetadata[]> {
    const userPreferences = await this.getUserPreferences(userId);
    const allEvents = await this.getAllEvents();
    
    // If no preferences are set, return featured events
    if (!userPreferences || !userPreferences.preferredCategories || userPreferences.preferredCategories.length === 0) {
      const featuredEvents = await this.getFeaturedEvents(limit);
      return featuredEvents.map(event => ({
        ...event,
        relevanceScore: 0.5,
        matchedPreferences: ["featured"],
        suggestedReason: "This is a featured event that might interest you."
      }));
    }
    
    // Score events based on user preferences
    const scoredEvents = await Promise.all(allEvents.map(async (event) => {
      let score = 0;
      const matchedPreferences: string[] = [];
      
      // Check category match
      const eventWithCats = await this.getEventWithCategories(event.id);
      if (eventWithCats) {
        const categoryMatches = eventWithCats.categories.filter(
          cat => userPreferences.preferredCategories.includes(cat.id)
        );
        
        if (categoryMatches.length > 0) {
          score += 0.4 * (categoryMatches.length / eventWithCats.categories.length);
          matchedPreferences.push("categories");
        }
      }
      
      // Check day of week match
      if (userPreferences.preferredDaysOfWeek && userPreferences.preferredDaysOfWeek.length > 0) {
        const eventDay = new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (userPreferences.preferredDaysOfWeek.some(day => day.toLowerCase() === eventDay)) {
          score += 0.2;
          matchedPreferences.push("day of week");
        }
      }
      
      // Check time of day match
      if (userPreferences.preferredTimeOfDay && userPreferences.preferredTimeOfDay.length > 0) {
        const hour = new Date(event.startTime).getHours();
        const timeOfDay = 
          hour < 12 ? "morning" :
          hour < 17 ? "afternoon" :
          hour < 20 ? "evening" : "night";
          
        if (userPreferences.preferredTimeOfDay.includes(timeOfDay)) {
          score += 0.2;
          matchedPreferences.push("time of day");
        }
      }
      
      // Check location match
      if (userPreferences.locationPreference && 
          event.location.toLowerCase().includes(userPreferences.locationPreference.toLowerCase())) {
        score += 0.2;
        matchedPreferences.push("location");
      }
      
      // Bonus for featured events
      if (event.featured) {
        score += 0.1;
        matchedPreferences.push("featured");
      }
      
      // Generate reason based on matched preferences
      let suggestedReason = "This event might interest you";
      if (matchedPreferences.length > 0) {
        suggestedReason += " based on your preferences for " + matchedPreferences.join(", ");
      }
      
      return {
        ...event,
        relevanceScore: score,
        matchedPreferences,
        suggestedReason
      };
    }));
    
    // Sort by score and return top results
    return scoredEvents
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
  
  async createAiSuggestionFeedback(feedback: InsertAiSuggestionFeedback): Promise<AiSuggestionFeedback> {
    const id = this.feedbackId++;
    const now = new Date();
    const aiSuggestion: AiSuggestionFeedback = { ...feedback, id, createdAt: now };
    this.aiSuggestionFeedback.push(aiSuggestion);
    return aiSuggestion;
  }
  
  async getAiSuggestionFeedbackByUser(userId: number): Promise<AiSuggestionFeedback[]> {
    return this.aiSuggestionFeedback.filter(feedback => feedback.userId === userId);
  }
}

export const storage = new MemStorage();
