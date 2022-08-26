import { build, transform } from 'https://deno.land/x/esbuild@v0.14.54/mod.js'
import { denoPlugin } from 'https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts'
import globalExternals from 'https://esm.sh/@fal-works/esbuild-plugin-global-externals@2.1.2?pin=v92'
import { createHash } from 'https://deno.land/std@0.152.0/hash/mod.ts'

import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { existsSync } from 'https://deno.land/std@0.152.0/fs/mod.ts'

import postcss from 'https://deno.land/x/postcss@8.4.16/mod.js'
import nested from 'https://esm.sh/postcss-nested@5.0.6?pin=v92&bundle'

// Note, this assumes Deno is run with the following flag:
// --import-map ./import_map.json
// ...I could not find away to dynamically get the path of the import map within the code
const importMapJson = JSON.parse(Deno.readTextFileSync(`${Deno.cwd()}/import_map.json`))

const generateStyleSheetHash = text => createHash('md5').update(text).toString().substring(0, 6)

const generateIslandFile = async path => {
  const { outputFiles } = await build({
    bundle: true,
    entryPoints: [path],
    format: 'esm',
    jsxFactory: 'React.createElement',
    plugins: [
      globalExternals(
        {
          react: 'React'
        }
      ),
      denoPlugin()
    ],
    write: false,
    minify: true
  })

  return `import{React}from'./shared.js';${outputFiles[0].text}`
}

const generateSharedDependenciesFile = async () => {
  const sharedTemporaryFile = Deno.makeTempFileSync({ suffix: '.js' })

  await Deno.writeTextFile(
    sharedTemporaryFile,
    `
      import React from '${importMapJson.imports.react}'
      import ReactDOMClient from '${importMapJson.imports['react-dom/client']}'

      ${existsSync('./src/store.js')
        ? `
          import { globalStore } from '${Deno.cwd()}/src/store.js'

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
      denoPlugin()
    ],
    write: false,
    minify: true
  })

  await Deno.remove(sharedTemporaryFile)

  return sharedOutputFiles[0].text
}

const handlePage = async ({ Page, getStaticProps, path, params, servestApp }) => {
  sessionStorage.removeItem('styleSheet')
  sessionStorage.removeItem('headNodes')
  sessionStorage.removeItem('hydrationScripts')

  const pageProps = getStaticProps !== undefined
    ? await getStaticProps({ params }).then(resolved => resolved.props)
    : {}

  const pageMarkup = ReactDOMServer.renderToStaticMarkup(
    <Page {...pageProps} servestApp={servestApp} />
  )

  const styleSheet = sessionStorage.getItem('styleSheet')

  const headNodes = sessionStorage.getItem('headNodes')

  const styleSheetBody = styleSheet && await transform(
    postcss([nested])
      .process(styleSheet, { from: undefined })
      .css,
    { loader: 'css', minify: true })
    .then(({ code }) => code)
  const styleSheetHash = styleSheet && generateStyleSheetHash(styleSheetBody)

  const pageBody = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charSet="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

${styleSheet
  ? `<link rel="stylesheet" href="${`/${path.split('.')[0]}.${styleSheetHash}.css`}">`
  : ''}

${headNodes !== null
  ? headNodes
  : ''}

${(existsSync('./src/islands') && sessionStorage.getItem('hydrationScripts') !== null)
  ? sessionStorage.getItem('hydrationScripts')
  : ''}
</head>
<body>
${pageMarkup}
</body>
</html>
`

  return { styleSheetHash, styleSheetBody, pageBody, response: null }
}

export { generateIslandFile, generateSharedDependenciesFile, handlePage }
