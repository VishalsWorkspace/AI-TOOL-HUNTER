"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Plus, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/useUser";
import AuthButton from "@/components/AuthButton";
import { SubmitToolModal } from "@/components/SubmitToolModal";

export default function Navbar() {
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-black/60 backdrop-blur-xl transition-all duration-300",
        scrolled
          ? "border-emerald-500/30 shadow-[0_1px_20px_-2px_rgba(16,185,129,0.35)]"
          : "border-white/10"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-white tracking-tight">
            <Terminal className="h-4 w-4 text-emerald-500" />
            AI Tool Hunter
          </Link>

          {user && (
            <Link
              href="/my-tools"
              className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" /> My Tools
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Submit a Tool
            </button>
          )}
          <Badge
            variant="outline"
            className="hidden md:inline-flex py-2 px-4 bg-black/50 backdrop-blur-md border-white/10 text-zinc-400 font-mono text-xs hover:text-white hover:border-emerald-500 transition-colors cursor-default"
          >
            <Terminal className="w-3 h-3 mr-2 inline-block text-emerald-500" />
            Engineered by VISHAL
          </Badge>
          <AuthButton />
        </div>
      </div>

      {showSubmitModal && <SubmitToolModal onClose={() => setShowSubmitModal(false)} />}
    </header>
  );
}
