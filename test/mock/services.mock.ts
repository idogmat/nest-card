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


  async getBlogImagesDB(blogId: string): Promise<BlogImage[] | []> {

    return [];
  }

  async getPostImagesDB(postId: string): Promise<PostImage[] | []> {

    return [];
  }
}