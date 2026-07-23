/**
 * In-memory store used when DATABASE_URL is not configured.
 * Data lives only for the lifetime of the Node.js server process.
 * Mutate only through the exported functions so callers are DB-agnostic.
 */

const SEEDED_TOPICS = [
  { id: 1, name: "Roads & Infrastructure", emoji: "🛣️", description: "Potholes, sidewalks, bridges, street lighting, and public transit." },
  { id: 2, name: "Parks & Recreation", emoji: "🌳", description: "Parks, playgrounds, sports facilities, trails, and community events." },
  { id: 3, name: "Public Safety", emoji: "🚨", description: "Police, fire, emergency services, traffic safety, and neighborhood watch." },
  { id: 4, name: "Schools & Education", emoji: "🎓", description: "Public schools, libraries, after-school programs, and adult education." },
  { id: 5, name: "Housing & Development", emoji: "🏘️", description: "Affordable housing, zoning, construction projects, and permits." },
  { id: 6, name: "Environment & Sustainability", emoji: "♻️", description: "Recycling, green spaces, air and water quality, and climate initiatives." },
];

// Mutable in-memory state (module-level singleton).
let nextQuestionId = 1;
/** @type {Array<{id:number, topic_id:number, text:string, author_email:string, votes:number, created_at:string}>} */
const questions = [];
/** @type {Set<string>} keys are `${question_id}:${voter_email}` */
const votedSet = new Set();

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export function memGetTopics() {
  return SEEDED_TOPICS.map((t) => ({
    ...t,
    question_count: questions.filter((q) => q.topic_id === t.id).length,
  }));
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

/**
 * Returns questions for a topic sorted by votes DESC, created_at DESC.
 * @param {number} topicId
 * @param {string|null} voterEmail  — if provided, each row includes user_voted
 */
export function memGetQuestions(topicId, voterEmail) {
  return questions
    .filter((q) => q.topic_id === topicId)
    .sort((a, b) => {
      if (b.votes !== a.votes) return b.votes - a.votes;
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .map((q) => ({
      id: q.id,
      topic_id: q.topic_id,
      text: q.text,
      author_email: q.author_email,
      votes: q.votes,
      created_at: q.created_at,
      user_voted: voterEmail ? votedSet.has(`${q.id}:${voterEmail}`) : false,
    }));
}

/**
 * Creates a new question. Returns the created question object.
 * @param {number} topicId
 * @param {string} text
 * @param {string} authorEmail
 */
export function memAddQuestion(topicId, text, authorEmail) {
  const question = {
    id: nextQuestionId++,
    topic_id: topicId,
    text,
    author_email: authorEmail,
    votes: 0,
    created_at: new Date().toISOString(),
  };
  questions.push(question);
  return { ...question, user_voted: false };
}

// ---------------------------------------------------------------------------
// Votes
// ---------------------------------------------------------------------------

/**
 * Records a vote. Returns { ok: true, votes: <new_count> } or { ok: false, conflict: true }.
 * @param {number} questionId
 * @param {string} voterEmail
 */
export function memVote(questionId, voterEmail) {
  const key = `${questionId}:${voterEmail}`;
  if (votedSet.has(key)) {
    return { ok: false, conflict: true };
  }
  const question = questions.find((q) => q.id === questionId);
  if (!question) {
    return { ok: false, notFound: true };
  }
  votedSet.add(key);
  question.votes += 1;
  return { ok: true, votes: question.votes };
}
