import Link from "next/link";
import { Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AuthButton from "@/components/AuthButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-white tracking-tight">
          <Terminal className="h-4 w-4 text-emerald-500" />
          AI Tool Hunter
        </Link>

        <div className="flex items-center gap-3">
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
    </header>
  );
}
