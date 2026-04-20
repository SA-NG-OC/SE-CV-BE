import { RoleName } from "src/common/types/role.enum";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { UpdateCommentDto } from "../dto/update-comment.dto";
import { CommentOfMyCompany, CommentResponse, CommentResponseDetail } from "../interface";
import { PaginationResponse } from "src/common/types/pagination-response";

export interface ICommentsRepository {
    create(data: CreateCommentDto, studentId: number): Promise<CommentResponse>;
    update(id: number, studentId: number, data: UpdateCommentDto): Promise<CommentResponse | null>;
    delete(id: number, studentId: number): Promise<boolean>;
    getCompanyComment(
        companyId: number,
        page: number,
        limit: number
    ): Promise<PaginationResponse<CommentResponseDetail>>;
    getCommentOfMyCompany(
        companyId: number,
        page: number,
        limit: number
    ): Promise<PaginationResponse<CommentOfMyCompany>>;
}

export const I_COMMENTS_REPOSITORY = 'I_COMMENTS_REPOSITORY';