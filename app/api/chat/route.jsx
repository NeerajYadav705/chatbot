// import { healthModel, safetySettings } from "@/lib/gemini";

import { healthModel , safetySettings } from "@/app/lib/gemini";


export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Validate request
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get last user message
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content;

    if (!lastUserMessage?.trim()) {
      return new Response(
        JSON.stringify({ error: "Empty or invalid message" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Start chat session
    const chat = healthModel.startChat({ safetySettings });

    // Get response
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ 
        content: `${text}\n\nℹ️ Note: Always consult a healthcare professional for medical advice.`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error:', error);
    
    let errorMessage = "I'm unable to respond right now. Please try again.";
    if (error.message.includes('400')) {
      errorMessage = "I can't process that request. Please ask differently.";
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}