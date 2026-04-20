import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as schema from '../../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, count } from 'drizzle-orm';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { ICommentsRepository } from './comment-repository.interface';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentMapper } from '../mapper/comment.mapper';
import { CommentOfMyCompany, CommentResponse, CommentResponseDetail } from '../interface';
import { Role, RoleName } from 'src/common/types/role.enum';
import { PaginationResponse } from 'src/common/types/pagination-response';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async create(data: CreateCommentDto, studentId: number): Promise<CommentResponse> {

        const [comment] = await this.db
            .insert(schema.comments)
            .values({
                student_id: studentId,
                rating: data.ratting,
                content: data.content,
                company_id: data.companyId,
            })
            .returning();

        return CommentMapper.toResponse(comment);
    }

    async update(id: number, studentId: number, data: UpdateCommentDto): Promise<CommentResponse | null> {
        const [updated] = await this.db
            .update(schema.comments)
            .set(data)
            .where(and(
                eq(schema.comments.id, id),
                eq(schema.comments.student_id, studentId)
            ))
            .returning();
        return CommentMapper.toResponse(updated);
    }

    async delete(id: number, studentId: number): Promise<boolean> {
        const result = await this.db
            .delete(schema.comments)
            .where(and(
                eq(schema.comments.id, id),
                eq(schema.comments.student_id, studentId)
            ))
            .returning({ id: schema.comments.id });

        return result.length > 0;
    }

    async getCompanyComment(
        companyId: number,
        page: number,
        limit: number
    ): Promise<PaginationResponse<CommentResponseDetail>> {
        const offset = (page - 1) * limit;
        const totalQuery = this.db
            .select({ total: count() })
            .from(schema.comments)
            .where(eq(schema.comments.company_id, companyId));

        const dataQuery = this.db
            .select({
                id: schema.comments.id,
                student_id: schema.comments.student_id,
                student_name: schema.students.full_name,
                student_avatar: schema.students.avatar_url,
                company_id: schema.comments.company_id,
                rating: schema.comments.rating,
                content: schema.comments.content,
                created_at: schema.comments.created_at,
            })
            .from(schema.comments)
            .innerJoin(schema.students, eq(schema.comments.student_id, schema.students.student_id))
            .where(eq(schema.comments.company_id, companyId))
            .orderBy(desc(schema.comments.created_at))
            .limit(limit)
            .offset(offset);

        const [[{ total }], rows] = await Promise.all([totalQuery, dataQuery]);

        const mappedData = CommentMapper.toResponseDetailArray(rows);

        return new PaginationResponse(mappedData, page, limit, Number(total));
    }

    async getCommentOfMyCompany(
        companyId: number,
        page: number,
        limit: number
    ): Promise<PaginationResponse<CommentOfMyCompany>> {
        const offset = (page - 1) * limit;

        const totalQuery = this.db
            .select({ total: count() })
            .from(schema.comments)
            .where(eq(schema.comments.company_id, companyId));

        const dataQuery = this.db
            .select({
                id: schema.comments.id,
                company_id: schema.comments.company_id,
                rating: schema.comments.rating,
                content: schema.comments.content,
                created_at: schema.comments.created_at,
            })
            .from(schema.comments)
            .where(eq(schema.comments.company_id, companyId))
            .orderBy(desc(schema.comments.created_at))
            .limit(limit)
            .offset(offset);

        const [[{ total }], rows] = await Promise.all([totalQuery, dataQuery]);

        const mappedData = CommentMapper.toCommentAnonymousArray(rows);

        return new PaginationResponse(mappedData, page, limit, Number(total));
    }


}