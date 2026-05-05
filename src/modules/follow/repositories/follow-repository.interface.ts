import { FollowedCompanyRaw } from "../types/followed-company.raw.type";

export const I_FOLLOWED_COMPANY_REPOSITORY = 'I_FOLLOWED_COMPANY_REPOSITORY';

// followed-company.interface.ts
export interface IFollowedCompanyRepository {
    follow(studentId: number, companyId: number): Promise<void>;
    unfollow(studentId: number, companyId: number): Promise<void>;
    getFollowerUserIdsByCompanyId(companyId: number): Promise<number[]>;
    checkFollowed(userId: number, companyId: number): Promise<boolean>;
}