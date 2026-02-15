export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gistToken = process.env.GIST_TOKEN;
  const gistId = process.env.GIST_ID;

  if (!gistToken || !gistId) {
    console.error('Missing GIST_TOKEN or GIST_ID env vars');
    return res.status(500).json({ error: 'Gist configuration missing.' });
  }

  try {
    const payload = req.body;

    let briefing = payload?.result?.briefingAI;
    if (typeof briefing === 'string') {
      briefing = JSON.parse(briefing);
    }

    if (!briefing || !briefing.stories) {
      console.error('Callback received but no valid briefing data:', JSON.stringify(payload).slice(0, 500));
      return res.status(400).json({ error: 'No valid briefing data in callback.' });
    }

    const cached = {
      ...briefing,
      _cachedAt: new Date().toISOString(),
    };

    const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${gistToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `The Brief - cached ${cached._cachedAt}`,
        files: {
          'briefing.json': {
            content: JSON.stringify(cached, null, 2),
          },
        },
      }),
    });

    if (!gistRes.ok) {
      const body = await gistRes.text();
      console.error('Gist update failed:', gistRes.status, body);
      return res.status(502).json({ error: 'Failed to update Gist.' });
    }

    console.log(`Briefing cached at ${cached._cachedAt}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Callback error:', err.message);
    return res.status(500).json({ error: 'Callback processing failed.' });
  }
}
