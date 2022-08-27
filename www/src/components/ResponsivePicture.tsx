import React from 'react'

type ResponsivePictureProps = {
  className: string | undefined,
  src: string
}

type mimeType = 'image/avif' | 'image/webp' | 'image/jpeg'
export type extension = 'avif' | 'webp' | 'jpg'

type srcFormatterArgs = {
  width: number,
  extension: extension,
  src: string
}

export type imageFormat = {
  mimeType: mimeType,
  extension: extension
}

const srcFormatter = ({ width, extension, src }: srcFormatterArgs) => `${width},${extension}`.replace(/([\w\/]+),(\w+)/, src)

export const imageWidths = [480, 512, 768, 1080, 1440]

export const imageFormats: imageFormat[] = [
  { mimeType: 'image/avif', extension: 'avif' },
  { mimeType: 'image/webp', extension: 'webp' },
  { mimeType: 'image/jpeg', extension: 'jpg' }
]

const ResponsivePicture = ({ className, src }: ResponsivePictureProps) => (
  <picture
    className={className}
  >
    {
      imageFormats.map(
        ({ mimeType, extension }: imageFormat) => (
          <source
            key={mimeType}
            type={mimeType}
            srcSet={imageWidths
              .map((width: number) => `${srcFormatter({ width, extension, src })} ${width}w`)
              .join(', ')}
            sizes='100vw'
          />
        )
      )}
    <img
      src='/images/optimized/cover_w1080.jpg'
      alt=''
      role='presentation'
    />
  </picture>
)

export { ResponsivePicture as default }
