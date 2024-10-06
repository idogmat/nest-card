import { Injectable } from '@nestjs/common';
import { BlogPg } from '../domain/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async getById(id: string): Promise<BlogPg | null> {
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.blog_pg
      WHERE id = $1;
      `, [id]);

    if (!res[0]) {
      return null;
    }

    return res[0];
  }

  async create(newBlog: BlogPg): Promise<string> {
    const res = await this.dataSource.query(`
      INSERT INTO public.blog_pg (
      name, 
      description,
      "websiteUrl",
      "createdAt",
      "isMembership"
      )
      VALUES ($1,$2,$3,$4,$5) RETURNING id;
      `, [
      newBlog.name,
      newBlog.description,
      newBlog.websiteUrl,
      newBlog.createdAt || new Date().toISOString(),
      newBlog.isMembership || false,
    ]);
    return res[0].id;
  }

  async update(id: string, newModel: BlogPg) {
    const updated = await this.dataSource.query(`
      UPDATE public.blog_pg
      SET name = $2, 
      description = $3,
      "websiteUrl" = $4
      WHERE id = $1 RETURNING * ;
      `, [
      id,
      newModel.name,
      newModel.description,
      newModel.websiteUrl
    ]);
    return updated[0];
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.dataSource.query(`
      DELETE FROM public.blog_pg
      WHERE id = $1;
      `, [id]);

    return res[1] === 1;
  }
}
