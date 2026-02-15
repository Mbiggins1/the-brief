import { MindStudio } from 'mindstudio';

const GIST_ID = process.env.GIST_ID;
const GIST_TOKEN = process.env.GIST_TOKEN;
const MINDSTUDIO_KEY = process.env.MINDSTUDIO_KEY;

async function fetchBriefing() {
  const client = new MindStudio(MINDSTUDIO_KEY);

  const { result, billingCost } = await client.run({
    workerId: 'c4f9d9eb-0ffd-4dd2-b05e-24e80f319984',
    workflow: 'Main',
    variables: {},
  });

  if (billingCost) {
    console.log(`Billing cost: ${billingCost}`);
  }

  let briefing = result?.briefingAI;

  if (typeof briefing === 'string') {
    briefing = JSON.parse(briefing);
  }

  if (!briefing || typeof briefing !== 'object') {
    throw new Error('No valid briefing data in MindStudio response');
  }

  return briefing;
}

async function getCurrentGist() {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${GIST_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch gist: ${res.status}`);
  }

  return res.json();
}

async function updateGist(briefing) {
  const payload = {
    ...briefing,
    _cachedAt: new Date().toISOString(),
  };

  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${GIST_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: `The Brief - cached ${payload._cachedAt}`,
      files: {
        'briefing.json': {
          content: JSON.stringify(payload, null, 2),
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to update gist: ${res.status} ${body}`);
  }

  console.log(`Gist updated at ${payload._cachedAt}`);
}

async function main() {
  if (!MINDSTUDIO_KEY) throw new Error('MINDSTUDIO_KEY not set');
  if (!GIST_TOKEN) throw new Error('GIST_TOKEN not set');
  if (!GIST_ID) throw new Error('GIST_ID not set');

  const gist = await getCurrentGist();
  if (!gist) {
    throw new Error(`Gist ${GIST_ID} not found. Create it manually first.`);
  }

  try {
    console.log('Calling MindStudio agent...');
    const briefing = await fetchBriefing();
    await updateGist(briefing);
    console.log('Refresh complete.');
  } catch (err) {
    console.error('MindStudio agent failed:', err.message);

    const existingContent = gist.files?.['briefing.json']?.content;
    const hasRealData = existingContent && existingContent !== '{}' && existingContent.includes('"stories"');
    if (hasRealData) {
      console.log('Keeping existing cached data (agent failure is non-destructive).');
      process.exit(0);
    }

    process.exit(1);
  }
}

main();
