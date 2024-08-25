import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { LikeType } from 'src/features/likes/domain/like-info.entity';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) { }

  async create(newPost: Post): Promise<string> {
    const model = await new this.PostModel({ ...newPost, createdAt: new Date() });
    await model.save();
    return model._id.toString();
  }

  async getById(id: string) {

    if (!isValidObjectId(id)) return null;
    const model = await this.PostModel.findById(id);

    return model;
  }

  async update(id: string, newModel: Post) {
    const model = await this.PostModel.findByIdAndUpdate({ _id: id }, { ...newModel });
    return model;
  }

  async setLike(id: string, user: { userId: string, login: string; }, like: LikeType) {
    const model = await this.PostModel.findById(id);
    if (!model) return false;
    let index = -1;
    if (like === "Like") {
      model.extendedLikesInfo.newestLikes.forEach((el, i) => {
        if (el.userId === user.userId) {
          index = i;
        }
      });
      if (index === -1) {
        model.extendedLikesInfo.newestLikes.unshift({
          userId: user.userId,
          login: user?.login || "",
          addedAt: new Date().toISOString(),
        });
      }
    } else {
      model.extendedLikesInfo.newestLikes.forEach((el, i) => {
        if (el.userId === user.userId) {
          index = i;
        }
        if (index !== -1) {
          model.extendedLikesInfo.newestLikes.splice(index, 1);
        }
      });
    }
    model.extendedLikesInfo.additionalLikes.set(user.userId, like);
    await model.save();
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.PostModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  };
}
