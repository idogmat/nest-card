import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BloggerService } from "../blogger.service";
import { ImageService } from "src/features/content/images/application/image.service";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { AuthUser } from "src/features/auth/auth.module";
import { ImageType } from "src/features/content/images/domain/blog-image.entity";
import { postImagesMapper, PostImagesOutputModel } from "src/features/content/images/api/model/output.post-image";

export class InsertPostImageCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly folder: string,
    public readonly config: {
      blogId: string,
      postId: string,
      user: AuthUser,
      width: number,
      height: number,
      fileSize: number
    },
    public readonly type: ImageType
  ) { }
}

@CommandHandler(InsertPostImageCommand)
export class InsertPostImageUseCase implements ICommandHandler<InsertPostImageCommand> {
  constructor(
    private readonly imageService: ImageService,
    private readonly bloggerService: BloggerService,
  ) { }

  async execute(command: InsertPostImageCommand): Promise<PostImagesOutputModel> {
    const { width, height, format } = await this.imageService.getImageDimensions(command.file.buffer)
    console.log(width, height)
    console.log(command.config.width, command.config.height)
    console.log(format)
    if (!this.imageService.formatCheck(format)) throw new BadRequestException()
    if (width !== command.config.width || height !== command.config.height) throw new BadRequestException()
    const blog = await this.bloggerService.getById(command.config.blogId)
    const post = await this.bloggerService.getPostById(command.config.postId)
    if (!blog || !post) throw new NotFoundException()
    if (post.blogId !== blog.id
      || command.file.size > 100000) throw new BadRequestException()
    if (blog?.userId !== command.config.user.userId) throw new ForbiddenException()
    const records = await this.imageService.insertPostImage(command.file, command.folder);
    console.log(records)
    await this.imageService.setPostImageDB(command.config.postId, records);
    const postImages = await this.imageService.getPostImagesDB(command.config.postId);
    return postImagesMapper(postImages)

  }
}