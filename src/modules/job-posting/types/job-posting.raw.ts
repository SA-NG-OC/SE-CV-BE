import { JobPostingDomain } from '../domain/job-posting.domain';
import { JobSkillItem } from '.';

export interface RawJobWithMeta {
  domain: JobPostingDomain;
  companyName: string;
  logoUrl: string | null;
  applicantCount: number;
  skills: JobSkillItem[];
}

export interface RawJobDetail extends RawJobWithMeta {
  requiredSkills: JobSkillItem[];
}

export interface RawJobPage<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
