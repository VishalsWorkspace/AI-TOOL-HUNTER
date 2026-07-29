import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Tool, UserStack } from '@/lib/types';
import { ToolCard } from '@/components/ToolCard';
import { SaveAllToolsButton } from '@/components/SaveAllToolsButton';

export const revalidate = 60;

export default async function StackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: stack } = await supabase
    .from('user_stacks')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .maybeSingle<UserStack>();

  if (!stack) return <div className="text-white text-center py-20">Stack not found</div>;

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .in('id', stack.tool_ids.length > 0 ? stack.tool_ids : [-1])
    .returns<Tool[]>();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hunter
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Layers className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{stack.name}</h1>
              {stack.description && <p className="text-zinc-400 mt-1">{stack.description}</p>}
              <div className="flex items-center gap-2 mt-3">
                {stack.user_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={stack.user_avatar}
                    alt={stack.user_name || "Creator"}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold">
                    {(stack.user_name || "?")[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-zinc-500">by {stack.user_name || "Anonymous"}</span>
              </div>
            </div>
          </div>

          <SaveAllToolsButton toolIds={stack.tool_ids} />
        </div>

        {tools && tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-600 text-center py-20">This stack is empty.</p>
        )}
      </div>
    </div>
  );
}
