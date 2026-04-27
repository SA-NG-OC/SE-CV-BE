import { Injectable } from "@nestjs/common";
import { ScoreResult } from "../types/recommendation.types";

export interface MergeOptions {
    alpha: number;   // weight cho rule-based (0–1)
    topK: number;
}

@Injectable()
export class HybridMerger {
    merge(
        ruleResults: ScoreResult[],
        vectorResults: ScoreResult[],
        options: MergeOptions,
    ): Array<ScoreResult & { rule_score: number; vector_score: number; final_score: number }> {
        const { alpha, topK } = options;
        const beta = 1 - alpha;

        const ruleMap = new Map(ruleResults.map((r) => [r.id, r]));
        const vectorMap = new Map(vectorResults.map((v) => [v.id, v]));

        const allIds = new Set([
            ...ruleResults.map((r) => r.id),
            ...vectorResults.map((v) => v.id),
        ]);

        const merged = Array.from(allIds).map((id) => {
            const rule = ruleMap.get(id);
            const vector = vectorMap.get(id);

            const rule_score = rule?.score ?? 0;
            const vector_score = vector?.score ?? 0;
            const final_score = alpha * rule_score + beta * vector_score;

            // Gộp reasons từ cả 2 scorer
            const reasons = [
                ...(rule?.reasons ?? []),
                ...(vector?.reasons ?? []),
            ];

            return {
                id,
                score: final_score,
                rule_score,
                vector_score,
                final_score,
                reasons,
            };
        });

        return merged
            .sort((a, b) => b.final_score - a.final_score)
            .slice(0, topK);
    }
}