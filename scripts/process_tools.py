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
    "Design": "best ai graphic design tools 2025",
    "Business": "ai tools for business productivity 2025",
}

def create_slug(title):
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

def get_og_image(url):
    print(f"   🖼️ Fetching image for: {url}...")
    try:
        response = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Priority 1: Open Graph Image
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            return og_image["content"]
            
        # Priority 2: Twitter Image
        twitter_image = soup.find("meta", name="twitter:image")
        if twitter_image and twitter_image.get("content"):
            return twitter_image["content"]
            
    except Exception:
        print(f"      ❌ Could not fetch image for {url}")
    return None

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
                if not tool.get('slug'): tool['slug'] = create_slug(tool['title'])
                
                # Check duplicates
                existing = supabase.table("tools").select("id").eq("slug", tool['slug']).execute()
                if not existing.data:
                    # FETCH IMAGE BEFORE UPLOAD
                    tool['image_url'] = get_og_image(tool['link'])
                    
                    supabase.table("tools").insert(tool).execute()
                    print(f"   ✅ PUBLISHED ARTICLE: {tool['title']}")
                else:
                    print(f"   ⚠️ Skipping duplicate: {tool['title']}")

    except Exception as e:
        print(f"   ❌ Error: {e}")

# --- SPECIAL FUNCTION TO FIX MISSING IMAGES ---
def update_missing_images():
    print("\n🔄 Checking for missing images in database...")
    response = supabase.table("tools").select("*").execute()
    tools = response.data
    
    for tool in tools:
        if not tool.get('image_url'):
            print(f"   fix: Finding image for {tool['title']}...")
            image_url = get_og_image(tool['link'])
            if image_url:
                supabase.table("tools").update({"image_url": image_url}).eq("id", tool['id']).execute()
                print("      ✅ Updated!")
            time.sleep(1)

if __name__ == "__main__":
    # 1. Update existing tools first
    update_missing_images()
    
    # 2. Then hunt for new ones
    # for cat, query in SEARCH_QUERIES.items():
    #     analyze_and_upload(cat, get_tool_details(query))