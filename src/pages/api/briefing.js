// src/pages/api/briefing.js
// Uses the official MindStudio Node SDK
// API key stays server-side — never exposed to browser

import { MindStudio } from 'mindstudio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.MINDSTUDIO_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'MINDSTUDIO_KEY not configured. Add it in Vercel → Settings → Environment Variables.'
    });
  }

  try {
    const client = new MindStudio(apiKey);

    const { result, billingCost } = await client.run({
      workerId: 'c4f9d9eb-0ffd-4dd2-b05e-24e80f319984',
      workflow: 'Main',
      variables: {},
    });

    // result.briefingAI contains the JSON — may be string or object
    let briefing = result?.briefingAI;

    if (typeof briefing === 'string') {
      try {
        briefing = JSON.parse(briefing);
      } catch (parseErr) {
        console.error('Failed to parse briefingAI:', parseErr);
        return res.status(500).json({
          error: 'Agent returned invalid JSON',
          raw: briefing,
        });
      }
    }

    if (!briefing) {
      return res.status(500).json({
        error: 'No briefing data in response',
        raw: result,
      });
    }

    // Log billing cost for monitoring
    if (billingCost) {
      console.log(`Briefing generated. Cost: ${billingCost}`);
    }

    return res.status(200).json(briefing);

  } catch (err) {
    console.error('MindStudio error:', err.message);
    return res.status(500).json({
      error: err.message || 'Failed to fetch briefing',
    });
  }
}
