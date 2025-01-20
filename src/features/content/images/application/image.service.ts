import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogImage, ImageType } from "../domain/blog-image.entity";
import { Repository } from "typeorm";
import { S3StorageAdapter } from "../../../s3/adapter/adapter.s3";
import { PostImage } from "../domain/post-image.entity";
import sharp from "sharp";

const FORMAT_LIST = ['png', 'jpg', 'jpeg']

@Injectable()
export class ImageService {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    @InjectRepository(BlogImage)
    private readonly blogImageRepo: Repository<BlogImage>,
    @InjectRepository(PostImage)
    private readonly postImageRepo: Repository<PostImage>,
  ) {
  }

  async insertImage(file: Express.Multer.File, folder: string): Promise<string> {
    const result: AWS.S3.ManagedUpload.SendData = await this.s3StorageAdapter.uploadFile(file, folder)
    console.log(result)
    return result.Key
  }

  async insertPostImage(file: Express.Multer.File, folder: string): Promise<Record<string, Partial<Express.Multer.File> & { Key: string }>> {
    const obj300x180 = await this.resizeImage(file, 300, 180)
    const obj149x96 = await this.resizeImage(file, 149, 96)

    await Promise.all([
      this.s3StorageAdapter.uploadFile(obj149x96, `${folder}/149x96`),
      this.s3StorageAdapter.uploadFile(obj300x180, `${folder}/300x180`),
      this.s3StorageAdapter.uploadFile(file, `${folder}/940x432`)
    ]).then(p => p.map(e => e.Key))
    const records = {
      ['940x432']: { ...file, Key: `${folder}/940x432/${file.originalname}` },
      ['300x180']: { ...obj300x180, Key: `${folder}/300x180/${file.originalname}` },
      ['149x96']: { ...obj149x96, Key: `${folder}/149x96/${file.originalname}` }
    }
    return records
  }

  async resizeImage(file: Express.Multer.File, width: number, height: number): Promise<Express.Multer.File> {
    const buffer = await sharp(file.buffer).resize(width, height) // Изменяем размер изображения
      .toBuffer()
    return {
      ...file,
      buffer: buffer,
      size: buffer.length,
    }
  }

  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number, format: string }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return { width: metadata.width, height: metadata.height, format: metadata.format };

    } catch {
      return { width: 0, height: 0, format: '' }
    }
  }

  formatCheck(format: string) {
    return FORMAT_LIST.includes(format)
  }

  async getBlogImagesDB(blogId: string): Promise<BlogImage[] | []> {
    const images = await this.blogImageRepo.find({
      where: { blogId }
    })
    return images;
  }

  async getPostImagesDB(postId: string): Promise<PostImage[] | []> {
    const images = await this.postImageRepo.find({
      where: { postId }
    })
    return images;
  }

  async setBlogImageDB(
    blogId: string,
    url: string,
    type: ImageType,
    fileSize: number,
    width: number, height: number
  ): Promise<BlogImage | null> {
    if (type === ImageType.Wallpaper) {
      const existImage = await this.blogImageRepo.findOne({
        where: { blogId, type }
      })
      if (existImage) {
        await this.blogImageRepo.update({ blogId, type }, { blogId, url, type, fileSize, width, height })
      } else {
        const result = await this.blogImageRepo.create({ blogId, url, type, fileSize, width, height })
        await this.blogImageRepo.save(result)
      }
    } else {
      const imageData = {
        blogId,
        url,
        type,
        fileSize,
        width, height
      }
      const existImage = await this.blogImageRepo.findOne({
        where: imageData
      })
      if (existImage) return null
      const result = await this.blogImageRepo.create(imageData)
      await this.blogImageRepo.save(result)
      console.log(result)
    }
    return null;
  }
  async setPostImageDB(
    postId: string,
    records: Record<string, Partial<Express.Multer.File> & { Key: string }>,
  ): Promise<BlogImage | null> {
    const splitSize = (str: string) => {
      const [width, height] = str.split('x')
      return { width: +width, height: +height }
    }
    const imageData = Object.keys(records).map(record => {
      const { width, height } = splitSize(record)
      console.log(width, height)
      return {
        postId,
        url: records[record].Key,
        fileSize: records[record].size,
        width, height
      }
    })
    for (const image of imageData) {
      const existingImage = await await this.postImageRepo.findOne({
        where: {
          postId: image.postId,
          url: image.url,
          fileSize: image.fileSize,
        }
      });

      if (existingImage) {
        // Обновляем существующую запись
        Object.assign(existingImage, image);
        await this.postImageRepo.save(existingImage);
      } else {
        // Созем новую запись
        // const
        const newImage = this.postImageRepo.create(image);
        await this.postImageRepo.save(newImage);
      }
    }
    // const existImage = await this.postImageRepo.findOne({
    //   where: imageData
    // })
    // if (existImage) return null
    // await this.postImageRepo.insert(imageData)

    return null;
  }
}