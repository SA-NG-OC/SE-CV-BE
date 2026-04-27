import { ScoreResult } from "./recommendation.types";

export interface IScorer<TContext> {
    score(context: TContext): Promise<ScoreResult[]>;
}