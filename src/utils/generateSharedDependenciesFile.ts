import { denoPlugin } from 'https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts'
import { existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'
import { join } from 'https://deno.land/std@0.150.0/path/mod.ts'

import { build } from 'esbuild'

const generateSharedDependenciesFile = async ({ projectDir }: { projectDir: string }) => {
  const sharedTemporaryFile = Deno.makeTempFileSync({ suffix: '.js' })

  await Deno.writeTextFile(
    sharedTemporaryFile,
    `
      import React from 'react'
      import ReactDOMClient from 'react-dom/client'

      export { React, ReactDOMClient }
    `
  )

  const { outputFiles: sharedOutputFiles } = await build({
    bundle: true,
    entryPoints: [sharedTemporaryFile],
    format: 'esm',
    plugins: [
      denoPlugin({ importMapURL: new URL(`file://${Deno.cwd()}/import_map.json`) })
    ],
    write: false,
    minify: true
  })

  await Deno.remove(sharedTemporaryFile)

  return sharedOutputFiles[0].text
}

export { generateSharedDependenciesFile }
