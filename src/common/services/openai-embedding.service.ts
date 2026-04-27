import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import * as crypto from "crypto";

@Injectable()
export class OpenAIEmbeddingService {
    private readonly genAI: GoogleGenerativeAI;
    private readonly logger = new Logger(OpenAIEmbeddingService.name);
    // Model Gemini mới nhất
    private readonly MODEL = "gemini-embedding-2";

    constructor(private readonly config: ConfigService) {
        const apiKey = this.config.get<string>("GEMINI_API_KEY") || "GEMINI_API_KEY";
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Chuyển đổi văn bản thành Vector 1536 chiều
     */
    async generate(text: string): Promise<number[]> {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.MODEL });

            const result = await model.embedContent({
                content: {
                    role: "user", // 👈 FIX QUAN TRỌNG
                    parts: [{ text: text.slice(0, 10000) }],
                },
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                outputDimensionality: 1536,
            } as any);

            return result.embedding.values;
        } catch (error: any) {
            this.logger.error(`Gemini Embedding Error: ${error.message}`);
            throw error;
        }
    }

    /** Tạo nội dung text để embed cho job - Đã gộp Salary/Location */
    buildJobText(job: any): string {
        return [
            `Job Title: ${job.job_title}`,
            `Description: ${job.job_description}`,
            `Requirements: ${job.requirements}`,
            `Skills Required: ${job.skill_names?.join(", ") ?? job.skill_ids?.join(", ") ?? "Not specified"}`,
            `Salary Range: ${job.salary_min ?? 0} - ${job.salary_max ?? 'Negotiable'}`,
            `Location: ${job.city ?? job.Location ?? 'Not specified'}`,
        ].join("\n").replace(/\s+/g, ' ').trim();
    }

    /** Tạo nội dung text để embed cho student - Đã gộp Salary/Location */
    buildStudentText(student: any): string {
        return [
            `Name: ${student.full_name}`,
            `Bio: ${student.bio ?? ""}`,
            `Career Goals: ${student.career_goals ?? ""}`,
            `Skills: ${student.skill_names?.join(", ") ?? student.skill_ids?.join(", ") ?? ""}`,
            `Expected Salary: ${student.desired_salary_min ?? 0} - ${student.desired_salary_max ?? ""}`,
            `Preferred Location: ${student.desired_location ?? ""}`,
        ]
            .filter((line) => line.length > 5)
            .join("\n")
            .replace(/\s+/g, ' ')
            .trim();
    }

    hashContent(text: string): string {
        return crypto.createHash("md5").update(text).digest("hex");
    }
}