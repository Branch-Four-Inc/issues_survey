"use client";

import { useState } from "react";

const MAX_CHARS = 300;

/**
 * "Add a question" button + inline form for a topic.
 * Props:
 *   topicId       — number
 *   email         — string | null
 *   onEmailNeeded — () => Promise<string>
 *   onEmailSaved  — (email: string) => void
 *   onSubmitted   — () => void  (called after successful submission)
 */
export default function AddQuestionForm({
  topicId,
  email,
  onEmailNeeded,
  onEmailSaved,
  onSubmitted,
}) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleOpen() {
    setError(null);
    setSuccess(false);

    let authorEmail = email;
    if (!authorEmail) {
      try {
        authorEmail = await onEmailNeeded();
        onEmailSaved(authorEmail);
      } catch {
        return; // User cancelled
      }
    }

    setExpanded(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setError("Please enter a question.");
      return;
    }
    if (trimmed.length > MAX_CHARS) {
      setError(`Question must be ${MAX_CHARS} characters or fewer.`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/topics/${topicId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Submission failed. Please try again.");
        return;
      }

      setText("");
      setExpanded(false);
      setSuccess(true);
      onSubmitted?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setExpanded(false);
    setText("");
    setError(null);
  }

  const remaining = MAX_CHARS - text.length;

  return (
    <div className="mb-4">
      {success && (
        <p className="mb-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Question submitted! It will appear after you reopen this topic.
        </p>
      )}

      {!expanded ? (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-blue-300 px-3 py-2 text-sm font-medium text-blue-600 hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add a question
        </button>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          <label htmlFor={`question-input-${topicId}`} className="sr-only">
            Your question
          </label>
          <textarea
            id={`question-input-${topicId}`}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            rows={3}
            maxLength={MAX_CHARS}
            placeholder="Type your question here…"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-400" : "border-gray-300"
            }`}
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs tabular-nums ${
                remaining < 30 ? "text-amber-500" : "text-gray-400"
              }`}
            >
              {remaining} left
            </span>
          </div>
          {error && (
            <p className="text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
