import { INestApplication } from '@nestjs/common';

export class AuthTestManager {
  constructor(protected readonly app: INestApplication) {
  }

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.login).toBe(responseModel.login);
    expect(createModel.email).toBe(responseModel.email);
    expect(createModel.password).toBe(responseModel.password);
  }


}