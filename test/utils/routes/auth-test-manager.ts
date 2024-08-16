import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserCreateModel } from '../../../src/features/users/api/models/input/create-user.input.model';

export class AuthTestManager {
  constructor(protected readonly app: INestApplication) {
  }

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.login).toBe(responseModel.login);
    expect(createModel.email).toBe(responseModel.email);
    expect(createModel.password).toBe(responseModel.password);
  }

  async registration(createModel: UserCreateModel) {
    return request(this.app.getHttpServer())
      .post('/api/auth/registration')
      .send(createModel);
  }
}