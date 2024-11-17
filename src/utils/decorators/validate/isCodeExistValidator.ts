import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UsersRepository } from "src/features/users/infrastructure/users.repository";

@ValidatorConstraint({ name: 'code', async: true })
@Injectable()
export class CustomCodeExistValidation implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) { }

  async validate(value: string): Promise<boolean> {
    const user = await this.usersRepository.findByConfirmCode(value);
    if (!user || user.isConfirmed) return false;
    else return true;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return "code already exists";
  }
}
