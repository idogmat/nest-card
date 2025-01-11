import { PostImage } from "../../domain/post-image.entity";

class Image {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export class PostImagesOutputModel {
  main: Image[] | []
}

const host = `${process.env.S3_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/`

const cutImage = (host: string, image: PostImage): Image => {
  return { url: `${host}${image.url}`, width: image.width, height: image.height, fileSize: image.fileSize }
}

export const postImagesMapper = (images: PostImage[]): PostImagesOutputModel => {
  const outputModel = new PostImagesOutputModel();
  outputModel.main = []
  if (images?.length) {
    images.forEach(image => {
      outputModel.main = [...outputModel.main, cutImage(host, image)]
    })
  }
  return outputModel;
};