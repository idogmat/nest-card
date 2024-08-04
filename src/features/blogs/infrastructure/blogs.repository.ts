import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) { }

  async create(newBlog: Blog): Promise<string> {
    const model = await new this.BlogModel({ ...newBlog, createdAt: new Date().getTime() });
    await model.save();
    return model._id.toString();
  }

  async update(id: string, newModel: Blog) {
    const result = await this.BlogModel.findByIdAndUpdate({ _id: id }, { ...newModel });
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.BlogModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  }
}
