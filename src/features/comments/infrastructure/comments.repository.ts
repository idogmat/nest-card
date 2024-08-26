import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModelType } from '../domain/comment.entity';
import { LikeType } from 'src/features/likes/domain/like-info.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) { }

  async create(newComment: Comment): Promise<CommentDocument> {
    const model = await new this.CommentModel(newComment);
    await model.save();
    return model;
  }

  async setLike(id: string, user: { userId: string, login: string; }, like: LikeType) {
    const model = await this.CommentModel.findById(id);
    if (!model) return false;
    model.extendedLikesInfo.additionalLikes.set(user.userId, like);
    await model.save();
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.CommentModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  };

  async update(id: string, newModel: Comment) {
    const model = await this.CommentModel.findByIdAndUpdate({ _id: id }, { ...newModel });
    return model;
  }
}
