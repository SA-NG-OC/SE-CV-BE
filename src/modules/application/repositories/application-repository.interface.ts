import { PaginationResponse } from 'src/common/types/pagination-response';
import { ApplicationDomain } from '../domain/application/application.domain';
import {
    ApplicationCardRaw,
    ApplicantCardRaw,
    ApplicationStatsRaw,
} from '../types/application.raw';
import { GetCompanyApplicationsFilter, GetMyApplicationsQuery } from '../types/application.interface';

export interface IApplicationRepository {
    save(application: ApplicationDomain): Promise<ApplicationDomain>;
    findById(applicationId: number): Promise<ApplicationDomain | null>;
    findByJobAndStudent(jobId: number, studentId: number): Promise<ApplicationDomain | null>;
    checkApply(companyId: number, studentId: number): Promise<boolean>;
    findCardsByStudent(
        studentId: number,
        query: GetMyApplicationsQuery,
    ): Promise<PaginationResponse<ApplicationCardRaw>>;
    findApplicantCardsByJob(
        filter: GetCompanyApplicationsFilter,
    ): Promise<PaginationResponse<ApplicantCardRaw>>;
    getStatsByStudent(studentId: number): Promise<ApplicationStatsRaw>;
    getStats(companyId: number, jobId?: number): Promise<ApplicationStatsRaw>;
}