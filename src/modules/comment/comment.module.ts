import { Module } from '@nestjs/common';
import { CommentsService } from './comment.service';
import { CommentsController } from './comment.controller';
import { I_COMMENTS_REPOSITORY } from './repositories/comment-repository.interface';
import { CommentsRepository } from './repositories/comment.repository';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [CommentsController],
  providers: [CommentsService,
    {
      provide: I_COMMENTS_REPOSITORY,
      useClass: CommentsRepository
    },
  ],
  exports: [I_COMMENTS_REPOSITORY],
})
export class CommentModule { }
