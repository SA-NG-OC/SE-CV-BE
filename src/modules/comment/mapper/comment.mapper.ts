import { CommentDB, CommentOfMyCompany, CommentResponse, CommentResponseDetail } from "../interface";

export class CommentMapper {
    static toResponse(db: CommentDB): CommentResponse {
        return {
            id: db.id,
            studentId: db.student_id,
            companyId: db.company_id,
            rating: db.rating,
            content: db.content,
            createdAt: db.created_at,
        }
    }

    static toResponseArray(dbArray: CommentDB[]): CommentResponse[] {
        return dbArray.map(db => this.toResponse(db));
    }

    static toResponseDetail(raw: {
        id: number;
        student_id: number;
        student_name: string;
        student_avatar: string | null;
        company_id: number;
        rating: number;
        content: string;
        created_at: Date;
    }): CommentResponseDetail {
        return {
            id: raw.id,
            studentId: raw.student_id,
            studentName: raw.student_name,
            studentAvatar: raw.student_avatar,
            companyId: raw.company_id,
            rating: raw.rating,
            content: raw.content,
            createdAt: raw.created_at,

        }
    }

    static toResponseDetailArray(raw: {
        id: number;
        student_id: number;
        student_name: string;
        student_avatar: string | null;
        company_id: number;
        rating: number;
        content: string;
        created_at: Date;
    }[]): CommentResponseDetail[] {
        return raw.map((item) => this.toResponseDetail(item));
    }

    static toCommentAnonymous(raw: {
        id: number;
        company_id: number;
        rating: number;
        content: string;
        created_at: Date;
    }): CommentOfMyCompany {
        return {
            id: raw.id,
            companyId: raw.company_id,
            rating: raw.rating,
            content: raw.content,
            createdAt: raw.created_at,
        }
    }

    static toCommentAnonymousArray(raw: {
        id: number;
        company_id: number;
        rating: number;
        content: string;
        created_at: Date;
    }[]) {
        return raw.map((item) => this.toCommentAnonymous(item));
    }
}
