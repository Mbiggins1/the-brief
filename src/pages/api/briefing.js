export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gistRawUrl = process.env.GIST_RAW_URL;

  if (!gistRawUrl) {
    return res.status(500).json({
      error: 'GIST_RAW_URL not configured. Add it in Vercel Settings.',
    });
  }

  try {
    const url = `${gistRawUrl}?t=${Date.now()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Gist fetch failed: ${response.status}`);
    }

    const briefing = await response.json();

    if (!briefing.date && !briefing.stories) {
      return res.status(503).json({
        error: 'Briefing not yet generated. The background job may not have run yet.',
      });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json(briefing);
  } catch (err) {
    console.error('Gist fetch error:', err.message);
    return res.status(502).json({
      error: 'Failed to load cached briefing data.',
    });
  }
}
