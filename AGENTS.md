# Project: AI Contract Automation (core-4)

## What exists
- **Backend** (Express + TypeScript + Prisma + PostgreSQL):
  - `POST /api/upload` — Upload PDF/DOCX, extract text, analyze via OpenAI, save results
  - `POST /api/upload/analyze/:documentId` — Re-analyze existing document
  - `POST /api/analysis/contracts/:contractId` — Local keyword-based analysis fallback
  - Two AI modes: `"single"` (one GPT call) and `"crew"` (parallel risk + clause extraction via GPT)
  - Prisma schema: `User`, `Document`, `Contract`, `RiskAnalysis`, `Clause`, `FileUpload`, etc.
- **Frontend** (React):
  - Upload page (`UploadContract.jsx`) — currently uses mock data, not wired to API
  - Contract details page (`ContractDetails.jsx`) — mock data
  - Auth pages (Login, Register)
  - API client in `lib/api.js` (Axios with JWT interceptor)

## Database
- PostgreSQL on AWS Lightsail (`ubuntu@13.212.187.177`)
- SSH tunnel: `ssh -i ~/Downloads/LightsailDefaultKey-ap-southeast-1.pem -L 5433:localhost:5432 ubuntu@13.212.187.177`
- `.env` DATABASE_URL: `postgresql://ai_contract_user:v6vFWnpKQiblQR6Eqm7iSiC2@localhost:5433/ai_contract`
- Migration ran successfully, schema is in sync.

## Status
- Backend and frontend are fully built.
- DB is connected and migrated.
- App can be started with `npm run dev`.
- Frontend upload/details pages still use mock data instead of calling real API.

## What to do next
- Wire frontend upload page to the actual `/api/upload` endpoint.
- Wire contract details page to fetch real data from `/api/analysis/contracts/:id`.
- Test end-to-end flow with a real PDF/DOCX.
