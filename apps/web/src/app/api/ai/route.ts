import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query, tool } = await req.json();
    
    // Use the Groq API Key from process.env
    const apiKey = process.env['GROQ_API_KEY'];
    
    if (!apiKey) {
      return NextResponse.json({ text: "API Key is missing on the server. Please add GROQ_API_KEY to your environment variables." }, { status: 500 });
    }
    
    let messages = [];

    if (tool === "AI Copilot") {
      messages = [
        { role: "system", content: "You are a helpful AI programming Copilot. Answer the user's coding and technical questions clearly and concisely. Provide code examples when relevant." },
        { role: "user", content: query }
      ];
    } else {
      // Deep Research Agent - use Jina Reader + DuckDuckGo to get search results
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const jinaRes = await fetch(`https://r.jina.ai/${searchUrl}`);
      const searchMarkdown = await jinaRes.text();
      
      messages = [
        { role: "system", content: "You are a Deep Research Agent. You have been provided with web search results in Markdown format. Synthesize a detailed, factual, and comprehensive answer to the user's query using only the provided search results. Structure your response with clear headings or bullet points." },
        { role: "user", content: `Search Results:\n\n${searchMarkdown.substring(0, 4000)}\n\nUser Query: ${query}` }
      ];
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        max_tokens: 1024,
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ text: data.choices[0].message.content });
    } else {
      console.error("Groq API Error:", data);
      return NextResponse.json({ text: "I'm sorry, I couldn't generate a response at this time. Please try again." }, { status: 500 });
    }
  } catch (error) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ text: "An error occurred while communicating with the AI server." }, { status: 500 });
  }
}
