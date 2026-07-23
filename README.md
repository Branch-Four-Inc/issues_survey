# Local Issues Survey

A community survey app where residents can browse local issue topics, submit questions, and upvote what matters most. Built with Next.js 15, Tailwind CSS v4, and Neon serverless Postgres, deployed on Cloudflare Pages.

## Features

- 6 topic categories with accordion-style expand/collapse
- Submit questions under any topic (requires email, stored locally)
- Upvote questions — one vote per email per question
- Questions sorted by votes, re-sorted on each reopen
- Works fully in-memory with no database configuration required

## Running locally

```bash
# Install dependencies
pnpm install

# Start dev server (uses in-memory store — no DB needed)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Using a real database

Add your Neon connection string to `.env.local`:

```
DATABASE_URL=postgres://user:pass@host/dbname?sslmode=require
```

Then run the schema against your Neon database:

```sql
CREATE TABLE topics (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT,
  description TEXT
);

CREATE TABLE questions (
  id           SERIAL PRIMARY KEY,
  topic_id     INTEGER NOT NULL REFERENCES topics(id),
  text         TEXT NOT NULL,
  author_email TEXT NOT NULL,
  votes        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE votes (
  id          SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  voter_email TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, voter_email)
);
```

Seed the default topics:

```sql
INSERT INTO topics (name, emoji, description) VALUES
  ('Roads & Infrastructure', '🛣️', 'Potholes, sidewalks, bridges, street lighting, and public transit.'),
  ('Parks & Recreation',     '🌳', 'Parks, playgrounds, sports facilities, trails, and community events.'),
  ('Public Safety',          '🚨', 'Police, fire, emergency services, traffic safety, and neighborhood watch.'),
  ('Schools & Education',    '🎓', 'Public schools, libraries, after-school programs, and adult education.'),
  ('Housing & Development',  '🏘️', 'Affordable housing, zoning, construction projects, and permits.'),
  ('Environment & Sustainability', '♻️', 'Recycling, green spaces, air and water quality, and climate initiatives.');
```

See [REQUIREMENTS.md](./REQUIREMENTS.md) for full feature requirements and [spec.md](./spec.md) for implementation spec.
