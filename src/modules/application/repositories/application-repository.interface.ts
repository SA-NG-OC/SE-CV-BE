import { PaginationResponse } from 'src/common/types/pagination-response';
import { ApplicationDomain } from '../domain/application/application.domain';
import {
    ApplicantCardView,
    ApplicationCardView,
    ApplicationStats,
    GetCompanyApplicationsFilter,
    GetMyApplicationsQuery,
} from '../interfaces/application.interface';

export interface IApplicationRepository {
    save(application: ApplicationDomain): Promise<ApplicationDomain>;
    findById(applicationId: number): Promise<ApplicationDomain | null>;
    findByJobAndStudent(jobId: number, studentId: number): Promise<ApplicationDomain | null>;
    findCardsByStudent(
        studentId: number,
        query: GetMyApplicationsQuery,
    ): Promise<PaginationResponse<ApplicationCardView>>;

    // Stats
    getStatsByStudent(studentId: number): Promise<ApplicationStats>;

    findApplicantCardsByJob(
        filter: GetCompanyApplicationsFilter,
    ): Promise<PaginationResponse<ApplicantCardView>>;
    getStats(companyId: number, jobId?: number): Promise<ApplicationStats>
}