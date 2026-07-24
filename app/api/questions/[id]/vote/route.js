import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "edge";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const questionId = parseInt(id, 10);
  if (isNaN(questionId)) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const url = process.env.DATABASE_URL;

  if (!url) {
    const { memVote } = await import("@/lib/store");
    const result = memVote(questionId, email);
    if (result.notFound) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    if (result.conflict) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }
    return NextResponse.json({ votes: result.votes });
  }

  const db = neon(url);

  // Insert vote, ignoring duplicate (ON CONFLICT DO NOTHING)
  const [inserted] = await db`
    INSERT INTO votes (question_id, voter_email)
    VALUES (${questionId}, ${email})
    ON CONFLICT (question_id, voter_email) DO NOTHING
    RETURNING id
  `;

  if (!inserted) {
    // Row already existed — duplicate vote
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  // Increment denormalized count and return new value
  const [updated] = await db`
    UPDATE questions
    SET votes = votes + 1
    WHERE id = ${questionId}
    RETURNING votes
  `;

  if (!updated) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({ votes: updated.votes });
}
