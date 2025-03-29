import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, suggestEventCategories } from "./openai";
import { fetchAllLocalEvents, suggestCategoryForEvent } from "./api/localEvents";
import { 
  generateCalendarFile, 
  sendCalendarFile, 
  generateSingleEventCalendarFile,
  generateCalendarFilename 
} from "./api/calendar";
import { 
  insertUserSchema, 
  insertWaitlistSchema, 
  insertCategorySchema,
  insertEventSchema,
  insertClubSchema,
  insertEventCategorySchema,
  insertClubCategorySchema,
  insertEventRsvpSchema,
  insertClubMemberSchema,
  insertChatConversationSchema,
  insertChatMessageSchema,
  insertEventReactionSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const httpServer = createServer(app);

  // Error handling middleware for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({
        message: validationError.message,
      });
    }
    
    console.error(error);
    return res.status(500).json({
      message: "An unexpected error occurred.",
    });
  };

  // Waitlist API
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      const waitlistEntry = insertWaitlistSchema.parse(req.body);
      
      // Check if email already exists in waitlist
      const emailExists = await storage.isEmailOnWaitlist(waitlistEntry.email);
      if (emailExists) {
        return res.status(409).json({
          message: "This email is already on the waitlist.",
        });
      }
      
      const result = await storage.addToWaitlist(waitlistEntry);
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Categories API
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching categories." });
    }
  });
  
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      
      // Check if category name already exists
      const existingCategory = await storage.getCategoryByName(category.name);
      if (existingCategory) {
        return res.status(409).json({
          message: "A category with this name already exists.",
        });
      }
      
      const result = await storage.createCategory(category);
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Events API
  // Local Events API - Placed BEFORE the :id param route to avoid conflict
  app.get("/api/events/local-events", async (req: Request, res: Response) => {
    try {
      const city = req.query.city as string || 'State College';
      const state = req.query.state as string || 'PA';
      
      console.log(`Fetching local events for ${city}, ${state}`);
      const localEvents = await fetchAllLocalEvents(city, state);
      console.log(`Found ${localEvents.length} local events`);
      
      // Get all existing categories for reference
      const allCategories = await storage.getAllCategories();
      
      // Process events to include category information
      const enhancedEvents = localEvents.map(event => {
        // For each event, suggest a category based on name/description
        const suggestedCategoryName = suggestCategoryForEvent(event);
        
        // Find if this category already exists
        let matchingCategory = allCategories.find(c => 
          c.name.toLowerCase() === suggestedCategoryName.toLowerCase()
        );
        
        // If not found, we'll create a virtual one just for display
        if (!matchingCategory) {
          // Generate a consistent color based on category name
          // Default color is gray
          let color = '#607D8B';
          
          // Map specific category names to colors
          if (suggestedCategoryName === 'Music') {
            color = '#2196F3'; // Blue
          } else if (suggestedCategoryName === 'Sports') {
            color = '#4CAF50'; // Green
          } else if (suggestedCategoryName === 'Academic') {
            color = '#FF9800'; // Orange
          } else if (suggestedCategoryName === 'Social') {
            color = '#9C27B0'; // Purple
          } else if (suggestedCategoryName === 'Community Service') {
            color = '#795548'; // Brown
          } else if (suggestedCategoryName === 'Arts & Culture') {
            color = '#E91E63'; // Pink
          } else if (suggestedCategoryName === 'Other') {
            color = '#607D8B'; // Gray
          }
          
          matchingCategory = {
            id: 1000 + allCategories.length + 1, // Virtual ID starting from 1000
            name: suggestedCategoryName,
            color: color,
            isDefault: false,
            createdBy: null
          };
        }
        
        // We don't modify the event itself, but we'll add a virtual
        // property for the frontend to use for display purposes
        const eventWithVirtualProp = {
          ...event,
          __suggestedCategory: matchingCategory
        };
        
        return eventWithVirtualProp;
      });
      
      res.json(enhancedEvents);
    } catch (error) {
      console.error("Error fetching local events:", error);
      res.status(500).json({ message: "Error fetching local events." });
    }
  });

  // Order is important: specific routes before parameterized routes
  app.get("/api/events/featured", async (_req: Request, res: Response) => {
    try {
      const limit = Number(_req.query.limit) || 5;
      const featuredEvents = await storage.getFeaturedEvents(limit);
      res.json(featuredEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching featured events." });
    }
  });
  
  app.get("/api/events", async (_req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching events." });
    }
  });
  
  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }
      
      const event = await storage.getEventWithCategories(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      
      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching event details." });
    }
  });
  
  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const event = insertEventSchema.parse(req.body);
      const result = await storage.createEvent(event);
      
      // Handle categories if provided in the request body
      if (req.body.categoryIds && Array.isArray(req.body.categoryIds)) {
        for (const categoryId of req.body.categoryIds) {
          await storage.addEventCategory({
            eventId: result.id,
            categoryId
          });
        }
      }
      
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.post("/api/events/:id/categories", async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      
      const eventCategory = insertEventCategorySchema.parse({ 
        ...req.body, 
        eventId 
      });
      
      const result = await storage.addEventCategory(eventCategory);
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.post("/api/events/:id/rsvp", async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      
      const rsvp = insertEventRsvpSchema.parse({
        ...req.body,
        eventId
      });
      
      const result = await storage.createEventRsvp(rsvp);
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Event Reactions endpoints
  app.get("/api/events/:id/reactions", async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      
      // For now, we assume a userId might be provided in query params
      // In a real app, this would come from the authenticated user
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const reactionCounts = await storage.getEventReactionCounts(eventId, userId);
      res.json(reactionCounts);
    } catch (error) {
      console.error("Error getting event reactions:", error);
      res.status(500).json({ error: "Failed to get event reactions" });
    }
  });
  
  app.post("/api/events/:id/reactions", async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      
      // Validate request body
      if (!req.body || typeof req.body.emoji !== 'string') {
        return res.status(400).json({ error: "Emoji is required" });
      }
      
      // For now, we assume a fixed userId for demonstration
      // In a real app, this would come from the authenticated user
      const userId = 1; // Mock user ID for demonstration
      
      await storage.toggleEventReaction(eventId, userId, req.body.emoji);
      
      // Return updated reaction counts
      const reactionCounts = await storage.getEventReactionCounts(eventId, userId);
      res.json(reactionCounts);
    } catch (error) {
      console.error("Error toggling event reaction:", error);
      res.status(500).json({ error: "Failed to toggle event reaction" });
    }
  });

  // Clubs API
  app.get("/api/clubs", async (_req: Request, res: Response) => {
    try {
      const clubs = await storage.getAllClubs();
      res.json(clubs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching clubs." });
    }
  });
  
  app.get("/api/clubs/featured", async (_req: Request, res: Response) => {
    try {
      const limit = Number(_req.query.limit) || 5;
      const featuredClubs = await storage.getFeaturedClubs(limit);
      res.json(featuredClubs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching featured clubs." });
    }
  });
  
  app.get("/api/clubs/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid club ID." });
      }
      
      const club = await storage.getClubWithCategories(id);
      if (!club) {
        return res.status(404).json({ message: "Club not found." });
      }
      
      res.json(club);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching club details." });
    }
  });
  
  app.post("/api/clubs", async (req: Request, res: Response) => {
    try {
      const club = insertClubSchema.parse(req.body);
      const result = await storage.createClub(club);
      
      // Handle categories if provided in the request body
      if (req.body.categoryIds && Array.isArray(req.body.categoryIds)) {
        for (const categoryId of req.body.categoryIds) {
          await storage.addClubCategory({
            clubId: result.id,
            categoryId
          });
        }
      }
      
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.post("/api/clubs/:id/categories", async (req: Request, res: Response) => {
    try {
      const clubId = Number(req.params.id);
      if (isNaN(clubId)) {
        return res.status(400).json({ message: "Invalid club ID." });
      }
      
      const club = await storage.getClub(clubId);
      if (!club) {
        return res.status(404).json({ message: "Club not found." });
      }
      
      const clubCategory = insertClubCategorySchema.parse({ 
        ...req.body, 
        clubId 
      });
      
      const result = await storage.addClubCategory(clubCategory);
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.post("/api/clubs/:id/members", async (req: Request, res: Response) => {
    try {
      const clubId = Number(req.params.id);
      if (isNaN(clubId)) {
        return res.status(400).json({ message: "Invalid club ID." });
      }
      
      const club = await storage.getClub(clubId);
      if (!club) {
        return res.status(404).json({ message: "Club not found." });
      }
      
      const member = insertClubMemberSchema.parse({
        ...req.body,
        clubId
      });
      
      const result = await storage.createClubMember(member);
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // AI Chat API
  app.post("/api/chat/conversations", async (req: Request, res: Response) => {
    try {
      const conversation = insertChatConversationSchema.parse(req.body);
      const result = await storage.createChatConversation(conversation);
      res.status(201).json(result);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.get("/api/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid conversation ID." });
      }
      
      const conversation = await storage.getChatConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }
      
      const messages = await storage.getChatMessagesByConversationId(id);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching chat messages." });
    }
  });
  
  app.post("/api/chat/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = Number(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID." });
      }
      
      const conversation = await storage.getChatConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }
      
      // Save the user message
      const userMessage = insertChatMessageSchema.parse({
        conversationId,
        content: req.body.content,
        isFromUser: true
      });
      
      await storage.createChatMessage(userMessage);
      
      // Get all messages for this conversation to build context
      const allMessages = await storage.getChatMessagesByConversationId(conversationId);
      
      // Format messages for OpenAI
      const formattedMessages = allMessages.map(msg => ({
        role: msg.isFromUser ? "user" as const : "assistant" as const,
        content: msg.content
      }));
      
      // Get campus data for the AI
      const events = await storage.getAllEvents();
      const clubs = await storage.getAllClubs();
      const categories = await storage.getAllCategories();
      
      // Generate AI response
      const aiResponseContent = await generateChatResponse(
        formattedMessages, 
        { events, clubs, categories }
      );
      
      // Save the AI response
      const aiMessage = await storage.createChatMessage({
        conversationId,
        content: aiResponseContent,
        isFromUser: false
      });
      
      res.status(201).json(aiMessage);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // AI Category Suggestion API
  app.post("/api/ai/suggest-categories", async (req: Request, res: Response) => {
    try {
      const { description } = req.body;
      
      if (!description || typeof description !== 'string') {
        return res.status(400).json({ message: "Event description is required." });
      }
      
      const categories = await storage.getAllCategories();
      const simplifiedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name
      }));
      
      const suggestedCategoryIds = await suggestEventCategories(
        description,
        simplifiedCategories
      );
      
      res.json({ categoryIds: suggestedCategoryIds });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error suggesting categories." });
    }
  });

  // User Calendar Events routes
  app.post("/api/events/:id/calendar", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, notes, reminderTime } = req.body;
      
      // Validate input
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      // Check if event exists
      const event = await storage.getEvent(Number(id));
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Add or update the calendar event
      const calendarEvent = await storage.addEventToCalendar({
        userId: Number(userId),
        eventId: Number(id),
        notes,
        reminderTime: reminderTime ? new Date(reminderTime) : undefined
      });
      
      return res.status(201).json(calendarEvent);
    } catch (error) {
      console.error("Error adding event to calendar:", error);
      return res.status(500).json({ error: "Failed to add event to calendar" });
    }
  });
  
  app.delete("/api/events/:id/calendar", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      // Validate input
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      // Remove from calendar
      const removed = await storage.removeEventFromCalendar(Number(userId), Number(id));
      
      if (removed) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ error: "Event not found in user's calendar" });
      }
    } catch (error) {
      console.error("Error removing event from calendar:", error);
      return res.status(500).json({ error: "Failed to remove event from calendar" });
    }
  });
  
  app.get("/api/users/:userId/calendar", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const calendarEvents = await storage.getUserCalendarEvents(Number(userId));
      
      return res.status(200).json(calendarEvents);
    } catch (error) {
      console.error("Error fetching user calendar:", error);
      return res.status(500).json({ error: "Failed to fetch user calendar" });
    }
  });
  
  app.get("/api/events/:id/calendar/:userId", async (req: Request, res: Response) => {
    try {
      const { id, userId } = req.params;
      
      const isInCalendar = await storage.isEventInUserCalendar(Number(userId), Number(id));
      
      return res.status(200).json({ isInCalendar });
    } catch (error) {
      console.error("Error checking calendar status:", error);
      return res.status(500).json({ error: "Failed to check calendar status" });
    }
  });
  
  // Calendar export endpoints
  
  // Export a single event as .ics file
  app.get("/api/events/:id/export/ics", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      
      // Generate .ics file for this event
      const icsContent = await generateSingleEventCalendarFile(event);
      
      // Generate filename with event ID
      const filename = generateCalendarFilename('campusconnect', id);
      
      // Send the file as download
      sendCalendarFile(res, icsContent, filename);
    } catch (error) {
      console.error("Error exporting event to calendar:", error);
      res.status(500).json({ message: "Error exporting event to calendar." });
    }
  });
  
  // Export all user calendar events as .ics file
  app.get("/api/users/:userId/calendar/export/ics", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID." });
      }
      
      // Get all user's calendar events
      const calendarEvents = await storage.getUserCalendarEvents(userId);
      
      // Generate .ics file for all events
      const icsContent = await generateCalendarFile(calendarEvents);
      
      if (!icsContent) {
        return res.status(404).json({ message: "No calendar events found." });
      }
      
      // Generate filename for all calendar events
      const filename = generateCalendarFilename('campusconnect');
      
      // Send the file as download
      sendCalendarFile(res, icsContent, filename);
    } catch (error) {
      console.error("Error exporting calendar:", error);
      res.status(500).json({ message: "Error exporting calendar." });
    }
  });

  return httpServer;
}
