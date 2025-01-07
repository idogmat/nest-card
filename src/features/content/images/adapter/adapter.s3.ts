import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from 'aws-sdk';


@Injectable()
export class S3StorageAdapter {
  private s3: AWS.S3;
  private bucketName: string;
  constructor(private configService: ConfigService,
  ) {
    const s3Config = {
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      s3ForcePathStyle: true,
    };
    console.log(s3Config)
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    this.s3 = new AWS.S3(s3Config);
  }

  async uploadFile(file: any, folder: string): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: `${folder}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return this.s3.upload(params).promise();
  }

  async getFileUrl(key: string): Promise<string> {

    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: false
    });
  }

}