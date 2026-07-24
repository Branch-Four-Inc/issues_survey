"use client";

import { useState } from "react";

/**
 * Masks an email: first 2 chars of local part + *** + @ + domain.
 * e.g. lucoby@gmail.com → lu***@gmail.com
 * @param {string} email
 */
function maskEmail(email) {
  const at = email.indexOf("@");
  if (at < 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * A single question row with an upvote button.
 * Props:
 *   question      — { id, text, votes, user_voted, author_email }
 *   email         — string | null
 *   onEmailNeeded — () => Promise<string>
 *   onVoted       — (questionId, newVoteCount) => void  (optimistic update callback)
 */
export default function QuestionRow({
  question,
  email,
  onEmailNeeded,
  onVoted,
}) {
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState(null);

  async function handleVote() {
    if (question.user_voted === true || voting) return;
    setError(null);

    let voterEmail = email;
    if (!voterEmail) {
      try {
        voterEmail = await onEmailNeeded();
      } catch {
        // User cancelled the gate — do nothing
        return;
      }
    }

    setVoting(true);
    try {
      const res = await fetch(`/api/questions/${question.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: voterEmail }),
      });

      if (res.status === 409) {
        // Already voted (race condition safeguard) — treat as success
        onVoted(question.id, question.votes);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Vote failed. Please try again.");
        return;
      }

      const data = await res.json();
      onVoted(question.id, data.votes);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVoting(false);
    }
  }

  const voted = question.user_voted === true;

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Vote button */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5">
        <button
          onClick={handleVote}
          disabled={voted || voting}
          aria-label={voted ? "Already voted" : "Upvote this question"}
          aria-pressed={voted}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            voted
              ? "cursor-default border-blue-300 bg-blue-50 text-blue-500"
              : voting
              ? "cursor-wait border-gray-200 bg-gray-50 text-gray-300"
              : "border-gray-200 bg-white text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500"
          }`}
        >
          {/* Upvote triangle */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3.293L3.293 10H7v7h6v-7h3.707L10 3.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <span
          className={`text-xs font-medium tabular-nums ${
            voted ? "text-blue-500" : "text-gray-500"
          }`}
        >
          {question.votes}
        </span>
      </div>

      {/* Question text + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug text-gray-800 break-words">
          {question.text}
        </p>
        {question.author_email && (
          <p className="mt-1 text-xs text-gray-400">
            {maskEmail(question.author_email)}
          </p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
