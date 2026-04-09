import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { I_APPLICATION_REPOSITORY, I_JOB_INVITATION } from './application.token';
import { ApplicationRepository } from './repositories/application-repository';
import { AuthModule } from '../auth/auth.module';
import { JobPostingModule } from '../job-posting/job-posting.module';
import { JobInvitationRepository } from './repositories/job-invitation-repository';

@Module({
  imports: [AuthModule, JobPostingModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, {
    provide: I_APPLICATION_REPOSITORY,
    useClass: ApplicationRepository
  },
    {
      provide: I_JOB_INVITATION,
      useClass: JobInvitationRepository
    }],
  exports: [I_APPLICATION_REPOSITORY, I_JOB_INVITATION]
})
export class ApplicationModule { }
