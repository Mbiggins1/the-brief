import { MindStudio } from 'mindstudio';

const MINDSTUDIO_KEY = process.env.MINDSTUDIO_KEY;

async function triggerBriefing() {
  const client = new MindStudio(MINDSTUDIO_KEY);
  const callbackUrl = 'https://the-brief-beta.vercel.app/api/mindstudio-callback';

  console.log(`Triggering with callbackUrl: ${callbackUrl}`);
  await client.run({
    workerId: '7492ab09-9841-41ea-a7af-995e3fe5bd75',
    workflow: 'Main',
    variables: {},
    callbackUrl,
  });

  console.log('MindStudio triggered (async). Callback will update Gist when done.');
}

async function main() {
  if (!MINDSTUDIO_KEY) throw new Error('MINDSTUDIO_KEY not set');

  try {
    console.log('Triggering MindStudio agent (async)...');
    await triggerBriefing();
    console.log('Trigger complete. Callback will handle Gist update.');
  } catch (err) {
    console.error('MindStudio trigger failed:', err.message);
    process.exit(1);
  }
}

main();
