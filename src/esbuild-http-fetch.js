// Forked from https://deno.land/x/esbuild_plugin_http_fetch@v1.0.3
const name = 'http-fetch'

const setup = ({ onResolve, onLoad }) => {
  onResolve({ filter: /^https:\/\// }, resolveFile)
  onResolve({ filter: /.*/, namespace: 'http-fetch' }, resolveUrl)
  onLoad({ filter: /.*/, namespace: 'http-fetch' }, loadSource)
}

const resolveFile = ({ path }) => ({
  path,
  namespace: 'http-fetch'
})

const resolveUrl = ({ path, importer }) => ({
  path: new URL(path, importer).href,
  namespace: 'http-fetch'
})

const loadSource = async ({ path }) => {
  const source = await fetch(path)

  if (!source.ok) {
    const message = `GET ${path} failed: status ${source.status}`
    throw new Error(message)
  }

  let contents = await source.text()
  const pattern = /\/\/# sourceMappingURL=(\S+)/
  const match = contents.match(pattern)
  if (match) {
    const url = new URL(match[1], source.url)
    const dataurl = await loadMap(url)
    const comment = `//# sourceMappingURL=${dataurl}`
    contents = contents.replace(pattern, comment)
  }

  const { pathname } = new URL(source.url)
  // Edited this line so that pathnames without an extension default to the ts (TypeScript) loader
  // Note, there still is a bug present when doing the following:
  // import React from 'https://jspm.dev/react'
  // It seems to error when it reaches "https://jspm.dev/npm:object-assign@4!cjs", saying "Invalid loader: "/npm:object-assign@4"
  // I have fixed this by falling back to a 'js' if the url does not include the file extension, but there's probably a more robust solution that needs implementing
  const loader = pathname.split('.').length === 1 ? 'ts' : pathname.split('.').slice(-1)[0]

  return {
    contents,
    loader: ['js', 'jsx', 'ts', 'tsx', 'css', 'json', 'text', 'base64', 'dataurl', 'file', 'binary'].includes(loader) ? loader : 'js'
  }
}

const loadMap = async url => {
  const map = await fetch(url)
  const type = map.headers.get('content-type').replace(/\s/g, '')
  const buffer = await map.arrayBuffer()
  const blob = new Blob([buffer], { type })
  const reader = new FileReader()
  return new Promise(resolve => {
    reader.onload = e => resolve(e.target.result)
    reader.readAsDataURL(blob)
  })
}

export default { name, setup }
