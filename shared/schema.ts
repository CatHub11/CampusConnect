import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, primaryKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("student"),
  university: text("university"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  organizerId: integer("organizer_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  featured: boolean("featured").notNull().default(false),
  // Fields for external events
  externalId: text("external_id"),
  externalUrl: text("external_url"),
  source: text("source"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Event categories junction table
export const eventCategories = pgTable("event_categories", {
  eventId: integer("event_id").references(() => events.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.eventId, t.categoryId] }),
}));

export const insertEventCategorySchema = createInsertSchema(eventCategories);

// Clubs table
export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  meetingLocation: text("meeting_location"),
  foundedDate: timestamp("founded_date"),
  presidentId: integer("president_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  featured: boolean("featured").notNull().default(false),
});

export const insertClubSchema = createInsertSchema(clubs).omit({
  id: true,
  createdAt: true,
});

// Club categories junction table
export const clubCategories = pgTable("club_categories", {
  clubId: integer("club_id").references(() => clubs.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.clubId, t.categoryId] }),
}));

export const insertClubCategorySchema = createInsertSchema(clubCategories);

// User event RSVPs
export const eventRsvps = pgTable("event_rsvps", {
  userId: integer("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  status: text("status").notNull(), // attending, interested, not attending
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.eventId] }),
}));

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  createdAt: true,
});

// User club memberships
export const clubMembers = pgTable("club_members", {
  userId: integer("user_id").references(() => users.id).notNull(),
  clubId: integer("club_id").references(() => clubs.id).notNull(),
  role: text("role").notNull().default("member"), // member, officer, president
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.clubId] }),
}));

export const insertClubMemberSchema = createInsertSchema(clubMembers).omit({
  joinedAt: true,
});

// Waitlist entries
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  university: text("university").notNull(),
  role: text("role").notNull(),
  interests: text("interests").array(),
  wantsUpdates: boolean("wants_updates").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
});

// Chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatConversations.id).notNull(),
  content: text("content").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventCategory = typeof eventCategories.$inferSelect;
export type InsertEventCategory = z.infer<typeof insertEventCategorySchema>;

export type Club = typeof clubs.$inferSelect;
export type InsertClub = z.infer<typeof insertClubSchema>;

export type ClubCategory = typeof clubCategories.$inferSelect;
export type InsertClubCategory = z.infer<typeof insertClubCategorySchema>;

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;

export type ClubMember = typeof clubMembers.$inferSelect;
export type InsertClubMember = z.infer<typeof insertClubMemberSchema>;

export type WaitlistEntry = typeof waitlist.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistSchema>;

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Extended types with relations
export type EventWithCategories = Event & {
  categories: Category[];
  organizer: User;
};

export type ClubWithCategories = Club & {
  categories: Category[];
  president: User;
};

// Event Reactions Schema
export const eventReactions = pgTable("event_reactions", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventReactionSchema = createInsertSchema(eventReactions).omit({
  id: true,
  createdAt: true,
});

export type EventReaction = typeof eventReactions.$inferSelect;
export type InsertEventReaction = z.infer<typeof insertEventReactionSchema>;

export type EventReactionCount = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

// User Calendar Events schema
export const userCalendarEvents = pgTable("user_calendar_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  addedAt: timestamp("added_at").notNull().defaultNow(),
  reminderTime: timestamp("reminder_time"),
  notes: text("notes"),
});

export const insertUserCalendarEventSchema = createInsertSchema(userCalendarEvents).omit({
  id: true,
  addedAt: true,
});

export type UserCalendarEvent = typeof userCalendarEvents.$inferSelect;
export type InsertUserCalendarEvent = z.infer<typeof insertUserCalendarEventSchema>;

// User Preferences schema for event recommendations
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  preferredCategories: integer("preferred_categories").array(),
  preferredDaysOfWeek: text("preferred_days_of_week").array(),
  preferredTimeOfDay: text("preferred_time_of_day").array(), // morning, afternoon, evening, night
  locationPreference: text("location_preference"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  updatedAt: true,
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// User Profile schema for personification
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  socialLinks: json("social_links").$type<{
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  }>(),
  interests: text("interests").array(),
  visibility: text("visibility").notNull().default("public"), // public, friends, private
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  updatedAt: true,
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// User Achievements and Badges schema for gamification
export const achievementTypes = pgTable("achievement_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  points: integer("points").notNull().default(10),
  category: text("category").notNull(), // event, club, social, etc.
  requirements: json("requirements").$type<{
    count?: number;
    duration?: number;
    specific_categories?: number[];
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAchievementTypeSchema = createInsertSchema(achievementTypes).omit({
  id: true,
  createdAt: true,
});

export type AchievementType = typeof achievementTypes.$inferSelect;
export type InsertAchievementType = z.infer<typeof insertAchievementTypeSchema>;

// User earned achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievementTypes.id),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  progress: integer("progress").notNull().default(100), // percentage of completion 0-100
  displayed: boolean("displayed").notNull().default(true), // Whether to display on profile
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Event Sharing schema for social integration
export const eventShares = pgTable("event_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  platform: text("platform").notNull(), // twitter, facebook, etc.
  sharedContent: text("shared_content").notNull(),
  sharingUrl: text("sharing_url"),
  sharedAt: timestamp("shared_at").notNull().defaultNow(),
});

export const insertEventShareSchema = createInsertSchema(eventShares).omit({
  id: true,
  sharedAt: true,
});

export type EventShare = typeof eventShares.$inferSelect;
export type InsertEventShare = z.infer<typeof insertEventShareSchema>;

// AI Suggestion Feedback schema for dynamic learning
export const aiSuggestionFeedback = pgTable("ai_suggestion_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").references(() => events.id),
  clubId: integer("club_id").references(() => clubs.id),
  suggestionType: text("suggestion_type").notNull(), // event, category, club, etc.
  isRelevant: boolean("is_relevant"),
  feedbackText: text("feedback_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiSuggestionFeedbackSchema = createInsertSchema(aiSuggestionFeedback).omit({
  id: true,
  createdAt: true,
});

export type AiSuggestionFeedback = typeof aiSuggestionFeedback.$inferSelect;
export type InsertAiSuggestionFeedback = z.infer<typeof insertAiSuggestionFeedbackSchema>;

// Extended types with new relations
export type UserWithProfile = User & {
  profile: UserProfile;
  preferences: UserPreferences;
  achievements: (UserAchievement & { type: AchievementType })[];
};

export type EventWithSuggestionMetadata = Event & {
  relevanceScore: number;
  matchedPreferences: string[];
  suggestedReason: string;
};
