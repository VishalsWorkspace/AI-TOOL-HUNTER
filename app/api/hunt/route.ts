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
// --- OG IMAGE FETCHER (mirrors process_tools.py's get_og_image) ---
// Runs server-side so no CORS issues. Uses regex instead of BeautifulSoup.
async function getOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();

    // Priority 1: og:image (handles both attribute orderings)
    const ogMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch?.[1]) {
      const img = ogMatch[1];
      return img.startsWith('http') ? img : new URL(img, url).href;
    }

    // Priority 2: twitter:image
    const twitterMatch =
      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (twitterMatch?.[1]) {
      const img = twitterMatch[1];
      return img.startsWith('http') ? img : new URL(img, url).href;
    }
  } catch {
    // Silent fail — image is optional, don't crash the hunt
  }
  return null;
}

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

            // BUG 1 FIX: select('*') so the full DB record (including image_url) is returned
            const { data: existing } = await supabase
                .from('tools')
                .select('*')
                .eq('link', tool.link)
                .single();

            if (!existing) {
                // BUG 2 FIX: fetch OG image before insert, same as process_tools.py
                tool.image_url = await getOgImage(tool.link);

                const { data } = await supabase.from('tools').insert(tool).select();
                if (data) processedTools.push(data[0]);
            } else {
                // BUG 1 FIX: push the full DB record (has image_url), not the bare AI object
                processedTools.push(existing);
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
