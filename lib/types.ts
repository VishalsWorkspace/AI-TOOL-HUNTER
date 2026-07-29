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
  slug: string;
  image_url?: string;
  featured?: boolean;
  content?: string;
  created_at?: string;
}

export interface SavedTool {
  id: number;
  user_id: string;
  tool_id: number;
  saved_at: string;
}

export interface ReviewStats {
  avg_rating: number;
  review_count: number;
}

export interface ToolReview {
  id: number;
  tool_id: number;
  user_id: string;
  rating: number;
  review: string | null;
  user_name: string | null;
  user_avatar: string | null;
  created_at: string;
}

export interface UserStack {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  tool_ids: number[];
  is_public: boolean;
  slug: string;
  user_name: string | null;
  user_avatar: string | null;
  created_at: string;
}
