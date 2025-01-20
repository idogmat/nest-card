import { IsString, IsUrl, Length } from "class-validator";
import { Trim } from "../../../../../../utils/decorators/transform/trim";
import { ApiProperty } from "@nestjs/swagger";

export class BlogCreateModel {
  @ApiProperty({ type: String })
  @IsString()
  @Trim()
  @Length(1, 15)
  name: string;
  @ApiProperty({ type: String })
  @IsString()
  @Trim()
  @Length(1, 500)
  description: string;
  @ApiProperty({ type: String, default: 'test@test.com' })
  @IsString()
  @Trim()
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}
