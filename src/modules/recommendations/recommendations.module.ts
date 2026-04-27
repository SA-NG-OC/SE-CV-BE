import { Module } from "@nestjs/common";
import { RecommendationsController } from "./recommendations.controller";
import { RecommendationsService } from "./recommendations.service";
import { RecommendationRepository } from "./repositories/recommendation.repository";
import { RuleBasedScorer } from "./scorers/rule-based.scorer";
import { EmbeddingScorer } from "./scorers/embedding.scorer";
import { HybridMerger } from "./merger/hybrid-merger";
import { CommonModule } from "src/common/common.module";
import { EmbeddingProcessor } from "./embedding/processor/embedding.processor";
import { EmbeddingRepository } from "./embedding/repositories/embedding.repository";
import { EmbeddingQueueService } from "./embedding/embedding-queue.service";
import { BullModule } from '@nestjs/bullmq';
import { RECOMMENDATION_REPOSITORY } from "./repositories/recommendation-repository.interface";
import { EMBEDDING_REPOSITORY } from "./embedding/repositories/embedding-repository.interface";

@Module({
  imports: [CommonModule, BullModule.registerQueue({
    name: 'embedding',
  })],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    {
      provide: RECOMMENDATION_REPOSITORY,
      useClass: RecommendationRepository,
    },
    EmbeddingScorer,
    EmbeddingProcessor,
    {
      provide: EMBEDDING_REPOSITORY,
      useClass: EmbeddingRepository,
    },
    EmbeddingQueueService,
    RuleBasedScorer,
    EmbeddingScorer,
    HybridMerger,
  ],
  exports: [EmbeddingQueueService],
})
export class RecommendationsModule { }