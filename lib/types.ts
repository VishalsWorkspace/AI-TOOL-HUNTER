export interface Tool {
  id: number;
  title: string;
  description: string;
  tags: string[];
  utility_score: number;
  link: string;
  tutorial_link?: string;
  pricing?: string;
  pros?: string[];
  slug?: string;
  image_url?: string;
  votes?: number;
  featured?: boolean;
  content?: string;
}

export interface SavedTool {
  id: number;
  user_id: string;
  tool_id: number;
  saved_at: string;
}
