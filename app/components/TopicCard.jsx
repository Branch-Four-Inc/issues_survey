"use client";

/**
 * A single topic row / card header.
 * Props:
 *   topic    — { id, name, emoji, description, question_count }
 *   isOpen   — boolean
 *   onClick  — () => void
 *   children — rendered when isOpen (the question panel)
 */
export default function TopicCard({ topic, isOpen, onClick, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        {/* Left: emoji + text */}
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 text-2xl leading-none" aria-hidden="true">
            {topic.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {topic.name}
              </span>
              {/* Question count badge */}
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {topic.question_count ?? 0}{" "}
                {(topic.question_count ?? 0) === 1 ? "question" : "questions"}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 leading-snug">
              {topic.description}
            </p>
          </div>
        </div>

        {/* Chevron — rotates when open */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Expandable panel */}
      {isOpen && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
