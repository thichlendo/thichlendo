"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Badge = "verified" | "owner" | null;

type Post = {
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  authorBadge: Badge;
  text: string;
  hearts: number;
  votedBy?: Record<string, boolean>;
  createdAt: number;
};

type Session = {
  username: string;
  displayName: string;
  badge: Badge;
};

export default function FeedPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.session) {
          router.push("/login");
        } else {
          setSession(data.session);
        }
      });
  }, [router]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.posts || []);
  }

  async function handlePost(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không đăng được.");
        return;
      }
      setText("");
      await loadPosts();
    } finally {
      setPosting(false);
    }
  }

  async function handleVote(id: string) {
    const res = await fetch(`/api/posts/${id}/vote`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, hearts: data.hearts } : p)));
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  if (session === undefined) {
    return (
      <main className="min-h-screen bg-[#14100F] flex items-center justify-center text-[#9C8F84] text-sm">
        Đang tải...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#14100F] text-[#F5EFE6]">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <span className="font-extrabold text-lg">
          Miu<span className="text-[#FF6A3D]">Mo</span>
        </span>
        <div className="flex items-center gap-3 text-sm text-[#9C8F84]">
          <span>{session?.displayName}</span>
          <button onClick={handleLogout} className="hover:text-[#F5EFE6] transition-colors">
            Đăng xuất
          </button>
        </div>
      </nav>

      <section className="max-w-xl mx-auto px-6 py-8">
        <form onSubmit={handlePost} className="bg-[#1E1815] border border-white/5 rounded-2xl p-4 mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Viết một lời thú nhận..."
            className="w-full bg-transparent outline-none resize-none text-sm placeholder:text-[#9C8F84]/60"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#9C8F84]">{text.length}/500</span>
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="bg-[#FF6A3D] hover:bg-[#FF7D51] disabled:opacity-40 text-[#14100F] text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              {posting ? "Đang đăng..." : "Đăng"}
            </button>
          </div>
          {error && <p className="text-xs text-[#FF6A3D] mt-2">{error}</p>}
        </form>

        <div className="flex flex-col gap-4">
          {posts.length === 0 && (
            <p className="text-center text-sm text-[#9C8F84] py-12">
              Chưa có bài đăng nào. Hãy là người đầu tiên.
            </p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={() => handleVote(post.id)} me={session?.username} />
          ))}
        </div>
      </section>
    </main>
  );
}

function PostCard({ post, onVote, me }: { post: Post; onVote: () => void; me?: string }) {
  const voted = !!(me && post.votedBy?.[me]);
  return (
    <div className="bg-[#1E1815] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium">{post.authorDisplayName}</span>
        {post.authorBadge === "verified" && <VerifiedDot />}
        {post.authorBadge === "owner" && <FireDot />}
      </div>
      <p className="text-[15px] leading-relaxed mb-4">{post.text}</p>
      <button
        onClick={onVote}
        className={`flex items-center gap-2 text-sm transition-colors ${
          voted ? "text-[#FF6A3D]" : "text-[#9C8F84] hover:text-[#FF6A3D]"
        }`}
      >
        <HeartIcon filled={voted} />
        <span>{post.hearts}</span>
      </button>
    </div>
  );
}

function VerifiedDot() {
  return (
    <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
      <path
        d="M18 2L22.5 5.5L28 5L29 10.5L34 13L32 18L34 23L29 25.5L28 31L22.5 30.5L18 34L13.5 30.5L8 31L7 25.5L2 23L4 18L2 13L7 10.5L8 5L13.5 5.5L18 2Z"
        fill="#3EC6E0"
        fillOpacity={0.2}
        stroke="#3EC6E0"
        strokeWidth={2}
      />
      <path d="M12.5 18.5L16 22L24 13.5" stroke="#3EC6E0" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FireDot() {
  return (
    <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="fireDotGrad" x1="0" y1="36" x2="0" y2="0">
          <stop offset="0%" stopColor="#FF6A3D" />
          <stop offset="100%" stopColor="#FFC65C" />
        </linearGradient>
      </defs>
      <path
        d="M18 2C18 2 7 13 7 24C7 31 12 35.5 18 35.5C24 35.5 29 31 29 24C29 18 25.5 14.5 24 11C23.5 14.5 21 16.5 19 16.5C20 11 18 6 18 2Z"
        fill="url(#fireDotGrad)"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.5C12 20.5 3 14.9 3 8.9C3 5.9 5.4 3.5 8.4 3.5C10.1 3.5 11.3 4.3 12 5.5C12.7 4.3 13.9 3.5 15.6 3.5C18.6 3.5 21 5.9 21 8.9C21 14.9 12 20.5 12 20.5Z"
        fill={filled ? "#FF6A3D" : "none"}
        stroke={filled ? "#FF6A3D" : "#9C8F84"}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
    }
