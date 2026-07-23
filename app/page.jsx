"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TopicAccordion from "./components/TopicAccordion";
import EmailGate from "./components/EmailGate";

const STORAGE_KEY = "survey_email";

export default function HomePage() {
  const [topics, setTopics] = useState([]);
  const [topicsError, setTopicsError] = useState(null);
  const [email, setEmail] = useState(null);

  // EmailGate state
  const [gateOpen, setGateOpen] = useState(false);
  // Holds the resolve/reject for the active Promise waiting on email input
  const gateResolveRef = useRef(null);
  const gateRejectRef = useRef(null);

  // Load stored email on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEmail(stored);
    } catch {
      // localStorage unavailable (e.g., private mode restriction) — ignore
    }
  }, []);

  // Fetch topics on mount
  useEffect(() => {
    fetch("/api/topics")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setTopics)
      .catch((err) => setTopicsError(err.message || "Failed to load topics."));
  }, []);

  /**
   * Opens the EmailGate and returns a Promise that resolves with the
   * email string once the user confirms, or rejects if they cancel.
   * If we already have an email, resolves immediately.
   */
  const requestEmail = useCallback(() => {
    if (email) return Promise.resolve(email);

    return new Promise((resolve, reject) => {
      gateResolveRef.current = resolve;
      gateRejectRef.current = reject;
      setGateOpen(true);
    });
  }, [email]);

  function handleGateConfirm(confirmedEmail) {
    try {
      localStorage.setItem(STORAGE_KEY, confirmedEmail);
    } catch {
      // ignore storage errors
    }
    setEmail(confirmedEmail);
    setGateOpen(false);
    gateResolveRef.current?.(confirmedEmail);
    gateResolveRef.current = null;
    gateRejectRef.current = null;
  }

  function handleGateCancel() {
    setGateOpen(false);
    gateRejectRef.current?.(new Error("Email gate cancelled"));
    gateResolveRef.current = null;
    gateRejectRef.current = null;
  }

  function handleEmailSaved(savedEmail) {
    try {
      localStorage.setItem(STORAGE_KEY, savedEmail);
    } catch {
      // ignore
    }
    setEmail(savedEmail);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Local Issues Survey
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse topics, ask questions, and vote on what matters most to your
          community.
        </p>
        {email && (
          <p className="mt-2 text-xs text-gray-400">
            Participating as{" "}
            <span className="font-medium text-gray-500">{email}</span>
          </p>
        )}
      </div>

      {/* Topics */}
      {topicsError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600"
          role="alert"
        >
          {topicsError}
        </div>
      ) : topics.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400" aria-live="polite">
          Loading topics…
        </div>
      ) : (
        <TopicAccordion
          topics={topics}
          email={email}
          onEmailNeeded={requestEmail}
          onEmailSaved={handleEmailSaved}
        />
      )}

      {/* Email gate modal */}
      {gateOpen && (
        <EmailGate
          onConfirm={handleGateConfirm}
          onCancel={handleGateCancel}
        />
      )}
    </main>
  );
}
