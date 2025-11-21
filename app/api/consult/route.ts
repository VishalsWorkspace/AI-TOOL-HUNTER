import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    // 1. Fetch all tools from DB (In a huge app, we'd use Vector Search, but this works for <1000 tools)
    const { data: tools } = await supabase.from('tools').select('title, description, link, tags');
    
    if (!tools || tools.length === 0) {
      return NextResponse.json({ success: false, error: "No tools in DB" });
    }

    // 2. Ask Llama 3 to pick the best one
    // We feed it the list of tools and the user's query
    const systemPrompt = `
    You are an Expert AI Consultant. 
    User Request: "${query}"
    
    Here is my database of tools:
    ${JSON.stringify(tools.map(t => `${t.title}: ${t.description} (Tags: ${t.tags})`).slice(0, 50))} 
    
    TASK:
    1. Analyze the User Request.
    2. Pick the SINGLE BEST tool from the list above that solves it.
    3. Explain WHY you picked it in 1 short sentence.
    4. If NO tool fits, return "None".
    
    OUTPUT JSON ONLY:
    {
      "tool_name": "Name",
      "reason": "Why it fits..."
    }
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0,
    });

    const aiResponse = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(aiResponse.replace(/```json|```/g, ""));

    // Find the full tool object to return
    const bestTool = tools.find(t => t.title === result.tool_name);

    return NextResponse.json({ success: true, recommendation: bestTool, reason: result.reason });

  } catch (error) {
    console.error("Consult Error:", error);
    return NextResponse.json({ success: false, error: "Failed to consult" }, { status: 500 });
  }
}