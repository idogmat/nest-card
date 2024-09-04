import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import 'dotenv/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { deleteAllData } from './utils/delete-all-data';

const login = process.env.ADMIN_LOGIN;
const password = process.env.ADMIN_PASSWORD;
const newBlog = {
  name: 'testik',
  description: 'igiwe8634@cartep.com',
  websiteUrl: 'testik.ry'
};

describe('blogs', () => {
  let app: INestApplication;
  let databaseConnection: Connection;

  beforeAll(async () => {

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    })
      .compile();

    app = await moduleFixture.createNestApplication();
    databaseConnection = app.get<Connection>(getConnectionToken());
    await app.init();
  });

  afterAll(async () => {
    await deleteAllData(databaseConnection);
    await app.close();
  });

  it('should create blog', async () => {
    const result = await request(app.getHttpServer())
      .post('/blogs')
      .auth(login, password, { type: "basic" })
      .send(newBlog);
    expect(result.status).toBe(201);

    const blogs = await request(app.getHttpServer())
      .get('/blogs')
      .send();
    expect(blogs.status).toBe(200);
    expect(blogs.body.items.length).not.toEqual(0);
  });
});