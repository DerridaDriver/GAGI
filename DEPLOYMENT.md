# GAGI Preview Deployment

This document covers Preview deployment preparation only. Production deployment
and the GAGI 0.5 version bump are intentionally deferred to 0.5D-2.

## 1. Push the repository to GitHub

1. Create an empty GitHub repository for GAGI. Do not initialize it with a
   README, license, or .gitignore.
2. In this project directory, add the repository URL:

   ~~~bash
   git remote add origin <GITHUB_REPOSITORY_URL>
   git branch -M main
   git push -u origin main
   ~~~

3. Never commit .env.local or paste secrets into a commit, issue, or chat.

## 2. Import the project into Vercel

1. In the Vercel Dashboard, choose **Add New → Project**.
2. Import the GAGI GitHub repository.
3. Keep the detected framework as **Next.js**.
4. Use the repository root as the project root.
5. Keep the package manager detected from pnpm-lock.yaml.

## 3. Configure Preview environment variables

Add these values directly in **Vercel Project Settings → Environment
Variables** and enable them for **Preview**:

- DEEPSEEK_API_KEY
- SUPABASE_URL
- SUPABASE_SECRET_KEY
- GAGI_RATE_LIMIT_SALT

Optional server-side limit overrides:

- GAGI_LIMIT_SESSION_10M
- GAGI_LIMIT_SESSION_24H
- GAGI_LIMIT_IP_10M
- GAGI_LIMIT_IP_24H
- GAGI_LIMIT_GLOBAL_24H

Do not create NEXT_PUBLIC_ versions of any secret. The five limit variables may
be omitted to use the defaults 3, 12, 6, 30, and 300.

## 4. Preview verification

After Vercel produces a Preview URL:

1. Confirm /, /ask, and /arena load and navigate correctly on desktop and
   mobile.
2. Generate one clearly labelled smoke-test round in /ask; confirm four
   candidates and submit an Ask vote.
3. Confirm /arena can read the generated round without calling DeepSeek and can
   save an Arena vote.
4. Confirm generation_requests, generations, candidates, and votes contain the
   expected test rows; confirm the stored IP value is only a salted
   64-character SHA-256 hash.
5. Trigger one low-cost 429 check using temporary Preview-only limit overrides,
   and confirm Arena remains usable.
6. Inspect the browser response and JavaScript bundle for server-only data, and
   inspect Vercel logs for accidental secret output.
7. Precisely delete only the smoke-test rows by their recorded UUIDs and restore
   the normal Preview limit settings.

## 5. Stop before Production

Do not assign a production domain, promote the deployment, or bump GAGI to 0.5
in this phase. Those steps belong to 0.5D-2.
