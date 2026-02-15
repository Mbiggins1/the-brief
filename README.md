# The Brief — AI News Dashboard

A personalized AI news dashboard powered by a MindStudio agent. Curates daily AI news across four pillars: Practical, Frontier, Economics, and Policy.

## Architecture

```
[MindStudio Agent] → mindstudio SDK → [Vercel Serverless Function] → [React Dashboard]
                                        (keeps API key secure)
```

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/the-brief.git
git push -u origin main
```

### 2. Deploy on Vercel
- Go to vercel.com and import the GitHub repo
- Framework: Next.js (auto-detected)
- No build settings changes needed

### 3. Add Environment Variable
In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `MINDSTUDIO_KEY` | Your MindStudio API key |

Get your API key at: https://app.mindstudio.ai/workspace/settings/developer?page=api-keys

### 4. Redeploy
After adding the env variable, trigger a redeploy from the Deployments tab.

## Local Development

```bash
# Create .env.local with your API key
echo "MINDSTUDIO_KEY=your_key_here" > .env.local

# Install and run
npm install
npm run dev
```

Open http://localhost:3000

## Tech Stack

- **Frontend:** Next.js + React (Pages Router)
- **API Layer:** Next.js API Routes (serverless)
- **MindStudio SDK:** `mindstudio` npm package (official Node client)
- **Hosting:** Vercel

## MindStudio Agent Configuration

The agent must output JSON matching the dashboard schema.

**Generate Text Block:**
- Output Schema: `JSON`
- Output Behavior: `Save to Variable`
- Variable name: `briefingAI_out`
- Sample Output: (the JSON schema template)

**Terminator Block:**
- Behavior: `End Session`
- JSON Output Key: `briefingAI`
- JSON Output Value: `{{briefingAI_out}}`

## File Structure

```
the-brief/
├── src/pages/
│   ├── index.js          # Dashboard UI (React)
│   └── api/
│       └── briefing.js   # Serverless route (calls MindStudio SDK)
├── package.json          # Includes mindstudio SDK dependency
├── next.config.js
├── vercel.json
└── .env.example
```
