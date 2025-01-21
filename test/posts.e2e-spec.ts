import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import 'dotenv/config';
import { initForTest } from './utils/ready-clear';
import { ImageService } from 'src/features/content/images/application/image.service';
import { ImageServiceMock } from './mock/services.mock';

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

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(ImageService)
      .useClass(ImageServiceMock)
      .compile();
    const result = await initForTest(moduleFixture, AppModule);
    app = result.app;
    await result.cleadDB();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create post', async () => {
    const result = await request(app.getHttpServer())
      .post('/api/sa/blogs')
      .auth(login, password, { type: "basic" })
      .send(newBlog);
    expect(result.status).toBe(201);

    blogId = result.body.id;

    const posts = await request(app.getHttpServer())
      .post(`/api/sa/blogs/${blogId}/posts`)
      .auth(login, password, { type: "basic" })
      .send({ ...newPost, blogId });
    expect(posts.status).toBe(201);

    const getPosts = await request(app.getHttpServer())
      .get(`/api/sa/blogs/${blogId}/posts`)
      .auth(login, password, { type: "basic" })
      .send();
    expect(getPosts.status).toBe(200);
    expect(getPosts.body.items.length).not.toEqual(0);
  });

  it('should update post', async () => {
    const posts = await request(app.getHttpServer())
      .post(`/api/sa/blogs/${blogId}/posts`)
      .auth(login, password, { type: "basic" })
      .send(newPost);
    expect(posts.status).toBe(201);
    expect(posts.body.blogId).toBe(blogId);

    const updatedPost = await request(app.getHttpServer())
      .put(`/api/sa/blogs/${blogId}/posts/${posts.body.id}`)
      .auth(login, password, { type: "basic" })
      .send({ ...newPost, blogId, title: 'newww' });
    expect(updatedPost.status).toBe(204);

    const getPost = await request(app.getHttpServer())
      .get(`/api/sa/blogs/${blogId}/posts/${posts.body.id}`)
      .auth(login, password, { type: "basic" })
      .send();
    expect(getPost.status).toBe(200);
    expect(getPost.body.title).toBe('newww');
  });

  it('should delete post', async () => {
    const post = await request(app.getHttpServer())
      .post(`/api/sa/blogs/${blogId}/posts`)
      .auth(login, password, { type: "basic" })
      .send(newPost);
    expect(post.status).toBe(201);
    expect(post.body.blogId).toBe(blogId);

    const result = await request(app.getHttpServer())
      .delete(`/api/sa/blogs/${blogId}/posts/${post.body.id}`)
      .auth(login, password, { type: "basic" })
      .send();
    expect(result.status).toBe(204);

    const postExist = await request(app.getHttpServer())
      .get(`/api/sa/blogs/${blogId}/posts/${post.body.id}`)
      .auth(login, password, { type: "basic" })
      .send();
    expect(postExist.status).toBe(404);
  });

  it('should add like', async () => {
    const post = await request(app.getHttpServer())
      .post(`/api/sa/blogs/${blogId}/posts`)
      .auth(login, password, { type: "basic" })
      .send(newPost);
    expect(post.status).toBe(201);
    expect(post.body.blogId).toBe(blogId);

    // auth
    const regUser = { login: 'name77', password: 'qwerty1221', email: 'email3787@gil.em' };

    const authResult = await request(app.getHttpServer())
      .post('/api/auth/registration')
      .send(regUser);
    expect(authResult.status).toBe(204);

    const loginRequest = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginOrEmail: regUser.login, password: regUser.password });
    expect(loginRequest.status).toBe(200);
    expect(loginRequest.body).toHaveProperty('accessToken');

    const accessToken: string = loginRequest.body?.accessToken.toString();
    // like post
    const postLike = await request(app.getHttpServer())
      .put(`/api/posts/${post.body.id}/like-status`)
      .set({ Authorization: "Bearer " + accessToken })
      .send({
        likeStatus: "Like"
      });
    expect(postLike.status).toBe(204);

    const postLiked = await request(app.getHttpServer())
      .get(`/api/posts/${post.body.id}`)
      .set({ Authorization: "Bearer " + accessToken })
      .send();

    expect(postLiked.status).toBe(200);
    expect(postLiked.body.extendedLikesInfo.myStatus).toBe("Like");
    expect(postLiked.body.extendedLikesInfo.likesCount).toBe(1);
  });
});