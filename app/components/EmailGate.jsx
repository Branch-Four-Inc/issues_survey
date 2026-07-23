"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Modal that prompts for an email address.
 * Props:
 *   onConfirm(email: string) — called when the user submits a valid email
 *   onCancel()              — called when the user dismisses without submitting
 */
export default function EmailGate({ onConfirm, onCancel }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  function validate(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!validate(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    onConfirm(trimmed);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-gate-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2
          id="email-gate-title"
          className="mb-1 text-lg font-semibold text-gray-900"
        >
          Enter your email to continue
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Your email is used only to prevent duplicate votes. No account is
          created.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email-gate-input" className="sr-only">
            Email address
          </label>
          <input
            id="email-gate-input"
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError("");
            }}
            className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-400" : "border-gray-300"
            }`}
          />
          {error && (
            <p className="mb-3 text-xs text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
