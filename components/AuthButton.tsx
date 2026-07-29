"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronDown, Layers, LogOut } from "lucide-react";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

export default function AuthButton() {
  const { user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  if (loading) {
    return <div className="h-9 w-9 rounded-full bg-zinc-800 animate-pulse" />;
  }

  if (!user) {
    return (
      <Button
        onClick={handleLogin}
        size="sm"
        className="bg-white text-black hover:bg-zinc-200 font-bold gap-2"
      >
        <GoogleIcon className="h-4 w-4" />
        Login with Google
      </Button>
    );
  }

  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Account";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 bg-zinc-900/50 border border-white/10 hover:border-emerald-500/50 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-white max-w-[120px] truncate hidden sm:inline">
          {name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-bold text-white truncate">{name}</p>
            {user.email && <p className="text-xs text-zinc-500 truncate">{user.email}</p>}
          </div>
          <Link
            href="/my-tools"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <Bookmark className="h-4 w-4" /> My Saved Tools
          </Link>
          <Link
            href="/my-tools#stacks"
            onClick={() => setMenuOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors border-b border-white/10"
          >
            <Layers className="h-4 w-4" /> My Stacks
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
