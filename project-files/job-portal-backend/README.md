# HireHub Backend

Node.js + Express + MongoDB backend for the HireHub job portal frontend.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod` process reachable at `mongodb://127.0.0.1:27017`)
- Optional: a Google Gemini API key (https://aistudio.google.com/app/apikey) for AI resume parsing and the chatbot

## Setup

```bash
cd job-portal-backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `JWT_SECRET` — any long random string
- `GEMINI_API_KEY` — optional; without it resume parsing uses the rule-based parser and the chatbot returns a fallback reply

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

There is no Postman collection in this repository yet. To test the API manually with Postman (or any HTTP client):

1. Send `POST /api/auth/register` (as a candidate or recruiter) with a JSON body — copy the returned `token`.
2. Store it in a Postman variable such as `token`.
3. Send other requests with the header `Authorization: Bearer {{token}}`. Resume uploads use `multipart/form-data` with the file in a field named `resume`.

## Notes on what's implemented vs. what's next

- **Resume parsing** extracts text from PDF/DOCX (with OCR for scanned PDFs) and structures it with Gemini when `GEMINI_API_KEY` is set (`utils/aiResumeParser.js`); otherwise, or if Gemini fails, it falls back to the rule-based parser in `utils/resumeParser.js`.
- **Match scoring** (`utils/matchScore.js`) is simple skill-overlap percentage — swap in a smarter algorithm later without touching any routes.
- **Chatbot** is currently stateless per request (aside from storing history in `Conversations` for continuity within a session) — it does NOT yet look up the user's actual applications/jobs/candidates from MongoDB to ground its answers. That's the planned "grounded" upgrade: give the Gemini model tool-use access to functions like `getMyApplications()` / `searchCandidates()` so answers are based on real data.
- **Database** is configured for a local MongoDB instance. To move to Atlas later, only `MONGODB_URI` in `.env` needs to change — no code changes required.
