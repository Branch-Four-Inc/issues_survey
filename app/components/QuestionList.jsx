"use client";

import { useState, useEffect, useCallback } from "react";
import QuestionRow from "./QuestionRow";
import AddQuestionForm from "./AddQuestionForm";

/**
 * Fetches and displays the questions for an open topic panel.
 * Props:
 *   topicId       — number
 *   email         — string | null
 *   onEmailNeeded — () => Promise<string>
 *   onEmailSaved  — (email: string) => void
 */
export default function QuestionList({
  topicId,
  email,
  onEmailNeeded,
  onEmailSaved,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const params = email ? `?email=${encodeURIComponent(email)}` : "";
    fetch(`/api/topics/${topicId}/questions${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      .catch((err) => {
        if (!cancelled) setFetchError(err.message || "Failed to load questions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topicId, email]);

  // Optimistic vote update: update the question's vote count in local state.
  // Position does not change until the panel is closed and reopened.
  const handleVoted = useCallback((questionId, newVotes) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, votes: newVotes, user_voted: true }
          : q
      )
    );
  }, []);

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-gray-400" aria-live="polite">
        Loading…
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="py-4 text-center text-sm text-red-500" role="alert">
        {fetchError}
      </div>
    );
  }

  return (
    <div>
      <AddQuestionForm
        topicId={topicId}
        email={email}
        onEmailNeeded={onEmailNeeded}
        onEmailSaved={onEmailSaved}
        onSubmitted={() => {
          // Questions are refreshed on next reopen; nothing to do here.
        }}
      />

      {questions.length === 0 ? (
        <p className="py-2 text-sm text-gray-400">
          No questions yet. Be the first to add one!
        </p>
      ) : (
        <ul className="divide-y divide-gray-100" role="list">
          {questions.map((q) => (
            <li key={q.id}>
              <QuestionRow
                question={q}
                email={email}
                onEmailNeeded={onEmailNeeded}
                onVoted={handleVoted}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
