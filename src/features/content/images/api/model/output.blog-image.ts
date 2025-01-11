import { BlogImage, ImageType } from "../../domain/blog-image.entity";

class Image {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export class BlogImagesOutputModel {
  wallpaper: Image | null
  main: Image[] | []
}

const host = `${process.env.S3_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/`

const cutImage = (host: string, image: BlogImage): Image => {
  return { url: `${host}${image.url}`, width: image.width, height: image.height, fileSize: image.fileSize }
}

export const blogImagesMapper = (images: BlogImage[]): BlogImagesOutputModel => {
  const outputModel = new BlogImagesOutputModel();
  outputModel.wallpaper = null
  outputModel.main = []
  images.forEach(image => {
    if (image.type === ImageType.Wallpaper) {
      outputModel.wallpaper = image ? cutImage(host, image) : null
    } else if (image.type === ImageType.Main) {
      outputModel.main = [...outputModel.main, cutImage(host, image)]
    }
  })

  return outputModel;
};