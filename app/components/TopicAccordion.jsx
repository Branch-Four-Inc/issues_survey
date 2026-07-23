"use client";

import { useState } from "react";
import TopicCard from "./TopicCard";
import QuestionList from "./QuestionList";

/**
 * Renders all topic cards with accordion behaviour (one open at a time).
 * Props:
 *   topics        — array of { id, name }
 *   email         — string | null  (currently stored user email)
 *   onEmailNeeded — () => Promise<string>  (opens EmailGate, resolves with email)
 *   onEmailSaved  — (email: string) => void  (called after email captured)
 */
export default function TopicAccordion({
  topics,
  email,
  onEmailNeeded,
  onEmailSaved,
}) {
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-3">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          isOpen={openId === topic.id}
          onClick={() => toggle(topic.id)}
        >
          {/* QuestionList is mounted when open; unmounts on close,
              so on next open it fetches fresh data (fulfilling the
              "sort on reopen" requirement). */}
          <QuestionList
            topicId={topic.id}
            email={email}
            onEmailNeeded={onEmailNeeded}
            onEmailSaved={onEmailSaved}
          />
        </TopicCard>
      ))}
    </div>
  );
}
