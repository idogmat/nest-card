import { EmailService } from "src/features/auth/application/email.service";
import { ImageService } from "src/features/content/images/application/image.service";
import { BlogImage } from "src/features/content/images/domain/blog-image.entity";
import { PostImage } from "src/features/content/images/domain/post-image.entity";
import { UsersService } from "src/features/users/application/users.service";
import { UsersRepository } from "src/features/users/infrastructure/users.repository";

export class UserServiceMock extends UsersService {
  constructor(usersRepository: UsersRepository) {
    super(usersRepository);
  }

  sendMessageOnEmail(_email: string) {
    console.log(
      'Call mock method sendMessageOnEmail / MailService, for specific test',
    );
    return Promise.resolve(true);
  }
}


export class EmailServiceMock extends EmailService {
  constructor() {
    super();
  }
  async sendMail(_name: string, mail: string, code: string) {
    console.log('sendMail')
  }


  async sendMailPasswordRecovery(
    _name: string,
    mail: string,
    code: string,
  ) {

    console.log('sendMail')
  }
}

export class ImageServiceMock extends ImageService {
  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number, format: string }> {

    return { width: 0, height: 0, format: '' }

  }

  async insertPostImage(file: Express.Multer.File, folder: string): Promise<Record<string, Partial<Express.Multer.File> & { Key: string }>> {
    const obj300x180 = await this.resizeImage(file, 300, 180)
    const obj149x96 = await this.resizeImage(file, 149, 96)
    const records = {
      ['940x432']: { ...file, Key: `${folder}/940x432/${file.originalname}` },
      ['300x180']: { ...obj300x180, Key: `${folder}/300x180/${file.originalname}` },
      ['149x96']: { ...obj149x96, Key: `${folder}/149x96/${file.originalname}` }
    }
    return records
  }

  async getBlogImagesDB(blogId: string): Promise<BlogImage[] | []> {

    return [];
  }

  async getPostImagesDB(postId: string): Promise<PostImage[] | []> {

    return [];
  }
}