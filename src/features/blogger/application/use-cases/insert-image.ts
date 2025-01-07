import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BloggerService } from "../blogger.service";
import { ImageService } from "src/features/content/images/application/image.service";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { AuthUser } from "src/features/auth/auth.module";
import { ImageType } from "src/features/content/images/domain/blog-image.entity";
import { blogImagesMapper, BlogImagesOutputModel } from "src/features/content/images/api/model/output.blog-image";

export class InsertBlogImageCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly folder: string,
    public readonly config: {
      id: string,
      user: AuthUser,
      width: number,
      height: number,
      fileSize: number
    },
    public readonly type: ImageType
  ) { }
}

@CommandHandler(InsertBlogImageCommand)
export class InsertBlogImageUseCase implements ICommandHandler<InsertBlogImageCommand> {
  constructor(
    private readonly imageService: ImageService,
    private readonly bloggerService: BloggerService,
  ) { }

  async execute(command: InsertBlogImageCommand): Promise<BlogImagesOutputModel> {

    const blog = await this.bloggerService.getById(command.config.id)
    if (!blog || command.file.size > 100000) throw new BadRequestException()
    if (blog?.userId !== command.config.user.userId) throw new ForbiddenException()
    const url = await this.imageService.insertImage(command.file, command.folder);
    await this.imageService.setImageDB(command.config.id, url, command.type, command.config.fileSize);
    const blogImages = await this.imageService.getImagesDB(command.config.id);
    return blogImagesMapper(blogImages)

  }
}