# The Royal Knot: Wedding OS

## Run it (needs Node 18+, nothing to install)
1. Backend:  `cd backend && node server.js`   (API on http://localhost:4000)
2. Frontend: `cd frontend && python3 -m http.server 5173`, then open http://localhost:5173
   (use `?api=http://host:port` to point at another server)

First sign-in as planner (planner123) so demo data gets created. Other demo passwords: couple123, founder123, vendor123.
Override with env vars PLANNER_PW, COUPLE_PW, FOUNDER_PW, VENDOR_PW. Data is saved in backend/data.json (delete it to reset).

## What the backend enforces
Sign-in with role tokens, a versioned save (409 if two people edit at once), quotes only after a signed agreement,
exactly one winning quote, payments in order, no paying a vendor more than their bill, a read-only founder,
vendors who can only check in, and couples who cannot touch vendor money or the plan.
The app refreshes every 4 seconds, so a vendor check-in shows up on the planner screen.
