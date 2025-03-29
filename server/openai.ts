import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development'
});

// Function to generate a chat response based on the conversation history and campus data
export async function generateChatResponse(
  messages: { role: "user" | "assistant", content: string }[],
  campusData: {
    events: any[],
    clubs: any[],
    categories: any[]
  }
): Promise<string> {
  try {
    // Create a system message that has information about campus events and clubs
    const systemMessage = {
      role: "system",
      content: `You are an AI assistant for a campus events and clubs platform called CampusConnect. 
      You help students find information about events, clubs, and activities on campus.
      
      Here is the current data about campus events and clubs:
      
      Events: ${JSON.stringify(campusData.events)}
      
      Clubs: ${JSON.stringify(campusData.clubs)}
      
      Categories: ${JSON.stringify(campusData.categories)}
      
      When responding to questions about events or clubs, try to be specific and provide details like time, location, and descriptions.
      If a user wants to RSVP or join something, guide them on how to use the platform to do so.
      If you don't know the answer to a question, be honest and suggest they contact the appropriate university office or club.
      Be friendly, helpful, and concise in your responses.`
    };
    
    // Prepare the messages array with the system message first
    const fullMessages = [
      systemMessage,
      ...messages
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: fullMessages as any,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm experiencing some technical difficulties right now. Please try again later.";
  }
}

// Function to analyze an event description and suggest appropriate categories
export async function suggestEventCategories(
  description: string,
  availableCategories: { id: number, name: string }[]
): Promise<number[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a categorization assistant for campus events. Based on the event description, 
          suggest which categories from the available list best match the event. 
          Respond with a JSON array containing the category IDs.
          Available categories: ${JSON.stringify(availableCategories)}`
        },
        {
          role: "user",
          content: `Event description: ${description}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (Array.isArray(result.categoryIds)) {
      return result.categoryIds;
    }
    
    return [];
  } catch (error) {
    console.error("Error suggesting event categories:", error);
    return [];
  }
}
