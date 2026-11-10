# Plumbcode

Plumbcode reviews GitHub pull requests against the rules you write for each repository. It publishes one check run for the current head commit and one sticky comment per pull request, and the result is always advisory: Plumbcode never blocks a merge.

## What it does

- Checks a pull request diff against the repository's `Rule-1`, `Rule-2`, ... rules.
- Compares each commit message with the change it actually makes.
- Re-runs when a pull request gets new commits, is reopened or marked ready, or has its labels or reviewers changed.
- Updates the same check run and comment on each run instead of posting duplicates.
- Stores review metadata only (counts, rule IDs, severities). It does not store source code or model messages.
- Reports `success` when there are no findings and `neutral` when there are, so a review cannot block a merge.

## How a review works

1. A pull request event reaches `POST /api/github/webhook`.
2. The route verifies `X-Hub-Signature-256`, returns `202`, and processes the review after the response with `after()`.
3. Plumbcode loads the repository rules, fetches the diff and up to 10 eligible commits, and runs the principles and commit checks.
4. Findings are rendered as a GitHub check run and a comment containing `<!-- plumbcode-review -->`. The next run updates both.
5. Review metadata is written to Postgres for the dashboard.

## Stack

- Next.js 16 (App Router, Turbopack) and React 19
- Prisma 7 with PostgreSQL
- Better Auth (email/password and GitHub sign-in)
- Octokit / GitHub App
- Google Gemini through `@google/genai`
- Tailwind CSS 4

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

Create `.env` in the project root:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Better Auth signing secret |
| `BETTER_AUTH_URL` | Yes | Public app URL, e.g. `http://localhost:3000` |
| `GITHUB_APP_ID` | Yes | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | Yes | GitHub App private key; `\n` escapes are normalized |
| `GITHUB_WEBHOOK_SECRET` | Yes | Secret configured on the GitHub App webhook |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth app client ID for sign-in |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth app client secret |
| `NEXT_PUBLIC_GITHUB_APP_SLUG` | Yes | Public GitHub App slug, used for the install URL |
| `GEMINI_API_KEY` | Yes | Gemini API key used for reviews |
| `PLUMBCODE_MODEL` | No | Overrides the primary model; leave unset unless needed |

`.env*` files are gitignored. Never commit real credentials.

### 3. Set up the database

The Prisma config in this repository is `prisma7.config.ts`, so pass it explicitly:

```bash
npx prisma migrate dev --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
```

For production, apply only the existing migrations:

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, and connect the GitHub App from `/dashboard/repositories`.

## GitHub App setup

Plumbcode uses two sets of GitHub credentials: the App for repository access and webhooks, and OAuth credentials for user sign-in. The OAuth credentials can be the GitHub App's own client ID and secret, or a separate OAuth app.

Create a GitHub App with:

- **Homepage URL:** your app URL.
- **Setup URL:** `https://<your-domain>/api/github/setup` (GitHub appends `installation_id`).
- **Webhook URL:** `https://<your-domain>/api/github/webhook`.
- **Webhook secret:** the value of `GITHUB_WEBHOOK_SECRET`.
- **Repository permissions:** Checks (write), Contents (read), Metadata (read), Pull requests (write).
- **Events:** Installation, Installation repositories, Pull request.

For sign-in, configure the OAuth credentials with the callback URL `https://<your-domain>/api/auth/callback/github`.

The install callback verifies the installation with the signed-in user's GitHub token. An installation can belong to only one Plumbcode user; another user cannot claim it later.

## Repository rules

Open `/dashboard/repositories`, choose a repository, and add rules in the editor. Each rule is one block:

```markdown
Rule-1
Never modify generated files.

Rule-2
Keep server actions in files marked "use server".
```

The editor stores a fixed preamble plus these blocks. Limits: 50 rules and 2,000 characters per rule. An invalid or empty rule set is treated as "no rules" so it cannot break pull-request checks.

## Review model

Reviews use Gemini's free tier. The primary model is measured fastest first:

```ts
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash"];
```

Each model gets one 40-second attempt. Plumbcode moves to the next model on a timeout, `404` (retired model), `429`, or any `5xx`. Non-retryable API errors fail the check instead of retrying.

### Changing the model

`PLUMBCODE_MODEL` overrides the primary model:

```bash
PLUMBCODE_MODEL="gemini-3.6-flash"
```

If it is unset, the code uses `gemini-3.5-flash-lite`. **Remove a stale `PLUMBCODE_MODEL` from Vercel** after changing the code default; otherwise the old value wins.

The ping script uses the same `thinkingLevel: LOW` setting and a realistic ~26k-character prompt:

```bash
node --env-file=.env scripts/gemini-ping.mjs gemini-3.5-flash-lite gemini-3.6-flash gemini-3.8-flash gemini-3.5-flash
```

If the key is in `.env.local` instead, use `--env-file=.env.local`. Node accepts multiple flags when both files are needed:

```bash
node --env-file=.env.local --env-file=.env scripts/gemini-ping.mjs gemini-3.5-flash-lite
```

Measured on November 10, 2026:

| Model | Result | Time |
| --- | --- | --- |
| `gemini-3.5-flash-lite` | ok | 3,737 ms |
| `gemini-3.5-flash` | ok | 2,708 ms |
| `gemini-3.6-flash` | ok | 13,343 ms |
| `gemini-3.8-flash` | 503 | 5,175 ms |

Re-run the ping when models change or reviews get slow.

### Free-tier warning

Google's Gemini free tier may use prompts and responses to improve its products. Confirm the current terms before sending customer code, and avoid enabling billing on the key's project if you want to stay on the free tier. A paid key provides higher quotas and different data terms; that decision should be made before launch.

## Review limits

- Up to 10 recent eligible commits per review.
- Up to 5,000 characters of diff per commit.
- Up to 120,000 characters per model prompt; larger prompts are truncated.
- Up to 50 annotations per check run.
- Rules and commits are checked in parallel, but each model call falls back sequentially.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `node --env-file=.env scripts/gemini-ping.mjs <models...>` | Measure model latency with production settings |

## Deployment

1. Add every environment variable above to the hosting project.
2. Run `npx prisma migrate deploy --config prisma7.config.ts` against the production database.
3. Deploy. The webhook route allows up to 300 seconds (`maxDuration = 300`).
4. Point the GitHub App webhook and setup URLs at the deployed domain.
5. Confirm the deployed commit matches the latest push, then open a test pull request.
6. In the logs, look for model timing lines:

   ```text
   Plumbcode model: gemini-3.5-flash-lite answered in 6120ms (prompt 4300 chars)
   ```

   Similar lines report timeouts (including prompt size) and API errors, so a slow review shows whether the model, the prompt size, or Google's capacity is responsible.

## Project layout

```text
app/api/github/webhook/   GitHub webhook and signature verification
app/api/github/setup/     GitHub App install callback
app/dashboard/            Repositories, rules, and review dashboard
lib/checks/               Diff, principles, commit, and model checks
lib/github-review.ts      Review pipeline and GitHub check/comment output
lib/principles.ts         Rule parsing and serialization
prisma/schema.prisma      Database schema and migrations
scripts/gemini-ping.mjs   Standalone model latency check
```
