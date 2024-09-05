import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TestingController } from "./api/testing.controller";

@Module({
  imports: [AuthModule],
  controllers: [TestingController],
  providers: [],
  exports: []
})
export class TestModule { }