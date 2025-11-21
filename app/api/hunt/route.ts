import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    // 1. TAVILY SEARCH (Broader Search)
    // We explicitly ask for "Official Website" to help Tavily focus
    const searchResult = await tvly.search(`${query} official landing page software ai tool`, {
      searchDepth: "basic",
      maxResults: 8, // Get more results so we can filter out the trash
    });

    const contextText = searchResult.results.map((res: any) => 
      `URL: ${res.url}\nTITLE: ${res.title}\nCONTENT: ${res.content.slice(0, 200)}`
    ).join("\n\n");

    // 2. AI ANALYSIS (The Strict Librarian)
    const systemPrompt = `
    You are an AI Tool Auditor. User is looking for: "${query}".
    
    TASK:
    1. Find the Top 3 REAL AI tools from the search results.
    2. Extract TWO links for each tool:
       - "link": MUST be the OFFICIAL HOMEPAGE (e.g., .com, .ai, .io). 
         * CRITICAL: NEVER use Facebook, Instagram, Twitter, LinkedIn, Pinterest, or YouTube here.
         * If you can't find the official site, leave "link" empty.
       - "tutorial_link": A helpful blog post, review, or social media post about the tool.
    
    3. Write a short, punchy description.
    
    OUTPUT JSON ONLY:
    [
      {
        "title": "Tool Name",
        "description": "Short summary.",
        "link": "https://official-site.com", 
        "tutorial_link": "https://facebook.com/post-about-it",
        "tags": ["${query}", "AI"],
        "utility_score": 9
      }
    ]
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextText }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0,
    });

    const aiContent = completion.choices[0]?.message?.content || "";
    const startIndex = aiContent.indexOf('[');
    const endIndex = aiContent.lastIndexOf(']');
    
    let tools = [];
    if (startIndex !== -1 && endIndex !== -1) {
      tools = JSON.parse(aiContent.substring(startIndex, endIndex + 1));
    }

    // 3. SAVE TO DB (With Validation)
    if (tools.length > 0) {
      for (const tool of tools) {
        // Double Check: If main link is social media, swap it or skip it
        if (tool.link && (tool.link.includes("facebook.com") || tool.link.includes("twitter.com") || tool.link.includes("linkedin.com"))) {
            // The AI failed the instructions. Move this bad link to tutorial_link if it's empty
            if (!tool.tutorial_link) tool.tutorial_link = tool.link;
            tool.link = ""; // Kill the bad main link
        }

        // Only save if we have a Title
        if (tool.title) {
            await supabase.from('tools').insert(tool);
        }
      }
    }

    return NextResponse.json({ success: true, tools });

  } catch (error) {
    console.error("Hunt Error:", error);
    return NextResponse.json({ success: false, error: "Failed to hunt" }, { status: 500 });
  }
}