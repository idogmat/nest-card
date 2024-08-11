import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) { }

  async create(newPost: Post): Promise<string> {
    const model = await new this.PostModel({ ...newPost, createdAt: new Date() });
    await model.save();
    return model._id.toString();
  }

  async update(id: string, newModel: Post) {
    const result = await this.PostModel.findByIdAndUpdate({ _id: id }, { ...newModel });
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.PostModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  }
}
