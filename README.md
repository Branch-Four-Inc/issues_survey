# Local Issues Survey Requirements

## 2.1 Topics
- The app shall display all 6 local topics on the main page simultaneously.
- Each topic shall be presented as a clickable element (e.g., card or row).
- Given a user clicks a topic, then a dropdown/expandable panel opens showing its associated questions.
- **Accordion behavior**: Only one topic dropdown may be open at a time. Given a user clicks a topic while a different topic's dropdown is open, the previously open dropdown shall close and the newly selected topic's dropdown shall open.
- Given a user clicks the currently open topic again, the dropdown shall collapse.

## 2.2 Questions
- Within each topic's dropdown, all previously added questions shall be listed.
- **Primary sort**: Questions shall be sorted by vote count in descending order (most votes to least votes).
- **Secondary sort (tiebreaker)**: Given two or more questions have equal vote counts, they shall be sorted by date added, most recent first (*confirm: most recent first, or oldest first? — assumed most recent first; flag if reversed*).
- **Sort timing**: The list shall re-sort on page refresh or when the topic dropdown is reopened — not live/real-time. A user's own vote will not visibly reorder the list until they refresh or re-open the dropdown.
- Given a topic has no questions yet, the dropdown shall display an empty state with the "Add a question" button still available.

## 2.3 Adding Questions
- An "Add a question" button/input shall appear at the top of each topic's dropdown, above the list of existing questions.
- Given a user activates this button without a stored email, they shall be routed through the email gate (2.5) before the question is accepted.
- Given a user submits a valid question, it shall appear in the dropdown's question list at next refresh/reopen, sorted per 2.2 (new questions start at 0 votes, positioned per the date-added tiebreaker among other 0-vote questions).

## 2.4 Voting
- Each question row within the dropdown shall display a voting control positioned to the left of the question text.
- Given a user activates the voting control without a stored email, they shall be routed through the email gate before the vote is recorded.
- Given a user has already voted on a question, the voting control shall reflect their vote state (e.g., filled/highlighted icon, disabled from re-voting).
- Given a user votes on a question, the vote count shall increment immediately (optimistic UI update on the count itself), but list re-sorting shall only occur on refresh/reopen per 2.2.
- Voting is per-question; a user may vote on multiple questions within the same topic and across different topics.

## 2.5 Email Gate
- Users must enter a valid email before voting or adding a question.
- One email = one identity; no additional verification required.
- Once provided in a session, the email shall not be re-requested for subsequent actions in that session.

## 2.6 Web Experience 
- Application is compatible with desktop browser (Chrome, Safari, Firefox, Edge — latest 2 versions), and all features function and display correctly.
- Application is compatbile with mobile browser (iOS Safari, Android Chrome)

## Example UI mockup:

<img width="723" height="668" alt="image" src="https://github.com/user-attachments/assets/72168ff7-99e9-48ac-a435-36e84308181d" />
