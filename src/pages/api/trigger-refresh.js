export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ghToken = process.env.GH_ACTIONS_TOKEN;
  if (!ghToken) {
    return res.status(500).json({ error: 'GH_ACTIONS_TOKEN not configured.' });
  }

  try {
    const response = await fetch(
      'https://api.github.com/repos/Mbiggins1/the-brief/actions/workflows/refresh-briefing.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'master' }),
      }
    );

    if (response.status === 204) {
      return res.status(200).json({ triggered: true });
    }

    const body = await response.text();
    console.error('GitHub dispatch failed:', response.status, body);
    return res.status(502).json({ error: `GitHub API returned ${response.status}` });
  } catch (err) {
    console.error('Trigger error:', err.message);
    return res.status(500).json({ error: 'Failed to trigger refresh.' });
  }
}
