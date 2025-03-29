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
  type EventWithCategories, type ClubWithCategories
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
  
  private userId: number;
  private categoryId: number;
  private eventId: number;
  private clubId: number;
  private waitlistId: number;
  private conversationId: number;
  private messageId: number;

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
    
    this.userId = 1;
    this.categoryId = 1;
    this.eventId = 1;
    this.clubId = 1;
    this.waitlistId = 1;
    this.conversationId = 1;
    this.messageId = 1;
    
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
}

export const storage = new MemStorage();
