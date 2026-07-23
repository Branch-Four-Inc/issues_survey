import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { memGetQuestions, memAddQuestion } from "@/lib/store";

export const runtime = "edge";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(req, { params }) {
  const { id } = await params;
  const topicId = parseInt(id, 10);
  if (isNaN(topicId)) {
    return NextResponse.json({ error: "Invalid topic id" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || null;
  const url = process.env.DATABASE_URL;

  if (!url) {
    return NextResponse.json(memGetQuestions(topicId, email));
  }

  const db = neon(url);
  const rows = await db`
    SELECT
      q.id,
      q.topic_id,
      q.text,
      q.author_email,
      q.votes,
      q.created_at,
      ${email
        ? db`EXISTS(
            SELECT 1 FROM votes v
            WHERE v.question_id = q.id AND v.voter_email = ${email}
          )`
        : db`false`
      } AS user_voted
    FROM questions q
    WHERE q.topic_id = ${topicId}
    ORDER BY q.votes DESC, q.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const topicId = parseInt(id, 10);
  if (isNaN(topicId)) {
    return NextResponse.json({ error: "Invalid topic id" }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, email } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Question text is required" }, { status: 400 });
  }
  if (text.trim().length > 300) {
    return NextResponse.json({ error: "Question must be 300 characters or fewer" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const url = process.env.DATABASE_URL;

  if (!url) {
    const question = memAddQuestion(topicId, text.trim(), email);
    return NextResponse.json(question, { status: 201 });
  }

  const db = neon(url);
  const [row] = await db`
    INSERT INTO questions (topic_id, text, author_email)
    VALUES (${topicId}, ${text.trim()}, ${email})
    RETURNING id, topic_id, text, votes, created_at
  `;
  return NextResponse.json({ ...row, user_voted: false }, { status: 201 });
}
