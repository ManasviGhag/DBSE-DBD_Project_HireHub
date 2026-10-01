# HireHub Backend

Node.js + Express + MongoDB backend for the HireHub job portal frontend.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod` process reachable at `mongodb://127.0.0.1:27017`)
- An Anthropic API key (https://console.anthropic.com) for the chatbot

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `JWT_SECRET` — any long random string
- `ANTHROPIC_API_KEY` — your Anthropic API key

Make sure MongoDB is running locally before starting the server. If you installed MongoDB Community Edition, start it with:

```bash
mongod
```
(or via your OS's service manager / MongoDB Compass)

## Run

```bash
npm run dev     # with nodemon (auto-restart on changes)
# or
npm start       # plain node
```

Server starts on `http://localhost:8000`, matching `VITE_API_URL=http://localhost:8000/api` in the frontend's `.env`.

## Testing the API

Import `hirehub-api.postman_collection.json` into Postman. Steps:

1. Run **Auth > Register** (as a candidate or recruiter) — copy the returned `token`.
2. Set the collection variable `token` to that value (or run **Auth > Login** which does this for you via a test script, if you add one).
3. All other requests use `{{token}}` automatically via the `Authorization: Bearer {{token}}` header.

## Notes on what's implemented vs. what's next

- **Resume parsing** uses a keyword-matching approach (`utils/resumeParser.js`) against a fixed skills list — good enough to demo match scoring, not a full NLP pipeline.
- **Match scoring** (`utils/matchScore.js`) is simple skill-overlap percentage — swap in a smarter algorithm later without touching any routes.
- **Chatbot** is currently stateless per request (aside from storing history in `Conversations` for continuity within a session) — it does NOT yet look up the user's actual applications/jobs/candidates from MongoDB to ground its answers. That's the planned "grounded" upgrade: give Claude tool-use access to functions like `getMyApplications()` / `searchCandidates()` so answers are based on real data.
- **Database** is configured for a local MongoDB instance. To move to Atlas later, only `MONGODB_URI` in `.env` needs to change — no code changes required.
