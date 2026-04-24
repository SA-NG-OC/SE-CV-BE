import { InferSelectModel } from 'drizzle-orm';
import * as schema from '../../../database/schema';

export type CommentDB = InferSelectModel<typeof schema.comments>;

export interface CommentResponse {
    id: number;
    studentId: number;
    companyId: number;
    rating: number;
    content: string;
    createdAt: Date;
}

export interface CommentResponseDetail {
    id: number;
    studentId: number;
    studentName: string;
    studentAvatar: string | null;
    companyId: number;
    rating: number;
    content: string;
    createdAt: Date;
}

export interface CommentOfMyCompany {
    id: number;
    companyId: number;
    rating: number;
    content: string;
    createdAt: Date;
}

export interface RatingDistribution {
    rating: number; // 1, 2, 3, 4, 5
    percentage: number; // Ví dụ: 0.25 (tức 25%)
    count: number;
}

export interface CompanyCommentStatistics {
    totalComments: number;
    averageRating: number;
    distribution: RatingDistribution[];
}

