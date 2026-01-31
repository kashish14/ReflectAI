"use strict";
/**
 * Seed in-memory repositories with demo data so all UI components can be seen with data.
 * Uses demo user: tenantId 'default', userId 'demo-user'.
 * Run once at server startup.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoData = seedDemoData;
const uuid_1 = require("uuid");
const conversation_repository_1 = require("./repositories/conversation.repository");
const analysis_repository_1 = require("./repositories/analysis.repository");
const privacy_1 = require("./lib/privacy");
const DEMO_TENANT = 'default';
const DEMO_USER = 'demo-user';
const DEMO_CONVERSATION_1 = `Hi, thanks for reaching out!
I really appreciate your help with this.
Let me know if you need anything else.
Have a great day!`;
const DEMO_CONVERSATION_2 = `Quick question about the project timeline.
We need to align on the deliverables.
Can we schedule a call tomorrow?`;
function seedConversations() {
    const ids = [];
    const conv1Id = (0, uuid_1.v4)();
    const conv2Id = (0, uuid_1.v4)();
    conversation_repository_1.conversationRepository.create(DEMO_TENANT, DEMO_USER, conv1Id, {
        contentHash: (0, privacy_1.contentHash)(DEMO_CONVERSATION_1),
        rawContent: DEMO_CONVERSATION_1,
        storeRaw: true,
    });
    ids.push({ id: conv1Id });
    conversation_repository_1.conversationRepository.create(DEMO_TENANT, DEMO_USER, conv2Id, {
        contentHash: (0, privacy_1.contentHash)(DEMO_CONVERSATION_2),
        rawContent: DEMO_CONVERSATION_2,
        storeRaw: true,
    });
    ids.push({ id: conv2Id });
    return ids;
}
function seedAnalyses(conversationIds) {
    const result = [];
    conversationIds.forEach((convId) => {
        const analysisId = (0, uuid_1.v4)();
        analysis_repository_1.analysisRepository.create(DEMO_TENANT, DEMO_USER, analysisId, convId);
        analysis_repository_1.analysisRepository.updateStatus(DEMO_TENANT, DEMO_USER, analysisId, 'completed', {
            sentiment: {
                scores: [
                    { message_index: 0, label: 'positive', score: 0.8 },
                    { message_index: 1, label: 'positive', score: 0.9 },
                    { message_index: 2, label: 'neutral', score: 0.1 },
                    { message_index: 3, label: 'positive', score: 0.7 },
                ],
                aggregate: 'Overall positive tone with gratitude and cooperation.',
                emotional_labels: ['grateful', 'friendly', 'cooperative'],
            },
            clarity: {
                readability: 8.2,
                flags: ['Clear sentence structure', 'Appropriate length'],
            },
            behavioral: {
                message_length_avg: 42,
                message_count: 4,
            },
        }, new Date().toISOString(), '1.0.0');
        result.push({ id: analysisId, conversationId: convId });
    });
    return result;
}
function seedDemoData() {
    const conversations = seedConversations();
    const conversationIds = conversations.map((c) => c.id);
    seedAnalyses(conversationIds);
}
//# sourceMappingURL=seed.js.map