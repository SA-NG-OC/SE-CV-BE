import { Module } from '@nestjs/common';
import { FollowedCompanyController } from './follow.controller';
import { I_FOLLOWED_COMPANY_REPOSITORY } from './repositories/follow-repository.interface';
import { FollowedCompanyRepository } from './repositories/follow.repository';
import { FollowedCompanyService } from './follow.service';

@Module({
  controllers: [FollowedCompanyController],
  providers: [
    {
      provide: I_FOLLOWED_COMPANY_REPOSITORY,
      useClass: FollowedCompanyRepository,
    },
    FollowedCompanyService,
  ],
  exports: [I_FOLLOWED_COMPANY_REPOSITORY],
})
export class FollowedCompanyModule { }
