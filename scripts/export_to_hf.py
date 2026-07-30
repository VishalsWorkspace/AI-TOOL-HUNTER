import json
import os

import pandas as pd
from dotenv import load_dotenv
from huggingface_hub import HfApi
from supabase import create_client, Client

load_dotenv('.env.local')

# --- CONFIGURATION ---
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
HF_TOKEN = os.environ.get("HF_TOKEN")

HF_REPO_ID = "vishalclen/AI-Tools-Corpus-2026"
# NOTE: tools has no "category" column — the UI derives a display category
# client-side from `tags` via getPrimaryCategory() (see components/ToolCard.tsx).
FIELDS = [
    "title", "description", "pricing", "tags",
    "utility_score", "link", "pros", "image_url", "slug", "created_at",
]

JSONL_PATH = "data/ai-tools-corpus.jsonl"
CSV_PATH = "data/ai-tools-corpus.csv"
# ---------------------

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_all_tools():
    tools = []
    page_size = 1000
    start = 0
    while True:
        response = (
            supabase.table("tools")
            .select(",".join(FIELDS))
            .range(start, start + page_size - 1)
            .execute()
        )
        batch = response.data
        tools.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return tools


def export_jsonl(tools, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for tool in tools:
            f.write(json.dumps(tool, ensure_ascii=False) + "\n")


def export_csv(tools, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df = pd.DataFrame(tools, columns=FIELDS)
    for key in ("tags", "pros"):
        df[key] = df[key].apply(
            lambda v: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
        )
    df.to_csv(path, index=False)


def upload_to_hf():
    api = HfApi(token=HF_TOKEN)
    api.create_repo(repo_id=HF_REPO_ID, repo_type="dataset", exist_ok=True)
    api.upload_file(
        path_or_fileobj=JSONL_PATH,
        path_in_repo=os.path.basename(JSONL_PATH),
        repo_id=HF_REPO_ID,
        repo_type="dataset",
    )
    api.upload_file(
        path_or_fileobj=CSV_PATH,
        path_in_repo=os.path.basename(CSV_PATH),
        repo_id=HF_REPO_ID,
        repo_type="dataset",
    )


def main():
    tools = fetch_all_tools()
    export_jsonl(tools, JSONL_PATH)
    export_csv(tools, CSV_PATH)
    upload_to_hf()
    print(f"Uploaded {len(tools)} tools to Hugging Face successfully")


if __name__ == "__main__":
    main()
