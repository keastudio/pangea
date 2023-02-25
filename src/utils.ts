import { denoPlugin } from 'https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts'
import globalExternals from 'https://esm.sh/@fal-works/esbuild-plugin-global-externals@2.1.2?pin=v92'

import ReactDOMServer from 'react-dom/server'

import postcss from 'https://deno.land/x/postcss@8.4.16/mod.js'
import type { AcceptedPlugin } from 'https://deno.land/x/postcss@8.4.16/lib/postcss.d.ts'
import nested from 'https://esm.sh/postcss-nested@5.0.6?pin=v92&bundle'

import { existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'
import { join } from 'https://deno.land/std@0.150.0/path/mod.ts'

import { build, transform, Plugin } from 'esbuild'

import { MemoryStorage } from 'https://deno.land/x/typed_local_store@v2.0.2/mod.ts'

const typedStorage = new MemoryStorage()

const generateStyleSheetHash = async (text: string) => {
  const encoder = new TextEncoder()
  const encodedText = encoder.encode(text)

  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-1', encodedText)
    )
  )
    .map(byte => byte.toString(16)
    .padStart(2, '0'))
    .join('')
    .substring(0, 6)
}

const generateIslandFile = async (path: string) => {
  const { outputFiles } = await build({
    bundle: true,
    entryPoints: [path],
    format: 'esm',
    jsxFactory: 'React.createElement',
    plugins: [
      <Plugin>globalExternals(
        {
          react: 'React'
        }
      ),
      denoPlugin({ importMapURL: new URL(`file://${Deno.cwd()}/import_map.json`) })
    ],
    write: false,
    minify: true
  })

  return `import{React}from'./shared.js';${outputFiles[0].text}`
}

const generateSharedDependenciesFile = async ({ projectDir }: { projectDir: string }) => {
  const sharedTemporaryFile = Deno.makeTempFileSync({ suffix: '.js' })

  await Deno.writeTextFile(
    sharedTemporaryFile,
    `
      import React from 'react'
      import ReactDOMClient from 'react-dom/client'

      ${existsSync(join(projectDir, 'store.ts'))
        ? `
          import { globalStore } from '${Deno.cwd()}/src/store.ts'

          export { React, ReactDOMClient, globalStore }
        `
        : `
          export { React, ReactDOMClient }
        `}
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

type handlePageArgs = {
  Page: (props: Record<string, unknown>) => JSX.Element,
  getStaticProps: ({ params }: { params: Record<string, unknown> | undefined }) => ({ props: Record<string, unknown> }),
  path: string,
  params?: Record<string, unknown>,
  reloadScriptSrc?: string,
  inlineCss?: boolean
}

const handlePage = async ({ Page, getStaticProps, path, params, reloadScriptSrc, inlineCss = false }: handlePageArgs) => {
  typedStorage.removeItem('styleSheet')
  typedStorage.removeItem('headNodes')
  typedStorage.removeItem('hydrationScripts')

  const { props: pageProps } = getStaticProps !== undefined
    ? await getStaticProps({ params })
    : { props: {} }

  const pageMarkup = ReactDOMServer.renderToStaticMarkup(
    Page({ ...pageProps })
  )

  const styleSheet = typedStorage.getItem('styleSheet')

  const headNodes = typedStorage.getItem('headNodes')

  const styleSheetBody = styleSheet && await transform(
    postcss([<AcceptedPlugin>nested])
      .process(styleSheet, { from: undefined })
      .css,
    { loader: 'css', minify: true })
    .then(({ code }) => code)
  const styleSheetHash = styleSheetBody && await generateStyleSheetHash(styleSheetBody)

  const pageBody = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charSet="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

${styleSheet
  ? inlineCss
    ? `<style>
${styleSheetBody}
</style>`
    : `<link rel="stylesheet" href="${`/${encodeURI(path.split('.')[0])}.${styleSheetHash}.css`}">`
  : ''}

${headNodes !== null
  ? headNodes
  : ''}

${typedStorage.getItem('hydrationScripts') !== null
  ? typedStorage.getItem('hydrationScripts')
  : ''}

${reloadScriptSrc
  ? `<script type="module" src="${reloadScriptSrc}"></script>`
  : ''}
</head>
<body>
${pageMarkup}
</body>
</html>
`

  return { styleSheetHash, styleSheetBody, pageBody, response: null }
}

export { generateIslandFile, generateSharedDependenciesFile, handlePage, typedStorage }
