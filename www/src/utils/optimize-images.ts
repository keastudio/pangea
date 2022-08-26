#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

import * as Colors from 'https://deno.land/std@0.152.0/fmt/colors.ts'
import { ensureDir } from 'https://deno.land/std@0.152.0/fs/mod.ts'
import { imageWidths, imageFormats } from '../components/ResponsivePicture.tsx'

try {
  Deno.run({ cmd: ['convert', '-version'] })
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error(Colors.red(`The program 'convert' is not in your PATH. Please install 'imagemagick'.`))
    Deno.exit(1)
  }
}

let libavifIsInstalled: boolean

try {
  const process = Deno.run({ cmd: ['avifenc', '--version'] })
  const status = await process.status()
  if (status.success) {
    libavifIsInstalled = true
  }
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.warn(Colors.yellow(`Warning, the program 'avifenc' is not in your PATH. Please install 'libavif'. Falling back to 'imagemagick'.`))
  }
  libavifIsInstalled = false
}


await ensureDir('./src/static/images/optimized')

const results = await Promise.all(
  Array.from(Deno.readDirSync('./src/static/images/original'))
    .filter(({ isFile }) => isFile === true)
    .map(
      ({ name }) => imageFormats.map(
        ({ extension }) => imageWidths.map(
          width => ({ name, width, extension })
        ) 
      )
    )
    .flat(2)
    .map(async ({ name, width, extension }) => {
      const command = (name === 'avif' && libavifIsInstalled === true)
        ? `avifenc ./src/static/images/original/${name} ./src/static/images/optimized/${name.split('.')[0]}_w${width}.${extension}`
        : `convert ./src/static/images/original/${name} -resize ${width} -quality 75 ./src/static/images/optimized/${name.split('.')[0]}_w${width}.${extension}`
      const process = Deno.run({ cmd: command.split(' ') })
      return await Promise.all([process.status(), { name, width, extension }])
    })
)

results.forEach(
  ([status, { name, width, extension }]) => {
    if (status.success) {
      console.log(Colors.green('Converted: ') + `/src/static/images/original/${name} -> ./src/static/images/optimized/${name.split('.')[0]}_w${width}.${extension}`)
    }
  }
)
