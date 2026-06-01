import { Module } from '@nestjs/common';
import { SavedJobController } from './saved-jobs.controller';
import { SavedJobService } from './saved-jobs.service';
import { I_SAVED_JOB_REPOSITORY } from './repositories/saved-jobs-repository.interface';
import { SavedJobRepository } from './repositories/saved-jobs.repository';

@Module({
  controllers: [SavedJobController],
  providers: [
    SavedJobService,
    {
      provide: I_SAVED_JOB_REPOSITORY,
      useClass: SavedJobRepository,
    },
  ],
  exports: [I_SAVED_JOB_REPOSITORY],
})
export class SavedJobsModule {}
