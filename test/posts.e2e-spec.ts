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

const newPost = {
  title: "testik",
  content: "testiktestiktestik",
  shortDescription: "testik"
};

let blogId = '';

describe('posts', () => {
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

  it('should create post', async () => {
    const result = await request(app.getHttpServer())
      .post('/blogs')
      .auth(login, password, { type: "basic" })
      .send(newBlog);
    expect(result.status).toBe(201);

    blogId = result.body.id;

    const posts = await request(app.getHttpServer())
      .post('/posts')
      .auth(login, password, { type: "basic" })
      .send({ ...newPost, blogId });
    expect(posts.status).toBe(201);

    const getPosts = await request(app.getHttpServer())
      .get('/posts')
      .auth(login, password, { type: "basic" })
      .send();
    expect(getPosts.status).toBe(200);
    expect(getPosts.body.items.length).not.toEqual(0);
  });

  it('should update post', async () => {

    const posts = await request(app.getHttpServer())
      .post(`/blogs/${blogId}/posts`)
      .auth(login, password, { type: "basic" })
      .send(newPost);
    expect(posts.status).toBe(201);
    expect(posts.body.blogId).toBe(blogId);

    const updatedPost = await request(app.getHttpServer())
      .put(`/posts/${posts.body.id}`)
      .auth(login, password, { type: "basic" })
      .send({ ...newPost, blogId, title: 'newww' });
    expect(updatedPost.status).toBe(204);

    const getPost = await request(app.getHttpServer())
      .get(`/posts/${posts.body.id}`)
      .auth(login, password, { type: "basic" })
      .send();
    expect(getPost.status).toBe(200);
    expect(getPost.body.title).toBe('newww');
  });

  // it('should delete blog', async () => {
  //   const result = await request(app.getHttpServer())
  //     .post('/blogs')
  //     .auth(login, password, { type: "basic" })
  //     .send(newBlog);
  //   expect(result.status).toBe(201);

  //   const blog = await request(app.getHttpServer())
  //     .delete(`/blogs/${result.body.id}`)
  //     .auth(login, password, { type: "basic" })
  //     .send();
  //   expect(blog.status).toBe(204);

  //   const blogExist = await request(app.getHttpServer())
  //     .get(`/blogs/${result.body.id}`)
  //     .send();
  //   expect(blogExist.status).toBe(404);
  // });

  // it('should update blog', async () => {
  //   const result = await request(app.getHttpServer())
  //     .post('/blogs')
  //     .auth(login, password, { type: "basic" })
  //     .send(newBlog);
  //   expect(result.status).toBe(201);

  //   const blogUpdated = await request(app.getHttpServer())
  //     .put(`/blogs/${result.body.id}`)
  //     .auth(login, password, { type: "basic" })
  //     .send({
  //       name: "yep",
  //     });
  //   expect(blogUpdated.status).toBe(204);

  //   const blog = await request(app.getHttpServer())
  //     .get(`/blogs/${result.body.id}`)
  //     .send();
  //   expect(blog.status).toBe(200);
  //   expect(blog.body.name).toBe('yep');

  // });
});