import { Inject, Injectable } from "@nestjs/common";
import { I_FOLLOWED_COMPANY_REPOSITORY, type IFollowedCompanyRepository } from "./repositories/follow-repository.interface";

// followed-company.service.ts
@Injectable()
export class FollowedCompanyService {
  constructor(
    @Inject(I_FOLLOWED_COMPANY_REPOSITORY)
    private readonly repo: IFollowedCompanyRepository,
  ) { }

  async follow(studentId: number, companyId: number) {
    await this.repo.follow(studentId, companyId);
    return {};
  }

  async unfollow(studentId: number, companyId: number) {
    await this.repo.unfollow(studentId, companyId);
    return {};
  }
}