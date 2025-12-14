import { supabase } from '@/lib/supabaseClient';
import ToolDashboard from "@/components/ToolDashboard"; 
import AiConsultant from "@/components/AiConsultant"; 

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-black selection:bg-emerald-500/30">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
          <ToolDashboard tools={tools || []} />
          <AiConsultant allTools={tools || []} />
      </div>
    </main>
  );
}