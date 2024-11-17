import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UsersRepository } from "src/features/users/infrastructure/users.repository";

@ValidatorConstraint({ name: 'login-not-exist', async: true })
@Injectable()
export default class CustomLoginValidation implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) { }

  async validate(value: string): Promise<boolean> {
    const user = await this.usersRepository.findByLogin(value);
    if (user) return false;
    else return true;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return "login already exists";
  }
}
