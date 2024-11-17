import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UsersRepository } from "./../../../features/users/infrastructure/users.repository";

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class CustomEmailExistValidation implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) { }

  async validate(value: string): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(value);
    if (!user || user.isConfirmed) return false;
    else return true;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return "email already exists";
  }
}
