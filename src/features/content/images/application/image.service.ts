import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogImage, ImageType } from "../domain/blog-image.entity";
import { Repository } from "typeorm";
import { S3StorageAdapter } from "../adapter/adapter.s3";

@Injectable()
export class ImageService {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    @InjectRepository(BlogImage)
    private readonly imageRepo: Repository<BlogImage>,
  ) {
  }

  async insertImage(file: any, folder: string): Promise<string> {
    const result: AWS.S3.ManagedUpload.SendData = await this.s3StorageAdapter.uploadFile(file, folder)
    console.log(result)
    return result.Key
  }

  async getImage(path: string): Promise<BlogImage | null> {
    const result = await this.s3StorageAdapter.getFileUrl(path)
    console.log(result)
    // const image = await this.imageRepo.findOne({
    //   where: {
    //     blogId: id
    //   }
    // });
    // if (!image) {
    //   throw new NotFoundException()
    // }
    return null;
  }

  async getImagesDB(blogId: string): Promise<BlogImage[] | []> {
    const images = await this.imageRepo.find({
      where: { blogId }
    })
    console.log(images)
    return images;
  }

  async setImageDB(blogId: string, url: string, type: ImageType, fileSize: number): Promise<BlogImage | null> {
    if (type === ImageType.Wallpaper) {
      const existImage = await this.imageRepo.findOne({
        where: { blogId, type }
      })
      if (existImage) {
        await this.imageRepo.update({ blogId, type }, { blogId, url, type, fileSize })
      } else {
        const result = await this.imageRepo.create({ blogId, url, type, fileSize })
        await this.imageRepo.save(result)
      }
    } else {
      const imageData = {
        blogId,
        url,
        type,
        fileSize
      }
      const existImage = await this.imageRepo.findOne({
        where: imageData
      })
      if (existImage) return null
      const result = await this.imageRepo.create(imageData)
      await this.imageRepo.save(result)
      console.log(result)
    }
    return null;
  }
}