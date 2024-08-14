import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UsersRepository } from "src/features/users/infrastructure/users.repository";

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class CustomEmailValidation implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) { }

  async validate(value: string): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(value);
    if (user) return false;
    else return true;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return "email already exists";
  }
}

@ValidatorConstraint({ name: 'login', async: true })
@Injectable()
export class CustomLoginValidation implements ValidatorConstraintInterface {
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

@ValidatorConstraint({ name: 'code', async: true })
@Injectable()
export class CustomCodeValidation implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) { }

  async validate(value: string): Promise<boolean> {
    const user = await this.usersRepository.findByConfirmCode(value);
    if (!user || user.emailConfirmation.isConfirmed) return false;
    else return true;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return "code already exists";
  }
}

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class CustomEmailExistValidation implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) { }

  async validate(value: string): Promise<boolean> {
    const user = await this.usersRepository.findByEmail(value);
    if (!user || user.emailConfirmation.isConfirmed) return false;
    else return true;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return "email already exists";
  }
}
