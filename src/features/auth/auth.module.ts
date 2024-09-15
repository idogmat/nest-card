import { Module, Provider } from "@nestjs/common";
import { AuthController } from "./api/auth.controller";
import { AuthService } from "./application/auth.service";
import { EmailService } from "./application/email.service";
import { JwtService } from "@nestjs/jwt";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UserModule } from "../users/users.module";
import { DeviceModule } from "../devices/device.module";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthLoginUseCase } from "./application/user-cases/auth-login-use-case";
import { PassportModule } from "@nestjs/passport";
import CustomEmailValidation from "src/common/decorators/validate/is-email-validator";
import CustomLoginValidation from "src/common/decorators/validate/is-login-validator";
import CustomEmailExistValidation from "src/common/decorators/validate/is-email-exist-validator";
import CustomCodeExistValidation from "src/common/decorators/validate/is-code-exist-validator";

const validators: Provider[] = [
  CustomEmailValidation,
  CustomLoginValidation,
  CustomCodeExistValidation,
  CustomEmailExistValidation,
];

@Module({
  imports: [UserModule, DeviceModule, CqrsModule, PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    LocalStrategy,
    EmailService,
    AuthLoginUseCase,
    ...validators,
  ],
  exports: [AuthService, JwtService]
})
export class AuthModule { }