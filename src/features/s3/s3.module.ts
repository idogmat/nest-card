import { Module } from "@nestjs/common";
import { S3StorageAdapter } from "./adapter/adapter.s3";

@Module({
  imports: [],
  controllers: [],
  providers: [S3StorageAdapter],
  exports: [S3StorageAdapter]
})
export class S3Module { }