"use strict";
/**
 * AI integration layer: run full analysis (preprocess → pipelines → aggregate).
 * Content in memory only; not logged or persisted by this layer.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBehavioralPipeline = exports.runClarityPipeline = exports.runSentimentPipeline = exports.preprocess = void 0;
exports.runAnalysis = runAnalysis;
const preprocessing_1 = require("./preprocessing");
const sentiment_1 = require("./pipelines/sentiment");
const clarity_1 = require("./pipelines/clarity");
const behavioral_1 = require("./pipelines/behavioral");
function runAnalysis(content, options) {
    const input = (0, preprocessing_1.preprocess)(content);
    const { messages } = input;
    const sentiment = (0, sentiment_1.runSentimentPipeline)(messages);
    const clarity = (0, clarity_1.runClarityPipeline)(messages);
    const behavioral = (0, behavioral_1.runBehavioralPipeline)(messages);
    const results = {
        sentiment,
        clarity,
        behavioral,
    };
    return Promise.resolve({
        results,
        model_version: options.modelVersion,
    });
}
var preprocessing_2 = require("./preprocessing");
Object.defineProperty(exports, "preprocess", { enumerable: true, get: function () { return preprocessing_2.preprocess; } });
var sentiment_2 = require("./pipelines/sentiment");
Object.defineProperty(exports, "runSentimentPipeline", { enumerable: true, get: function () { return sentiment_2.runSentimentPipeline; } });
var clarity_2 = require("./pipelines/clarity");
Object.defineProperty(exports, "runClarityPipeline", { enumerable: true, get: function () { return clarity_2.runClarityPipeline; } });
var behavioral_2 = require("./pipelines/behavioral");
Object.defineProperty(exports, "runBehavioralPipeline", { enumerable: true, get: function () { return behavioral_2.runBehavioralPipeline; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map