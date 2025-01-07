import { BlogImage, ImageType } from "../../domain/blog-image.entity";

class Image {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export class BlogImagesOutputModel {
  wrapper: Image | null
  main: Image[] | []
}

const host = `${process.env.S3_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/`

const cutImage = (host: string, image: BlogImage, width: number, height: number): Image => {
  return { url: `${host}${image.url}`, width, height, fileSize: image.fileSize }
}

export const blogImagesMapper = (images: BlogImage[]): BlogImagesOutputModel => {
  const outputModel = new BlogImagesOutputModel();
  outputModel.main = []
  images.forEach(image => {
    if (image.type === ImageType.Wallpaper) {
      outputModel.wrapper = cutImage(host, image, 1028, 312)
    } else if (image.type === ImageType.Main) {
      outputModel.main = [...outputModel.main, cutImage(host, image, 156, 156)]
    }
  })

  return outputModel;
};