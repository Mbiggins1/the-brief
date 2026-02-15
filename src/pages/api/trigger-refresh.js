import { MindStudio } from 'mindstudio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.MINDSTUDIO_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'MINDSTUDIO_KEY not configured.' });
  }

  try {
    const client = new MindStudio(apiKey);
    const callbackUrl = `https://the-brief-beta.vercel.app/api/mindstudio-callback`;

    console.log('Triggering MindStudio:', {
      workerId: '7492ab09-9841-41ea-a7af-995e3fe5bd75',
      workflow: 'Main',
      callbackUrl,
    });

    const result = await client.run({
      workerId: '7492ab09-9841-41ea-a7af-995e3fe5bd75',
      workflow: 'Main',
      variables: {},
      callbackUrl,
    });

    console.log('MindStudio response:', JSON.stringify(result));
    return res.status(200).json({ triggered: true, threadId: result?.threadId });
  } catch (err) {
    console.error('MindStudio trigger error:', err.message, err.code, err.statusCode);
    return res.status(500).json({ error: 'Failed to trigger briefing generation.', detail: err.message });
  }
}
