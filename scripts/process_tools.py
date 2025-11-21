import json
import os
import time
import requests
from groq import Groq
from supabase import create_client, Client
from tavily import TavilyClient # The new "Eagle Eye" library

# --- CONFIGURATION (SECURE VERSION) ---
# We now read from the System Environment, not the file text.
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY")
# ---------------------

client = Groq(api_key=GROQ_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
tavily = TavilyClient(api_key=TAVILY_API_KEY)

# --- MASSIVE CATEGORY LIST (The "All Tools" Update) ---
SEARCH_QUERIES = {
    "Video": "site:producthunt.com OR site:reddit.com best new ai video tools 2025",
    "Writing": "site:medium.com OR site:linkedin.com best new ai writing assistants 2025",
    "Coding": "site:dev.to OR site:github.com top new ai coding agents 2025",
    "Design": "site:dribbble.com best ai design tools 2025",
    "Business": "site:forbes.com top ai business automation tools 2025",
    "PDF": "best ai pdf summarizer tools official site"
}

def get_tool_details(query):
    print(f"   🕵️‍♂️ Tavily researching: {query}...")
    try:
        return tavily.search(query=query, search_depth="basic", max_results=5)['results']
    except:
        return []

def verify_link(tool_name, url, description):
    """
    Uses AI to check if a URL actually matches the tool description.
    """
    system_prompt = f"""
    VERIFICATION TASK:
    Tool Name: {tool_name}
    URL Found: {url}
    
    Does this URL look like the OFFICIAL homepage/landing page for {tool_name}?
    If it looks like a blog, 'zapier.com', 'linkedin.com', or a listicle, return "FALSE".
    If it looks like the real product site (e.g. .ai, .com, .io), return "TRUE".
    
    OUTPUT ONLY: TRUE or FALSE.
    """
    try:
        check = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0.0
        )
        return "TRUE" in check.choices[0].message.content.upper()
    except:
        return True 

def analyze_and_upload(category, search_results):
    if not search_results: return

    context_text = ""
    for res in search_results:
        context_text += f"URL: {res['url']}\nCONTENT: {res['content'][:400]}\n\n"

    system_prompt = f"""
    You are an Expert AI Auditor.
    I will give you search results for '{category}' tools.
    
    TASK:
    1. Identify top 2 REAL AI Tools.
    2. Extract the OFFICIAL URL.
    3. Determine Pricing Model: "Free", "Freemium", "Paid", or "Open Source".
    4. Extract 3 Key "Pros" or "Features" (short bullet points).
    
    OUTPUT JSON ARRAY:
    [
      {{
        "title": "Tool Name",
        "description": "Technical summary.",
        "link": "https://official-site.com",
        "tutorial_link": "https://blog-guide.com",
        "tags": ["{category}", "AI"],
        "utility_score": 9,
        "pricing": "Freemium",
        "pros": ["Real-time collaboration", "Export to React", "Dark mode"]
      }}
    ]
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context_text}
            ],
            temperature=0.0
        )
        
        ai_response = completion.choices[0].message.content
        start = ai_response.find('[')
        end = ai_response.rfind(']')
        
        if start != -1 and end != -1:
            tools = json.loads(ai_response[start : end + 1])
            
            for tool in tools:
                # 1. STRICT VALIDATION: If bad link, SKIP IT.
                if "google.com" in tool['link'] or "example.com" in tool['link']:
                    print(f"   ⚠️ Skipping Google Link: {tool['title']}")
                    continue

                if not verify_link(tool['title'], tool['link'], tool['description']):
                    print(f"   🚫 AI Rejected Blog/Spam Link for: {tool['title']}")
                    continue # <--- THIS STOPS THE BAD LINKS

                # 2. Upload
                try:
                    supabase.table("tools").insert(tool).execute()
                    print(f"   ✅ LIVE: {tool['title']}")
                except:
                    pass
    except Exception as e:
        print(f"   ❌ Error parsing category '{category}': {e}") 
        # We catch the error here so the loop DOES NOT STOP

if __name__ == "__main__":
    # CLEAN SLATE (Run this once to clear bad data)
    # supabase.table("tools").delete().neq("id", 0).execute()
    
    print("🚀 Starting Massive Harvest...")
    for category, query in SEARCH_QUERIES.items():
        print(f"\n📂 Category: {category}")
        results = get_tool_details(query)
        analyze_and_upload(category, results)
        time.sleep(1)