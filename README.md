# Aayush Mishra — Portfolio

Personal portfolio for data analytics, data engineering, and AI / ML roles.

## Development

Use Node.js 22. Run `npm run dev` and open port 3000. No package dependencies or secrets are required.

Run `npm run check` for JavaScript syntax checks and `npm run build` to create the production website in `dist/`.

## Deploy on Vercel

Import this repository into Vercel, select the `main` branch, and keep the root directory at the repository root. The included `vercel.json` builds the static website and deploys `api/leetcode.js` as a serverless function. No environment variables are needed.

After deployment, check the homepage, images, search, mobile layout, dark mode, and `/api/leetcode`. The LeetCode section fetches public statistics for `AAYUSHMISHRA0329`, caches successful responses for 15 minutes, and shows an unavailable message when LeetCode blocks or fails the request. The heatmap shows daily submissions over the last 365 days; solved counts represent unique accepted problems.

The standalone HTML review file does not include the backend. Screenshots and review files are excluded from deployment and Git.
