import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserCreateModel } from '../../../src/features/users/api/models/input/create-user.input.model';

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) {
  }

  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
    expect(createModel.lastName).toBe(responseModel.lastName);
  }

  async createUser(adminAccessToken: string, createModel: UserCreateModel, statusCode: number = 201) {
    return request(this.app.getHttpServer())
      .post('/api/users')
      .auth(adminAccessToken, 'qwerty', {
        type: 'basic',
      })
      .send(createModel)
      .expect(statusCode);
  }

  async updateUser(adminAccessToken: string, userId: string, updateModel: any, statusCode: number = 204) {
    return request(this.app.getHttpServer())
      .put(`/api/users/${userId}`)
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(statusCode);
  }

  async login(
    login: string,
    password: string,
  ): Promise<{ accessToken: string, refreshToken: string; }> {
    const response = await request(this.app.getHttpServer())
      .post('/login')
      .send({ login, password })
      .expect(200);

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0].split('=')[1].split(';')[0]
    };
  }
}