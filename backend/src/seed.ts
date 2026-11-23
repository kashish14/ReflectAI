/**
 * Seed the in-memory repositories with demo data for user 'demo-user' (tenant 'default').
 * Each conversation is analyzed with the real local pipeline, and timestamps are spread
 * over the past week so the dashboard trend chart has something to show.
 */

import { randomUUID as uuidv4 } from 'crypto';
import { conversationRepository } from './repositories/conversation.repository';
import { analysisRepository } from './repositories/analysis.repository';
import { contentHash } from './lib/privacy';
import { runAnalysis } from './ai';
import { config } from './config';

const DEMO_TENANT = 'default';
const DEMO_USER = 'demo-user';
const DAY_MS = 24 * 60 * 60 * 1000;

const DEMO_CONVERSATIONS: Array<{ daysAgo: number; text: string }> = [
  {
    daysAgo: 6,
    text: `Hi, thanks for reaching out!
I really appreciate your help with the onboarding docs.
They were clear and easy to follow.
Let me know if you need anything else from me.`,
  },
  {
    daysAgo: 5,
    text: `Quick question about the project timeline.
We need to align on the deliverables before Friday.
Can we schedule a call tomorrow morning?
I want to make sure nothing is blocked.`,
  },
  {
    daysAgo: 4,
    text: `The release slipped again and I am frustrated.
The build broke twice and nobody flagged it.
This is a problem we keep having.
Honestly I am worried we will miss the deadline.`,
  },
  {
    daysAgo: 3,
    text: `Sorry for the confusion yesterday.
I think we fixed the pipeline issue.
The tests are passing now, which is great.
Thanks for staying late to help.`,
  },
  {
    daysAgo: 1,
    text: `Can you review the design proposal when you get a chance?
I tried to keep it short.
Happy to walk through it on a call.
Some parts are still unclear to me, so feedback is welcome.`,
  },
  {
    daysAgo: 0,
    text: `Great work on the demo today!
The team loved the new dashboard.
I am excited about the next sprint.
Thank you all for the effort.`,
  },
];

export async function seedDemoData(now: Date = new Date()): Promise<void> {
  for (const { daysAgo, text } of DEMO_CONVERSATIONS) {
    const at = new Date(now.getTime() - daysAgo * DAY_MS).toISOString();
    const conversationId = uuidv4();
    const conversation = await conversationRepository.create(DEMO_TENANT, DEMO_USER, conversationId, {
      contentHash: contentHash(text),
      rawContent: text,
      storeRaw: true,
    });
    conversation.created_at = at;

    const analysisId = uuidv4();
    const analysis = await analysisRepository.create(DEMO_TENANT, DEMO_USER, analysisId, conversationId);
    analysis.created_at = at;
    const { results, model_version } = await runAnalysis(text, { modelVersion: config.aiModelVersion });
    await analysisRepository.updateStatus(
      DEMO_TENANT,
      DEMO_USER,
      analysisId,
      'completed',
      results,
      at,
      model_version
    );
  }
}
