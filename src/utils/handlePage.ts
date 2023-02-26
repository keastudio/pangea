import ReactDOMServer from 'react-dom/server'

import postcss from 'https://deno.land/x/postcss@8.4.16/mod.js'
import type { AcceptedPlugin } from 'https://deno.land/x/postcss@8.4.16/lib/postcss.d.ts'
import nested from 'https://esm.sh/postcss-nested@5.0.6?pin=v92&bundle'

import { transform } from 'esbuild'

import { memoryStorage } from './memoryStorage.ts'

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

type handlePageArgs = {
  Page: (props: Record<string, unknown>) => JSX.Element,
  getStaticProps: ({ params }: { params: Record<string, unknown> | undefined }) => ({ props: Record<string, unknown> }),
  path: string,
  params?: Record<string, unknown>,
  reloadScriptSrc?: string,
  inlineCss?: boolean,
  netlifyEdge?: boolean
}

const handlePage = async ({ Page, getStaticProps, path, params, reloadScriptSrc, inlineCss = false, netlifyEdge = false }: handlePageArgs) => {
  memoryStorage.removeItem('styleSheet')
  memoryStorage.removeItem('headNodes')
  memoryStorage.removeItem('hydrationScripts')
  memoryStorage.removeItem('netlifyEdge')

  if (netlifyEdge) {
    memoryStorage.setItem('netlifyEdge', 'true')
  }

  const { props: pageProps } = getStaticProps !== undefined
    ? await getStaticProps({ params })
    : { props: {} }

  const pageMarkup = ReactDOMServer.renderToStaticMarkup(
    Page({ ...pageProps })
  )

  const styleSheet = memoryStorage.getItem('styleSheet')

  const headNodes = memoryStorage.getItem('headNodes')

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

${memoryStorage.getItem('hydrationScripts') !== null
  ? memoryStorage.getItem('hydrationScripts')
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

export { handlePage }
