import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { memGetTopics } from "@/lib/store";

export const runtime = "edge";

export async function GET() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return NextResponse.json(memGetTopics());
  }

  const db = neon(url);
  const rows = await db`
    SELECT
      t.id,
      t.name,
      t.emoji,
      t.description,
      COUNT(q.id)::int AS question_count
    FROM topics t
    LEFT JOIN questions q ON q.topic_id = t.id
    GROUP BY t.id
    ORDER BY t.id
  `;
  return NextResponse.json(rows);
}
