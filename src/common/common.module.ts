import { Module } from "@nestjs/common";
import { OpenAIEmbeddingService } from "./services/openai-embedding.service";

@Module({
    providers: [OpenAIEmbeddingService],
    exports: [OpenAIEmbeddingService],
})
export class CommonModule { }