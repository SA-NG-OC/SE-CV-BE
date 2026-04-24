import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { I_COMMENTS_REPOSITORY, type ICommentsRepository } from "./repositories/comment-repository.interface";
import { CommentOfMyCompany, CommentResponse, CommentResponseDetail, CompanyCommentStatistics } from "./interface";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { I_APPLICATION_REPOSITORY } from "../application/application.token";
import type { IApplicationRepository } from "../application/repositories/application-repository.interface";
import { PaginationResponse } from "src/common/types/pagination-response";

@Injectable()
export class CommentsService {
  constructor(
    @Inject(I_COMMENTS_REPOSITORY)
    private readonly repo: ICommentsRepository,
    @Inject(I_APPLICATION_REPOSITORY)
    private readonly applicationRepo: IApplicationRepository,
  ) { }

  async createComment(studentId: number, dto: CreateCommentDto): Promise<CommentResponse> {
    const check = await this.applicationRepo.checkApply(dto.companyId, studentId);
    if (!check) {
      throw new UnauthorizedException('Bạn không thể đánh giá khi chưa phỏng vấn tại công ty này');
    }
    const dbData = await this.repo.create(dto, studentId);
    return dbData;
  }

  async getCommentByCompany(
    companyId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResponse<CommentResponseDetail>> {
    const result = await this.repo.getCompanyComment(companyId, page, limit);
    if (!result) throw new NotFoundException('Không tìm thấy dữ liệu');

    return result;
  }

  async getCommentOfMyCompany(
    companyId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResponse<CommentOfMyCompany>> {
    const result = await this.repo.getCommentOfMyCompany(companyId, page, limit);

    if (!result) throw new NotFoundException('Không tìm thấy dữ liệu');

    return result;
  }

  async deleteComment(id: number, studentId: number) {
    const isDeleted = await this.repo.delete(id, studentId);
    if (!isDeleted) {
      throw new NotFoundException('Không tìm thấy đánh giá hoặc bạn không có quyền xóa');
    }
    return true;
  }

  async updateComment(id: number, studentId: number, dto: UpdateCommentDto) {
    const updated = await this.repo.update(id, studentId, dto);
    if (!updated) {
      throw new NotFoundException('Không tìm thấy đánh giá hoặc bạn không có quyền sửa');
    }
    return updated;
  }

  async getCompanyCommentStats(companyId: number): Promise<CompanyCommentStatistics> {
    const data = await this.repo.getCompanyCommentStats(companyId);
    if (!data) {
      throw new NotFoundException('Không tìm thấy dữ liệu');
    }
    return data;
  }
}