import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getCurrentSession } from "@/lib/session";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  }

  const { id } = await params;
  const postRef = adminDb.ref(`posts/${id}`);

  const result = await postRef.transaction((post) => {
    if (!post) return post;
    post.votedBy = post.votedBy || {};
    if (post.votedBy[session.username]) {
      delete post.votedBy[session.username];
      post.hearts = Math.max(0, (post.hearts || 0) - 1);
    } else {
      post.votedBy[session.username] = true;
      post.hearts = (post.hearts || 0) + 1;
    }
    return post;
  });

  if (!result.committed || !result.snapshot.exists()) {
    return NextResponse.json({ error: "Không tìm thấy bài đăng." }, { status: 404 });
  }

  const updated = result.snapshot.val();
  return NextResponse.json({
    hearts: updated.hearts,
    voted: !!updated.votedBy?.[session.username],
  });
}
