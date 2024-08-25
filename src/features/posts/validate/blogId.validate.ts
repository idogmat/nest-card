import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { BlogsRepository } from "src/features/blogs/infrastructure/blogs.repository";

@ValidatorConstraint({ name: 'login', async: true })
@Injectable()
export class CustomBlogIdValidation implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) { }

  async validate(value: string): Promise<boolean> {
    const blog = await this.blogsRepository.getById(value);
    if (!blog) return false;
    else return true;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return "blog not exist";
  }
}