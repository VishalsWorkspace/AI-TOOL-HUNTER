import { supabase } from '@/lib/supabaseClient';
import ToolDashboard from "@/components/ToolDashboard"; 
import AiConsultant from "@/components/AiConsultant"; 

// Define the shape of our data
interface Tool {
  id: number;
  title: string;
  description: string;
  tags: string[];
  utility_score: number;
  link: string;
  tutorial_link?: string;
  pricing?: string;
  pros?: string[];
}

// Fetch from Cloud
async function getTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("DB Error:", error);
    return [];
  }
  return data as Tool[];
}

// Revalidate every 60 seconds to keep data fresh
export const revalidate = 60;

export default async function Home() {
  const tools = await getTools();

  return (
    <main>
      {/* The Dashboard now handles the Aurora background and Hero section */}
      <ToolDashboard tools={tools} />
      
      {/* The Floating Consultant Button */}
      <AiConsultant allTools={tools} />
    </main>
  );
}