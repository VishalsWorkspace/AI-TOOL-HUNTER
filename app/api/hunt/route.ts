import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import { createClient } from '@supabase/supabase-js';

// Initialize with your keys
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
// Add a check to prevent build crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    console.log(`🚀 Launching Deep Search for: "${query}"`);

    // 1. TAVILY: Broad Spectrum Search
    // We search for "Pricing" and "Features" explicitly to get rich data
    const searchResult = await tvly.search(`best ${query} ai tool software pricing features official site`, {
      searchDepth: "advanced", // Deep search for better results
      maxResults: 7,
      includeDomains: [], 
      excludeDomains: ["linkedin.com", "instagram.com", "facebook.com"] // Anti-Social filter
    });

    const contextText = searchResult.results.map((res: any) => 
      `SOURCE: ${res.url}\nTITLE: ${res.title}\nTEXT: ${res.content.slice(0, 300)}`
    ).join("\n\n");

    // 2. LLAMA 3: The "VC Analyst" Logic
    const systemPrompt = `
    You are an elite Venture Capital Analyst evaluating AI tools.
    User is hunting for: "${query}".
    
    ANALYZE the search results and extract the Top 3 HIGH-QUALITY tools.
    
    STRICT RULES:
    1. IGNORE "Top 10" lists, blogs, or newsletters. Look for PRODUCT LANDING PAGES.
    2. 'link' must be the OFFICIAL HOMEPAGE (e.g., .com, .ai, .io). NO SOCIAL MEDIA LINKS.
    3. 'pricing' must be specific: "Free", "Freemium", "$10/mo", or "Paid".
    4. 'pros' must be 3 short, punchy features (max 4 words each).
    
    OUTPUT JSON FORMAT ONLY (No markdown):
    [
      {
        "title": "Tool Name",
        "description": "One sentence value prop.",
        "link": "https://official-site.com",
        "tutorial_link": "https://docs.official-site.com",
        "tags": ["${query}", "Generative AI", "Productivity"],
        "utility_score": 95,
        "pricing": "Freemium",
        "pros": ["Real-time Sync", "No-code Builder", "GPT-4 Native"]
      }
    ]
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextText }
      ],
      model: "llama-3.3-70b-versatile", // Use the smartest model available
      temperature: 0.1, // Low creativity, high accuracy
    });

    const aiContent = completion.choices[0]?.message?.content || "";
    
    // Robust JSON Extractor
    const startIndex = aiContent.indexOf('[');
    const endIndex = aiContent.lastIndexOf(']');
    
    let tools = [];
    if (startIndex !== -1 && endIndex !== -1) {
      tools = JSON.parse(aiContent.substring(startIndex, endIndex + 1));
    }

    // 3. DATABASE: Upsert Logic (Prevent Duplicates)
    const processedTools = [];
    if (tools.length > 0) {
      for (const tool of tools) {
        if (!tool.link.includes("example.com") && !tool.link.includes("google.com")) {
            // Check if exists first to avoid duplicates
            const { data: existing } = await supabase
                .from('tools')
                .select('id')
                .eq('link', tool.link)
                .single();

            if (!existing) {
                const { data, error } = await supabase.from('tools').insert(tool).select();
                if (data) processedTools.push(data[0]);
            } else {
                processedTools.push(tool); // It exists, just return it to UI
            }
        }
      }
    }

    return NextResponse.json({ success: true, tools: processedTools });

  } catch (error) {
    console.error("Hunt Critical Failure:", error);
    return NextResponse.json({ success: false, error: "AI Engine Overload" }, { status: 500 });
  }
}