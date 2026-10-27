import requests
import json
import os

# --- CONFIGURATION ---
API_KEY = os.getenv("NEWS_API_KEY") # <--- PASTE YOUR KEY HERE
QUERY = "artificial intelligence tools" # What we look for
LANGUAGE = "en"
# ---------------------

def fetch_news():
    print(f"🔍 Hunting for '{QUERY}'...")
    
    url = f"https://newsapi.org/v2/everything?q={QUERY}&language={LANGUAGE}&sortBy=publishedAt&apiKey={API_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get("status") != "ok":
            print("❌ Error:", data.get("message"))
            return

        articles = data.get("articles", [])[:10] # Get top 10 newest
        print(f"✅ Found {len(articles)} potential tools.")

        # Save raw data to a file so we can see it
        output_path = os.path.join("scripts", "raw_data.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(articles, f, indent=2)
            
        print(f"💾 Saved to {output_path}")

    except Exception as e:
        print(f"❌ Failed to connect: {e}")

if __name__ == "__main__":
    fetch_news()
