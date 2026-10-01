# HireHub — Job Portal Frontend

A clean, animated React + Vite frontend for the DBSEDBD project **Job Portal with Resume Parsing and Matching**.

## Included UI modules

- Job seeker registration/login
- Recruiter registration/login
- Job discovery and search
- Candidate dashboard
- Resume upload interface
- Resume parsing result state
- Skill-based match scores
- Application status UI
- Interview scheduling UI
- Recruiter dashboard
- Candidate ranking UI
- Admin management dashboard
- Responsive mobile navigation
- 3D animated hero using React Three Fiber
- Animated cards using Framer Motion
- Live remote team image from Unsplash

## Run in VS Code

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally:

http://localhost:5173

## Backend connection

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

Then replace the mock UI actions with functions from `src/api.js`.

## Suggested backend route contract

POST /api/auth/register
POST /api/auth/login
GET  /api/jobs
POST /api/jobs
POST /api/candidate/resume
GET  /api/candidate/profile
GET  /api/matches
POST /api/jobs/{job_id}/apply
GET  /api/applications
POST /api/interviews
GET  /api/admin/analytics
