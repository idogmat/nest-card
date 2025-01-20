import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TestingController } from "./api/testing.controller";
import { S3Module } from "../s3/s3.module";

@Module({
  imports: [AuthModule, S3Module],
  controllers: [TestingController],
  providers: [],
  exports: []
})
export class TestModule { }