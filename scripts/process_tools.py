import json
import os
import time
import requests
import re
from bs4 import BeautifulSoup
from groq import Groq
from supabase import create_client, Client
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv('.env.local')

# --- CONFIGURATION ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY")
# ---------------------

client = Groq(api_key=GROQ_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
tavily = TavilyClient(api_key=TAVILY_API_KEY)

SEARCH_QUERIES = {
    "Coding": "top ai coding assistants 2025 review",
    "Video": "best ai video generators 2025 review",
    # Add more...
}

def create_slug(title):
    # Turns "Cursor AI Code Editor" into "cursor-ai-code-editor"
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

def get_tool_details(query):
    print(f"   🕵️‍♂️ Researching: {query}...")
    try:
        return tavily.search(query=query, search_depth="advanced", max_results=5)['results']
    except: return []

def analyze_and_upload(category, search_results):
    if not search_results: return

    context_text = "\n\n".join([f"URL: {r['url']}\nTEXT: {r['content'][:600]}" for r in search_results])

    system_prompt = f"""
    You are a Tech Journalist. Write a detailed review for the top AI tool found.
    
    OUTPUT JSON ONLY:
    [
      {{
        "title": "Tool Name",
        "slug": "tool-name-slug", 
        "description": "Short summary (2 sentences).",
        "content": "Write a 3-paragraph mini-blog post here. Paragraph 1: What is it? Paragraph 2: Key Features. Paragraph 3: Who is it for? Use Markdown formatting.",
        "link": "https://official-site.com",
        "tutorial_link": "https://blog.com",
        "tags": ["{category}", "AI"],
        "utility_score": 9,
        "pricing": "Freemium",
        "pros": ["Feature A", "Feature B", "Feature C"],
        "features": ["Deep Context Window", "VS Code Fork", "Privacy Mode"]
      }}
    ]
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": context_text}],
            temperature=0.3
        )
        ai_response = completion.choices[0].message.content
        start, end = ai_response.find('['), ai_response.rfind(']')
        
        if start != -1:
            tools = json.loads(ai_response[start:end+1])
            for tool in tools:
                # Ensure slug is safe
                if not tool.get('slug'): tool['slug'] = create_slug(tool['title'])
                
                # Check duplicates by Slug
                existing = supabase.table("tools").select("id").eq("slug", tool['slug']).execute()
                if not existing.data:
                    supabase.table("tools").insert(tool).execute()
                    print(f"   ✅ PUBLISHED ARTICLE: {tool['title']}")
                else:
                    print(f"   ⚠️ Skipping duplicate: {tool['title']}")

    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    for cat, query in SEARCH_QUERIES.items():
        analyze_and_upload(cat, get_tool_details(query))